import React, { useState } from 'react';
import { LAB_BLUEPRINTS } from '../data/labs';
import { PILLARS } from '../data/pillars';
import { 
  FileCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Terminal, 
  Tag
} from 'lucide-react';

export const LabBlueprints: React.FC = () => {
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [activeLabId, setActiveLabId] = useState<string>(LAB_BLUEPRINTS[0].id);
  const [copied, setCopied] = useState<boolean>(false);

  const filteredLabs = LAB_BLUEPRINTS.filter(lab => 
    selectedPillar === 'all' ? true : lab.pillar === selectedPillar
  );

  const activeLab = filteredLabs.find(l => l.id === activeLabId) || filteredLabs[0] || LAB_BLUEPRINTS[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/30 via-gray-900 to-slate-900 border border-cyan-900/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <FileCode className="w-3.5 h-3.5" /> Production Templates
              </span>
              <span className="text-xs text-gray-400">Code mẫu chuẩn Enterprise</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Production Lab Blueprints
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Các cấu hình chuẩn production được tinh chỉnh từng dòng: Dockerfile hardened, K8s Zero-downtime, Terraform Distributed Lock, Linux Kernel tuning. Copy về áp dụng ngay vào dự án thực tế.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedPillar('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedPillar === 'all'
              ? 'bg-cyan-500 text-white font-semibold'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
          }`}
        >
          Tất cả Labs ({LAB_BLUEPRINTS.length})
        </button>

        {PILLARS.map(p => {
          const count = LAB_BLUEPRINTS.filter(l => l.pillar === p.id).length;
          if (count === 0) return null;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPillar(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedPillar === p.id
                  ? 'bg-cyan-500 text-white font-semibold'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {p.shortTitle} ({count})
            </button>
          );
        })}
      </div>

      {/* Two Column Layout: Lab List on Left, Active Blueprint on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Lab Navigation */}
        <div className="lg:col-span-4 space-y-3">
          {filteredLabs.map((lab) => {
            const isSelected = lab.id === activeLab.id;

            return (
              <div
                key={lab.id}
                onClick={() => setActiveLabId(lab.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gray-800 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-800/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {lab.filename}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">
                  {lab.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {lab.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right column: Code Viewer & Breakdown */}
        <div className="lg:col-span-8 bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="border-b border-gray-800 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400">{activeLab.tag}</span>
              </div>

              <button
                onClick={() => handleCopyCode(activeLab.code)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 border border-gray-700 transition-colors self-start sm:self-auto"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Đã copy vào clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Config File</span>
                  </>
                )}
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {activeLab.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {activeLab.description}
            </p>
          </div>

          {/* Why Production Needs This */}
          <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Tại sao môi trường Production bắt buộc phải cấu hình như thế này?
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {activeLab.productionWhy}
              </p>
            </div>
          </div>

          {/* Code Block Container */}
          <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#0B0F19]">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800/80 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-gray-400 ml-2">{activeLab.filename}</span>
              </div>
              <span className="text-[11px] font-mono text-gray-500 uppercase">{activeLab.language}</span>
            </div>

            <div className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed whitespace-pre">
              {activeLab.code}
            </div>
          </div>

          {/* Verification & Testing */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/30 flex items-start gap-3">
            <Terminal className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                Cách Test & Kiểm Tra (Verification Instructions)
              </div>
              <p className="text-xs text-cyan-200 leading-relaxed font-mono">
                {activeLab.testInstructions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
