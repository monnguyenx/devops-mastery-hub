export type PillarId = 
  | 'linux-network' 
  | 'k8s-containers' 
  | 'cicd-gitops' 
  | 'iac-terraform' 
  | 'observability-sre' 
  | 'cloud-secops';

export interface Competency {
  id: string;
  name: string;
  levelTarget: 'Junior' | 'Middle' | 'Senior';
  description: string;
  checkpoints: string[];
}

export interface Pillar {
  id: PillarId;
  title: string;
  shortTitle: string;
  icon: string;
  color: string;
  summary: string;
  whyMiddleNeedsThis: string;
  competencies: Competency[];
}

export interface InvestigationCommand {
  command: string;
  label: string;
  output: string;
  insight: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'SEV-1 (CRITICAL)' | 'SEV-2 (HIGH)' | 'SEV-3 (MEDIUM)';
  pillar: PillarId;
  system: string;
  alertMessage: string;
  description: string;
  symptoms: string[];
  investigationCommands: InvestigationCommand[];
  rootCauseOptions: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  permanentFix: {
    action: string;
    configSnippet?: string;
    configLang?: string;
    explanation: string;
  };
  postMortemTakeaway: string;
}

export interface QuizQuestion {
  id: string;
  pillar: PillarId;
  title: string;
  scenario: string;
  codeSnippet?: {
    code: string;
    lang: string;
  };
  options: string[];
  correctIndex: number;
  explanation: string;
  middleDevOpsInsight: string;
  tags: string[];
}

export interface LabBlueprint {
  id: string;
  pillar: PillarId;
  title: string;
  tag: string;
  description: string;
  productionWhy: string;
  filename: string;
  language: string;
  code: string;
  testInstructions: string;
}

export interface InterviewScenario {
  id: string;
  pillar: PillarId;
  title: string;
  scenario: string;
  expectedQuestions: string[];
  middleLevelRubric: {
    whatInterviewersLookFor: string[];
    sampleAnswerStructure: string[];
    commonMistakesOrRedFlags: string[];
  };
}
