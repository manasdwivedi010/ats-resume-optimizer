import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertTriangle, XCircle, Award } from 'lucide-react';

export default function ScoreGauge({ score, threshold = 90, breakdown, targetRole }) {
  const isAbove = score >= threshold;
  const isWarning = score >= 70 && score < threshold;
  const isCritical = score < 70;

  useEffect(() => {
    if (isAbove) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#3b82f6']
      });
    }
  }, [isAbove]);

  const strokeColor = isAbove
    ? '#10b981' // emerald
    : isWarning
    ? '#f59e0b' // amber
    : '#f43f5e'; // rose

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="saas-card p-6 sm:p-8 rounded-2xl">
      <div className="flex flex-col md:flex-row items-center gap-8">
        
        {/* Circle Gauge */}
        <div className="relative flex flex-col items-center justify-center shrink-0">
          <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 170 170">
            <circle
              cx="85"
              cy="85"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="85"
              cy="85"
              r={radius}
              stroke={strokeColor}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Inner Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-4xl font-extrabold text-slate-900">{score}</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ATS Score</span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: strokeColor }}
            />
            <span style={{ color: strokeColor }}>
              {isAbove ? 'READY FOR APPLICATION' : isWarning ? 'NEEDS WORK (< 90%)' : 'CRITICAL FLAWS DETECTED'}
            </span>
          </div>
        </div>

        {/* Breakdown Rubric */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                ATS Diagnostic Rubric
              </h3>
              <p className="text-xs text-slate-500">
                {isAbove
                  ? 'Great job! Your resume passes top ATS company screening filters.'
                  : `Score is below ${threshold}%. Resolve the flaws and missing skills below to qualify.`}
              </p>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 w-fit">
              Benchmark Target: {threshold}%
            </div>
          </div>

          {breakdown && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Hard Skills & Target Keywords
                  </span>
                  <span className="font-bold text-slate-900">
                    {breakdown.hard_skills.score} / {breakdown.hard_skills.max} ({breakdown.hard_skills.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${breakdown.hard_skills.percentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    Experience & Title Alignment
                  </span>
                  <span className="font-bold text-slate-900">
                    {breakdown.experience.score} / {breakdown.experience.max} ({breakdown.experience.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${breakdown.experience.percentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                    Action Verbs & Impact Metrics
                  </span>
                  <span className="font-bold text-slate-900">
                    {breakdown.action_verbs_and_metrics.score} / {breakdown.action_verbs_and_metrics.max} ({breakdown.action_verbs_and_metrics.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-600 rounded-full transition-all duration-700"
                    style={{ width: `${breakdown.action_verbs_and_metrics.percentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Soft Skills</span>
                    <span className="font-bold text-slate-800">{breakdown.soft_skills.score}/10</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-600 rounded-full"
                      style={{ width: `${breakdown.soft_skills.percentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Formatting</span>
                    <span className="font-bold text-slate-800">{breakdown.formatting.score}/10</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${breakdown.formatting.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
