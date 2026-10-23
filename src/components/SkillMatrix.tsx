import React, { useState } from 'react';
import { PILLARS } from '../data/pillars';
import { 
  CheckCircle2, 
  Circle, 
  Terminal, 
  Cpu, 
  GitBranch, 
  Layers, 
  Activity, 
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface SkillMatrixProps {
  completedCheckpoints: Record<string, boolean>;
  onToggleCheckpoint: (checkpointId: string) => void;
  onResetProgress: () => void;
  onNavigateTab: (tab: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Terminal: Terminal,
  Cpu: Cpu,
  GitBranch: GitBranch,
  Layers: Layers,
  Activity: Activity,
  ShieldCheck: ShieldCheck
};

export const SkillMatrix: React.FC<SkillMatrixProps> = ({
  completedCheckpoints,
  onToggleCheckpoint,
  onResetProgress,
  onNavigateTab
}) => {
  const [selectedPillarId, setSelectedPillarId] = useState<string>(PILLARS[0].id);

  const selectedPillar = PILLARS.find(p => p.id === selectedPillarId) || PILLARS[0];

  // Calculate pillar-specific completion
  const getPillarStats = (pillarId: string) => {
    const pillar = PILLARS.find(p => p.id === pillarId);
    if (!pillar) return { total: 0, completed: 0, percent: 0 };
    
    let total = 0;
    let completed = 0;

    pillar.competencies.forEach((comp, compIdx) => {
      comp.checkpoints.forEach((_, checkIdx) => {
        total++;
        const id = `${pillar.id}-${compIdx}-${checkIdx}`;
        if (completedCheckpoints[id]) {
          completed++;
        }
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  const currentStats = getPillarStats(selectedPillar.id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-slate-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Khung Năng Lực 6 Trụ Cột
              </span>
              <span className="text-xs text-gray-400">Junior ➔ Middle DevOps</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Middle DevOps Competency Matrix
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Đánh giá và tích lũy các kỹ năng thực chiến cốt lõi. Tích chọn các checkpoint bạn đã nắm vững để đo lường mức độ sẵn sàng cho vị trí Middle DevOps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onResetProgress}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition-colors"
              title="Đặt lại toàn bộ tiến độ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Tiến Độ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Pillars Selection Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {PILLARS.map((pillar) => {
          const stats = getPillarStats(pillar.id);
          const Icon = ICON_MAP[pillar.icon] || Terminal;
          const isSelected = pillar.id === selectedPillarId;

          return (
            <button
              key={pillar.id}
              onClick={() => setSelectedPillarId(pillar.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gray-800 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-gray-900/80 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${pillar.color}20`, color: pillar.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-300">
                    {stats.percent}%
                  </span>
                </div>
                <div className="text-xs font-semibold text-white line-clamp-1">
                  {pillar.shortTitle}
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-gray-700 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${stats.percent}%`,
                    backgroundColor: pillar.color 
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Pillar Detailed View */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Pillar Header & Why Middle Needs This */}
        <div className="border-b border-gray-800 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
              <span 
                className="w-3 h-8 rounded-full" 
                style={{ backgroundColor: selectedPillar.color }} 
              />
              {selectedPillar.title}
            </h2>
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-gray-400">Tiến độ trụ cột:</span>
              <span className="text-emerald-400 font-bold">
                {currentStats.completed} / {currentStats.total} ({currentStats.percent}%)
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {selectedPillar.summary}
          </p>

          {/* Junior vs Middle Mindset Box */}
          <div className="mt-4 p-4 rounded-xl bg-gray-800/60 border border-gray-700/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                Góc nhìn Middle DevOps (Under The Hood)
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {selectedPillar.whyMiddleNeedsThis}
              </p>
            </div>
          </div>
        </div>

        {/* Competencies & Checkpoints List */}
        <div className="space-y-6">
          {selectedPillar.competencies.map((comp, compIdx) => (
            <div 
              key={comp.id}
              className="bg-gray-800/40 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {comp.id.toUpperCase()}
                  </span>
                  <h3 className="font-semibold text-white text-base">
                    {comp.name}
                  </h3>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 self-start sm:self-auto">
                  Mục tiêu: {comp.levelTarget} DevOps
                </span>
              </div>
              
              <p className="text-xs text-gray-400 mb-4">
                {comp.description}
              </p>

              {/* Checkpoint list */}
              <div className="space-y-2.5">
                {comp.checkpoints.map((checkpoint, checkIdx) => {
                  const checkId = `${selectedPillar.id}-${compIdx}-${checkIdx}`;
                  const isChecked = !!completedCheckpoints[checkId];

                  return (
                    <div
                      key={checkIdx}
                      onClick={() => onToggleCheckpoint(checkId)}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : 'bg-gray-900/60 border-gray-800/80 text-gray-300 hover:bg-gray-900 hover:border-gray-700'
                      }`}
                    >
                      <button 
                        type="button" 
                        className="mt-0.5 text-emerald-400 shrink-0"
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-500/20 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-600 hover:text-gray-400" />
                        )}
                      </button>
                      <div className="text-xs sm:text-sm leading-relaxed">
                        {checkpoint}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action Footer */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Chưa tự tin phần nào? Hãy luyện ngay kịch bản mô phỏng sự cố thực tế!</span>
          </div>

          <button
            onClick={() => onNavigateTab('incidents')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            <span>Luyện Incident Drills Ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
