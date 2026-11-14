import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export const Reports: React.FC = () => {
  const { language, t } = useLanguage();
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await api.get('/reports/pdf', {
        params: { lang: language },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PatchShield_Security_Report_${language}_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to download PDF report");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadCsv = async () => {
    setDownloadingCsv(true);
    try {
      const res = await api.get('/reports/csv/incidents', {
        params: { lang: language },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv; charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PatchShield_Incidents_${language}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to download CSV export");
    } finally {
      setDownloadingCsv(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('reports.title')}
        </h2>
        <p className="text-xs text-slate-500">
          {t('reports.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Executive PDF Summary */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {language === 'ta' 
                  ? 'நிர்வாக வாராந்திர பாதுகாப்பு அறிக்கை (PDF)' 
                  : language === 'hi'
                  ? 'कार्यकारी साप्ताहिक सुरक्षा रिपोर्ट (PDF)'
                  : 'Executive Security Briefing (PDF)'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ta'
                  ? 'தளத்தின் பாதுகாப்பு தரம், செயலில் உள்ள மெய்நிகர் விதிகள் மற்றும் நாஸ்காம் ARB 2.0 அளவீடுகளின் சுருக்கம்.'
                  : language === 'hi'
                  ? 'वेबसाइट सुरक्षा स्कोर, सक्रिय वर्चुअल पैच नियम और नैसकॉम ARB 2.0 मेट्रिक्स का प्रमाणित सारांश।'
                  : 'Branded PDF document summarizing site health scores, active virtual patches, blocked attacks, and MTTVP metrics.'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>&bull; {language === 'ta' ? 'தமிழ் எழுத்துருக்களுடன் அழகாக வடிவமைக்கப்பட்டது' : language === 'hi' ? 'देवनागरी फॉन्ट के साथ तैयार' : 'Embedded TrueType fonts (Tamil, Devanagari)'}</p>
              <p>&bull; {language === 'ta' ? 'நாஸ்காம் ARB 2.0 PS5 இணக்கத்தன்மை' : language === 'hi' ? 'नैसकॉम ARB 2.0 PS5 अनुपालन' : 'Nasscom ARB 2.0 PS5 Compliance'}</p>
              <p>&bull; {language === 'ta' ? 'தொழில்நுட்பம் அறியாத வணிகர்களுக்கான எளிய சொற்கள்' : language === 'hi' ? 'गैर-तकनीकी व्यापारियों के लिए सरल भाषा' : 'Plain language for non-technical owners'}</p>
            </div>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-2"
          >
            <Download className={`w-4 h-4 ${downloadingPdf ? 'animate-bounce' : ''}`} />
            <span>{downloadingPdf ? t('common.loading') : t('reports.downloadPdf')}</span>
          </button>
        </div>

        {/* Card 2: Incident CSV Export */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {language === 'ta'
                  ? 'தடுக்கப்பட்ட தாக்குதல்களின் பதிவேடு (CSV)'
                  : language === 'hi'
                  ? 'रोके गए सुरक्षा हमलों का बहीखाता (CSV)'
                  : 'Blocked Incidents Ledger (CSV)'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ta'
                  ? 'தடுக்கப்பட்ட அனைத்து அத்துமீறல்கள், IP முகவரிகள் மற்றும் பிலோட்களின் விரிவான பட்டியல்.'
                  : language === 'hi'
                  ? 'रोके गए सभी हमलों, क्लाइंट IP पतों और पेलोड का विस्तृत स्प्रेडशीट डेटा।'
                  : 'Raw comma-separated spreadsheet of all blocked intrusion attempts, client IPs, payloads, and triggered rules.'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>&bull; {language === 'ta' ? 'Excel-ல் நேரடியாகத் திறக்க UTF-8 BOM சேர்க்கப்பட்டுள்ளது' : language === 'hi' ? 'एक्सेल में सही प्रदर्शन हेतु UTF-8 BOM युक्त' : 'Excel-compatible UTF-8 BOM encoding'}</p>
              <p>&bull; {language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட மொழியில் தலைப்புகள்' : language === 'hi' ? 'चुनी गई भाषा में कॉलम शीर्षक' : 'Localized column headers'}</p>
              <p>&bull; {language === 'ta' ? 'வாடிக்கையாளர் ரகசிய விவரங்கள் மறைக்கப்பட்டுள்ளன' : language === 'hi' ? 'गोपनीय डेटा सुरक्षित रूप से हटाया गया' : 'Sanitized PII (passwords redacted)'}</p>
            </div>
          </div>

          <button
            onClick={handleDownloadCsv}
            disabled={downloadingCsv}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center justify-center space-x-2"
          >
            <Download className={`w-4 h-4 ${downloadingCsv ? 'animate-bounce' : ''}`} />
            <span>{downloadingCsv ? t('common.loading') : t('reports.downloadCsv')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
