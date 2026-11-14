import React, { useState } from 'react';
import { FileText, Download, ShieldCheck, FileSpreadsheet, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export const Reports: React.FC = () => {
  const { language, t } = useLanguage();
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await api.get('/reports/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PatchShield_Security_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
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
      const res = await api.get('/reports/csv/incidents', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PatchShield_Incidents_${new Date().toISOString().slice(0, 10)}.csv`);
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
          {t('nav.reports')} & Compliance Exports
        </h2>
        <p className="text-xs text-slate-500">
          Executive security briefings and incident audit logs formatted for SMB owners, audits, and leadership.
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
                Executive Weekly Security Briefing (PDF)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Branded PDF document summarizing site health scores, active virtual patches, blocked attacks, and Mean Time to Virtual Patch (MTTVP) reduction metrics.
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>&bull; Formatted for non-technical stakeholders</p>
              <p>&bull; Includes Nasscom ARB 2.0 PS5 compliance metrics</p>
              <p>&bull; Signed cryptographic hash included</p>
            </div>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-2"
          >
            <Download className={`w-4 h-4 ${downloadingPdf ? 'animate-bounce' : ''}`} />
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download Executive PDF Report'}</span>
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
                Blocked Security Incidents Ledger (CSV)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Raw comma-separated spreadsheet of all blocked intrusion attempts, client IPs, payloads, and triggered virtual patch rules.
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>&bull; Full payload & timestamp audit trail</p>
              <p>&bull; Compatible with Excel, Google Sheets, SIEM</p>
              <p>&bull; Sanitized PII (no customer passwords exported)</p>
            </div>
          </div>

          <button
            onClick={handleDownloadCsv}
            disabled={downloadingCsv}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center justify-center space-x-2"
          >
            <Download className={`w-4 h-4 ${downloadingCsv ? 'animate-bounce' : ''}`} />
            <span>{downloadingCsv ? 'Exporting CSV...' : 'Export Incidents to CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
