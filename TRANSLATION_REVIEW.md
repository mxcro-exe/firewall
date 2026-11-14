# 📋 PatchShield Translation Catalog Review Document

> **Note:** As specified in the project guidelines, every Tamil and Hindi translation has been crafted for natural, conversational clarity (keeping technical terms like SQL injection, XSS, CVE in English) and is marked below as [needs native-speaker review] so you can review and refine them before production customer presentation.

| Key | English Source | Tamil Translation [needs native-speaker review] | Hindi Translation [needs native-speaker review] |
| :--- | :--- | :--- | :--- |
| alerts.blocked_request_msg | Blocked {action} attack from {ip} on endpoint {endpoint}. Your website is safe. | {endpoint} பக்கத்தில் {ip} முகவரியிலிருந்து வந்த {action} தாக்குதல் தடுக்கப்பட்டது. உங்கள் இணையதளம் பாதுகாப்பாக உள்ளது. | {endpoint} पर {ip} से आए {action} हमले को सुरक्षित रूप से रोक दिया गया है। आपकी वेबसाइट सुरक्षित है। |
| alerts.blocked_request_title | Attack Blocked on {site} | {site} தளத்தில் தாக்குதல் தடுக்கப்பட்டது | {site} पर हमला रोका गया |
| alerts.daily_summary_msg | PatchShield protected your business: {count} attacks blocked, {patches} active virtual patches, 0.00% false blocks today. | இன்று பேட்ச்ஷீல்ட் உங்கள் வணிகத்தைப் பாதுகாத்தது: {count} தாக்குதல்கள் முறியடிப்பு, {patches} நேரலை பாதுகாப்பு விதிகள், 0% தவறுதலான தடுப்புகள். | आज पैचशील्ड ने आपके व्यवसाय की सुरक्षा की: {count} हमले रोके गए, {patches} सक्रिय नियम, 0% गलत रुकावटें। |
| alerts.daily_summary_title | Daily Security Summary for {site} | {site} தளத்தின் தினசரி பாதுகாப்பு அறிக்கை | {site} की दैनिक सुरक्षा रिपोर्ट |
| alerts.empty | No alerts recorded yet. | இதுவரை எந்த எச்சரிக்கையும் இல்லை. | अभी तक कोई सुरक्षा अलर्ट नहीं है। |
| alerts.filterAll | All Severities | அனைத்து நிலைகளும் | सभी स्तर |
| alerts.flagged_request_msg | Observed unusual request on {endpoint} with risk score {score}. Currently monitoring. | {endpoint} பக்கத்தில் {score} அபாய அளவிலான அசாதாரண நடவடிக்கை கண்காணிக்கப்படுகிறது. | {endpoint} पर {score} जोखिम स्तर का असामान्य ट्रैफ़िक देखा गया है। अभी निगरानी की जा रही है। |
| alerts.flagged_request_title | Suspicious Activity Detected on {site} | {site} தளத்தில் சந்தேகத்திற்கிடமான நடவடிக்கை கண்டறியப்பட்டது | {site} पर संदिग्ध गतिविधि देखी गई |
| alerts.markRead | Mark as Read | படித்ததாகக் குறி | पढ़ा हुआ चिह्नित करें |
| alerts.new_patch_proposed_msg | A new virtual patch rule was generated for {cve_id} on {site}. Automated sandbox testing has begun. | {site} தளத்தில் உள்ள {cve_id} பாதிப்பிற்காக புதிய பாதுகாப்பு விதி உருவாக்கப்பட்டு சோதனை தொடங்கப்பட்டுள்ளது. | {site} पर {cve_id} के लिए नया सुरक्षा नियम तैयार कर स्वचालित परीक्षण शुरू कर दिया गया है। |
| alerts.new_patch_proposed_title | Virtual Patch Proposed for {cve_id} | {cve_id} பாதிப்பிற்கு மெய்நிகர் பாதுகாப்பு தயார் | {cve_id} के लिए वर्चुअल पैच तैयार है |
| alerts.rule_canary_msg | Rule for {cve_id} is currently protecting {percent}% of live traffic safely. | {cve_id} பாதுகாப்பு விதி தற்போது நேரலை போக்குவரத்தின் {percent}% அளவில் வெற்றிகரமாகச் செயல்படுகிறது. | {cve_id} नियम वर्तमान में {percent}% ट्रैफ़िक की सुरक्षित सुरक्षा कर रहा है। |
| alerts.rule_canary_title | Canary Testing Active: {cve_id} | சோதனை அமலாக்கம் தொடங்கியது: {cve_id} | कैनरी परीक्षण शुरू: {cve_id} |
| alerts.rule_enforce_msg | PatchShield is actively blocking all {cve_id} exploit attempts on {site}. | {site} தளத்தில் {cve_id} தொடர்பான அனைத்து அத்துமீறல்களும் இப்போது முழுமையாகத் தடுக்கப்படுகின்றன. | {site} पर {cve_id} के सभी हमलों को अब पूरी तरह ब्लॉक किया जा रहा है। |
| alerts.rule_enforce_title | Virtual Patch Fully Enforced: {cve_id} | முழு பாதுகாப்பு நடைமுறைக்கு வந்தது: {cve_id} | वर्चुअल पैच पूरी तरह लागू: {cve_id} |
| alerts.rule_rollback_msg | Rule for {cve_id} was rolled back because potential false blocks exceeded safety threshold. Normal business traffic is unaffected. | வாடிக்கையாளர் போக்குவரத்தில் சிறு பாதிப்பு கூட வரக்கூடாது என்பதால் {cve_id} விதி தானாக நிறுத்தப்பட்டது. உங்கள் வணிகம் பாதுகாப்பாக இயங்குகிறது. | ग्राहकों के ट्रैफ़िक में रुकावट से बचने के लिए {cve_id} नियम को वापस ले लिया गया है। आपका व्यापार सुचारू रूप से चल रहा है। |
| alerts.rule_rollback_title | Safety Rollback Triggered: {cve_id} | பாதுகாப்பு திரும்பப் பெறப்பட்டது: {cve_id} | सुरक्षा नियम वापस लिया गया: {cve_id} |
| alerts.rule_shadow_msg | Rule for {cve_id} is passively observing traffic without blocking real customers. | {cve_id} விதி வாடிக்கையாளர்களைத் தடுக்காமல் போக்குவரத்தை அமைதியாகக் கண்காணித்து வருகிறது. | {cve_id} नियम असली ग्राहकों को रोके बिना ट्रैफ़िक की निगरानी कर रहा है। |
| alerts.rule_shadow_title | Rule in Shadow Mode: {cve_id} | கண்காணிப்பு முறையில் பாதுகாப்பு விதி: {cve_id} | शैडो मोड में सुरक्षा नियम: {cve_id} |
| alerts.subtitle | Real-time attack notifications and virtual patch status updates | நேரலை தாக்குதல் அறிவிப்புகள் மற்றும் மெய்நிகர் பாதுகாப்பு நிலை | रीयल-टाइम हमले की सूचनाएं एवं वर्चुअल पैच स्थिति |
| alerts.title | Security Alerts & Incident Timeline | பாதுகாப்பு எச்சரிக்கைகள் & நிகழ்வு வரிசை | सुरक्षा अलर्ट एवं घटनाक्रम |
| auth.forgot | Forgot Password? | கடவுச்சொல் மறந்துவிட்டதா? | पासवर्ड भूल गए? |
| auth.login | Login to PatchShield | பேட்ச்ஷீல்டில் உள்நுழையவும் | पैचशील्ड में लॉगिन करें |
| auth.password | Password | கடவுச்சொல் | पासवर्ड |
| auth.submit | Sign In | உள்நுழை | साइन इन करें |
| auth.totp | 6-Digit Authenticator Code | 6-இலக்க அங்கீகாரக் குறியீடு | 6-अंकों का प्रमाणीकरण कोड |
| auth.username | Username | பயனர் பெயர் | उपयोगकर्ता नाम |
| auth.wizardDesc | Get your business protected in under 3 minutes | 3 நிமிடங்களில் உங்கள் வணிகத்திற்கு பாதுகாப்பு பெறுங்கள் | 3 मिनट से भी कम समय में अपने व्यवसाय को सुरक्षित करें |
| auth.wizardTitle | PatchShield First-Run Wizard | பேட்ச்ஷீல்ட் தொடக்க வழிகாட்டி | पैचशील्ड प्रारंभिक विज़ार्ड |
| brand.name | PatchShield | பேட்ச்ஷீல்ட் (PatchShield) | पैचशील्ड (PatchShield) |
| brand.tagline | AI-Era Virtual Patching Gateway for SMBs | வணிகங்களுக்கான AI மெய்நிகர் பாதுகாப்பு நுழைவாயில் | छोटे व्यवसायों के लिए AI वर्चुअल पैचिंग गेटवे |
| common.actions | Actions | செயல்கள் | कार्रवाई |
| common.active | Active | செயலில் | सक्रिय |
| common.cancel | Cancel | ரத்து | रद्द करें |
| common.delete | Delete | நீக்கு | हटाएं |
| common.disabled | Disabled | முடக்கப்பட்டது | अक्षम |
| common.enabled | Enabled | இயக்கப்பட்டது | सक्षम |
| common.inactive | Inactive | செயலற்றது | निष्क्रिय |
| common.loading | Loading... | ஏற்றுகிறது... | लोड हो रहा है... |
| common.refresh | Refresh | புதுப்பி | रीफ्रेश करें |
| common.save | Save | சேமி | सहेजें |
| common.search | Search | தேடு | खोजें |
| common.status | Status | நிலை | स्थिति |
| dashboard.activePatches | Active Virtual Patches | செயலில் உள்ள பாதுகாப்பு விதிகள் | सक्रिय वर्चुअल पैच |
| dashboard.addSite | Add New Site | புதிய தளம் சேர்க்க | नई वेबसाइट जोड़ें |
| dashboard.agentStatus | Agent Status | AI முகவர் நிலை | AI एजेंट स्थिति |
| dashboard.blockedAttacks | Attacks Blocked (24h) | தடுக்கப்பட்ட தாக்குதல்கள் (24 மணிநேரம்) | रोके गए हमले (24 घंटे) |
| dashboard.healthScore | Overall Health Score | ஒட்டுமொத்த பாதுகாப்பு தரம் | समग्र सुरक्षा स्कोर |
| dashboard.quickActions | Quick Controls | விரைவு கட்டுப்பாடுகள் | त्वरित नियंत्रण |
| dashboard.recentAlerts | Recent Alerts | சமீபத்திய எச்சரிக்கைகள் | हालिया सुरक्षा अलर्ट |
| dashboard.subtitle | Real-time virtual patching & automated attack shield | நேரலை மெய்நிகர் பாதுகாப்பு & தானியங்கி தாக்குதல் தடுப்பு | रीयल-टाइम वर्चुअल पैचिंग एवं स्वचालित साइबर सुरक्षा |
| dashboard.testSim | Run Attack Simulator | தாக்குதல் சோதனையை இயக்கு | हमला सिम्युलेटर चलाएं |
| dashboard.title | Security Command Center | பாதுகாப்பு கட்டுப்பாட்டு மையம் | सुरक्षा नियंत्रण केंद्र |
| dashboard.totalSites | Protected Sites | பாதுகாக்கப்பட்ட தளங்கள் | सुरक्षित वेबसाइटें |
| modes.advanced | Advanced Mode (DevOps/Sec) | மேம்பட்ட முறை (தொழில்நுட்ப வல்லுநர்களுக்கு) | उन्नत मोड (तकनीकी विशेषज्ञों के लिए) |
| modes.monitor | Monitor Only | கண்காணிப்பு மட்டும் | केवल निगरानी (Monitor) |
| modes.protect | Protect (Recommended) | பாதுகாப்பு (பரிந்துரைக்கப்படுகிறது) | सुरक्षा (अनुशंसित) |
| modes.simple | Simple Mode (Shopkeeper) | எளிய முறை (வியாபாரிகளுக்கு) | सरल मोड (दुकानदारों के लिए) |
| modes.strict | Strict Enforcement | கடுமையான தடுப்பு | कड़ा प्रतिबंध (Strict) |
| nav.agent | PatchShield Agent | AI பாதுகாப்பு முகவர் (Agent) | AI सुरक्षा एजेंट |
| nav.alerts | Alerts & Notifications | எச்சரிக்கைகள் (Alerts) | सुरक्षा अलर्ट (Alerts) |
| nav.attackModules | Attack Modules | தாக்குதல் தடுப்பு தொகுதிகள் | हमला सुरक्षा मॉड्यूल |
| nav.auditLog | Audit Log | செயல் பதிவேடு (Audit Log) | ऑडिट लॉग (Audit Log) |
| nav.dashboard | Dashboard | முகப்பு (Dashboard) | डैशबोर्ड (Dashboard) |
| nav.demoLab | Demo Lab & Simulator | மாதிரி ஆய்வகம் (Demo Lab) | डेमो लैब (Demo Lab) |
| nav.help | Help & Support | உதவி & வழிகாட்டி | सहायता एवं समर्थन |
| nav.metrics | PS5 Metrics | செயல்திறன் அளவீடுகள் (Metrics) | प्रदर्शन मेट्रिक्स |
| nav.provePatch | Prove-then-Patch | நிரூபித்து இணை (Prove-then-Patch) | प्रमाणित पैच (Prove-then-Patch) |
| nav.reports | Reports & Analytics | அறிக்கைகள் (Reports) | रिपोर्ट्स (Reports) |
| nav.rules | Virtual Patch Rules | மெய்நிகர் விதிகள் (Rules) | वर्चुअल पैच नियम |
| nav.settings | Settings | அமைப்புகள் (Settings) | सेटिंग्स (Settings) |
| nav.sites | Protected Sites | பாதுகாக்கப்பட்ட தளங்கள் | सुरक्षित वेबसाइटें |
| nav.traffic | Live Traffic | நேரலை இணைய போக்குவரத்து | लाइव वेब ट्रैफ़िक |
| nav.vulnerabilities | Vulnerabilities | பாதிப்புகள் (CVEs) | कमज़ोरियाँ (CVEs) |
| reports.col_metric | Metric | அளவீடு | मेट्रिक |
| reports.col_value | Status / Value | நிலை / மதிப்பு | स्थिति / मान |
| reports.compliance_body | This system satisfies Problem Statement 5 (PS5: AI-Era Virtual Patching for Indian SMBs). All telemetry, audit logs, and virtual patches are cryptographically hashed and stored on-premises. | இக்கணினி நாஸ்காம் ARB 2.0 (பிரச்சனை அறிக்கை 5) விதிமுறைகளை முழுமையாகப் பூர்த்தி செய்கிறது. அனைத்து தரவுகளும் பாதுகாப்பாக உங்கள் கணினியிலேயே சேமிக்கப்படுகின்றன. | यह प्रणाली नैसकॉम ARB 2.0 (समस्या विवरण 5: भारतीय छोटे व्यवसायों के लिए वर्चुअल पैचिंग) की सभी आवश्यकताओं को पूरा करती है। समस्त डेटा स्थानीय रूप से सुरक्षित रखा जाता है। |
| reports.compliance_title | Nasscom ARB 2.0 Compliance Sign-off | நாஸ்காம் ARB 2.0 இணக்கச் சான்று | नैसकॉम ARB 2.0 अनुपालन प्रमाण |
| reports.csv_col_action | Defense Action | பாதுகாப்பு நடவடிக்கை | सुरक्षा कार्रवाई |
| reports.csv_col_client_ip | Client IP | பயனர் IP முகவரி | क्लाइंट IP पता |
| reports.csv_col_id | Incident ID | நிகழ்வு எண் | घटना संख्या |
| reports.csv_col_method | HTTP Method | கோரிக்கை வகை | HTTP विधि |
| reports.csv_col_path | Endpoint Path | இணையதளப் பாதை | एंडपॉइंट पथ |
| reports.csv_col_payload | Payload / Query | தாக்குதல் விவரம் | पेलोड / क्वेरी |
| reports.csv_col_status | Response Code | பதில் குறியீடு | प्रतिक्रिया कोड |
| reports.csv_col_timestamp | Timestamp | நேரம் | समय |
| reports.downloadCsv | Export Incidents (CSV) | நிகழ்வுகளைப் பதிவிறக்கு (CSV) | घटनाओं का निर्यात (CSV) |
| reports.downloadPdf | Download PDF Report | PDF அறிக்கை பதிவிறக்கு | PDF रिपोर्ट डाउनलोड करें |
| reports.generated_on | Generated on {date} \| Target: {site} | உருவாக்கப்பட்ட நேரம்: {date} \| தளம்: {site} | दिनांक: {date} \| लक्ष्य साइट: {site} |
| reports.kpi_active_patches | Active Scoped Virtual Patches | செயலில் உள்ள பாதுகாப்பு விதிகள் | सक्रिय वर्चुअल पैच नियम |
| reports.kpi_blocked_attacks | Attacks Blocked (Last 24h) | தடுக்கப்பட்ட தாக்குதல்கள் (24 மணிநேரம்) | रोके गए हमले (पिछले 24 घंटे) |
| reports.kpi_exposure | Exposure Window Reduction | ஆபத்து கால குறைப்பு சதவீதம் | जोखिम अवधि में कमी |
| reports.kpi_fp_rate | False-Block Rate (Benchmark) | தவறான தடுப்பு விகிதம் | गलत रुकावट दर (FP Rate) |
| reports.kpi_health | Overall Security Health Score | ஒட்டுமொத்த பாதுகாப்பு தரம் | समग्र सुरक्षा स्वास्थ्य स्कोर |
| reports.kpi_mttvp | Mean Time to Virtual Patch (MTTVP) | சராசரி மெய்நிகர் பாதுகாப்பு நேரம் (MTTVP) | औसत वर्चुअल पैच समय (MTTVP) |
| reports.methodology_body | Unlike legacy signature-based WAFs that frequently block legitimate shoppers, every virtual patch deployed by PatchShield underwent automated exploit sandbox verification and regression replay against recorded legitimate traffic. Active auto-rollback circuit breakers guarantee zero production disruption. | சாதாரண வாடிக்கையாளர்களைத் தவறுதலாகத் தடுக்கும் பழைய WAF முறைகளைப் போலல்லாமல், பேட்ச்ஷீல்டின் ஒவ்வொரு மெய்நிகர் பாதுகாப்பு விதியும் தானியங்கி மாதிரி சோதனைகள் மற்றும் பழைய நேரலை போக்குவரத்து மறு-சோதனைகளுக்குப் பிறகே செயல்படுத்தப்படுகிறது. | पुराने WAF नियमों के विपरीत, जो अक्सर असली ग्राहकों को ब्लॉक कर देते हैं, पैचशील्ड द्वारा तैनात प्रत्येक वर्चुअल पैच को स्वचालित सैंडबॉक्स परीक्षण और वास्तविक ट्रैफ़िक रीप्ले के बाद ही लागू किया जाता है। |
| reports.methodology_title | Prove-then-Patch Assurance Guarantee | நிரூபித்து இணை (Prove-then-Patch) உத்தரவாதம் | प्रमाणित पैच (Prove-then-Patch) आश्वासन |
| reports.subtitle | Download security compliance reports and incident logs | பாதுகாப்பு சான்றிதழ் அறிக்கைகள் மற்றும் நிகழ்வு பதிவுகளைப் பதிவிறக்கவும் | सुरक्षा अनुपालन रिपोर्ट एवं घटना लॉग डाउनलोड करें |
| reports.title | Executive Security Report | பாதுகாப்பு நிர்வாக அறிக்கை | कार्यकारी सुरक्षा रिपोर्ट |
| settings.language_desc | Select language for dashboard, alerts, and PDF/CSV reports | டாஷ்போர்டு, எச்சரிக்கைகள் மற்றும் அறிக்கைகளுக்கான மொழியைத் தேர்ந்தெடுக்கவும் | डैशबोर्ड, अलर्ट और रिपोर्ट्स के लिए पसंदीदा भाषा चुनें |
| settings.language_select | Preferred Dashboard Language | டாஷ்போர்டு மொழித் தேர்வு | डैशबोर्ड भाषा चयन |
| settings.save | Save Changes | மாற்றங்களைச் சேமி | परिवर्तन सहेजें |
| settings.tabs.about | About & Version | பதிப்பு & தகவல் | संस्करण एवं परिचय |
| settings.tabs.apiKeys | API Keys | API சாவிகள் | API कुंजियाँ |
| settings.tabs.appearance | Appearance & Language | தோற்றம் & மொழி | दिखावट एवं भाषा |
| settings.tabs.general | General | பொதுவானவை | सामान्य |
| settings.tabs.notifications | Notifications & Telegram | அறிவிப்புகள் & டெலிகிராம் | सूचनाएं एवं टेलीग्राम |
| settings.tabs.profile | Profile | சுயவிவரம் | प्रोफ़ाइल |
| settings.tabs.security | Security (2FA) | பாதுகாப்பு (2FA) | सुरक्षा (2FA) |
| settings.title | System Settings | அமைப்புகள் | सिस्टम सेटिंग्स |
| simple_mode.bot | An automated hacker scanner bot was searching your site for weaknesses. We dropped it. | உங்கள் தளத்தில் உள்ள குறைகளை கண்டறிய தானியங்கி ஸ்கேனர் பாட் முயன்றது. நாங்கள் அதை தடுத்து நிறுத்தினோம். | एक स्वचालित हैकर स्कैनर बॉट आपकी साइट की कमज़ोरियाँ ढूंढ रहा था। हमने उसे तुरंत बाहर कर दिया। |
| simple_mode.brute | Someone repeatedly guessed passwords to break into your admin area. We locked them out. | உங்கள் நிர்வாக பக்கத்திற்குள் நுழைய தொடர்ந்து கடவுச்சொற்களை தவறாக முயற்சித்தனர். நாங்கள் அவர்களை தற்காலிகமாக முடக்கிவிட்டோம். | किसी ने एडमिन खाते में घुसने के लिए बार-बार गलत पासवर्ड डालने की कोशिश की। हमने उसे बाहर कर दिया। |
| simple_mode.cmd | Someone tried to run dangerous operating system commands on your server. We blocked them safely. | உங்கள் கணினியில் ஆபத்தான கட்டளைகளை செயல்படுத்த முயன்றனர். நாங்கள் அதை உடனே தடுத்துவிட்டோம். | किसी ने आपके सर्वर पर ख़तरनाक ऑपरेटिंग सिस्टम कमांड चलाने की कोशिश की। हमने उसे तुरंत रोक दिया। |
| simple_mode.ddos | A sudden flood of fake requests tried to slow down your site. We rate-limited them. | தளத்தை முடக்க அதிகப்படியான போலி கோரிக்கைகள் அனுப்பப்பட்டன. நாங்கள் அவற்றை தடுத்து சீராக்கிவிட்டோம். | आपकी वेबसाइट को धीमा करने के लिए बहुत सारे फ़र्ज़ी अनुरोध भेजे गए। हमने ट्रैफ़िक को सीमित कर दिया। |
| simple_mode.path | Someone tried to peek into confidential server system files. We blocked them safely. | சேவையகத்தில் உள்ள ரகசிய கணினி கோப்புகளை பார்க்க முயன்றனர். நாங்கள் அதை பாதுகாப்பாக தடுத்துவிட்டோம். | किसी ने सर्वर की गोपनीय सिस्टम फ़ाइलों को देखने की कोशिश की। हमने उसे सुरक्षित रूप से रोक दिया। |
| simple_mode.sqli | Someone tried to sneak hidden database commands into your search or form. We blocked them safely. | உங்கள் தேடல் அல்லது படிவத்தில் மறைமுகமாக தரவுத்தள கட்டளைகளை நுழைக்க முயன்றனர். நாங்கள் அதை பாதுகாப்பாக தடுத்துவிட்டோம். | किसी ने आपकी खोज या फ़ॉर्म में गुप्त डेटाबेस कमांड डालने की कोशिश की। हमने उसे सुरक्षित रूप से रोक दिया। |
| simple_mode.subtitle | Plain-language explanations of what PatchShield is protecting | பேட்ச்ஷீல்ட் எவ்வாறு பாதுகாக்கிறது என்பதற்கான எளிய விளக்கங்கள் | पैचशील्ड आपकी सुरक्षा कैसे करता है, इसकी सरल व्याख्या |
| simple_mode.title | Shopkeeper Shield Assistant | வணிகர் பாதுகாப்பு உதவியாளர் | व्यापारी सुरक्षा सहायक |
| simple_mode.xss | Someone tried to inject malicious script into your web page to hijack users. We blocked them safely. | பயனர்களை ஏமாற்ற உங்கள் இணையப் பக்கத்தில் தீங்கிழைக்கும் ஸ்கிரிப்டை இயக்க முயன்றனர். நாங்கள் அதை தடுத்துவிட்டோம். | किसी ने उपयोगकर्ताओं को निशाना बनाने के लिए आपकी वेबसाइट में दुर्भावनापूर्ण कोड डालने की कोशिश की। हमने उसे रोक दिया। |
| sites.actions | Actions | செயல்கள் | कार्रवाई |
| sites.addSite | Add Site | தளம் சேர்க்க | साइट जोड़ें |
| sites.bypassStatus | Bypass Check | நேரடி அணுகல் சோதனை | डायरेक्ट बाईपास जांच |
| sites.cancel | Cancel | ரத்து | रद्द करें |
| sites.checkBypass | Test Direct Bypass | நேரடி அணுகலை சோதி | बाईपास का परीक्षण करें |
| sites.domain | Domain / Host | டொமைன் / முகவரி | डोमेन / होस्ट |
| sites.health | Health Score | பாதுகாப்பு தரம் | स्वास्थ्य स्कोर |
| sites.language | Preferred Language | விருப்பமான மொழி | पसंदीदा भाषा |
| sites.mode | Security Mode | பாதுகாப்பு முறை | सुरक्षा मोड |
| sites.safe | Protected (No Bypass) | பாதுகாப்பானது (நேரடி அணுகல் இல்லை) | सुरक्षित (कोई बाईपास नहीं) |
| sites.save | Save Site | சேமி | सहेजें |
| sites.siteName | Site Name | தளத்தின் பெயர் | साइट का नाम |
| sites.subtitle | Manage reverse proxy routes and upstream configurations | வலைப்பின்னல் வழிகள் மற்றும் இணைப்பு அமைப்புகளை நிர்வகிக்கவும் | रिवर्स प्रॉक्सी मार्ग एवं अपस्ट्रीम सर्वर प्रबंधित करें |
| sites.title | Protected Websites & APIs | பாதுகாக்கப்பட்ட இணையதளங்கள் & APIகள் | सुरक्षित वेबसाइटें एवं APIs |
| sites.upstream | Upstream URL | சேவையக URL | अपस्ट्रीम URL |
| sites.vulnerable | Direct Access Exposed! | நேரடி அணுகல் அபாயம் உள்ளது! | सीधा प्रवेश खुला है! |
| topbar.language | Language | மொழி | भाषा |
| topbar.logout | Logout | வெளியேறு | लॉग आउट |
| topbar.notifications | Notifications | அறிவிப்புகள் | सूचनाएं |
| topbar.profile | Profile | சுயவிவரம் | प्रोफ़ाइल |
| topbar.search | Search routes, rules, CVEs... (Ctrl+K) | தேடவும்... (Ctrl+K) | खोजें... (Ctrl+K) |
| topbar.themeDark | Dark | இருள் | डार्क |
| topbar.themeLight | Light | வெளிச்சம் | लाइट |
| topbar.themeSystem | System | அமைப்பு | सिस्टम |