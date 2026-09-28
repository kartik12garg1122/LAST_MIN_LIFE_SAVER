import React, { useState } from 'react';
import { BrandLogo } from '../components/BrandLogo';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin, onOpenSignup }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] font-['Inter'] selection:bg-[#3525cd] selection:text-white flex flex-col">
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#dee8ff]/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <BrandLogo size="md" />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#505f76]">
            <button
              onClick={() => scrollToSection('product-preview')}
              className="hover:text-[#3525cd] transition-colors cursor-pointer"
            >
              Product Preview
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#3525cd] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#3525cd] transition-colors cursor-pointer"
            >
              How It Works
            </button>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-[#3525cd] bg-[#dee8ff]/50 hover:bg-[#dee8ff] rounded-xl transition-all cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={onOpenSignup}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3525cd] hover:bg-[#2b1eb3] shadow-[0_4px_20px_0_rgba(53,37,205,0.22)] active:scale-95 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#505f76] hover:text-[#111c2d] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Slide-down Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#dee8ff] px-4 pt-2 pb-6 space-y-4 animate-fadeIn">
            <nav className="flex flex-col gap-3 font-semibold text-sm text-[#505f76]">
              <button
                onClick={() => scrollToSection('product-preview')}
                className="text-left py-2 hover:text-[#3525cd]"
              >
                Product Preview
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-2 hover:text-[#3525cd]"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 hover:text-[#3525cd]"
              >
                How It Works
              </button>
            </nav>
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-3 text-sm font-bold text-[#3525cd] bg-[#dee8ff]/60 rounded-xl text-center"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSignup();
                }}
                className="w-full py-3 text-sm font-bold text-white bg-[#3525cd] rounded-xl text-center shadow-md flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Decorative subtle ambient glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#3525cd]/15 via-[#4f46e5]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dee8ff] border border-[#3525cd]/20 text-[#3525cd] text-xs font-bold mb-6">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Academic Workload & Schedule Assistant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#111c2d] tracking-tight leading-[1.15] font-['Geist'] mb-6">
            Turn last-minute chaos into a plan.
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-[#505f76] font-normal leading-relaxed mb-8 sm:mb-10">
            Student Life Saver helps you prioritize tasks, plan your time, protect deadlines, and stay focused when college gets overwhelming.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <button
              onClick={onOpenSignup}
              className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-white bg-[#3525cd] hover:bg-[#2b1eb3] shadow-[0_8px_30px_0_rgba(53,37,205,0.3)] active:scale-[0.98] rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-[#111c2d] bg-white border border-[#c7c4d8] hover:bg-[#f9f9ff] hover:border-[#3525cd] active:scale-[0.98] rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Log In</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT PREVIEW */}
      <section id="product-preview" className="py-16 bg-white border-y border-[#dee8ff]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#3525cd] uppercase tracking-wider font-['Geist']">
              Product Interface Preview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111c2d] mt-2 font-['Geist']">
              Designed for your busy college schedule
            </h2>
            <p className="text-xs sm:text-sm text-[#505f76] mt-2">
              Get an instant snapshot of your daily priorities, deadline risks, and study windows.
            </p>
          </div>

          {/* Interactive Mockup Container */}
          <div className="bg-[#f9f9ff] rounded-3xl p-4 sm:p-6 md:p-8 border border-[#c7c4d8]/50 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Today's Focus */}
              <div className="bg-white rounded-2xl p-5 border border-[#dee8ff] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#3525cd] text-xl">flag</span>
                      <h3 className="text-sm font-bold text-[#111c2d]">Today's Focus</h3>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#dee8ff] text-[#3525cd] rounded-full">
                      3 Items
                    </span>
                  </div>

                  <ul className="space-y-3">
                    <li className="p-3 bg-[#f9f9ff] rounded-xl border border-[#dee8ff]/60 flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#111c2d]">Complete DSA Assignment</p>
                        <p className="text-[11px] text-[#505f76] mt-0.5">High Priority • 60 mins</p>
                      </div>
                      <span className="text-[10px] font-bold bg-[#10b981]/15 text-[#047857] px-2 py-0.5 rounded-md">
                        70% Done
                      </span>
                    </li>

                    <li className="p-3 bg-[#f9f9ff] rounded-xl border border-[#dee8ff]/60 flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#111c2d]">Prepare DBMS notes</p>
                        <p className="text-[11px] text-[#505f76] mt-0.5">Medium Priority • 45 mins</p>
                      </div>
                      <span className="text-[10px] font-bold bg-[#f59e0b]/15 text-[#b45309] px-2 py-0.5 rounded-md">
                        In Progress
                      </span>
                    </li>

                    <li className="p-3 bg-[#f9f9ff] rounded-xl border border-[#dee8ff]/60 flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#111c2d]">Project meeting</p>
                        <p className="text-[11px] text-[#505f76] mt-0.5">Scheduled at 3:00 PM</p>
                      </div>
                      <span className="text-[10px] font-bold bg-[#3525cd]/10 text-[#3525cd] px-2 py-0.5 rounded-md">
                        Upcoming
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card 2: AI Priority */}
              <div className="bg-white rounded-2xl p-5 border border-[#dee8ff] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#3525cd] text-xl">auto_awesome</span>
                      <h3 className="text-sm font-bold text-[#111c2d]">AI Priority</h3>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a] rounded-full">
                      Urgent
                    </span>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-[#dee8ff]/60 to-[#f9f9ff] rounded-2xl border border-[#3525cd]/20 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-md">
                        High Priority
                      </span>
                      <span className="text-xs font-semibold text-[#505f76]">Due Tomorrow</span>
                    </div>
                    <p className="text-xs font-bold text-[#111c2d]">Database Management Systems</p>
                    <p className="text-[11px] text-[#505f76] mt-1">
                      Estimated 45 min focus sprint required before 10:00 PM cutoff.
                    </p>
                  </div>

                  <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#dee8ff]/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#505f76]">AI Recommendation</span>
                    <span className="font-bold text-[#3525cd]">Start Focus Session &rarr;</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Upcoming Deadline */}
              <div className="bg-white rounded-2xl p-5 border border-[#dee8ff] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#3525cd] text-xl">schedule</span>
                      <h3 className="text-sm font-bold text-[#111c2d]">Upcoming Deadline</h3>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#fef3c7] text-[#92400e] rounded-full">
                      Tracked
                    </span>
                  </div>

                  <div className="p-4 bg-[#f9f9ff] rounded-2xl border border-[#dee8ff]/60 mb-4">
                    <p className="text-sm font-bold text-[#111c2d]">Database Project</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="material-symbols-outlined text-[16px] text-[#d97706]">timer</span>
                      <span className="text-xs font-bold text-[#b45309]">2 days remaining</span>
                    </div>
                    <div className="w-full bg-[#e7eeff] h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-[#3525cd] h-full w-[65%]" />
                    </div>
                  </div>

                  <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#dee8ff]/60">
                    <p className="text-[11px] font-semibold text-[#505f76]">Workload Balance</p>
                    <p className="text-xs font-bold text-[#111c2d] mt-0.5">
                      Wednesday workload high (6.5h) • Rescue Plan ready
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES */}
      <section id="features" className="py-20 bg-[#f9f9ff]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#3525cd] uppercase tracking-wider font-['Geist']">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111c2d] mt-2 font-['Geist']">
              Everything you need to conquer college stress
            </h2>
            <p className="text-sm sm:text-base text-[#505f76] mt-3">
              Tools designed specifically for managing assignments, exams, labs, and study routines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-6 border border-[#c7c4d8]/40 shadow-xs hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#dee8ff] flex items-center justify-center text-[#3525cd] mb-5 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <h3 className="text-lg font-bold text-[#111c2d] font-['Geist']">AI Task Prioritization</h3>
              <p className="text-xs sm:text-sm text-[#505f76] mt-2 leading-relaxed">
                Automatically organize tasks based on urgency, deadlines, workload, and importance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-6 border border-[#c7c4d8]/40 shadow-xs hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#dee8ff] flex items-center justify-center text-[#3525cd] mb-5 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">calendar_month</span>
              </div>
              <h3 className="text-lg font-bold text-[#111c2d] font-['Geist']">Smart Scheduling</h3>
              <p className="text-xs sm:text-sm text-[#505f76] mt-2 leading-relaxed">
                Create realistic schedules instead of simply creating another long to-do list.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-6 border border-[#c7c4d8]/40 shadow-xs hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#dee8ff] flex items-center justify-center text-[#3525cd] mb-5 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">shield</span>
              </div>
              <h3 className="text-lg font-bold text-[#111c2d] font-['Geist']">Deadline Protection</h3>
              <p className="text-xs sm:text-sm text-[#505f76] mt-2 leading-relaxed">
                Help students identify tasks that are approaching deadlines and reorganize their workload.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-6 border border-[#c7c4d8]/40 shadow-xs hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#dee8ff] flex items-center justify-center text-[#3525cd] mb-5 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">timer</span>
              </div>
              <h3 className="text-lg font-bold text-[#111c2d] font-['Geist']">Focus Mode</h3>
              <p className="text-xs sm:text-sm text-[#505f76] mt-2 leading-relaxed">
                Give students a distraction-free environment to work on the current task.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-3xl p-6 border border-[#c7c4d8]/40 shadow-xs hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#dee8ff] flex items-center justify-center text-[#3525cd] mb-5 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">published_with_changes</span>
              </div>
              <h3 className="text-lg font-bold text-[#111c2d] font-['Geist']">Habit Tracking</h3>
              <p className="text-xs sm:text-sm text-[#505f76] mt-2 leading-relaxed">
                Track recurring habits and consistency.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-3xl p-6 border border-[#c7c4d8]/40 shadow-xs hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#dee8ff] flex items-center justify-center text-[#3525cd] mb-5 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">analytics</span>
              </div>
              <h3 className="text-lg font-bold text-[#111c2d] font-['Geist']">Analytics</h3>
              <p className="text-xs sm:text-sm text-[#505f76] mt-2 leading-relaxed">
                Help students understand their task completion, focus sessions, habits, and workload.
              </p>
            </div>

            {/* Feature 7 (Full row on desktop or standard card) */}
            <div className="bg-white rounded-3xl p-6 border border-[#c7c4d8]/40 shadow-xs hover:shadow-md transition-all group md:col-span-2 lg:col-span-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#dee8ff] flex items-center justify-center text-[#3525cd] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">groups</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111c2d] font-['Geist']">Team Tasks</h3>
                  <p className="text-xs sm:text-sm text-[#505f76] mt-1 leading-relaxed">
                    Support collaborative student work and shared responsibilities for group assignments and lab teams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-t border-[#dee8ff]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#3525cd] uppercase tracking-wider font-['Geist']">
              Simple Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111c2d] mt-2 font-['Geist']">
              How Student Life Saver Works
            </h2>
            <p className="text-sm sm:text-base text-[#505f76] mt-3">
              Four clear steps to convert assignment overload into a manageable, actionable schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-[#f9f9ff] rounded-3xl p-6 border border-[#dee8ff] relative flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black text-[#3525cd] font-['Geist']">01</span>
                <h3 className="text-lg font-bold text-[#111c2d] mt-4 mb-2 font-['Geist']">
                  Add your tasks
                </h3>
                <p className="text-xs sm:text-sm text-[#505f76] leading-relaxed">
                  Put assignments, projects, exams, and other responsibilities into Student Life Saver.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#f9f9ff] rounded-3xl p-6 border border-[#dee8ff] relative flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black text-[#3525cd] font-['Geist']">02</span>
                <h3 className="text-lg font-bold text-[#111c2d] mt-4 mb-2 font-['Geist']">
                  Let the system prioritize
                </h3>
                <p className="text-xs sm:text-sm text-[#505f76] leading-relaxed">
                  The system analyzes deadlines, workload, and task importance.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#f9f9ff] rounded-3xl p-6 border border-[#dee8ff] relative flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black text-[#3525cd] font-['Geist']">03</span>
                <h3 className="text-lg font-bold text-[#111c2d] mt-4 mb-2 font-['Geist']">
                  Build your plan
                </h3>
                <p className="text-xs sm:text-sm text-[#505f76] leading-relaxed">
                  Turn the prioritized work into a realistic schedule.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#f9f9ff] rounded-3xl p-6 border border-[#dee8ff] relative flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black text-[#3525cd] font-['Geist']">04</span>
                <h3 className="text-lg font-bold text-[#111c2d] mt-4 mb-2 font-['Geist']">
                  Focus and finish
                </h3>
                <p className="text-xs sm:text-sm text-[#505f76] leading-relaxed">
                  Use Focus Mode and track progress as you complete your work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-[#3525cd] to-[#2517a8] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-['Geist'] mb-6">
            Stop planning everything at the last minute.
          </h2>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Give your tasks a plan, protect your deadlines, and focus on what matters next.
          </p>

          <div className="flex justify-center">
            <button
              onClick={onOpenSignup}
              className="px-8 py-4 text-sm sm:text-base font-bold text-[#3525cd] bg-white hover:bg-[#dee8ff] shadow-xl active:scale-[0.98] rounded-2xl transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-white border-t border-[#dee8ff] py-12 text-xs text-[#505f76]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Col 1: Brand info */}
            <div className="lg:col-span-2 space-y-4">
              <BrandLogo size="md" />
              <p className="text-xs text-[#505f76] max-w-sm leading-relaxed">
                Student Life Saver helps college students prioritize tasks, protect deadlines, balance course workloads, and stay focused.
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <p className="font-bold text-[#111c2d] mb-3 uppercase tracking-wider font-['Geist']">
                Product
              </p>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-[#3525cd] cursor-pointer">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#3525cd] cursor-pointer">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('product-preview')} className="hover:text-[#3525cd] cursor-pointer">
                    Product Preview
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Access */}
            <div>
              <p className="font-bold text-[#111c2d] mb-3 uppercase tracking-wider font-['Geist']">
                Account
              </p>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={onOpenLogin} className="hover:text-[#3525cd] cursor-pointer">
                    Login
                  </button>
                </li>
                <li>
                  <button onClick={onOpenSignup} className="hover:text-[#3525cd] cursor-pointer">
                    Get Started
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
