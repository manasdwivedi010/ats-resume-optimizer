import React, { useEffect, useState } from 'react';
import { Clock, FileText, CheckCircle2, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import { atsApi } from '../services/api';

export default function HistoryList({ onSelectScan }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await atsApi.getHistory();
      setHistory(data.scans || []);
    } catch (err) {
      setError('Failed to load past scans from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 saas-card rounded-2xl">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading saved evaluations from MongoDB...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 saas-card rounded-2xl border border-rose-200 text-rose-700 text-xs text-center">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center p-12 saas-card rounded-2xl">
        <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800 mb-1">No Past Scans Saved</h3>
        <p className="text-xs text-slate-500">Run an ATS analysis to save and track your score history!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Past Resume Analyses ({history.length})</span>
        </h3>
        <span className="text-xs text-slate-400">Stored in MongoDB</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {history.map((scan) => {
          const isAbove = scan.overall_score >= 90;
          return (
            <div
              key={scan.id}
              onClick={() => onSelectScan(scan)}
              className="saas-card p-4 rounded-xl hover:border-blue-300 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{scan.filename}</span>
                    <span className="text-xs text-slate-500 capitalize">&bull; {scan.target_role}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(scan.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    {isAbove ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span
                      className={`text-sm font-extrabold ${
                        isAbove ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {scan.overall_score}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {scan.flaws?.length || 0} flaws flagged
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
