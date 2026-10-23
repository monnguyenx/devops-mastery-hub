import React from 'react';
import { PILLARS } from '../data/pillars';
import { INCIDENTS } from '../data/incidents';
import { QUIZ_QUESTIONS } from '../data/quizzes';
import { 
  Flame, 
  CheckSquare, 
  HelpCircle, 
  FileCode, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  GitBranch, 
  Layers, 
  Activity, 
  Sparkles,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
  readinessScore: number;
  completedCheckpoints: Record<string, boolean>;
  completedIncidents: Record<string, boolean>;
  quizAnswers: Record<string, number>;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Terminal: Terminal,
  Cpu: Cpu,
  GitBranch: GitBranch,
  Layers: Layers,
  Activity: Activity,
  ShieldCheck: ShieldCheck
};

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  readinessScore,
  completedCheckpoints,
  completedIncidents,
  quizAnswers
}) => {
  const incidentCompletedCount = Object.keys(completedIncidents).length;
  const quizAnsweredCount = Object.keys(quizAnswers).length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-[#0e1626] to-slate-900 border border-gray-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nền Tảng Đào Tạo & Ôn Luyện Middle DevOps Toàn Diện</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Lên Trình <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Middle DevOps</span> Bằng Tư Duy Thực Chiến
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Không chỉ nhớ câu lệnh. Nền tảng giúp bạn làm chủ <strong>cơ chế hoạt động sâu bên trong (Under The Hood)</strong>, khả năng <strong>Troubleshoot sự cố Production</strong>, thiết kế CI/CD & IaC chuẩn Enterprise, và tự tin vượt qua mọi buổi phỏng vấn kỹ thuật.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('incidents')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-500/25"
              >
                <Flame className="w-4 h-4" />
                <span>Vào War Room Sự Cố</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('matrix')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-sm border border-gray-700 transition-all"
              >
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Xem Khung Năng Lực 6 Trụ Cột</span>
              </button>
            </div>
          </div>

          {/* Readiness Gauge Card */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 sm:p-7 backdrop-blur-md lg:w-80 shrink-0 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                Chỉ Số Sẵn Sàng
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                readinessScore >= 75 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {readinessScore >= 75 ? 'Middle Ready 🚀' : 'Đang Luyện Tập ⚡'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black font-mono text-white tracking-tight">
                {readinessScore}
              </span>
              <span className="text-xl font-bold font-mono text-emerald-400">%</span>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700"
                style={{ width: `${Math.max(5, readinessScore)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-gray-800 text-gray-400">
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Incident War Room</span>
                <span className="font-mono font-bold text-white text-sm">{incidentCompletedCount}/{INCIDENTS.length}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Quiz Đã Làm</span>
                <span className="font-mono font-bold text-white text-sm">{quizAnsweredCount}/{QUIZ_QUESTIONS.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateTab('incidents')}
          className="group p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-rose-500/60 transition-all cursor-pointer hover:shadow-xl hover:shadow-rose-500/5 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-rose-400 transition-colors">
              Incident Drills
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Mô phỏng sự cố SEV-1, gõ lệnh chẩn đoán terminal, tìm root-cause và fix vĩnh viễn.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-rose-400 font-medium pt-1">
            <span>Khám phá {INCIDENTS.length} kịch bản</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('quizzes')}
          className="group p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-amber-500/60 transition-all cursor-pointer hover:shadow-xl hover:shadow-amber-500/5 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
              Deep-Dive Quizzes
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Các câu hỏi tình huống hóc búa, bẫy cấu hình K8s CFS throttling, TCP TIME_WAIT.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-400 font-medium pt-1">
            <span>Luyện {QUIZ_QUESTIONS.length} câu hỏi sâu</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('labs')}
          className="group p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-cyan-500/60 transition-all cursor-pointer hover:shadow-xl hover:shadow-cyan-500/5 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors">
              Production Labs
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Code mẫu Dockerfile hardened, K8s Zero-downtime PDB, Terraform S3 Locking.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-cyan-400 font-medium pt-1">
            <span>Copy template chuẩn</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('interview')}
          className="group p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500/60 transition-all cursor-pointer hover:shadow-xl hover:shadow-purple-500/5 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">
              Mock Interview
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Học cách trả lời các câu hỏi phỏng vấn System Design & Troubleshooting theo chuẩn STAR.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-400 font-medium pt-1">
            <span>Xem Rubric & Câu hỏi</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 6 Pillars Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              6 Trụ Cột Năng Lực Middle DevOps
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Kiểm tra mức độ hoàn thiện trên từng phân hệ kỹ thuật
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('matrix')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Chi tiết Skill Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PILLARS.map((pillar) => {
            const Icon = ICON_MAP[pillar.icon] || Terminal;
            
            // Count checkpoints completed
            let total = 0;
            let completed = 0;
            pillar.competencies.forEach((comp, compIdx) => {
              comp.checkpoints.forEach((_, checkIdx) => {
                total++;
                const id = `${pillar.id}-${compIdx}-${checkIdx}`;
                if (completedCheckpoints[id]) completed++;
              });
            });
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div 
                key={pillar.id}
                onClick={() => onNavigateTab('matrix')}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${pillar.color}20`, color: pillar.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-gray-300 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                    {percent}% Thành thạo
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {pillar.summary}
                  </p>
                </div>

                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percent}%`,
                      backgroundColor: pillar.color 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Junior vs Middle Mindset Comparison */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-slate-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <TrendingUp className="w-5 h-5" />
          <h3 className="text-base sm:text-lg font-bold text-white">
            Sự khác biệt cốt lõi giữa Junior và Middle DevOps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-200 space-y-2">
            <div className="font-bold text-rose-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Tư duy Junior DevOps (Làm theo lệnh)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-300 leading-relaxed">
              <li>Chỉ biết chạy lệnh theo checklist hoặc playbook có sẵn.</li>
              <li>Khi có sự cố: vội vàng restart service hoặc tăng RAM/CPU mà không tìm nguyên nhân gốc rễ.</li>
              <li>Lưu trữ static API Keys, password trong repo hoặc K8s ConfigMap.</li>
              <li>Setup alert CPU &gt; 80% spam kênh Slack suốt ngày gây alert fatigue.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-200 space-y-2">
            <div className="font-bold text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Tư duy Middle DevOps (Làm chủ hệ thống)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-300 leading-relaxed">
              <li>Hiểu rõ cơ chế bên dưới (Kernel cgroups, DNS ndots, TCP states, Reconciliation loops).</li>
              <li>Troubleshoot bài bản với strace, tcpdump, lsof, vmstat, PromQL.</li>
              <li>Thiết kế Zero-Trust: IAM Workload Identity, Secret Rotation, Vault.</li>
              <li>Đo lường bằng 4 Golden Signals, SLO/SLI User-facing và preStop Graceful Shutdown.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
