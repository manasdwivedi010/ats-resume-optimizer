import React, { useState, useRef } from 'react';
import { 
  Download, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ArrowLeft, 
  Zap, 
  Check, 
  Loader2,
  Briefcase,
  GraduationCap,
  FolderGit2,
  User,
  Printer,
  ExternalLink
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ResumeMaker({ initialScanData, onBack }) {
  const targetRole = initialScanData?.target_role || 'Full Stack Developer';
  const missingFromScan = initialScanData?.skills_analysis?.missing || [];
  const presentFromScan = initialScanData?.skills_analysis?.present || [];
  const contact = initialScanData?.contact_detected || {};

  // Extract candidate's real details
  let initialName = contact.name || '';
  if (!initialName) {
    if (contact.linkedin && contact.linkedin.includes('manas-dwivedi')) {
      initialName = 'MANAS DWIVEDI';
    } else if (contact.email) {
      initialName = contact.email.split('@')[0].replace(/[\._\d]/g, ' ').toUpperCase();
    } else {
      initialName = 'MANAS DWIVEDI';
    }
  }

  const parsedSections = initialScanData?.sections || {};

  // Smart parser to break raw education text into clean structured entries
  const parseEducationEntries = (rawEduText) => {
    if (!rawEduText || typeof rawEduText !== 'string') {
      return [{ id: 1, degree: '', college: '', period: '', details: '' }];
    }

    const lines = rawEduText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return [{ id: 1, degree: '', college: '', period: '', details: '' }];
    }

    const entries = [];
    const dateRegex = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.\,]+)?\d{4}(?:\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.\,]+)?(?:\d{4}|present|current))?/i;
    const degreeRegex = /(?:Master|Bachelor|B\.Tech|M\.Tech|B\.C\.A|M\.C\.A|B\.S|M\.S|B\.E|M\.E|BSc|MSc|Diploma|Higher Secondary|Intermediate|High School|Class\s*X(?:II)?)/i;

    lines.forEach((line, index) => {
      let college = '';
      let period = '';
      let degree = '';
      let details = '';

      // Check if dates are inside the line
      const dateMatch = line.match(dateRegex);
      let remaining = line;
      if (dateMatch) {
        period = dateMatch[0].trim();
        // Remove date from remaining text
        remaining = line.replace(dateMatch[0], ' | ').trim();
      }

      // Check if degree is in remaining text
      const degreeMatch = remaining.match(degreeRegex);
      if (degreeMatch) {
        const degreeIdx = remaining.search(degreeRegex);
        // If degree appears later in the string, preceding part is often college
        if (degreeIdx > 5) {
          college = remaining.slice(0, degreeIdx).replace(/[\|\,\-]+$/, '').trim();
          degree = remaining.slice(degreeIdx).replace(/^[\|\,\-]+/, '').trim();
        } else {
          degree = remaining.slice(0, remaining.indexOf('|') > -1 ? remaining.indexOf('|') : undefined).trim();
          college = remaining.slice(degree.length).replace(/^[\|\,\-]+/, '').trim();
        }
      } else {
        // Fallback: if contains pipe or comma
        if (remaining.includes('|')) {
          const parts = remaining.split('|').map(p => p.trim()).filter(Boolean);
          college = parts[0] || '';
          degree = parts[1] || '';
          details = parts.slice(2).join(' | ');
        } else {
          college = remaining;
        }
      }

      entries.push({
        id: index + 1,
        degree: degree || '',
        college: college || remaining,
        period: period || '',
        details: details || ''
      });
    });

    return entries.length > 0 ? entries : [{ id: 1, degree: '', college: rawEduText, period: '', details: '' }];
  };

  const [downloading, setDownloading] = useState(false);
  const resumeRef = useRef(null);

  // Resume state
  const [resume, setResume] = useState({
    fullName: initialName,
    title: targetRole,
    email: contact.email || 'dubeymanas618@gmail.com',
    phone: contact.phone || '+91 8840394591',
    location: '',
    linkedin: contact.linkedin || 'linkedin.com/in/manas-dwivedi-a374b5247',
    github: contact.github || 'github.com/manasdwivedi010',
    
    summary: parsedSections.summary || '',
    skills: [...presentFromScan],
    addedSkills: [],

    experience: parsedSections.experience 
      ? [{ id: 1, title: '', company: '', period: '', description: parsedSections.experience }]
      : [{ id: 1, title: '', company: '', period: '', description: '' }],

    projects: parsedSections.projects
      ? [{ id: 1, name: '', tech: '', link: '', description: parsedSections.projects }]
      : [{ id: 1, name: '', tech: '', link: '', description: '' }],

    education: parsedSections.education
      ? parseEducationEntries(parsedSections.education)
      : [{ id: 1, degree: '', college: '', period: '', details: '' }],

    customLinks: []
  });

  // Custom links / websites handlers
  const handleAddCustomLink = () => {
    setResume(prev => ({
      ...prev,
      customLinks: [...(prev.customLinks || []), { id: Date.now(), label: '', url: '' }]
    }));
  };

  const handleRemoveCustomLink = (id) => {
    setResume(prev => ({
      ...prev,
      customLinks: (prev.customLinks || []).filter(l => l.id !== id)
    }));
  };

  const allSkills = Array.from(new Set([...resume.skills, ...resume.addedSkills]));

  // Injects missing skills recommended by ATS
  const handleAddMissingSkill = (skill) => {
    if (resume.addedSkills.includes(skill)) {
      setResume(prev => ({
        ...prev,
        addedSkills: prev.addedSkills.filter(s => s !== skill)
      }));
    } else {
      setResume(prev => ({
        ...prev,
        addedSkills: [...prev.addedSkills, skill]
      }));
    }
  };

  const handleAddAllMissingSkills = () => {
    const toAdd = missingFromScan.filter(s => !allSkills.includes(s));
    setResume(prev => ({
      ...prev,
      addedSkills: [...prev.addedSkills, ...toAdd]
    }));
  };

  // Custom skill
  const [customSkill, setCustomSkill] = useState('');
  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const clean = customSkill.trim();
    if (clean && !allSkills.includes(clean)) {
      setResume(prev => ({ ...prev, addedSkills: [...prev.addedSkills, clean] }));
      setCustomSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
      addedSkills: prev.addedSkills.filter(s => s !== skill)
    }));
  };

  // Experience handlers
  const handleAddExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now(), title: '', company: '', period: '', description: '' }]
    }));
  };

  const handleRemoveExperience = (id) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id)
    }));
  };

  // Projects handlers
  const handleAddProject = () => {
    setResume(prev => ({
      ...prev,
      projects: [...prev.projects, { id: Date.now(), name: '', tech: '', link: '', description: '' }]
    }));
  };

  const handleRemoveProject = (id) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  // Education handlers
  const handleAddEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), degree: '', college: '', period: '' }]
    }));
  };

  const handleRemoveEducation = (id) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
  };

  // Live ATS score
  const skillsCount = allSkills.length;
  const hasSummary = Boolean(resume.summary.trim());
  const hasExp = resume.experience.some(e => e.title || e.company || e.description);
  const hasEdu = resume.education.some(e => e.degree || e.college);

  const calculatedScore = Math.min(
    98,
    Math.round(
      Math.min(40, (skillsCount / Math.max(6, missingFromScan.length + presentFromScan.length)) * 40) +
      (hasExp ? 25 : 10) +
      14 +
      (hasSummary ? 10 : 5) +
      (hasEdu ? 10 : 5)
    )
  );

  // Helper to format clean URLs
  const formatUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  // Download PDF with ONLY the resume document and WITH CLICKABLE HYPERLINKS
  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;
    setDownloading(true);

    try {
      const element = resumeRef.current;
      
      // Capture ONLY the resume document element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210; // A4 mm
      const pdfHeight = 297; // A4 mm
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add page content
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);

      // Embed clickable PDF hyperlink annotations for every <a> link inside the resume!
      const parentRect = element.getBoundingClientRect();
      const links = element.querySelectorAll('a');

      links.forEach((a) => {
        const rect = a.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && a.href) {
          // Calculate coordinates in mm on the PDF
          const x = ((rect.left - parentRect.left) / parentRect.width) * pdfWidth;
          const y = ((rect.top - parentRect.top) / parentRect.height) * imgHeight;
          const w = (rect.width / parentRect.width) * pdfWidth;
          const h = (rect.height / parentRect.height) * imgHeight;

          // Check which page this link lands on
          const pageIndex = Math.floor(y / pdfHeight) + 1;
          const yOnPage = y % pdfHeight;

          if (pageIndex === 1) {
            pdf.setPage(1);
            pdf.link(x, yOnPage, w, h, { url: a.href });
          }
        }
      });

      heightLeft -= pdfHeight;

      // Handle multi-page if content overflows A4
      let pageNum = 2;
      while (heightLeft > 5) { // more than 5mm overflow
        position = -(pageNum - 1) * pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);

        // Add links on this overflow page
        links.forEach((a) => {
          const rect = a.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && a.href) {
            const x = ((rect.left - parentRect.left) / parentRect.width) * pdfWidth;
            const y = ((rect.top - parentRect.top) / parentRect.height) * imgHeight;
            const w = (rect.width / parentRect.width) * pdfWidth;
            const h = (rect.height / parentRect.height) * imgHeight;

            const targetPage = Math.floor(y / pdfHeight) + 1;
            if (targetPage === pageNum) {
              const yOnPage = y % pdfHeight;
              pdf.setPage(pageNum);
              pdf.link(x, yOnPage, w, h, { url: a.href });
            }
          }
        });

        heightLeft -= pdfHeight;
        pageNum++;
      }

      const fileName = (resume.fullName || 'Resume').replace(/\s+/g, '_') + '_ATS_Optimized.pdf';
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation error', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Diagnostic Report</span>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Resume Builder &bull; <span className="text-blue-600">Active Links Enabled</span>
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>ATS Score: {calculatedScore}%</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Downloads only the resume document. All links (Email, LinkedIn, GitHub, Projects) are 100% clickable in the generated PDF.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAddAllMissingSkills}
            disabled={missingFromScan.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-200 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>+ Add Missing Skills</span>
          </button>

          <button
            onClick={() => window.print()}
            title="Open browser print dialog to save as vector PDF"
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/25 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download ATS PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: User fills in their REAL details (Hidden in Print) */}
        <div className="no-print lg:col-span-5 space-y-5 max-h-[85vh] overflow-y-auto pr-2">
          
          {/* 1. Header & Contact */}
          <div className="saas-card p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Contact Details & Links</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-bold text-slate-500">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Manas Dubey"
                  value={resume.fullName}
                  onChange={e => setResume({ ...resume, fullName: e.target.value })}
                  className="saas-input w-full px-2.5 py-1.5 rounded-lg text-xs font-bold"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-bold text-slate-500">Target Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer"
                  value={resume.title}
                  onChange={e => setResume({ ...resume, title: e.target.value })}
                  className="saas-input w-full px-2.5 py-1.5 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500">Email Address (Clickable)</label>
                <input
                  type="email"
                  value={resume.email}
                  onChange={e => setResume({ ...resume, email: e.target.value })}
                  className="saas-input w-full px-2.5 py-1.5 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500">Phone Number (Clickable)</label>
                <input
                  type="text"
                  value={resume.phone}
                  onChange={e => setResume({ ...resume, phone: e.target.value })}
                  className="saas-input w-full px-2.5 py-1.5 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500">Location (City, Country)</label>
                <input
                  type="text"
                  placeholder="e.g. India"
                  value={resume.location}
                  onChange={e => setResume({ ...resume, location: e.target.value })}
                  className="saas-input w-full px-2.5 py-1.5 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500">LinkedIn Profile Link</label>
                <input
                  type="text"
                  placeholder="linkedin.com/in/yourname"
                  value={resume.linkedin}
                  onChange={e => setResume({ ...resume, linkedin: e.target.value })}
                  className="saas-input w-full px-2.5 py-1.5 rounded-lg text-xs"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500">GitHub Profile Link</label>
                <input
                  type="text"
                  placeholder="github.com/yourname"
                  value={resume.github}
                  onChange={e => setResume({ ...resume, github: e.target.value })}
                  className="saas-input w-full px-2.5 py-1.5 rounded-lg text-xs"
                />
              </div>

              {/* DYNAMIC ADDITIONAL LINKS & WEBSITES */}
              <div className="col-span-2 pt-2 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-blue-600" />
                    Additional Links / Portfolios / Websites
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCustomLink}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Add Link or Website
                  </button>
                </div>

                {(resume.customLinks || []).map((linkItem, idx) => (
                  <div key={linkItem.id} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 relative">
                    <input
                      type="text"
                      placeholder="Label (e.g. Portfolio, LeetCode, Blog)"
                      value={linkItem.label}
                      onChange={e => {
                        const updated = [...(resume.customLinks || [])];
                        updated[idx].label = e.target.value;
                        setResume({ ...resume, customLinks: updated });
                      }}
                      className="saas-input w-1/3 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="URL (e.g. https://myportfolio.com or leetcode.com/username)"
                      value={linkItem.url}
                      onChange={e => {
                        const updated = [...(resume.customLinks || [])];
                        updated[idx].url = e.target.value;
                        setResume({ ...resume, customLinks: updated });
                      }}
                      className="saas-input flex-1 px-2.5 py-1.5 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomLink(linkItem.id)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                      title="Remove link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Skills: Recommended 90% Keywords */}
          <div className="saas-card p-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>2. Required Skills for {targetRole}</span>
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                90% Target
              </span>
            </div>

            {missingFromScan.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-600">
                  Skills missing from your scan (Click to toggle):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {missingFromScan.map((skill, idx) => {
                    const isSelected = resume.addedSkills.includes(skill);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddMissingSkill(skill)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        <span>{skill}</span>
                        {isSelected ? (
                          <Check className="w-3 h-3 text-emerald-700" />
                        ) : (
                          <Plus className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Skill Input */}
            <form onSubmit={handleAddCustomSkill} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add other skill you know..."
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                className="saas-input flex-1 px-3 py-1.5 rounded-lg text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {allSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium flex items-center gap-1.5"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 3. Professional Summary */}
          <div className="saas-card p-5 rounded-2xl space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>3. Professional Summary</span>
              <span className="text-[10px] text-slate-400">Optional</span>
            </h3>
            <textarea
              rows={3}
              placeholder="Enter your summary or leave blank..."
              value={resume.summary}
              onChange={e => setResume({ ...resume, summary: e.target.value })}
              className="saas-input w-full p-2.5 rounded-lg text-xs resize-none"
            />
          </div>

          {/* 4. Experience (User entered) */}
          <div className="saas-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>4. Work Experience</span>
              </h3>
              <button
                type="button"
                onClick={handleAddExperience}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Role
              </button>
            </div>

            {resume.experience.map((exp, idx) => (
              <div key={exp.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative">
                {resume.experience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.title}
                    onChange={e => {
                      const updated = [...resume.experience];
                      updated[idx].title = e.target.value;
                      setResume({ ...resume, experience: updated });
                    }}
                    className="saas-input px-2.5 py-1.5 rounded-lg text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={e => {
                      const updated = [...resume.experience];
                      updated[idx].company = e.target.value;
                      setResume({ ...resume, experience: updated });
                    }}
                    className="saas-input px-2.5 py-1.5 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Period (e.g. 2023 - Present)"
                    value={exp.period}
                    onChange={e => {
                      const updated = [...resume.experience];
                      updated[idx].period = e.target.value;
                      setResume({ ...resume, experience: updated });
                    }}
                    className="saas-input px-2.5 py-1.5 rounded-lg text-xs col-span-2"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Responsibilities and accomplishments..."
                  value={exp.description}
                  onChange={e => {
                    const updated = [...resume.experience];
                    updated[idx].description = e.target.value;
                    setResume({ ...resume, experience: updated });
                  }}
                  className="saas-input w-full p-2.5 rounded-lg text-xs resize-none"
                />
              </div>
            ))}
          </div>

          {/* 5. Projects with clickable links */}
          <div className="saas-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-blue-600" />
                <span>5. Projects</span>
              </h3>
              <button
                type="button"
                onClick={handleAddProject}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Project
              </button>
            </div>

            {resume.projects.map((proj, idx) => (
              <div key={proj.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative">
                {resume.projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(proj.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={proj.name}
                    onChange={e => {
                      const updated = [...resume.projects];
                      updated[idx].name = e.target.value;
                      setResume({ ...resume, projects: updated });
                    }}
                    className="saas-input px-2.5 py-1.5 rounded-lg text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Project Link (e.g. github.com/...)"
                    value={proj.link}
                    onChange={e => {
                      const updated = [...resume.projects];
                      updated[idx].link = e.target.value;
                      setResume({ ...resume, projects: updated });
                    }}
                    className="saas-input px-2.5 py-1.5 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Tech Stack (e.g. React, Node.js)"
                    value={proj.tech}
                    onChange={e => {
                      const updated = [...resume.projects];
                      updated[idx].tech = e.target.value;
                      setResume({ ...resume, projects: updated });
                    }}
                    className="saas-input px-2.5 py-1.5 rounded-lg text-xs col-span-2"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Project details and results..."
                  value={proj.description}
                  onChange={e => {
                    const updated = [...resume.projects];
                    updated[idx].description = e.target.value;
                    setResume({ ...resume, projects: updated });
                  }}
                  className="saas-input w-full p-2 rounded-lg text-xs resize-none"
                />
              </div>
            ))}
          </div>

          {/* 6. Education */}
          <div className="saas-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>6. Education</span>
              </h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Education
              </button>
            </div>

            {resume.education.map((edu, idx) => (
              <div key={edu.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative mb-3">
                {resume.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Degree / Course
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bachelor of Technology in Computer Science"
                      value={edu.degree}
                      onChange={e => {
                        const updated = [...resume.education];
                        updated[idx].degree = e.target.value;
                        setResume({ ...resume, education: updated });
                      }}
                      className="saas-input w-full px-3 py-2 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        College / University / School
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Stanford University"
                        value={edu.college}
                        onChange={e => {
                          const updated = [...resume.education];
                          updated[idx].college = e.target.value;
                          setResume({ ...resume, education: updated });
                        }}
                        className="saas-input w-full px-3 py-2 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Year / Graduation Period
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2020 – 2024"
                        value={edu.period}
                        onChange={e => {
                          const updated = [...resume.education];
                          updated[idx].period = e.target.value;
                          setResume({ ...resume, education: updated });
                        }}
                        className="saas-input w-full px-3 py-2 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      CGPA / Percentage / Relevant Coursework (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CGPA: 8.9 / 10 | Major in Data Structures, AI"
                      value={edu.details || ''}
                      onChange={e => {
                        const updated = [...resume.education];
                        updated[idx].details = e.target.value;
                        setResume({ ...resume, education: updated });
                      }}
                      className="saas-input w-full px-3 py-2 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Side: ONLY THIS RESUME DOCUMENT IS CAPTURED IN PDF */}
        <div className="lg:col-span-7">
          <div className="no-print mb-2 flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800">Resume Document Preview</span>
            <span className="text-blue-600 font-semibold">Every Link Below is Clickable in PDF</span>
          </div>

          <div className="bg-slate-100 p-3 sm:p-6 rounded-2xl overflow-x-auto">
            {/* The Document Container: ONLY THIS ELEMENT IS EXPORTED TO PDF */}
            <div
              id="resume-document-to-export"
              ref={resumeRef}
              className="bg-white mx-auto shadow-lg p-8 sm:p-12 text-slate-900 font-sans"
              style={{
                width: '100%',
                maxWidth: '794px',
                minHeight: '1000px',
                boxSizing: 'border-box',
                lineHeight: 1.45
              }}
            >
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
                  {resume.fullName || 'YOUR NAME'}
                </h1>
                <div className="text-xs font-bold text-blue-700 tracking-wide mt-1 uppercase">
                  {resume.title}
                </div>
                <div className="text-[11px] text-slate-600 mt-2 flex flex-wrap justify-center gap-x-2.5 gap-y-1">
                  {resume.email && (
                    <a
                      href={`mailto:${resume.email}`}
                      className="text-blue-700 hover:underline inline-flex items-center gap-1"
                    >
                      {resume.email}
                    </a>
                  )}
                  {resume.phone && (
                    <>
                      <span>&bull;</span>
                      <a
                        href={`tel:${resume.phone.replace(/[^0-9+]/g, '')}`}
                        className="text-slate-700 hover:underline"
                      >
                        {resume.phone}
                      </a>
                    </>
                  )}
                  {resume.location && (
                    <>
                      <span>&bull;</span>
                      <span>{resume.location}</span>
                    </>
                  )}
                  {resume.linkedin && (
                    <>
                      <span>&bull;</span>
                      <a
                        href={formatUrl(resume.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        {resume.linkedin.replace(/^https?:\/\//, '')}
                      </a>
                    </>
                  )}
                  {resume.github && (
                    <>
                      <span>&bull;</span>
                      <a
                        href={formatUrl(resume.github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        {resume.github.replace(/^https?:\/\//, '')}
                      </a>
                    </>
                  )}
                  {(resume.customLinks || []).filter(l => l.url).map((linkItem) => (
                    <React.Fragment key={linkItem.id}>
                      <span>&bull;</span>
                      <a
                        href={formatUrl(linkItem.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        {linkItem.label || linkItem.url.replace(/^https?:\/\//, '')}
                      </a>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* TECHNICAL SKILLS SECTION */}
              {allSkills.length > 0 && (
                <div className="mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                    TECHNICAL SKILLS & CORE COMPETENCIES
                  </div>
                  <p className="text-[11.5px] text-slate-800 leading-relaxed">
                    <strong className="font-semibold text-slate-900">Technical Skills: </strong>
                    {allSkills.join(' • ')}
                  </p>
                </div>
              )}

              {/* SUMMARY */}
              {resume.summary && (
                <div className="mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                    PROFESSIONAL SUMMARY
                  </div>
                  <p className="text-[11.5px] text-slate-800 leading-relaxed whitespace-pre-line">
                    {resume.summary}
                  </p>
                </div>
              )}

              {/* EXPERIENCE */}
              {resume.experience.some(e => e.title || e.company || e.description) && (
                <div className="mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    WORK EXPERIENCE
                  </div>
                  <div className="space-y-3">
                    {resume.experience
                      .filter(e => e.title || e.company || e.description)
                      .map(exp => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                            <span>{exp.title}</span>
                            <span className="text-[11px] font-normal text-slate-600">{exp.period}</span>
                          </div>
                          {exp.company && (
                            <div className="text-[11px] text-slate-700 italic mb-1">
                              {exp.company}
                            </div>
                          )}
                          {exp.description && (
                            <p className="text-[11.5px] text-slate-800 leading-relaxed whitespace-pre-line">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* PROJECTS WITH WORKING CLICKABLE HYPERLINKS */}
              {resume.projects.some(p => p.name || p.description) && (
                <div className="mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    PROJECTS
                  </div>
                  <div className="space-y-3">
                    {resume.projects
                      .filter(p => p.name || p.description)
                      .map(proj => (
                        <div key={proj.id}>
                          <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                            <span className="flex items-center gap-1.5">
                              <span className="text-[13px] font-extrabold text-black tracking-tight">
                                {proj.name}
                              </span>
                              {proj.link && (
                                <a
                                  href={formatUrl(proj.link)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center gap-0.5 text-[10.5px] font-normal"
                                >
                                  <span>[Link]</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </span>
                            {proj.tech && (
                              <span className="text-[11px] font-semibold text-slate-600">
                                ({proj.tech})
                              </span>
                            )}
                          </div>
                          {proj.description && (
                            <p className="text-[11.5px] text-slate-800 leading-relaxed whitespace-pre-line mt-0.5">
                              {proj.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* EDUCATION */}
              {resume.education.some(edu => edu.degree || edu.college) && (
                <div className="mb-6">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 mb-4">
                    EDUCATION
                  </div>
                  <div className="space-y-4">
                    {resume.education
                      .filter(edu => edu.degree || edu.college)
                      .map(edu => {
                        const topHeading = edu.degree || edu.college;
                        const subHeading = (edu.degree && edu.college && edu.college.trim().toLowerCase() !== edu.degree.trim().toLowerCase()) 
                          ? edu.college 
                          : null;

                        const isDegreeOrCollege = (text) => {
                          if (!text) return false;
                          return /(?:Master|Bachelor|B\.Tech|M\.Tech|B\.C\.A|M\.C\.A|MCA|BCA|B\.S|M\.S|B\.E|M\.E|BSc|MSc|Diploma|Higher Secondary|Intermediate|High School)/i.test(text);
                        };

                        const isTopDegree = isDegreeOrCollege(topHeading);

                        return (
                          <div key={edu.id} className="space-y-1">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className={`tracking-tight text-[12.5px] ${isTopDegree ? 'font-medium text-slate-600' : 'font-bold text-slate-900'}`}>
                                {topHeading}
                              </span>
                              {edu.period && (
                                <span className="text-[11px] font-normal text-slate-500 ml-2 shrink-0">
                                  {edu.period}
                                </span>
                              )}
                            </div>
                            {subHeading && (
                              <div className={`text-[12px] ${isDegreeOrCollege(subHeading) ? 'font-normal text-slate-600' : 'font-medium text-slate-800'}`}>
                                {subHeading}
                              </div>
                            )}
                            {edu.details && (
                              <div className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                                {edu.details}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
