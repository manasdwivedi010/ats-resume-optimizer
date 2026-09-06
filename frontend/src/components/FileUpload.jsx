import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, AlertCircle, Loader2, Sparkles, Briefcase, FileText } from 'lucide-react';

export default function FileUpload({ onAnalyze, loading, roles = [], onClose }) {
  const [file, setFile] = useState(null);
  const [selectedRole, setSelectedRole] = useState('full stack developer');
  const [customRole, setCustomRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selected) => {
    setError('');
    const validExts = ['pdf', 'docx', 'doc', 'txt'];
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!validExts.includes(ext)) {
      setError('Please upload a PDF (.pdf) or Word document (.docx).');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }
    setFile(selected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please choose or drop your resume file.');
      return;
    }
    const finalRole = selectedRole === 'custom' ? customRole.trim() : selectedRole;
    if (!finalRole) {
      setError('Please select or specify a target job role.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_role', finalRole);
    if (jobDescription.trim()) {
      formData.append('job_description', jobDescription.trim());
    }

    onAnalyze(formData);
  };

  return (
    <div className="saas-card p-6 sm:p-8 rounded-2xl max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Upload Your Resume</span>
            <Sparkles className="w-5 h-5 text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Our AI scans formatting, parseability, and content against the 90% benchmark rule.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-700 px-2.5 py-1 rounded-md bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Upload Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50'
              : file
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleChange}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-900">{file.name}</div>
              <div className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB &bull; Click to choose another file
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-slate-800">
                Drag and drop your resume here, or <span className="text-blue-600 underline">browse</span>
              </div>
              <div className="text-xs text-slate-400">
                Supports PDF, DOCX up to 10MB
              </div>
            </div>
          )}
        </div>

        {/* Target Job Role */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Target Job Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="saas-input w-full px-3.5 py-2.5 rounded-xl text-xs bg-white text-slate-800 cursor-pointer font-medium"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
              <option value="custom">+ Custom Target Role</option>
            </select>

            {selectedRole === 'custom' && (
              <input
                type="text"
                placeholder="e.g., Product Designer"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="saas-input w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-900 placeholder-slate-400"
              />
            )}
          </div>
        </div>

        {/* Optional Custom Job Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Target Job Description (Optional)
            </label>
            <span className="text-[11px] text-slate-400">For keyword gap matching</span>
          </div>
          <textarea
            rows={3}
            placeholder="Paste job posting requirements to identify exact missing technical keywords..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="saas-input w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-900 placeholder-slate-400 resize-none"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing against 90% ATS benchmark...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Calculate ATS Score & Check Flaws</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
