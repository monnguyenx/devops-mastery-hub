import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizzes';
import { PILLARS } from '../data/pillars';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  Sparkles, 
  RotateCcw,
  Check,
  Tag
} from 'lucide-react';

interface QuizEngineProps {
  quizAnswers: Record<string, number>;
  onSelectAnswer: (questionId: string, optionIndex: number) => void;
  onResetQuiz: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  quizAnswers,
  onSelectAnswer,
  onResetQuiz
}) => {
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>('all');
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  const filteredQuestions = QUIZ_QUESTIONS.filter(q => 
    selectedPillarFilter === 'all' ? true : q.pillar === selectedPillarFilter
  );

  const activeQuestion = filteredQuestions[currentIdx] || filteredQuestions[0];
  const totalQuestions = filteredQuestions.length;

  const currentAnswer = activeQuestion ? quizAnswers[activeQuestion.id] : undefined;
  const isAnswered = currentAnswer !== undefined;
  const isCorrect = isAnswered && currentAnswer === activeQuestion.correctIndex;

  // Calculate score
  let correctCount = 0;
  QUIZ_QUESTIONS.forEach(q => {
    if (quizAnswers[q.id] === q.correctIndex) {
      correctCount++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/30 via-gray-900 to-slate-900 border border-amber-900/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <HelpCircle className="w-3.5 h-3.5" /> Deep-Dive Scenarios
              </span>
              <span className="text-xs text-gray-400">Câu hỏi hóc búa & Bẫy thực tế</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Middle DevOps Scenario Quizzes
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Không hỏi lý thuyết học vẹt. Mọi câu hỏi đều là tình huống production hoặc câu hỏi phân loại level trong các vòng phỏng vấn kỹ thuật chuyên sâu.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-right">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Điểm chính xác</div>
              <div className="text-base font-bold font-mono text-emerald-400">
                {correctCount} / {QUIZ_QUESTIONS.length} ({QUIZ_QUESTIONS.length > 0 ? Math.round((correctCount / QUIZ_QUESTIONS.length) * 100) : 0}%)
              </div>
            </div>
            <button
              onClick={onResetQuiz}
              className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Làm lại tất cả câu hỏi"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pillar Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => { setSelectedPillarFilter('all'); setCurrentIdx(0); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedPillarFilter === 'all'
              ? 'bg-emerald-500 text-white font-semibold'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
          }`}
        >
          Tất cả Trụ Cột ({QUIZ_QUESTIONS.length})
        </button>

        {PILLARS.map(p => {
          const count = QUIZ_QUESTIONS.filter(q => q.pillar === p.id).length;
          return (
            <button
              key={p.id}
              onClick={() => { setSelectedPillarFilter(p.id); setCurrentIdx(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedPillarFilter === p.id
                  ? 'bg-emerald-500 text-white font-semibold'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {p.shortTitle} ({count})
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      {activeQuestion ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Question Nav & Tags */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-gray-800 text-emerald-400 font-mono text-xs font-bold border border-gray-700">
                Câu {currentIdx + 1} / {totalQuestions}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {PILLARS.find(p => p.id === activeQuestion.pillar)?.title}
              </span>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeQuestion.tags.map((tag, tIdx) => (
                <span 
                  key={tIdx} 
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-800/80 text-gray-400 border border-gray-700/60 flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5 text-gray-500" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Title & Scenario */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
              {activeQuestion.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed bg-gray-800/40 p-4 rounded-xl border border-gray-800/80">
              {activeQuestion.scenario}
            </p>
          </div>

          {/* Code Snippet if present */}
          {activeQuestion.codeSnippet && (
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-gray-800 font-mono text-xs text-slate-200 overflow-x-auto">
              {activeQuestion.codeSnippet.code}
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {activeQuestion.options.map((option, optIdx) => {
              const isPicked = currentAnswer === optIdx;
              const isTheCorrectOne = optIdx === activeQuestion.correctIndex;

              let style = 'bg-gray-800/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700';
              if (isAnswered) {
                if (isTheCorrectOne) {
                  style = 'bg-emerald-950/30 border-emerald-500 text-emerald-200';
                } else if (isPicked && !isCorrect) {
                  style = 'bg-rose-950/30 border-rose-500 text-rose-200';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => onSelectAnswer(activeQuestion.id, optIdx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all text-xs sm:text-sm leading-relaxed flex items-start gap-3.5 ${style}`}
                >
                  <span className="font-mono font-bold text-xs px-2 py-1 rounded bg-black/40 border border-gray-700 shrink-0 mt-0.5">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {isAnswered && (
                    <span className="shrink-0 mt-0.5">
                      {isTheCorrectOne ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isPicked ? (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detailed Explanation upon Answer */}
          {isAnswered && (
            <div className="space-y-4 pt-4 border-t border-gray-800 animate-fadeIn">
              <div className={`p-4 rounded-xl border ${
                isCorrect 
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200' 
                  : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-2">
                  {isCorrect ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Bạn đã chọn chính xác!</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400">Đáp án chính xác là: {String.fromCharCode(65 + activeQuestion.correctIndex)}</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {activeQuestion.explanation}
                </p>
              </div>

              {/* Middle DevOps Mindset Insight */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-blue-950/30 border border-cyan-800/40 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                    Góc nhìn kinh nghiệm thực chiến (Middle Takeaway)
                  </div>
                  <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
                    {activeQuestion.middleDevOpsInsight}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-gray-800 text-xs font-medium text-white transition-colors"
            >
              ← Câu Trước
            </button>

            <span className="text-xs text-gray-500 font-mono">
              {currentIdx + 1} / {totalQuestions}
            </span>

            <button
              onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentIdx === totalQuestions - 1}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-emerald-500/10"
            >
              Câu Tiếp Theo →
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-gray-400 bg-gray-900 border border-gray-800 rounded-2xl">
          Không tìm thấy câu hỏi cho bộ lọc này.
        </div>
      )}
    </div>
  );
};
