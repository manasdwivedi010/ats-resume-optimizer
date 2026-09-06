import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Sparkles,
  Copy,
  Check,
  Zap,
  Tag,
  FileCheck2
} from 'lucide-react';

export default function FlawCards({
  flaws = [],
  recommendations = [],
  missingSkills = [],
  presentSkills = [],
  targetRole
}) {
  const [copiedSkill, setCopiedSkill] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSkill(text);
    setTimeout(() => setCopiedSkill(null), 2000);
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-600 border border-rose-200">
            HIGH RISK
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-600 border border-amber-200">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-600 border border-blue-200">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Missing Technical Skills (Directly targets < 90%) */}
      {missingSkills.length > 0 && (
        <div className="saas-card p-6 rounded-2xl border-l-4 border-l-rose-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Missing Required Keywords ({missingSkills.length})
              </h4>
            </div>
            <span className="text-xs text-slate-400">Click any skill to copy to clipboard</span>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Applicant Tracking Systems automatically score candidates down when these core keywords for{' '}
            <strong className="text-slate-900 capitalize">{targetRole}</strong> are missing:
          </p>

          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill, idx) => (
              <button
                key={idx}
                onClick={() => handleCopy(skill)}
                className="group px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span>{skill}</span>
                {copiedSkill === skill ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 group-hover:text-rose-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Detected Flaws Grid */}
      {flaws.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Detected Flaws & Formatting Warnings ({flaws.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flaws.map((flaw, idx) => (
              <div
                key={idx}
                className="saas-card p-4 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800">{flaw.category}</span>
                    {getSeverityBadge(flaw.severity)}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{flaw.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Actionable Rewrite Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Suggested Upgrades to Reach 90%+ Score
          </h4>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="saas-card p-5 rounded-xl space-y-3 border-l-4 border-l-blue-600"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    {rec.section}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {rec.priority || 'Upgrade'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{rec.advice}</p>

                {rec.example_rewrite && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-line">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                      Target Transformation
                    </div>
                    {rec.example_rewrite}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Confirmed Present Skills */}
      {presentSkills.length > 0 && (
        <div className="saas-card p-5 rounded-xl">
          <h4 className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            Skills Verified in Your Resume ({presentSkills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {presentSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
