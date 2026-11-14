import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

new_strings = {
    "en": {
        "ssrf": "Someone tried to manipulate your server to secretly access internal cloud services or private network data. We blocked them safely.",
        "recon": "Someone probed for secret configuration or backup files like .env or database dumps. We trapped and dropped them.",
        "xxe": "Someone sent a malformed XML file trying to read confidential server files. We blocked them safely.",
        "ssti": "Someone tried to inject malicious template code to execute commands on your web server. We blocked them safely.",
        "deserial": "Someone sent crafted serialized object code to trigger remote execution on your server. We blocked them safely.",
        "redirect": "Someone tried to abuse your store links to redirect shoppers to an external phishing website. We blocked them safely.",
        "csrf": "An external unauthorized source tried to trigger actions on your store on behalf of a user. We blocked them safely.",
        "nosql": "Someone tried to bypass authentication using NoSQL database injection operators. We blocked them safely.",
        "smuggling": "Someone tried to desynchronize HTTP headers or split lines to smuggle hidden requests. We dropped them.",
        "ldap": "Someone tried to inject wildcard operators into directory search to bypass employee login. We blocked them.",
        "graphql": "Someone probed your API schema or sent circular query bombs to overwhelm your system. We blocked them.",
        "mass_assign": "Someone tried to tamper with payment amounts or promote themselves to store administrator. We blocked them.",
        "proto_abuse": "Someone tried to bypass safety checks using forbidden HTTP methods or null-byte characters. We blocked them."
    },
    "ta": {
        "ssrf": "யாரோ உங்கள் சர்வரைப் பயன்படுத்தி உள் கிளவுட் ரகசியங்களை திருட முயன்றனர். நாங்கள் அதை பாதுகாப்பாக தடுத்தோம்.",
        "recon": "ரகசிய சர்வர் கோப்புகள் அல்லது பேக்கப் தரவுகளை தேடிய போலி முயற்சிகள் தடுத்து முடக்கப்பட்டன.",
        "xxe": "ரகசிய கோப்புகளை திருட அனுப்பப்பட்ட தவறான XML கோப்பு முயற்சி வெற்றிகரமாக முறியடிக்கப்பட்டது.",
        "ssti": "உங்கள் சர்வரில் ரகசிய குறியீடுகளை இயக்க முயன்ற டெம்ப்ளேட் தாக்குதல் பாதுகாப்பாக தடுக்கப்பட்டது.",
        "deserial": "சர்வரில் தானியங்கி தாக்குதல் நடத்த அனுப்பப்பட்ட ஆபத்தான குறியீட்டு அமைப்பு தடுக்கப்பட்டது.",
        "redirect": "வாடிக்கையாளர்களை போலி வலைத்தளத்திற்கு திருப்பிவிட முயன்ற ஃபிஷிங் முயற்சி பாதுகாப்பாக தடுக்கப்பட்டது.",
        "csrf": "அனுமதியற்ற வெளி தளத்திலிருந்து வந்த போலி கோரிக்கை உடனடியாக முடக்கப்பட்டது.",
        "nosql": "NoSQL டேட்டாபேஸ் வழியே உள்நுழைய முயன்ற போலி தேடல் முயற்சி பாதுகாப்பாக தடுக்கப்பட்டது.",
        "smuggling": "இணைய நெறிமுறைகளை ஏமாற்றி ரகசிய கோரிக்கைகளை கடத்த முயன்ற முயற்சி தடுக்கப்பட்டது.",
        "ldap": "அங்கீகாரத்தை மீறி நுழைய முயன்ற அடைவு தேடல் தாக்குதல் பாதுகாப்பாக முடக்கப்பட்டது.",
        "graphql": "API அமைப்பை ரகசியமாக உளவு பார்க்க முயன்ற அதிகப்படியான கேள்விகள் தடுக்கப்பட்டன.",
        "mass_assign": "பணம் செலுத்தும் தொகையை மாற்றவோ அல்லது நிர்வாக அனுமதியை திருடவோ முயன்ற முயற்சி தடுக்கப்பட்டது.",
        "proto_abuse": "தடைசெய்யப்பட்ட நெறிமுறைகள் அல்லது போலி குறியீடுகளை பயன்படுத்தி நுழைய முயன்ற முயற்சி தடுக்கப்பட்டது."
    },
    "hi": {
        "ssrf": "किसी ने आपके सर्वर के ज़रिये गुप्त क्लाउड या निजी नेटवर्क डेटा चुराने की कोशिश की। हमने उसे सुरक्षित रूप से रोक दिया।",
        "recon": "किसी ने गुप्त कॉन्फ़िग या बैकअप फ़ाइलों की टोह लेने की कोशिश की। हमने उसे तुरंत रोक दिया।",
        "xxe": "किसी ने गुप्त फ़ाइलें पढ़ने के लिए दुर्भावनापूर्ण XML भेजा। हमने उसे सुरक्षित रूप से ब्लॉक कर दिया।",
        "ssti": "किसी ने आपके सर्वर पर कोड चलाने के लिए दुर्भावनापूर्ण टेम्प्लेट कोड इंजेक्ट करने की कोशिश की। हमने उसे रोक दिया।",
        "deserial": "किसी ने सर्वर पर रिमोट कोड चलाने के लिए खतरनाक ऑब्जेक्ट भेजा। हमने उसे ब्लॉक कर दिया।",
        "redirect": "किसी ने आपके ग्राहकों को फ़र्जी फ़िशिंग वेबसाइट पर भेजने के लिए लिंक का दुरुपयोग करने की कोशिश की। हमने उसे रोक दिया।",
        "csrf": "किसी बाहरी अनधिकृत स्रोत ने उपयोगकर्ता की ओर से कोई क्रिया करने की कोशिश की। हमने उसे रोक दिया।",
        "nosql": "किसी ने NoSQL डेटाबेस ऑपरेटरों के ज़रिये अनधिकृत प्रवेश करने की कोशिश की। हमने उसे रोक दिया।",
        "smuggling": "किसी ने नेटवर्क हेडर में हेरफेर करके छिपे हुए अनुरोध भेजने की कोशिश की। हमने उसे रोक दिया।",
        "ldap": "किसी ने लॉगिन बायपास करने के लिए डायरेक्टरी सर्च में हेरफेर की कोशिश की। हमने उसे रोक दिया।",
        "graphql": "किसी ने सिस्टम पर दबाव डालने के लिए अत्यधिक जटिल प्रश्न भेजे। हमने उसे सुरक्षित रूप से ब्लॉक कर दिया।",
        "mass_assign": "किसी ने भुगतान राशि बदलने या स्वयं को व्यवस्थापक बनाने की कोशिश की। हमने उसे तुरंत रोक दिया।",
        "proto_abuse": "किसी ने प्रतिबंधित प्रोटोकॉल या अवैध वर्णों का उपयोग करके सुरक्षा को बायपास करने की कोशिश की। हमने उसे रोक दिया।"
    }
}

for lang in ["en", "ta", "hi"]:
    path = ROOT / "locales" / f"{lang}.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if "simple_mode" not in data:
        data["simple_mode"] = {}

    for k, v in new_strings[lang].items():
        data["simple_mode"][k] = v

    # Write back to locales/
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Mirror to backend/app/locales/
    b_path = ROOT / "backend" / "app" / "locales" / f"{lang}.json"
    b_path.parent.mkdir(parents=True, exist_ok=True)
    with open(b_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Mirror to frontend/src/i18n/
    f_path = ROOT / "frontend" / "src" / "i18n" / f"{lang}.json"
    f_path.parent.mkdir(parents=True, exist_ok=True)
    with open(f_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("Catalogs updated and mirrored successfully!")

