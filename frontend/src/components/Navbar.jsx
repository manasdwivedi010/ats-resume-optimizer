import React, { useState } from 'react';
import { Sparkles, ChevronDown, User, LogOut, FileCheck2, ArrowRight, Wand2, Target, Sun, Moon } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenAuth, currentView, setCurrentView, darkMode, onToggleDarkMode }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => setCurrentView('home')}
        >
          <img 
            src="/ats-logo.png" 
            alt="ATS Logo" 
            className="h-10 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
          />
          <div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
              ATS<span className="text-blue-600">Resume</span>
            </div>
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 flex items-center gap-1">
              <span className="text-blue-600 font-semibold">Dev:</span> Manas Dwivedi
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          {/* AI Tools Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
              className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors py-2 text-slate-800 dark:text-slate-200"
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">AI Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 w-64 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div 
                  onClick={() => {
                    setCurrentView('maker');
                    setDropdownOpen(false);
                  }}
                  className="p-3 rounded-xl hover:bg-blue-50/60 dark:hover:bg-slate-700/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 flex items-center gap-1.5">
                      <Wand2 className="w-4 h-4 text-blue-600" />
                      AI Resume Maker
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                      90%+ RULE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Fills what your resume lacks to reach 90% and downloads ATS PDF.
                  </p>
                </div>

                <div 
                  onClick={() => {
                    setCurrentView('home');
                    setDropdownOpen(false);
                  }}
                  className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-emerald-600" />
                      Free ATS Scanner
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Instant diagnostic check benchmarked against 90% threshold.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setCurrentView('home')} 
            className={`hover:text-blue-600 transition-colors ${currentView === 'home' ? 'text-blue-600 font-semibold' : ''}`}
          >
            ATS Checker
          </button>

          <button
            onClick={() => setCurrentView('maker')}
            className={`hover:text-blue-600 transition-colors flex items-center gap-1 ${currentView === 'maker' ? 'text-blue-600 font-bold' : ''}`}
          >
            <span>Resume Maker</span>
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-full">
              PDF
            </span>
          </button>

          <a href="#rubric" className="hover:text-blue-600 transition-colors">
            90% Rubric
          </a>

          {user && (
            <button
              onClick={() => setCurrentView('history')}
              className={`hover:text-blue-600 transition-colors ${currentView === 'history' ? 'text-blue-600 font-semibold' : ''}`}
            >
              My Scans
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="max-w-[150px] truncate">{user.email}</span>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
