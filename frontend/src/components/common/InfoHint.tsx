import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface InfoHintProps {
  title?: string;
  content: string;
  badge?: string;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoHint: React.FC<InfoHintProps> = ({ 
  title, 
  content, 
  badge, 
  className = "",
  side = 'top' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (hintRef.current && !hintRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={hintRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        className="w-4 h-4 rounded-full flex items-center justify-center text-iceteal-300 hover:text-cream-300 hover:bg-cyanteal-500/20 transition-all duration-200 focus:outline-none"
        title="Click for details"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 w-64 p-3 rounded-2xl glass-panel-elevated shadow-2xl text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150 border border-iceteal-300/30 right-0 top-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-cyanteal-500/20 pb-1.5">
            <div className="flex items-center space-x-1.5">
              {title && <span className="font-bold text-cream-300 text-[11px]">{title}</span>}
              {badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-copper-500/20 text-copper-300 border border-copper-500/30">
                  {badge}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {content}
          </p>
        </div>
      )}
    </div>
  );
};

