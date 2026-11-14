"""
Build and validate master multilingual translation catalogs for PatchShield.
Languages: English (en), Tamil (ta), Hindi (hi)
"""
import json
import shutil
from pathlib import Path

EN = {
    "brand": {
        "name": "PatchShield",
        "tagline": "AI-Era Virtual Patching Gateway for SMBs"
    },
    "nav": {
        "dashboard": "Dashboard",
        "sites": "Protected Sites",
        "vulnerabilities": "Vulnerabilities",
        "rules": "Virtual Patch Rules",
        "provePatch": "Prove-then-Patch",
        "attackModules": "Attack Modules",
        "agent": "PatchShield Agent",
        "traffic": "Live Traffic",
        "alerts": "Alerts & Notifications",
        "reports": "Reports & Analytics",
        "metrics": "PS5 Metrics",
        "demoLab": "Demo Lab & Simulator",
        "auditLog": "Audit Log",
        "settings": "Settings",
        "help": "Help & Support"
    },
    "modes": {
        "simple": "Simple Mode (Shopkeeper)",
        "advanced": "Advanced Mode (DevOps/Sec)",
        "monitor": "Monitor Only",
        "protect": "Protect (Recommended)",
        "strict": "Strict Enforcement"
    },
    "topbar": {
        "search": "Search routes, rules, CVEs... (Ctrl+K)",
        "themeLight": "Light",
        "themeDark": "Dark",
        "themeSystem": "System",
        "language": "Language",
        "notifications": "Notifications",
        "profile": "Profile",
        "logout": "Logout"
    },
    "dashboard": {
        "title": "Security Command Center",
        "subtitle": "Real-time virtual patching & automated attack shield",
        "totalSites": "Protected Sites",
        "activePatches": "Active Virtual Patches",
        "blockedAttacks": "Attacks Blocked (24h)",
        "healthScore": "Overall Health Score",
        "recentAlerts": "Recent Alerts",
        "quickActions": "Quick Controls",
        "addSite": "Add New Site",
        "testSim": "Run Attack Simulator",
        "agentStatus": "Agent Status"
    },
    "sites": {
        "title": "Protected Websites & APIs",
        "subtitle": "Manage reverse proxy routes and upstream configurations",
        "addSite": "Add Site",
        "siteName": "Site Name",
        "domain": "Domain / Host",
        "upstream": "Upstream URL",
        "mode": "Security Mode",
        "health": "Health Score",
        "bypassStatus": "Bypass Check",
        "actions": "Actions",
        "checkBypass": "Test Direct Bypass",
        "safe": "Protected (No Bypass)",
        "vulnerable": "Direct Access Exposed!",
        "save": "Save Site",
        "cancel": "Cancel",
        "language": "Preferred Language"
    },
    "alerts": {
        "title": "Security Alerts & Incident Timeline",
        "subtitle": "Real-time attack notifications and virtual patch status updates",
        "filterAll": "All Severities",
        "markRead": "Mark as Read",
        "empty": "No alerts recorded yet.",
        "blocked_request_title": "Attack Blocked on {site}",
        "blocked_request_msg": "Blocked {action} attack from {ip} on endpoint {endpoint}. Your website is safe.",
        "flagged_request_title": "Suspicious Activity Detected on {site}",
        "flagged_request_msg": "Observed unusual request on {endpoint} with risk score {score}. Currently monitoring.",
        "new_patch_proposed_title": "Virtual Patch Proposed for {cve_id}",
        "new_patch_proposed_msg": "A new virtual patch rule was generated for {cve_id} on {site}. Automated sandbox testing has begun.",
        "rule_shadow_title": "Rule in Shadow Mode: {cve_id}",
        "rule_shadow_msg": "Rule for {cve_id} is passively observing traffic without blocking real customers.",
        "rule_canary_title": "Canary Testing Active: {cve_id}",
        "rule_canary_msg": "Rule for {cve_id} is currently protecting {percent}% of live traffic safely.",
        "rule_enforce_title": "Virtual Patch Fully Enforced: {cve_id}",
        "rule_enforce_msg": "PatchShield is actively blocking all {cve_id} exploit attempts on {site}.",
        "rule_rollback_title": "Safety Rollback Triggered: {cve_id}",
        "rule_rollback_msg": "Rule for {cve_id} was rolled back because potential false blocks exceeded safety threshold. Normal business traffic is unaffected.",
        "daily_summary_title": "Daily Security Summary for {site}",
        "daily_summary_msg": "PatchShield protected your business: {count} attacks blocked, {patches} active virtual patches, 0.00% false blocks today."
    },
    "simple_mode": {
        "title": "Shopkeeper Shield Assistant",
        "subtitle": "Plain-language explanations of what PatchShield is protecting",
        "sqli": "Someone tried to sneak hidden database commands into your search or form. We blocked them safely.",
        "xss": "Someone tried to inject malicious script into your web page to hijack users. We blocked them safely.",
        "path": "Someone tried to peek into confidential server system files. We blocked them safely.",
        "cmd": "Someone tried to run dangerous operating system commands on your server. We blocked them safely.",
        "brute": "Someone repeatedly guessed passwords to break into your admin area. We locked them out.",
        "ddos": "A sudden flood of fake requests tried to slow down your site. We rate-limited them.",
        "bot": "An automated hacker scanner bot was searching your site for weaknesses. We dropped it."
    },
    "reports": {
        "title": "Executive Security Report",
        "subtitle": "Download security compliance reports and incident logs",
        "downloadPdf": "Download PDF Report",
        "downloadCsv": "Export Incidents (CSV)",
        "generated_on": "Generated on {date} | Target: {site}",
        "col_metric": "Metric",
        "col_value": "Status / Value",
        "kpi_health": "Overall Security Health Score",
        "kpi_active_patches": "Active Scoped Virtual Patches",
        "kpi_blocked_attacks": "Attacks Blocked (Last 24h)",
        "kpi_mttvp": "Mean Time to Virtual Patch (MTTVP)",
        "kpi_exposure": "Exposure Window Reduction",
        "kpi_fp_rate": "False-Block Rate (Benchmark)",
        "methodology_title": "Prove-then-Patch Assurance Guarantee",
        "methodology_body": "Unlike legacy signature-based WAFs that frequently block legitimate shoppers, every virtual patch deployed by PatchShield underwent automated exploit sandbox verification and regression replay against recorded legitimate traffic. Active auto-rollback circuit breakers guarantee zero production disruption.",
        "compliance_title": "Nasscom ARB 2.0 Compliance Sign-off",
        "compliance_body": "This system satisfies Problem Statement 5 (PS5: AI-Era Virtual Patching for Indian SMBs). All telemetry, audit logs, and virtual patches are cryptographically hashed and stored on-premises.",
        "csv_col_id": "Incident ID",
        "csv_col_timestamp": "Timestamp",
        "csv_col_client_ip": "Client IP",
        "csv_col_method": "HTTP Method",
        "csv_col_path": "Endpoint Path",
        "csv_col_payload": "Payload / Query",
        "csv_col_action": "Defense Action",
        "csv_col_status": "Response Code"
    },
    "settings": {
        "title": "System Settings",
        "tabs": {
            "general": "General",
            "profile": "Profile",
            "security": "Security (2FA)",
            "notifications": "Notifications & Telegram",
            "apiKeys": "API Keys",
            "appearance": "Appearance & Language",
            "about": "About & Version"
        },
        "language_select": "Preferred Dashboard Language",
        "language_desc": "Select language for dashboard, alerts, and PDF/CSV reports",
        "save": "Save Changes"
    },
    "auth": {
        "login": "Login to PatchShield",
        "username": "Username",
        "password": "Password",
        "totp": "6-Digit Authenticator Code",
        "submit": "Sign In",
        "forgot": "Forgot Password?",
        "wizardTitle": "PatchShield First-Run Wizard",
        "wizardDesc": "Get your business protected in under 3 minutes"
    },
    "common": {
        "save": "Save",
        "cancel": "Cancel",
        "delete": "Delete",
        "refresh": "Refresh",
        "search": "Search",
        "loading": "Loading...",
        "status": "Status",
        "actions": "Actions",
        "active": "Active",
        "inactive": "Inactive",
        "enabled": "Enabled",
        "disabled": "Disabled"
    }
}

