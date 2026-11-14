import re
import sre_parse
import sre_constants
import time
import concurrent.futures
from typing import Tuple, List, Optional, Dict, Any

class ReDoSStaticAnalyzer:
    """
    Static AST Analyzer to detect dangerous Regular Expression Denial of Service (ReDoS)
    flaws such as catastrophic exponential backtracking before compiling or persisting rules.
    """
    EVIL_REGEX_PATTERNS = [
        re.compile(r"\([^\)]*[\+\*]\)[^\)]*[\+\*]"),          # Nested quantifiers like (a+)+ or (.*)*
        re.compile(r"\[[^\]]*[\+\*]\][^\)]*[\+\*]"),          # Nested character class repetitions
        re.compile(r"([a-zA-Z0-9_\-\.]+\+)+\$"),               # Overlapping suffixes with greedy plus like (a+)+$
        re.compile(r"\([a-zA-Z0-9_\-\.\s]+\|[a-zA-Z0-9_\-\.\s]+\)[\+\*]"), # Repeated alternation like (a|aa)+ or (0|1)*
    ]

    @classmethod
    def analyze_ast(cls, pattern_str: str) -> Tuple[bool, Optional[str]]:
        """
        Parses regex AST into sre_parse tokens to detect nested repetitions.
        Returns: (is_safe, error_reason)
        """
        try:
            parsed = sre_parse.parse(pattern_str)
        except Exception as e:
            return False, f"Invalid regular expression syntax: {str(e)}"

        # 1. Heuristic string analysis for classic nested repetition
        for evil_pat in cls.EVIL_REGEX_PATTERNS:
            if evil_pat.search(pattern_str):
                return False, f"Catastrophic exponential backtracking detected (ReDoS vulnerability in pattern: {evil_pat.pattern})"

        # 2. Recursive AST walk to detect SUBPATTERN repetition inside REPEAT
        def walk_tokens(tokens, depth=0) -> Optional[str]:
            for op, val in tokens:
                # If we encounter a repeat inside another repeat or subpattern with repetition
                if op == sre_constants.MAX_REPEAT or op == sre_constants.MIN_REPEAT:
                    min_rep, max_rep, sub_tokens = val
                    if max_rep > 1000 or max_rep == sre_constants.MAXREPEAT:
                        # Check if sub_tokens contains another repetition
                        for sub_op, sub_val in sub_tokens:
                            if sub_op in (sre_constants.MAX_REPEAT, sre_constants.MIN_REPEAT):
                                return "Nested unbounded quantifiers detected in AST"
                            if sub_op == sre_constants.SUBPATTERN:
                                # Inspect subpattern body
                                sub_pat_tokens = sub_val[3] if len(sub_val) > 3 else []
                                for inner_op, _ in sub_pat_tokens:
                                    if inner_op in (sre_constants.MAX_REPEAT, sre_constants.MIN_REPEAT):
                                        return "Nested quantifier inside grouped subpattern detected (ReDoS hazard)"
                elif op == sre_constants.SUBPATTERN:
                    sub_pat_tokens = val[3] if len(val) > 3 else []
                    res = walk_tokens(sub_pat_tokens, depth + 1)
                    if res:
                        return res
            return None

        ast_error = walk_tokens(parsed)
        if ast_error:
            return False, ast_error

        return True, None

class SafeRegexMatcher:
    """
    Executes regex pattern matching with strict execution timeout safeguards.
    Prevents CPU thread locking even if an undetected ReDoS payload arrives.
    """
    def __init__(self, default_timeout_sec: float = 0.05): # 50 milliseconds hard timeout
        self.default_timeout = default_timeout_sec
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=8, thread_name_prefix="redos_guard")

    def match_with_timeout(
        self,
        pattern: re.Pattern,
        text: str,
        timeout_sec: Optional[float] = None
    ) -> Tuple[bool, Optional[re.Match], float]:
        """
        Executes regex search with a bounded execution timer.
        Returns: (matched, match_object, elapsed_ms)
        """
        timeout = timeout_sec or self.default_timeout
        start_t = time.perf_counter()

        # Fast-path: try direct search for short inputs (< 200 chars)
        if len(text) < 200:
            match = pattern.search(text)
            elapsed_ms = (time.perf_counter() - start_t) * 1000
            return bool(match), match, elapsed_ms

        # Bounded executor for larger payloads to prevent CPU exhaustion
        future = self.executor.submit(pattern.search, text)
        try:
            match = future.result(timeout=timeout)
            elapsed_ms = (time.perf_counter() - start_t) * 1000
            return bool(match), match, elapsed_ms
        except concurrent.futures.TimeoutError:
            elapsed_ms = (time.perf_counter() - start_t) * 1000
            return False, None, elapsed_ms

# Global safe matcher instance
safe_regex_matcher = SafeRegexMatcher()
