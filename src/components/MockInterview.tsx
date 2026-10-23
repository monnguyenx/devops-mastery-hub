import React, { useState } from 'react';
import { INTERVIEW_SCENARIOS } from '../data/interview';
import { PILLARS } from '../data/pillars';
import { 
  Users, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  ListOrdered, 
  Lightbulb,
  Award
} from 'lucide-react';

export const MockInterview: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(INTERVIEW_SCENARIOS[0].id);
  const [selfChecks, setSelfChecks] = useState<Record<string, boolean>>({});

  const scenario = INTERVIEW_SCENARIOS.find(s => s.id === selectedScenarioId) || INTERVIEW_SCENARIOS[0];

  const handleToggleCheck = (id: string) => {
    setSelfChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/30 via-gray-900 to-slate-900 border border-purple-900/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Users className="w-3.5 h-3.5" /> Technical Interview Prep
              </span>
              <span className="text-xs text-gray-400">Vòng Phỏng Vấn Kỹ Thuật Middle</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Middle DevOps Mock Interview & Rubrics
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Học cách trả lời phỏng vấn theo phương pháp của kỹ sư có kinh nghiệm: phân tích đa chiều, phương pháp STAR, tránh các lỗi chết người (Red Flags) mà Junior hay mắc phải.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Picker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {INTERVIEW_SCENARIOS.map((scen) => {
          const isSelected = scen.id === selectedScenarioId;
          const pillar = PILLARS.find(p => p.id === scen.pillar);

          return (
            <div
              key={scen.id}
              onClick={() => setSelectedScenarioId(scen.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-gray-800 border-purple-500 shadow-md shadow-purple-500/10'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-800/40'
              }`}
            >
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2 inline-block">
                {pillar?.shortTitle || 'DevOps'}
              </span>
              <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                {scen.title}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Active Scenario Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {scenario.title}
          </h2>
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800 text-sm text-gray-300 leading-relaxed">
            <strong className="text-purple-400">Bối cảnh câu hỏi: </strong>
            {scenario.scenario}
          </div>
        </div>

        {/* Expected Sub-Questions */}
        <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>Các câu hỏi follow-up mà người phỏng vấn sẽ đào sâu:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-400 pl-2">
            {scenario.expectedQuestions.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        </div>

        {/* Rubric Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What Interviewers Look For */}
          <div className="bg-emerald-950/10 border border-emerald-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Award className="w-4 h-4" />
              <span>Điểm Cộng Lớn (What Interviewers Look For)</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-200">
              {scenario.middleLevelRubric.whatInterviewersLookFor.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Red Flags / Common Mistakes */}
          <div className="bg-rose-950/10 border border-rose-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Điểm Trừ / Dấu Hiệu Junior (Red Flags)</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-rose-200">
              {scenario.middleLevelRubric.commonMistakesOrRedFlags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sample Answer Structure (Model Answer) */}
        <div className="p-6 rounded-xl bg-gray-800/40 border border-gray-700/60 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ListOrdered className="w-5 h-5 text-purple-400" />
            <span>Khung Trả Lời Mẫu Chuẩn Middle DevOps (Step-by-step Framework)</span>
          </div>

          <div className="space-y-3">
            {scenario.middleLevelRubric.sampleAnswerStructure.map((step, idx) => {
              const checkKey = `${scenario.id}-step-${idx}`;
              const isChecked = !!selfChecks[checkKey];

              return (
                <div
                  key={idx}
                  onClick={() => handleToggleCheck(checkKey)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-purple-950/30 border-purple-500/50 text-purple-200'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <button type="button" className="shrink-0 mt-0.5 text-purple-400">
                    <CheckCircle className={`w-4 h-4 ${isChecked ? 'text-purple-400' : 'text-gray-600'}`} />
                  </button>
                  <div className="text-xs sm:text-sm leading-relaxed">
                    {step}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Mẹo: Hãy luyện tập nói to các bước trên trước gương hoặc ghi âm lại để kiểm tra độ trôi chảy!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
