import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroPreview from './components/HeroPreview';
import FileUpload from './components/FileUpload';
import ScoreGauge from './components/ScoreGauge';
import FlawCards from './components/FlawCards';
import HistoryList from './components/HistoryList';
import LoginOTP from './components/LoginOTP';
import ResumeMaker from './components/ResumeMaker';
import { atsApi } from './services/api';
import { Sparkles, ArrowLeft, RefreshCw, Wand2, Download } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'scan' | 'history' | 'maker'
  const [scanResult, setScanResult] = useState(null);
  const [makerData, setMakerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ats_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ats_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ats_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    // Check saved user session
    const savedUser = localStorage.getItem('ats_user');
    const token = localStorage.getItem('ats_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('ats_user');
      }
    }

    // Load available roles
    atsApi
      .getRoles()
      .then((data) => {
        if (data.roles) setRoles(data.roles);
      })
      .catch((err) => console.error('Roles fetch failed', err));

    const handleAuthChange = () => {
      setUser(null);
      setScanResult(null);
    };
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ats_token');
    localStorage.removeItem('ats_user');
    setUser(null);
    setScanResult(null);
    setCurrentView('home');
  };

  const handleAnalyzeResume = async (formData) => {
    setLoading(true);
    try {
      const response = await atsApi.analyzeResume(formData);
      if (response.success && response.data) {
        setScanResult(response.data);
        setShowUploadModal(false);
        setCurrentView('scan');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setShowAuthModal(true);
      } else {
        alert(err.response?.data?.detail || 'Analysis failed. Please check your resume file.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSampleReport = () => {
    const sample = {
      overall_score: 62,
      is_above_threshold: false,
      threshold: 90,
      target_role: "Product Designer",
      word_count: 320,
      bullet_count: 3,
      breakdown: {
        hard_skills: { score: 24.0, max: 40, percentage: 60 },
        experience: { score: 18.0, max: 25, percentage: 72 },
        action_verbs_and_metrics: { score: 7.0, max: 15, percentage: 47 },
        soft_skills: { score: 7.0, max: 10, percentage: 70 },
        formatting: { score: 6.0, max: 10, percentage: 60 }
      },
      skills_analysis: {
        present: ["UX Research", "Prototyping", "Design Systems"],
        missing: ["Figma", "Design Tokens", "Wireframing", "A/B Testing", "Usability Testing", "Interaction Design"]
      },
      flaws: [
        {
          category: "Weak Passive Phrasing",
          severity: "Medium",
          description: "Bullet point begins with passive phrase 'Responsible for the design of various features'. ATS favors active impact verbs."
        },
        {
          category: "Lack of Quantified Impact",
          severity: "High",
          description: "Bullet point 'Ran user research to guide the roadmap' lacks measurable business outcomes or metrics."
        },
        {
          category: "Missing Core Target Keywords",
          severity: "High",
          description: "Missing essential Product Design industry keywords: Figma, Design Tokens, A/B Testing."
        }
      ],
      recommendations: [
        {
          section: "Experience Bullets",
          priority: "High",
          advice: "Replace 'Responsible for' with power verbs like 'Architected', 'Spearheaded', or 'Standardized'.",
          example_rewrite: "Before: 'Responsible for the design of various features and flows.'\nAfter: 'Spearheaded end-to-end design of core checkout flows in Figma, reducing checkout abandonment by 23%.'"
        },
        {
          section: "Metrics & Impact",
          priority: "High",
          advice: "Quantify research outcomes with candidate/user counts and retention lift.",
          example_rewrite: "Before: 'Ran user research to guide the roadmap.'\nAfter: 'Executed 45+ usability testing sessions, translating user feedback into high-priority roadmap initiatives that accelerated feature adoption by 35%.'"
        }
      ],
      contact_detected: { name: "Ananya Sharma", email: "ananya.s@email.com", phone: "+91 98765 43210" }
    };

    setScanResult(sample);
    setCurrentView('scan');
  };

  const handleOpenMakerWithData = (data = null) => {
    setMakerData(data || scanResult);
    setCurrentView('maker');
  };

  const handleSelectHistoricalScan = (scan) => {
    setScanResult({
      overall_score: scan.overall_score,
      threshold: scan.threshold || 90,
      breakdown: scan.breakdown,
      flaws: scan.flaws,
      recommendations: scan.recommendations,
      target_role: scan.target_role,
      skills_analysis: {
        missing: scan.missing_skills || [],
        present: scan.present_skills || []
      },
      contact_detected: scan.contact_detected
    });
    setCurrentView('scan');
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view === 'home') setScanResult(null);
        }}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1">
        {/* 1. View: AI Resume Maker */}
        {currentView === 'maker' ? (
          <ResumeMaker
            initialScanData={makerData}
            onBack={() => setCurrentView(scanResult ? 'scan' : 'home')}
          />
        ) : currentView === 'history' ? (
          /* 2. View: Past Scan History */
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <HistoryList onSelectScan={handleSelectHistoricalScan} />
          </div>
        ) : scanResult ? (
          /* 3. View: Scan Results */
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header with scan metadata and Fix with Maker CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    ATS Diagnostic Report
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                    {scanResult.target_role}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Benchmarked against the 90% pass threshold &bull; Evaluated using role-tailored ATS rubric
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Direct CTA to build the 90%+ resume and download PDF */}
                <button
                  onClick={() => handleOpenMakerWithData(scanResult)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-500/25"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Fix with AI Resume Maker (Get 90%+ PDF)</span>
                </button>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another</span>
                </button>
              </div>
            </div>

            {/* Circular Gauge and Rubric */}
            <ScoreGauge
              score={scanResult.overall_score}
              threshold={scanResult.threshold || 90}
              breakdown={scanResult.breakdown}
              targetRole={scanResult.target_role}
            />

            {/* Granular Flaw Diagnostics & Rewrite Cards */}
            <FlawCards
              flaws={scanResult.flaws}
              recommendations={scanResult.recommendations}
              missingSkills={scanResult.skills_analysis?.missing || []}
              presentSkills={scanResult.skills_analysis?.present || []}
              targetRole={scanResult.target_role}
            />
          </div>
        ) : (
          /* 4. View: Home / Landing */
          <div>
            <HeroPreview
              onStartScan={() => setShowUploadModal(true)}
              onSampleReport={handleSampleReport}
              onOpenMaker={() => handleOpenMakerWithData(null)}
            />

            {/* Rubric Explainer Section */}
            <section id="rubric" className="py-16 bg-slate-50/60 border-t border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Why the 90% Rule Matters
                  </h2>
                  <p className="text-sm text-slate-500 mt-2">
                    Tier-1 tech companies and recruiting platforms use automated filters that filter out resumes with sub-90% keyword relevance.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="saas-card p-6 rounded-2xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">40% Hard Skills Match</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      We match your resume against verified skill taxonomies for your target role, flagging every missing technical competency.
                    </p>
                  </div>

                  <div className="saas-card p-6 rounded-2xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">AI Resume Maker & PDF</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Automatically fills in missing keywords, rewrites weak bullets with metrics, and exports a clean ATS-friendly PDF.
                    </p>
                  </div>

                  <div className="saas-card p-6 rounded-2xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Instant PDF Download</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Download 100% machine-parsable, clean single-column resumes formatted specifically for ATS algorithms.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Upload Modal Drawer */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <FileUpload
              onAnalyze={handleAnalyzeResume}
              loading={loading}
              roles={roles}
              onClose={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}

      {/* Auth Modal with OTP */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <LoginOTP
              onLoginSuccess={(loggedInUser) => {
                setUser(loggedInUser);
                setShowAuthModal(false);
              }}
              onClose={() => setShowAuthModal(false)}
            />
          </div>
        </div>
      )}

      {/* Footer with Developer Attribution */}
      <footer className="no-print bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Bottom Left: Logo and Developer Name */}
          <div className="flex items-center gap-3">
            <img 
              src="/ats-logo.png" 
              alt="ATS Logo" 
              className="h-9 w-auto object-contain"
            />
            <div className="text-left">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Developer Name:</span>
                <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm tracking-tight">Manas Dwivedi</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">ATS Resume Builder &bull; 90%+ Score Optimizer</p>
            </div>
          </div>

          {/* Bottom Right */}
          <div className="text-right text-slate-400 dark:text-slate-500 text-[11.5px]">
            FastAPI &bull; MongoDB &bull; Secure Gmail OTP
          </div>
        </div>
      </footer>
    </div>
  );
}
