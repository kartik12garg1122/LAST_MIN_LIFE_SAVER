import React, { useState, useEffect } from 'react';
import { Task, ScheduleItem } from '../types';
import { generateScheduleFromTasks } from '../utils/scheduleEngine';
import { askGeminiAdvisor, generateSmartSchedule } from '../utils/aiApi';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  schedule: ScheduleItem[];
  onApplyScheduleUpdates?: (updatedSchedule: ScheduleItem[]) => void;
  initialMode?: 'schedule' | 'recommendations';
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  tasks,
  schedule,
  onApplyScheduleUpdates,
  initialMode = 'recommendations',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'recommendations' | 'smart_schedule' | 'ask'>(
    initialMode === 'schedule' ? 'smart_schedule' : 'recommendations'
  );
  const [userQuery, setUserQuery] = useState('');
  
  const pendingTasks = tasks.filter((t) => !t.completed);
  const topTask = pendingTasks.find((t) => t.priority === 'high') || pendingTasks[0];

  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'ai'; text: string; time: string }[]
  >([
    {
      sender: 'ai',
      text: topTask
        ? `Hello! I'm your AI Study Advisor. Based on your current assignment "${topTask.title}" (${topTask.durationMinutes}m, ${topTask.subject}), I've prepared schedule recommendations to keep your study plan optimal.`
        : "Hello! I'm your AI Study Advisor. You have no pending tasks. Add assignments to your task list to get personalized study recommendations.",
      time: 'Just now',
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [smartScheduleData, setSmartScheduleData] = useState<ScheduleItem[] | null>(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'smart_schedule' && !smartScheduleData && pendingTasks.length > 0 && !isGeneratingSchedule) {
      setIsGeneratingSchedule(true);
      generateSmartSchedule(tasks, schedule)
        .then(data => {
          setSmartScheduleData(data);
          setIsGeneratingSchedule(false);
        })
        .catch(err => {
          setScheduleError('Failed to generate smart schedule. Falling back to local engine.');
          setSmartScheduleData(generateScheduleFromTasks(tasks));
          setIsGeneratingSchedule(false);
        });
    }
  }, [activeTab, tasks, schedule, smartScheduleData, isGeneratingSchedule, pendingTasks.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const query = userQuery.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text: query, time: nowTime }]);
    setUserQuery('');
    setIsGenerating(true);

    try {
      const reply = await askGeminiAdvisor(query, tasks, schedule);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      setIsGenerating(false);
    } catch (err: any) {
      console.error('AI Advisor error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ ${err?.message || 'Something went wrong. Please try again.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsGenerating(false);
    }
  };

  const handleApplySmartSchedule = () => {
    if (onApplyScheduleUpdates && smartScheduleData) {
      onApplyScheduleUpdates(smartScheduleData);
    }
    onClose();
  };

  const dynamicSchedulePreview = smartScheduleData || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl border border-[#dee8ff] flex flex-col max-h-[90vh] relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3525cd] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111c2d] font-['Geist']">
                AI Study Advisor
              </h2>
              <p className="text-xs text-[#505f76]">Academic workload optimization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#505f76] hover:bg-[#f0f3ff] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 my-4 p-1 rounded-2xl bg-[#f0f3ff]">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'recommendations'
                ? 'bg-white text-[#3525cd] shadow-xs'
                : 'text-[#505f76] hover:text-[#111c2d]'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('smart_schedule')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'smart_schedule'
                ? 'bg-white text-[#3525cd] shadow-xs'
                : 'text-[#505f76] hover:text-[#111c2d]'
            }`}
          >
            Smart Schedule
          </button>
          <button
            onClick={() => setActiveTab('ask')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ask'
                ? 'bg-white text-[#3525cd] shadow-xs'
                : 'text-[#505f76] hover:text-[#111c2d]'
            }`}
          >
            Ask AI
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'recommendations' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#3525cd] text-[20px]">
                    priority_high
                  </span>
                  <h4 className="text-sm font-bold text-[#111c2d]">High Urgency Target</h4>
                </div>
                <p className="text-xs text-[#464555] leading-relaxed">
                  {topTask ? (
                    <>
                      "Complete <strong className="text-[#111c2d]">{topTask.title}</strong> (
                      {topTask.durationMinutes}m) first to stay on top of your {topTask.subject} deadline."
                    </>
                  ) : (
                    `"You're all caught up! Add new tasks to receive active study sprint recommendations."`
                  )}
                </p>
              </div>

              {pendingTasks.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-[#dee8ff] shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#505f76]">
                    Key Tactical Interventions
                  </h4>

                  {pendingTasks.slice(0, 3).map((task, idx) => (
                    <div key={task.id} className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-[#dee8ff] text-[#3525cd] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="text-xs">
                        <p className="font-semibold text-[#111c2d]">
                          Focus Block: {task.title} ({task.durationMinutes}m)
                        </p>
                        <p className="text-[#505f76] mt-0.5">
                          {task.subject} • Priority: {task.priority}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setActiveTab('smart_schedule')}
                  className="flex-1 py-3 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:bg-[#2b1eb3] transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Build My Schedule
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-5 rounded-xl border border-[#c7c4d8] text-[#505f76] text-xs font-semibold hover:bg-[#f0f3ff] transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {activeTab === 'smart_schedule' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#dee8ff]/60 border border-[#dee8ff]">
                <h4 className="text-sm font-bold text-[#3525cd] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  Optimized Study Blueprint
                </h4>
                <p className="text-xs text-[#505f76] mt-1">
                  We've slotted in study focus blocks based on your current tasks to ensure deadlines are met smoothly.
                </p>
              </div>

              {isGeneratingSchedule ? (
                <div className="p-6 bg-[#f9f9ff] border border-[#dee8ff] rounded-2xl text-center text-xs text-[#505f76] flex flex-col items-center gap-3">
                  <span className="w-6 h-6 border-2 border-[#3525cd] border-t-transparent rounded-full animate-spin"></span>
                  Generating your optimized schedule...
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="p-6 bg-[#f9f9ff] border border-[#dee8ff] rounded-2xl text-center text-xs text-[#505f76]">
                  No active tasks to schedule! Add tasks to your task list to generate a smart study blueprint.
                </div>
              ) : scheduleError ? (
                <div className="p-6 bg-[#fff0f0] border border-[#ffdad6] rounded-2xl text-center text-xs text-[#ba1a1a]">
                  {scheduleError}
                  <div className="mt-4 space-y-2 border border-[#dee8ff] rounded-2xl p-3 bg-white">
                    {dynamicSchedulePreview.map((item) => (
                      <div
                        key={item.id}
                        className={`flex justify-between items-center py-2 px-2.5 text-xs rounded-lg ${
                          item.type === 'break'
                            ? 'bg-[#e7eeff]/60 text-[#505f76] italic'
                            : item.badgeText?.includes('High')
                            ? 'bg-[#ffdad6]/40 text-[#ba1a1a] font-semibold border-b border-[#ffdad6]'
                            : 'bg-white text-[#111c2d] font-medium border border-[#dee8ff]'
                        }`}
                      >
                        <span className="font-bold">{item.time}</span>
                        <span>{item.title}</span>
                        {item.badgeText && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#dee8ff] text-[#3525cd]">
                            {item.badgeText}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : dynamicSchedulePreview.length === 0 ? (
                <div className="p-6 bg-[#f9f9ff] border border-[#dee8ff] rounded-2xl text-center text-xs text-[#505f76]">
                  No schedule items generated.
                </div>
              ) : (
                <div className="space-y-2 border border-[#dee8ff] rounded-2xl p-3 bg-[#f9f9ff]">
                  {dynamicSchedulePreview.map((item) => (
                    <div
                      key={item.id}
                      className={`flex justify-between items-center py-2 px-2.5 text-xs rounded-lg ${
                        item.type === 'break'
                          ? 'bg-[#e7eeff]/60 text-[#505f76] italic'
                          : item.badgeText?.includes('High')
                          ? 'bg-[#ffdad6]/40 text-[#ba1a1a] font-semibold border-b border-[#ffdad6]'
                          : 'bg-white text-[#111c2d] font-medium border border-[#dee8ff]'
                      }`}
                    >
                      <span className="font-bold">{item.time}</span>
                      <span>{item.title}</span>
                      {item.badgeText && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#dee8ff] text-[#3525cd]">
                          {item.badgeText}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={handleApplySmartSchedule}
                  disabled={dynamicSchedulePreview.length === 0}
                  className="flex-1 py-3 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:bg-[#2b1eb3] transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  Apply Smart Schedule to Timeline
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ask' && (
            <div className="flex flex-col h-[320px]">
              {/* Chat log */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#f9f9ff] rounded-2xl border border-[#dee8ff]">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#3525cd] text-white rounded-br-none'
                          : 'bg-white text-[#111c2d] border border-[#dee8ff] rounded-bl-none shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-[#777587] mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-[#dee8ff] max-w-[60%]">
                    <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-[#505f76] font-medium ml-1">Analyzing...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Ask advisor: e.g. How should I sequence my tasks today?"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#c7c4d8] text-xs text-[#111c2d] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none"
                />
                <button
                  type="submit"
                  disabled={!userQuery.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#3525cd] text-white text-xs font-bold hover:bg-[#2b1eb3] transition-all disabled:opacity-50 cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
