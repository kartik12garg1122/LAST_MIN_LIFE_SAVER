import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getAvatarForUser } from '../data/initialData';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  onResetData,
  onLogout,
}) => {
  const [name, setName] = useState(user.name);
  const [cgpa, setCgpa] = useState(user.cgpa || user.gpa || '9.00');
  const [program, setProgram] = useState(user.program);
  const [targetHours, setTargetHours] = useState(
    user.dailyStudyTargetHours || user.dailyTarget || 5
  );
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [advisorSensitivity, setAdvisorSensitivity] = useState<'gentle' | 'proactive' | 'strict'>(
    'proactive'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setName(user.name);
    setCgpa(user.cgpa || user.gpa || '9.00');
    setProgram(user.program);
    setTargetHours(user.dailyStudyTargetHours || user.dailyTarget || 5);
    setAvatarUrl(user.avatarUrl);
  }, [user]);

  const presetAvatars = [
    { label: 'Indigo', url: getAvatarForUser(name || 'Alex', 'user-indigo@student.edu') },
    { label: 'Emerald', url: getAvatarForUser(name || 'Sarah', 'user-emerald@student.edu') },
    { label: 'Amber', url: getAvatarForUser(name || 'Jordan', 'user-amber@student.edu') },
    { label: 'Purple', url: getAvatarForUser(name || 'Taylor', 'user-purple@student.edu') },
    { label: 'Teal', url: getAvatarForUser(name || 'Morgan', 'user-teal@student.edu') },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      setValidationError('Please enter a valid CGPA between 0.00 and 10.00');
      return;
    }

    const parsedHours = Number(targetHours);
    if (isNaN(parsedHours) || parsedHours < 1 || parsedHours > 14) {
      setValidationError('Please enter a valid daily target between 1 and 14 hours');
      return;
    }

    onUpdateUser({
      name: name.trim(),
      cgpa: cgpa.trim(),
      gpa: cgpa.trim(),
      program: program.trim(),
      dailyStudyTargetHours: parsedHours,
      dailyTarget: parsedHours,
      avatarUrl,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCustomAvatarApply = () => {
    if (customAvatarInput.trim()) {
      setAvatarUrl(customAvatarInput.trim());
      setCustomAvatarInput('');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-24 md:pb-10 font-['Inter']">
      <div>
        <h2 className="text-xl font-bold text-[#111c2d] font-['Geist']">
          Settings & Academic Profile
        </h2>
        <p className="text-xs text-[#505f76]">
          Configure your academic limits, profile avatar, CGPA, and study target parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {validationError && (
          <div className="p-3.5 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {validationError}
          </div>
        )}

        {/* Student Profile & Avatar Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c7c4d8]/40 shadow-xs space-y-5">
          <h3 className="text-xs font-bold text-[#505f76] uppercase tracking-wider font-['Geist']">
            Student Identity & Avatar
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={avatarUrl}
              alt="Avatar Preview"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-[#dee8ff] shadow-md shrink-0"
            />
            <div className="space-y-2 flex-1">
              <p className="text-sm font-bold text-[#111c2d]">
                {name} • {program}
              </p>
              <p className="text-xs text-[#505f76]">
                Academic Standing: CGPA <span className="font-bold text-[#3525cd]">{cgpa}</span> | Target:{' '}
                <span className="font-bold text-[#3525cd]">{targetHours}h/day</span>
              </p>

              {/* Avatar Selector Options */}
              <div>
                <label className="block text-[11px] font-bold text-[#505f76] mb-1.5 uppercase">
                  Select Profile Avatar Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetAvatars.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        avatarUrl === preset.url
                          ? 'bg-[#3525cd] text-white border-[#3525cd]'
                          : 'bg-[#f9f9ff] text-[#505f76] border-[#c7c4d8] hover:bg-[#dee8ff]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL option */}
              <div className="flex gap-2 pt-1">
                <input
                  type="url"
                  placeholder="Or paste custom image URL..."
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-[#c7c4d8] text-xs text-[#111c2d] outline-none"
                />
                <button
                  type="button"
                  onClick={handleCustomAvatarApply}
                  className="px-3 h-9 bg-[#dee8ff] text-[#3525cd] font-bold text-xs rounded-lg hover:bg-[#4f46e5]/20 cursor-pointer"
                >
                  Use URL
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#505f76] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#505f76] mb-1.5">
                Degree / Program
              </label>
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#505f76] mb-1.5">
                CGPA (Cumulative Grade Point Average) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 9.20"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#505f76] mb-1.5">
                Daily Study Target (Hours / Day) *
              </label>
              <input
                type="number"
                min="1"
                max="14"
                step="0.5"
                required
                value={targetHours}
                onChange={(e) => setTargetHours(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] outline-none"
              />
            </div>
          </div>
        </div>

        {/* AI Advisor Sensitivity */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c7c4d8]/40 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#505f76] uppercase tracking-wider font-['Geist']">
            AI Advisor Preferences
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#505f76] mb-2">
              Deficit Alert Frequency
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'gentle', label: 'Gentle', desc: 'Alerts only > 3h deficit' },
                { id: 'proactive', label: 'Proactive', desc: 'Standard (> 1h deficit)' },
                { id: 'strict', label: 'Strict', desc: 'Immediate deadline warning' },
              ].map((lvl) => (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => setAdvisorSensitivity(lvl.id as any)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    advisorSensitivity === lvl.id
                      ? 'bg-[#dee8ff] border-[#3525cd] text-[#3525cd]'
                      : 'bg-[#f9f9ff] border-[#c7c4d8]/40 text-[#505f76]'
                  }`}
                >
                  <p className="text-xs font-bold">{lvl.label}</p>
                  <p className="text-[10px] text-[#777587] mt-0.5">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save button & feedback message */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-8 py-3 bg-[#3525cd] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#2b1eb3] shadow-[0_4px_20px_0_rgba(53,37,205,0.25)] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Profile & Preferences
          </button>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Profile updated successfully!
            </span>
          )}
        </div>

        {/* Session & Data Actions */}
        <div className="pt-6 border-t border-[#dee8ff] space-y-4">
          {onLogout && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#111c2d]">Account Session</p>
                <p className="text-[11px] text-[#505f76]">
                  Sign out of Student Life Saver workspace on this device.
                </p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 bg-[#f9f9ff] border border-[#c7c4d8] text-[#505f76] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign Out
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-bold text-[#ba1a1a]">Restore Sample Data</p>
              <p className="text-[11px] text-[#505f76]">
                Reset user profile and tasks to initial defaults.
              </p>
            </div>
            <button
              type="button"
              onClick={onResetData}
              className="px-4 py-2 border border-[#ba1a1a]/30 text-[#ba1a1a] text-xs font-bold rounded-xl hover:bg-[#ffdad6]/40 transition-all cursor-pointer"
            >
              Reset Data
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
