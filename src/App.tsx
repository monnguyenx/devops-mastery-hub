import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SkillMatrix } from './components/SkillMatrix';
import { IncidentDrill } from './components/IncidentDrill';
import { QuizEngine } from './components/QuizEngine';
import { LabBlueprints } from './components/LabBlueprints';
import { MockInterview } from './components/MockInterview';
import { PILLARS } from './data/pillars';
import { INCIDENTS } from './data/incidents';
import { QUIZ_QUESTIONS } from './data/quizzes';
import { Terminal, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Load state from localStorage
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('devops_levelup_checkpoints');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [completedIncidents, setCompletedIncidents] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('devops_levelup_incidents');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('devops_levelup_quizzes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('devops_levelup_checkpoints', JSON.stringify(completedCheckpoints));
  }, [completedCheckpoints]);

  useEffect(() => {
    localStorage.setItem('devops_levelup_incidents', JSON.stringify(completedIncidents));
  }, [completedIncidents]);

  useEffect(() => {
    localStorage.setItem('devops_levelup_quizzes', JSON.stringify(quizAnswers));
  }, [quizAnswers]);

  // Toggle handlers
  const handleToggleCheckpoint = (checkpointId: string) => {
    setCompletedCheckpoints(prev => ({
      ...prev,
      [checkpointId]: !prev[checkpointId]
    }));
  };

  const handleResetCheckpoints = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ Skill Matrix?')) {
      setCompletedCheckpoints({});
    }
  };

  const handleToggleIncidentCompleted = (incidentId: string) => {
    setCompletedIncidents(prev => ({
      ...prev,
      [incidentId]: !prev[incidentId]
    }));
  };

  const handleSelectQuizAnswer = (questionId: string, optionIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleResetQuiz = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm lại toàn bộ câu hỏi trắc nghiệm?')) {
      setQuizAnswers({});
    }
  };

  // Calculate Overall Middle DevOps Readiness
  const calculateOverallReadiness = (): number => {
    // 1. Checkpoint percentage (weight: 50%)
    let totalCheckpoints = 0;
    let finishedCheckpoints = 0;
    PILLARS.forEach(p => {
      p.competencies.forEach((c, cIdx) => {
        c.checkpoints.forEach((_, chkIdx) => {
          totalCheckpoints++;
          const id = `${p.id}-${cIdx}-${chkIdx}`;
          if (completedCheckpoints[id]) finishedCheckpoints++;
        });
      });
    });
    const checkpointRatio = totalCheckpoints > 0 ? (finishedCheckpoints / totalCheckpoints) : 0;

    // 2. Incidents Mastered (weight: 30%)
    const incidentRatio = INCIDENTS.length > 0 ? (Object.keys(completedIncidents).length / INCIDENTS.length) : 0;

    // 3. Quiz Score (weight: 20%)
    let correctQuizCount = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) correctQuizCount++;
    });
    const quizRatio = QUIZ_QUESTIONS.length > 0 ? (correctQuizCount / QUIZ_QUESTIONS.length) : 0;

    const totalScore = (checkpointRatio * 50) + (incidentRatio * 30) + (quizRatio * 20);
    return Math.round(totalScore);
  };

  const readinessScore = calculateOverallReadiness();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        readinessScore={readinessScore} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            onNavigateTab={setActiveTab}
            readinessScore={readinessScore}
            completedCheckpoints={completedCheckpoints}
            completedIncidents={completedIncidents}
            quizAnswers={quizAnswers}
          />
        )}

        {activeTab === 'matrix' && (
          <SkillMatrix 
            completedCheckpoints={completedCheckpoints}
            onToggleCheckpoint={handleToggleCheckpoint}
            onResetProgress={handleResetCheckpoints}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentDrill 
            completedIncidents={completedIncidents}
            onToggleIncidentCompleted={handleToggleIncidentCompleted}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizEngine 
            quizAnswers={quizAnswers}
            onSelectAnswer={handleSelectQuizAnswer}
            onResetQuiz={handleResetQuiz}
          />
        )}

        {activeTab === 'labs' && (
          <LabBlueprints />
        )}

        {activeTab === 'interview' && (
          <MockInterview />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-gray-950 py-8 mt-12 text-gray-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-semibold text-gray-200">DevOps Middle LevelUp Hub</span>
            <span className="text-gray-600">|</span>
            <span>Thiết kế dành riêng cho kỹ sư bứt phá lên Middle/Senior</span>
          </div>

          <div className="flex items-center gap-1 text-gray-500">
            <span>Xây dựng với</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>cho cộng đồng DevOps thực chiến</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