TA = {
    "brand": {
        "name": "பேட்ச்ஷீல்ட் (PatchShield)",
        "tagline": "வணிகங்களுக்கான AI மெய்நிகர் பாதுகாப்பு நுழைவாயில்"
    },
    "nav": {
        "dashboard": "முகப்பு (Dashboard)",
        "sites": "பாதுகாக்கப்பட்ட தளங்கள்",
        "vulnerabilities": "பாதிப்புகள் (CVEs)",
        "rules": "மெய்நிகர் விதிகள் (Rules)",
        "provePatch": "நிரூபித்து இணை (Prove-then-Patch)",
        "attackModules": "தாக்குதல் தடுப்பு தொகுதிகள்",
        "agent": "AI பாதுகாப்பு முகவர் (Agent)",
        "traffic": "நேரலை இணைய போக்குவரத்து",
        "alerts": "எச்சரிக்கைகள் (Alerts)",
        "reports": "அறிக்கைகள் (Reports)",
        "metrics": "செயல்திறன் அளவீடுகள் (Metrics)",
        "demoLab": "மாதிரி ஆய்வகம் (Demo Lab)",
        "auditLog": "செயல் பதிவேடு (Audit Log)",
        "settings": "அமைப்புகள் (Settings)",
        "help": "உதவி & வழிகாட்டி"
    },
    "modes": {
        "simple": "எளிய முறை (வியாபாரிகளுக்கு)",
        "advanced": "மேம்பட்ட முறை (தொழில்நுட்ப வல்லுநர்களுக்கு)",
        "monitor": "கண்காணிப்பு மட்டும்",
        "protect": "பாதுகாப்பு (பரிந்துரைக்கப்படுகிறது)",
        "strict": "கடுமையான தடுப்பு"
    },
    "topbar": {
        "search": "தேடவும்... (Ctrl+K)",
        "themeLight": "வெளிச்சம்",
        "themeDark": "இருள்",
        "themeSystem": "அமைப்பு",
        "language": "மொழி",
        "notifications": "அறிவிப்புகள்",
        "profile": "சுயவிவரம்",
        "logout": "வெளியேறு"
    },
    "dashboard": {
        "title": "பாதுகாப்பு கட்டுப்பாட்டு மையம்",
        "subtitle": "நேரலை மெய்நிகர் பாதுகாப்பு & தானியங்கி தாக்குதல் தடுப்பு",
        "totalSites": "பாதுகாக்கப்பட்ட தளங்கள்",
        "activePatches": "செயலில் உள்ள பாதுகாப்பு விதிகள்",
        "blockedAttacks": "தடுக்கப்பட்ட தாக்குதல்கள் (24 மணிநேரம்)",
        "healthScore": "ஒட்டுமொத்த பாதுகாப்பு தரம்",
        "recentAlerts": "சமீபத்திய எச்சரிக்கைகள்",
        "quickActions": "விரைவு கட்டுப்பாடுகள்",
        "addSite": "புதிய தளம் சேர்க்க",
        "testSim": "தாக்குதல் சோதனையை இயக்கு",
        "agentStatus": "AI முகவர் நிலை"
    },
    "sites": {
        "title": "பாதுகாக்கப்பட்ட இணையதளங்கள் & APIகள்",
        "subtitle": "வலைப்பின்னல் வழிகள் மற்றும் இணைப்பு அமைப்புகளை நிர்வகிக்கவும்",
        "addSite": "தளம் சேர்க்க",
        "siteName": "தளத்தின் பெயர்",
        "domain": "டொமைன் / முகவரி",
        "upstream": "சேவையக URL",
        "mode": "பாதுகாப்பு முறை",
        "health": "பாதுகாப்பு தரம்",
        "bypassStatus": "நேரடி அணுகல் சோதனை",
        "actions": "செயல்கள்",
        "checkBypass": "நேரடி அணுகலை சோதி",
        "safe": "பாதுகாப்பானது (நேரடி அணுகல் இல்லை)",
        "vulnerable": "நேரடி அணுகல் அபாயம் உள்ளது!",
        "save": "சேமி",
        "cancel": "ரத்து",
        "language": "விருப்பமான மொழி"
    },
    "alerts": {
        "title": "பாதுகாப்பு எச்சரிக்கைகள் & நிகழ்வு வரிசை",
        "subtitle": "நேரலை தாக்குதல் அறிவிப்புகள் மற்றும் மெய்நிகர் பாதுகாப்பு நிலை",
        "filterAll": "அனைத்து நிலைகளும்",
        "markRead": "படித்ததாகக் குறி",
        "empty": "இதுவரை எந்த எச்சரிக்கையும் இல்லை.",
        "blocked_request_title": "{site} தளத்தில் தாக்குதல் தடுக்கப்பட்டது",
        "blocked_request_msg": "{endpoint} பக்கத்தில் {ip} முகவரியிலிருந்து வந்த {action} தாக்குதல் தடுக்கப்பட்டது. உங்கள் இணையதளம் பாதுகாப்பாக உள்ளது.",
        "flagged_request_title": "{site} தளத்தில் சந்தேகத்திற்கிடமான நடவடிக்கை கண்டறியப்பட்டது",
        "flagged_request_msg": "{endpoint} பக்கத்தில் {score} அபாய அளவிலான அசாதாரண நடவடிக்கை கண்காணிக்கப்படுகிறது.",
        "new_patch_proposed_title": "{cve_id} பாதிப்பிற்கு மெய்நிகர் பாதுகாப்பு தயார்",
        "new_patch_proposed_msg": "{site} தளத்தில் உள்ள {cve_id} பாதிப்பிற்காக புதிய பாதுகாப்பு விதி உருவாக்கப்பட்டு சோதனை தொடங்கப்பட்டுள்ளது.",
        "rule_shadow_title": "கண்காணிப்பு முறையில் பாதுகாப்பு விதி: {cve_id}",
        "rule_shadow_msg": "{cve_id} விதி வாடிக்கையாளர்களைத் தடுக்காமல் போக்குவரத்தை அமைதியாகக் கண்காணித்து வருகிறது.",
        "rule_canary_title": "சோதனை அமலாக்கம் தொடங்கியது: {cve_id}",
        "rule_canary_msg": "{cve_id} பாதுகாப்பு விதி தற்போது நேரலை போக்குவரத்தின் {percent}% அளவில் வெற்றிகரமாகச் செயல்படுகிறது.",
        "rule_enforce_title": "முழு பாதுகாப்பு நடைமுறைக்கு வந்தது: {cve_id}",
        "rule_enforce_msg": "{site} தளத்தில் {cve_id} தொடர்பான அனைத்து அத்துமீறல்களும் இப்போது முழுமையாகத் தடுக்கப்படுகின்றன.",
        "rule_rollback_title": "பாதுகாப்பு திரும்பப் பெறப்பட்டது: {cve_id}",
        "rule_rollback_msg": "வாடிக்கையாளர் போக்குவரத்தில் சிறு பாதிப்பு கூட வரக்கூடாது என்பதால் {cve_id} விதி தானாக நிறுத்தப்பட்டது. உங்கள் வணிகம் பாதுகாப்பாக இயங்குகிறது.",
        "daily_summary_title": "{site} தளத்தின் தினசரி பாதுகாப்பு அறிக்கை",
        "daily_summary_msg": "இன்று பேட்ச்ஷீல்ட் உங்கள் வணிகத்தைப் பாதுகாத்தது: {count} தாக்குதல்கள் முறியடிப்பு, {patches} நேரலை பாதுகாப்பு விதிகள், 0% தவறுதலான தடுப்புகள்."
    },
    "simple_mode": {
        "title": "வணிகர் பாதுகாப்பு உதவியாளர்",
        "subtitle": "பேட்ச்ஷீல்ட் எவ்வாறு பாதுகாக்கிறது என்பதற்கான எளிய விளக்கங்கள்",
        "sqli": "உங்கள் தேடல் அல்லது படிவத்தில் மறைமுகமாக தரவுத்தள கட்டளைகளை நுழைக்க முயன்றனர். நாங்கள் அதை பாதுகாப்பாக தடுத்துவிட்டோம்.",
        "xss": "பயனர்களை ஏமாற்ற உங்கள் இணையப் பக்கத்தில் தீங்கிழைக்கும் ஸ்கிரிப்டை இயக்க முயன்றனர். நாங்கள் அதை தடுத்துவிட்டோம்.",
        "path": "சேவையகத்தில் உள்ள ரகசிய கணினி கோப்புகளை பார்க்க முயன்றனர். நாங்கள் அதை பாதுகாப்பாக தடுத்துவிட்டோம்.",
        "cmd": "உங்கள் கணினியில் ஆபத்தான கட்டளைகளை செயல்படுத்த முயன்றனர். நாங்கள் அதை உடனே தடுத்துவிட்டோம்.",
        "brute": "உங்கள் நிர்வாக பக்கத்திற்குள் நுழைய தொடர்ந்து கடவுச்சொற்களை தவறாக முயற்சித்தனர். நாங்கள் அவர்களை தற்காலிகமாக முடக்கிவிட்டோம்.",
        "ddos": "தளத்தை முடக்க அதிகப்படியான போலி கோரிக்கைகள் அனுப்பப்பட்டன. நாங்கள் அவற்றை தடுத்து சீராக்கிவிட்டோம்.",
        "bot": "உங்கள் தளத்தில் உள்ள குறைகளை கண்டறிய தானியங்கி ஸ்கேனர் பாட் முயன்றது. நாங்கள் அதை தடுத்து நிறுத்தினோம்."
    },
    "reports": {
        "title": "பாதுகாப்பு நிர்வாக அறிக்கை",
        "subtitle": "பாதுகாப்பு சான்றிதழ் அறிக்கைகள் மற்றும் நிகழ்வு பதிவுகளைப் பதிவிறக்கவும்",
        "downloadPdf": "PDF அறிக்கை பதிவிறக்கு",
        "downloadCsv": "நிகழ்வுகளைப் பதிவிறக்கு (CSV)",
        "generated_on": "உருவாக்கப்பட்ட நேரம்: {date} | தளம்: {site}",
        "col_metric": "அளவீடு",
        "col_value": "நிலை / மதிப்பு",
        "kpi_health": "ஒட்டுமொத்த பாதுகாப்பு தரம்",
        "kpi_active_patches": "செயலில் உள்ள பாதுகாப்பு விதிகள்",
        "kpi_blocked_attacks": "தடுக்கப்பட்ட தாக்குதல்கள் (24 மணிநேரம்)",
        "kpi_mttvp": "சராசரி மெய்நிகர் பாதுகாப்பு நேரம் (MTTVP)",
        "kpi_exposure": "ஆபத்து கால குறைப்பு சதவீதம்",
        "kpi_fp_rate": "தவறான தடுப்பு விகிதம்",
        "methodology_title": "நிரூபித்து இணை (Prove-then-Patch) உத்தரவாதம்",
        "methodology_body": "சாதாரண வாடிக்கையாளர்களைத் தவறுதலாகத் தடுக்கும் பழைய WAF முறைகளைப் போலல்லாமல், பேட்ச்ஷீல்டின் ஒவ்வொரு மெய்நிகர் பாதுகாப்பு விதியும் தானியங்கி மாதிரி சோதனைகள் மற்றும் பழைய நேரலை போக்குவரத்து மறு-சோதனைகளுக்குப் பிறகே செயல்படுத்தப்படுகிறது.",
        "compliance_title": "நாஸ்காம் ARB 2.0 இணக்கச் சான்று",
        "compliance_body": "இக்கணினி நாஸ்காம் ARB 2.0 (பிரச்சனை அறிக்கை 5) விதிமுறைகளை முழுமையாகப் பூர்த்தி செய்கிறது. அனைத்து தரவுகளும் பாதுகாப்பாக உங்கள் கணினியிலேயே சேமிக்கப்படுகின்றன.",
        "csv_col_id": "நிகழ்வு எண்",
        "csv_col_timestamp": "நேரம்",
        "csv_col_client_ip": "பயனர் IP முகவரி",
        "csv_col_method": "கோரிக்கை வகை",
        "csv_col_path": "இணையதளப் பாதை",
        "csv_col_payload": "தாக்குதல் விவரம்",
        "csv_col_action": "பாதுகாப்பு நடவடிக்கை",
        "csv_col_status": "பதில் குறியீடு"
    },
    "settings": {
        "title": "அமைப்புகள்",
        "tabs": {
            "general": "பொதுவானவை",
            "profile": "சுயவிவரம்",
            "security": "பாதுகாப்பு (2FA)",
            "notifications": "அறிவிப்புகள் & டெலிகிராம்",
            "apiKeys": "API சாவிகள்",
            "appearance": "தோற்றம் & மொழி",
            "about": "பதிப்பு & தகவல்"
        },
        "language_select": "டாஷ்போர்டு மொழித் தேர்வு",
        "language_desc": "டாஷ்போர்டு, எச்சரிக்கைகள் மற்றும் அறிக்கைகளுக்கான மொழியைத் தேர்ந்தெடுக்கவும்",
        "save": "மாற்றங்களைச் சேமி"
    },
    "auth": {
        "login": "பேட்ச்ஷீல்டில் உள்நுழையவும்",
        "username": "பயனர் பெயர்",
        "password": "கடவுச்சொல்",
        "totp": "6-இலக்க அங்கீகாரக் குறியீடு",
        "submit": "உள்நுழை",
        "forgot": "கடவுச்சொல் மறந்துவிட்டதா?",
        "wizardTitle": "பேட்ச்ஷீல்ட் தொடக்க வழிகாட்டி",
        "wizardDesc": "3 நிமிடங்களில் உங்கள் வணிகத்திற்கு பாதுகாப்பு பெறுங்கள்"
    },
    "common": {
        "save": "சேமி",
        "cancel": "ரத்து",
        "delete": "நீக்கு",
        "refresh": "புதுப்பி",
        "search": "தேடு",
        "loading": "ஏற்றுகிறது...",
        "status": "நிலை",
        "actions": "செயல்கள்",
        "active": "செயலில்",
        "inactive": "செயலற்றது",
        "enabled": "இயக்கப்பட்டது",
        "disabled": "முடக்கப்பட்டது"
    }
}

