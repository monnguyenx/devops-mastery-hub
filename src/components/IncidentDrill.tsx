import React, { useState } from 'react';
import { INCIDENTS } from '../data/incidents';
import { 
  Flame, 
  Terminal, 
  AlertOctagon, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Check, 
  Lightbulb, 
  ShieldCheck, 
  Server
} from 'lucide-react';

interface IncidentDrillProps {
  completedIncidents: Record<string, boolean>;
  onToggleIncidentCompleted: (incidentId: string) => void;
}

export const IncidentDrill: React.FC<IncidentDrillProps> = ({
  completedIncidents,
  onToggleIncidentCompleted
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(INCIDENTS[0].id);
  const [executedCommands, setExecutedCommands] = useState<Record<number, boolean>>({});
  const [selectedRootCause, setSelectedRootCause] = useState<string | null>(null);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const incident = INCIDENTS.find(inc => inc.id === selectedIncidentId) || INCIDENTS[0];
  const isMastered = !!completedIncidents[incident.id];

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setExecutedCommands({});
    setSelectedRootCause(null);
    setCopiedConfig(false);
  };

  const handleRunCommand = (idx: number) => {
    setExecutedCommands(prev => ({ ...prev, [idx]: true }));
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const selectedOptionObj = incident.rootCauseOptions.find(o => o.id === selectedRootCause);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-gray-900 to-slate-900 border border-rose-900/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Flame className="w-3.5 h-3.5" /> War Room Drill
              </span>
              <span className="text-xs text-gray-400">Troubleshoot sự cố thực tế</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Production Incident Simulator
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Middle DevOps được đánh giá cao nhất ở khả năng dập tắt sự cố Production. Hãy vào vai On-call Engineer: đọc alert, gõ lệnh chẩn đoán, tìm root-cause và cấu hình fix vĩnh viễn.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Đã giải quyết:</span>
            <span className="px-3 py-1 rounded-lg bg-gray-800 border border-gray-700 font-mono font-bold text-emerald-400 text-sm">
              {Object.keys(completedIncidents).length} / {INCIDENTS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Incident List Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {INCIDENTS.map((inc) => {
          const isSelected = inc.id === selectedIncidentId;
          const completed = !!completedIncidents[inc.id];

          return (
            <div
              key={inc.id}
              onClick={() => handleSelectIncident(inc.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                isSelected
                  ? 'bg-gray-800 border-rose-500/80 shadow-lg shadow-rose-500/10'
                  : 'bg-gray-900/90 border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded ${
                  inc.severity.includes('CRITICAL') 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {inc.severity}
                </span>

                {completed ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" /> Đã nắm vững
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-500">Chưa hoàn thành</span>
                )}
              </div>

              <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1.5">
                {inc.title}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Server className="w-3 h-3 text-gray-500" />
                <span className="line-clamp-1">{inc.system}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Incident Details & War Room Console */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Incident Alert Header */}
        <div className="p-6 bg-gradient-to-b from-gray-800/60 to-gray-900 border-b border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono text-xs text-rose-400 font-bold uppercase tracking-wider">
                {incident.severity}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-xs text-gray-400 font-mono">{incident.system}</span>
            </div>

            <button
              onClick={() => onToggleIncidentCompleted(incident.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isMastered
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-emerald-600 hover:text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isMastered ? '✓ Đã Master Kịch Bản Này' : 'Đánh Dấu Đã Nắm Vững'}</span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {incident.title}
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {incident.description}
          </p>

          {/* Alert Message Box */}
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-bold font-mono text-rose-400">
                PROMETHEUS ALERT FIRING
              </div>
              <div className="text-xs font-mono text-rose-200 bg-black/40 px-2 py-1 rounded border border-rose-900/30">
                {incident.alertMessage}
              </div>
            </div>
          </div>

          {/* Key Symptoms list */}
          <div className="mt-4 flex flex-wrap gap-2">
            {incident.symptoms.map((symptom, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 rounded-md text-xs bg-gray-800 text-gray-300 border border-gray-700 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {symptom}
              </span>
            ))}
          </div>
        </div>

        {/* Phase 1: Investigation Terminal */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">
                1. Diagnostic Terminal (Điều tra nguyên nhân)
              </h3>
            </div>
            <span className="text-xs text-gray-400">
              Nhấn "Chạy Lệnh" để xem kết quả trả về từ server
            </span>
          </div>

          <div className="space-y-4">
            {incident.investigationCommands.map((cmd, idx) => {
              const isRun = !!executedCommands[idx];

              return (
                <div key={idx} className="border border-gray-800 rounded-xl overflow-hidden bg-black/50">
                  {/* Command Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-800/70 border-b border-gray-800 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-emerald-400 font-mono">
                        {cmd.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-gray-300 bg-gray-900/80 px-2 py-1 rounded border border-gray-700 hidden lg:block">
                        {cmd.command}
                      </code>
                      <button
                        onClick={() => handleRunCommand(idx)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          isRun
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20'
                        }`}
                      >
                        {isRun ? 'Chạy Lại' : 'Chạy Lệnh ➔'}
                      </button>
                    </div>
                  </div>

                  {/* Terminal Output */}
                  {isRun ? (
                    <div className="p-4 space-y-3">
                      <div className="bg-[#0B0F19] p-3 rounded-lg border border-gray-800 font-mono text-xs text-emerald-300 whitespace-pre-wrap overflow-x-auto leading-relaxed shadow-inner">
                        <span className="text-gray-500 select-none">$ {cmd.command}</span>{'\n'}
                        {cmd.output}
                      </div>

                      {/* Insight box */}
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
                        <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-400">DevOps Phân Tích: </strong>
                          {cmd.insight}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-gray-500 italic">
                      Terminal đang ở chế độ chờ. Hãy nhấn "Chạy Lệnh" để tiến hành chẩn đoán.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Phase 2: Root Cause Deduction */}
          <div className="pt-6 border-t border-gray-800 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">
                2. Root Cause Deduction (Xác định nguyên nhân cốt lõi)
              </h3>
            </div>
            <p className="text-xs text-gray-400">
              Dựa vào các bằng chứng ở log và terminal trên, đâu là nguyên nhân thực sự của sự cố?
            </p>

            <div className="space-y-3">
              {incident.rootCauseOptions.map((opt) => {
                const isSelected = selectedRootCause === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedRootCause(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-xs sm:text-sm leading-relaxed flex items-start gap-3 ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200'
                          : 'bg-rose-950/30 border-rose-500 text-rose-200'
                        : 'bg-gray-800/40 border-gray-800 hover:bg-gray-800 hover:border-gray-700 text-gray-200'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {isSelected ? (
                        opt.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-600" />
                      )}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected feedback */}
            {selectedOptionObj && (
              <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                selectedOptionObj.isCorrect
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
              }`}>
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  {selectedOptionObj.isCorrect ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Chính Xác! Phân Tích Chuẩn Middle DevOps:</span>
                    </>
                  ) : (
                    <>
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                      <span>Chưa Chính Xác:</span>
                    </>
                  )}
                </div>
                {selectedOptionObj.feedback}
              </div>
            )}
          </div>

          {/* Phase 3: Permanent Fix & Post-Mortem */}
          {selectedOptionObj?.isCorrect && (
            <div className="pt-6 border-t border-gray-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">
                    3. Giải Pháp Dài Hạn & Cấu Hình Fix Vĩnh Viễn
                  </h3>
                </div>
                {incident.permanentFix.configSnippet && (
                  <button
                    onClick={() => handleCopyCode(incident.permanentFix.configSnippet!)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 border border-gray-700 transition-colors"
                  >
                    {copiedConfig ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Đã Copy!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code Config</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="text-xs sm:text-sm text-gray-300 bg-gray-800/50 p-4 rounded-xl border border-gray-800">
                <strong>Hành động: </strong>{incident.permanentFix.action}
              </div>

              {incident.permanentFix.configSnippet && (
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-gray-800 font-mono text-xs text-slate-200 whitespace-pre overflow-x-auto leading-relaxed shadow-lg">
                  {incident.permanentFix.configSnippet}
                </div>
              )}

              <p className="text-xs text-gray-300 leading-relaxed bg-gray-800/30 p-3 rounded-lg border border-gray-800">
                <strong className="text-emerald-400">Giải thích cơ chế: </strong>
                {incident.permanentFix.explanation}
              </p>

              {/* Post-Mortem Takeaway */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-blue-950/30 border border-cyan-800/40 text-xs sm:text-sm text-cyan-200">
                <div className="font-bold text-cyan-400 uppercase tracking-wider text-xs mb-1">
                  Bài học đắt giá (Post-Mortem Takeaway)
                </div>
                {incident.postMortemTakeaway}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
