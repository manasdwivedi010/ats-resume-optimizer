import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Clock, 
  AlertTriangle, 
  UploadCloud, 
  Sparkles,
  FileText,
  Wand2
} from 'lucide-react';

export default function HeroPreview({ onStartScan, onSampleReport, onOpenMaker }) {
  return (
    <section className="pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>FREE - INSTANT RESULTS</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08]">
              Free ATS resume checker <br />
              <span className="text-blue-600">Check your score</span> before you apply
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              Upload your resume to check common formatting, parsing, and content risks using our diagnostic rubric benchmarked against the 90% pass threshold.
            </p>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited free analyses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Sign in to save results</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>30-second results</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Email OTP verification</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onStartScan}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
              >
                <span>Run my free ATS check</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenMaker}
                className="px-6 py-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Wand2 className="w-4 h-4 text-indigo-600" />
                <span>AI Resume Maker (90%+)</span>
              </button>

              <button
                onClick={onSampleReport}
                className="px-4 py-3.5 rounded-xl text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
              >
                See sample report
              </button>
            </div>

            <p className="text-xs text-slate-400">
              PDF or DOCX &bull; up to 10 MB &bull; see our Privacy Policy for data-handling details
            </p>
          </div>

          {/* Right Mockup Preview matching screenshot */}
          <div className="lg:col-span-6">
            <div className="browser-window overflow-hidden border border-slate-200">
              {/* Browser Header Bar */}
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
                <div className="flex-1 max-w-sm mx-auto bg-white border border-slate-200 text-slate-500 text-[11px] py-1 px-3 rounded-md text-center font-mono flex items-center justify-center gap-1.5 shadow-2xs">
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span>atsresume.com/free-ats-check</span>
                </div>
              </div>

              {/* Main Card Split View */}
              <div className="p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Resume Excerpt */}
                  <div className="md:col-span-7 bg-white rounded-xl p-4 border border-slate-100 shadow-xs space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Ananya Sharma</h4>
                      <p className="text-xs font-semibold text-blue-600">Product Designer</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">ananya.s@email.com &bull; Bengaluru &bull; linkedin.com/in/ananya</p>
                    </div>

                    {/* Section: Experience */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-blue-600 inline-block"></span>
                        EXPERIENCE
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        Senior Product Designer, <span className="font-normal text-slate-600">Acme</span>
                      </div>

                      {/* Bullet with Weak Verb tag */}
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-slate-700 leading-snug">
                            &bull; Responsible for the design of various features and flows.
                          </p>
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                            weak verb
                          </span>
                        </div>
                      </div>

                      {/* Bullet with Add Metric tag */}
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-slate-700 leading-snug">
                            &bull; Ran user research to guide the roadmap.
                          </p>
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                            add metric
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section: Skills */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-blue-600 inline-block"></span>
                        SKILLS
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                        <span>UX Research &bull; Prototyping &bull; Design Systems</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                          + keyword
                        </span>
                      </div>
                    </div>

                    {/* Section: Education */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-slate-300 inline-block"></span>
                        EDUCATION
                      </div>
                      <div className="w-28 h-2 bg-slate-200 rounded-full"></div>
                    </div>
                  </div>

                  {/* Right Score & Rubric Breakdown */}
                  <div className="md:col-span-5 bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col items-center text-center">
                    {/* Circle Score */}
                    <div className="relative w-28 h-28 flex items-center justify-center my-1">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#f1f5f9"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#f59e0b"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - 62 / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-extrabold text-slate-900">62</span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-4">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>NEEDS WORK (&lt; 90%)</span>
                    </div>

                    {/* Breakdown Rubric */}
                    <div className="w-full space-y-2.5 text-left text-xs mb-4">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Work Experience
                        </span>
                        <span className="font-bold text-slate-900">
                          <span className="text-rose-500">58</span>/100
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Skills & Keywords
                        </span>
                        <span className="font-bold text-slate-900">
                          <span className="text-amber-500">64</span>/100
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Impact, Grammar & Consistency
                        </span>
                        <span className="font-bold text-slate-900">
                          <span className="text-rose-500">49</span>/100
                        </span>
                      </div>
                    </div>

                    {/* Fix with ATS AI Button */}
                    <button
                      onClick={onOpenMaker}
                      className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Fix with ATS AI (90%+)</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Alert Banner */}
                <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2 text-xs text-slate-700">
                  <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Scored 62.</strong> Found a weak verb, a missing metric, an unmatched keyword. Goal is &ge; 90%.
                  </span>
                </div>
              </div>

              {/* Carousel Indicator Dots */}
              <div className="bg-slate-50 py-2.5 flex items-center justify-center gap-1.5 border-t border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="w-4 h-1.5 rounded-full bg-blue-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