HI = {
    "brand": {
        "name": "पैचशील्ड (PatchShield)",
        "tagline": "छोटे व्यवसायों के लिए AI वर्चुअल पैचिंग गेटवे"
    },
    "nav": {
        "dashboard": "डैशबोर्ड (Dashboard)",
        "sites": "सुरक्षित वेबसाइटें",
        "vulnerabilities": "कमज़ोरियाँ (CVEs)",
        "rules": "वर्चुअल पैच नियम",
        "provePatch": "प्रमाणित पैच (Prove-then-Patch)",
        "attackModules": "हमला सुरक्षा मॉड्यूल",
        "agent": "AI सुरक्षा एजेंट",
        "traffic": "लाइव वेब ट्रैफ़िक",
        "alerts": "सुरक्षा अलर्ट (Alerts)",
        "reports": "रिपोर्ट्स (Reports)",
        "metrics": "प्रदर्शन मेट्रिक्स",
        "demoLab": "डेमो लैब (Demo Lab)",
        "auditLog": "ऑडिट लॉग (Audit Log)",
        "settings": "सेटिंग्स (Settings)",
        "help": "सहायता एवं समर्थन"
    },
    "modes": {
        "simple": "सरल मोड (दुकानदारों के लिए)",
        "advanced": "उन्नत मोड (तकनीकी विशेषज्ञों के लिए)",
        "monitor": "केवल निगरानी (Monitor)",
        "protect": "सुरक्षा (अनुशंसित)",
        "strict": "कड़ा प्रतिबंध (Strict)"
    },
    "topbar": {
        "search": "खोजें... (Ctrl+K)",
        "themeLight": "लाइट",
        "themeDark": "डार्क",
        "themeSystem": "सिस्टम",
        "language": "भाषा",
        "notifications": "सूचनाएं",
        "profile": "प्रोफ़ाइल",
        "logout": "लॉग आउट"
    },
    "dashboard": {
        "title": "सुरक्षा नियंत्रण केंद्र",
        "subtitle": "रीयल-टाइम वर्चुअल पैचिंग एवं स्वचालित साइबर सुरक्षा",
        "totalSites": "सुरक्षित वेबसाइटें",
        "activePatches": "सक्रिय वर्चुअल पैच",
        "blockedAttacks": "रोके गए हमले (24 घंटे)",
        "healthScore": "समग्र सुरक्षा स्कोर",
        "recentAlerts": "हालिया सुरक्षा अलर्ट",
        "quickActions": "त्वरित नियंत्रण",
        "addSite": "नई वेबसाइट जोड़ें",
        "testSim": "हमला सिम्युलेटर चलाएं",
        "agentStatus": "AI एजेंट स्थिति"
    },
    "sites": {
        "title": "सुरक्षित वेबसाइटें एवं APIs",
        "subtitle": "रिवर्स प्रॉक्सी मार्ग एवं अपस्ट्रीम सर्वर प्रबंधित करें",
        "addSite": "साइट जोड़ें",
        "siteName": "साइट का नाम",
        "domain": "डोमेन / होस्ट",
        "upstream": "अपस्ट्रीम URL",
        "mode": "सुरक्षा मोड",
        "health": "स्वास्थ्य स्कोर",
        "bypassStatus": "डायरेक्ट बाईपास जांच",
        "actions": "कार्रवाई",
        "checkBypass": "बाईपास का परीक्षण करें",
        "safe": "सुरक्षित (कोई बाईपास नहीं)",
        "vulnerable": "सीधा प्रवेश खुला है!",
        "save": "सहेजें",
        "cancel": "रद्द करें",
        "language": "पसंदीदा भाषा"
    },
    "alerts": {
        "title": "सुरक्षा अलर्ट एवं घटनाक्रम",
        "subtitle": "रीयल-टाइम हमले की सूचनाएं एवं वर्चुअल पैच स्थिति",
        "filterAll": "सभी स्तर",
        "markRead": "पढ़ा हुआ चिह्नित करें",
        "empty": "अभी तक कोई सुरक्षा अलर्ट नहीं है।",
        "blocked_request_title": "{site} पर हमला रोका गया",
        "blocked_request_msg": "{endpoint} पर {ip} से आए {action} हमले को सुरक्षित रूप से रोक दिया गया है। आपकी वेबसाइट सुरक्षित है।",
        "flagged_request_title": "{site} पर संदिग्ध गतिविधि देखी गई",
        "flagged_request_msg": "{endpoint} पर {score} जोखिम स्तर का असामान्य ट्रैफ़िक देखा गया है। अभी निगरानी की जा रही है।",
        "new_patch_proposed_title": "{cve_id} के लिए वर्चुअल पैच तैयार है",
        "new_patch_proposed_msg": "{site} पर {cve_id} के लिए नया सुरक्षा नियम तैयार कर स्वचालित परीक्षण शुरू कर दिया गया है।",
        "rule_shadow_title": "शैडो मोड में सुरक्षा नियम: {cve_id}",
        "rule_shadow_msg": "{cve_id} नियम असली ग्राहकों को रोके बिना ट्रैफ़िक की निगरानी कर रहा है।",
        "rule_canary_title": "कैनरी परीक्षण शुरू: {cve_id}",
        "rule_canary_msg": "{cve_id} नियम वर्तमान में {percent}% ट्रैफ़िक की सुरक्षित सुरक्षा कर रहा है।",
        "rule_enforce_title": "वर्चुअल पैच पूरी तरह लागू: {cve_id}",
        "rule_enforce_msg": "{site} पर {cve_id} के सभी हमलों को अब पूरी तरह ब्लॉक किया जा रहा है।",
        "rule_rollback_title": "सुरक्षा नियम वापस लिया गया: {cve_id}",
        "rule_rollback_msg": "ग्राहकों के ट्रैफ़िक में रुकावट से बचने के लिए {cve_id} नियम को वापस ले लिया गया है। आपका व्यापार सुचारू रूप से चल रहा है।",
        "daily_summary_title": "{site} की दैनिक सुरक्षा रिपोर्ट",
        "daily_summary_msg": "आज पैचशील्ड ने आपके व्यवसाय की सुरक्षा की: {count} हमले रोके गए, {patches} सक्रिय नियम, 0% गलत रुकावटें।"
    },
    "simple_mode": {
        "title": "व्यापारी सुरक्षा सहायक",
        "subtitle": "पैचशील्ड आपकी सुरक्षा कैसे करता है, इसकी सरल व्याख्या",
        "sqli": "किसी ने आपकी खोज या फ़ॉर्म में गुप्त डेटाबेस कमांड डालने की कोशिश की। हमने उसे सुरक्षित रूप से रोक दिया।",
        "xss": "किसी ने उपयोगकर्ताओं को निशाना बनाने के लिए आपकी वेबसाइट में दुर्भावनापूर्ण कोड डालने की कोशिश की। हमने उसे रोक दिया।",
        "path": "किसी ने सर्वर की गोपनीय सिस्टम फ़ाइलों को देखने की कोशिश की। हमने उसे सुरक्षित रूप से रोक दिया।",
        "cmd": "किसी ने आपके सर्वर पर ख़तरनाक ऑपरेटिंग सिस्टम कमांड चलाने की कोशिश की। हमने उसे तुरंत रोक दिया।",
        "brute": "किसी ने एडमिन खाते में घुसने के लिए बार-बार गलत पासवर्ड डालने की कोशिश की। हमने उसे बाहर कर दिया।",
        "ddos": "आपकी वेबसाइट को धीमा करने के लिए बहुत सारे फ़र्ज़ी अनुरोध भेजे गए। हमने ट्रैफ़िक को सीमित कर दिया।",
        "bot": "एक स्वचालित हैकर स्कैनर बॉट आपकी साइट की कमज़ोरियाँ ढूंढ रहा था। हमने उसे तुरंत बाहर कर दिया।"
    },
    "reports": {
        "title": "कार्यकारी सुरक्षा रिपोर्ट",
        "subtitle": "सुरक्षा अनुपालन रिपोर्ट एवं घटना लॉग डाउनलोड करें",
        "downloadPdf": "PDF रिपोर्ट डाउनलोड करें",
        "downloadCsv": "घटनाओं का निर्यात (CSV)",
        "generated_on": "दिनांक: {date} | लक्ष्य साइट: {site}",
        "col_metric": "मेट्रिक",
        "col_value": "स्थिति / मान",
        "kpi_health": "समग्र सुरक्षा स्वास्थ्य स्कोर",
        "kpi_active_patches": "सक्रिय वर्चुअल पैच नियम",
        "kpi_blocked_attacks": "रोके गए हमले (पिछले 24 घंटे)",
        "kpi_mttvp": "औसत वर्चुअल पैच समय (MTTVP)",
        "kpi_exposure": "जोखिम अवधि में कमी",
        "kpi_fp_rate": "गलत रुकावट दर (FP Rate)",
        "methodology_title": "प्रमाणित पैच (Prove-then-Patch) आश्वासन",
        "methodology_body": "पुराने WAF नियमों के विपरीत, जो अक्सर असली ग्राहकों को ब्लॉक कर देते हैं, पैचशील्ड द्वारा तैनात प्रत्येक वर्चुअल पैच को स्वचालित सैंडबॉक्स परीक्षण और वास्तविक ट्रैफ़िक रीप्ले के बाद ही लागू किया जाता है।",
        "compliance_title": "नैसकॉम ARB 2.0 अनुपालन प्रमाण",
        "compliance_body": "यह प्रणाली नैसकॉम ARB 2.0 (समस्या विवरण 5: भारतीय छोटे व्यवसायों के लिए वर्चुअल पैचिंग) की सभी आवश्यकताओं को पूरा करती है। समस्त डेटा स्थानीय रूप से सुरक्षित रखा जाता है।",
        "csv_col_id": "घटना संख्या",
        "csv_col_timestamp": "समय",
        "csv_col_client_ip": "क्लाइंट IP पता",
        "csv_col_method": "HTTP विधि",
        "csv_col_path": "एंडपॉइंट पथ",
        "csv_col_payload": "पेलोड / क्वेरी",
        "csv_col_action": "सुरक्षा कार्रवाई",
        "csv_col_status": "प्रतिक्रिया कोड"
    },
    "settings": {
        "title": "सिस्टम सेटिंग्स",
        "tabs": {
            "general": "सामान्य",
            "profile": "प्रोफ़ाइल",
            "security": "सुरक्षा (2FA)",
            "notifications": "सूचनाएं एवं टेलीग्राम",
            "apiKeys": "API कुंजियाँ",
            "appearance": "दिखावट एवं भाषा",
            "about": "संस्करण एवं परिचय"
        },
        "language_select": "डैशबोर्ड भाषा चयन",
        "language_desc": "डैशबोर्ड, अलर्ट और रिपोर्ट्स के लिए पसंदीदा भाषा चुनें",
        "save": "परिवर्तन सहेजें"
    },
    "auth": {
        "login": "पैचशील्ड में लॉगिन करें",
        "username": "उपयोगकर्ता नाम",
        "password": "पासवर्ड",
        "totp": "6-अंकों का प्रमाणीकरण कोड",
        "submit": "साइन इन करें",
        "forgot": "पासवर्ड भूल गए?",
        "wizardTitle": "पैचशील्ड प्रारंभिक विज़ार्ड",
        "wizardDesc": "3 मिनट से भी कम समय में अपने व्यवसाय को सुरक्षित करें"
    },
    "common": {
        "save": "सहेजें",
        "cancel": "रद्द करें",
        "delete": "हटाएं",
        "refresh": "रीफ्रेश करें",
        "search": "खोजें",
        "loading": "लोड हो रहा है...",
        "status": "स्थिति",
        "actions": "कार्रवाई",
        "active": "सक्रिय",
        "inactive": "निष्क्रिय",
        "enabled": "सक्षम",
        "disabled": "अक्षम"
    }
}

def verify_and_save():
    # 1. Compare key sets recursively
    def get_keys(d, prefix=""):
        keys = set()
        for k, v in d.items():
            full = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                keys.update(get_keys(v, full))
            else:
                keys.add(full)
        return keys

    en_keys = get_keys(EN)
    ta_keys = get_keys(TA)
    hi_keys = get_keys(HI)

    assert en_keys == ta_keys, f"Tamil keys mismatch: {en_keys ^ ta_keys}"
    assert en_keys == hi_keys, f"Hindi keys mismatch: {en_keys ^ hi_keys}"
    print(f"[+] All 3 language catalogs validated with {len(en_keys)} identical leaf keys.")

    catalogs = {"en": EN, "ta": TA, "hi": HI}
    targets = [Path("locales"), Path("backend/app/locales"), Path("frontend/src/i18n")]

    for tdir in targets:
        tdir.mkdir(parents=True, exist_ok=True)
        for lang, cat in catalogs.items():
            out_file = tdir / f"{lang}.json"
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(cat, f, ensure_ascii=False, indent=2)
            print(f"[+] Saved {out_file} (UTF-8, {len(json.dumps(cat, ensure_ascii=False))} chars)")

if __name__ == "__main__":
    verify_and_save()
