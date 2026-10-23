import React from 'react';
import { 
  Terminal, 
  Flame, 
  CheckSquare, 
  HelpCircle, 
  FileCode, 
  Users, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  readinessScore: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, readinessScore }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
    { id: 'matrix', label: 'Skill Matrix', icon: CheckSquare },
    { id: 'incidents', label: 'Incident Drills', icon: Flame, badge: 'Hot' },
    { id: 'quizzes', label: 'Deep-Dive Quizzes', icon: HelpCircle },
    { id: 'labs', label: 'Production Labs', icon: FileCode },
    { id: 'interview', label: 'Mock Interview', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-white tracking-tight">DevOps<span className="text-emerald-400">LevelUp</span></span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Target: Middle
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">Luyện tư duy & thực chiến Production</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                    isActive
                      ? 'text-white bg-gray-800 shadow-sm border border-gray-700'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Readiness Tracker Pill */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('matrix')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-emerald-500/40 cursor-pointer transition-colors"
              title="Điểm sẵn sàng Middle DevOps dựa trên Skill Matrix"
            >
              <div className="text-right">
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Middle Readiness</div>
                <div className="text-xs font-bold font-mono text-emerald-400">{readinessScore}% Complete</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                <ShieldAlert className={`w-4 h-4 ${readinessScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-gray-800 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-gray-800 border border-gray-700'
                    : 'text-gray-400'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
