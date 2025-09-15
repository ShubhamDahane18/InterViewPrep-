import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ResumeData {
  rawText: string;
  skills: string[];
  contactInfo: {
    name?: string;
    email?: string;
    phone?: string;
  };
  sections: Record<string, string>;
  filePath?: string;
}

export interface Question {
  id: string;
  question: string;
  type: 'HR' | 'Technical';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export interface Answer {
  questionId: string;
  answer: string;
  audioUrl?: string;
  timestamp: number;
}

export interface Evaluation {
  questionId: string;
  score: number;
  strengths: string[];
  areasForImprovement: string[];
  feedback: string;
  overallAssessment: string;
}

export interface InterviewRound {
  type: 'HR' | 'Technical';
  questions: Question[];
  answers: Answer[];
  evaluation?: {
    evaluations: Evaluation[];
    averageScore: number;
    totalQuestions: number;
    overallFeedback: string;
    performanceLevel: string;
  };
}

export interface InterviewReport {
  candidateInfo: {
    name: string;
    email: string;
    phone: string;
    skills: string[];
  };
  interviewSummary: {
    totalQuestions: number;
    averageScores: Record<string, number>;
    performanceLevels: Record<string, string>;
    roundsCompleted: string[];
    overallAverage: number;
  };
  overallAssessment: {
    overallScore: number;
    strengths: string[];
    areasForImprovement: string[];
    recommendation: string;
  };
  recommendations: string[];
  generatedAt: string;
}

interface AppState {
  // Loading states
  isLoading: boolean;
  isUploading: boolean;
  isGeneratingQuestions: boolean;
  isEvaluating: boolean;
  
  // Data
  resumeData: ResumeData | null;
  hrRound: InterviewRound | null;
  technicalRound: InterviewRound | null;
  interviewReport: InterviewReport | null;
  
  // Voice recording
  isRecording: boolean;
  currentAudioBlob: Blob | null;
  
  // UI state
  currentStep: 'upload' | 'interview' | 'results';
  activeInterviewType: 'HR' | 'Technical' | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setGeneratingQuestions: (generating: boolean) => void;
  setEvaluating: (evaluating: boolean) => void;
  
  setResumeData: (data: ResumeData) => void;
  setHRRound: (round: InterviewRound) => void;
  setTechnicalRound: (round: InterviewRound) => void;
  setInterviewReport: (report: InterviewReport) => void;
  
  setRecording: (recording: boolean) => void;
  setCurrentAudioBlob: (blob: Blob | null) => void;
  
  setCurrentStep: (step: 'upload' | 'interview' | 'results') => void;
  setActiveInterviewType: (type: 'HR' | 'Technical' | null) => void;
  
  addAnswer: (roundType: 'HR' | 'Technical', answer: Answer) => void;
  updateAnswer: (roundType: 'HR' | 'Technical', questionId: string, answer: Answer) => void;
  
  resetInterview: () => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      isUploading: false,
      isGeneratingQuestions: false,
      isEvaluating: false,
      
      resumeData: null,
      hrRound: null,
      technicalRound: null,
      interviewReport: null,
      
      isRecording: false,
      currentAudioBlob: null,
      
      currentStep: 'upload',
      activeInterviewType: null,
      
      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setUploading: (uploading) => set({ isUploading: uploading }),
      setGeneratingQuestions: (generating) => set({ isGeneratingQuestions: generating }),
      setEvaluating: (evaluating) => set({ isEvaluating: evaluating }),
      
      setResumeData: (data) => set({ resumeData: data }),
      setHRRound: (round) => set({ hrRound: round }),
      setTechnicalRound: (round) => set({ technicalRound: round }),
      setInterviewReport: (report) => set({ interviewReport: report }),
      
      setRecording: (recording) => set({ isRecording: recording }),
      setCurrentAudioBlob: (blob) => set({ currentAudioBlob: blob }),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      setActiveInterviewType: (type) => set({ activeInterviewType: type }),
      
      addAnswer: (roundType, answer) => {
        const state = get();
        if (roundType === 'HR' && state.hrRound) {
          set({
            hrRound: {
              ...state.hrRound,
              answers: [...state.hrRound.answers, answer]
            }
          });
        } else if (roundType === 'Technical' && state.technicalRound) {
          set({
            technicalRound: {
              ...state.technicalRound,
              answers: [...state.technicalRound.answers, answer]
            }
          });
        }
      },
      
      updateAnswer: (roundType, questionId, answer) => {
        const state = get();
        if (roundType === 'HR' && state.hrRound) {
          set({
            hrRound: {
              ...state.hrRound,
              answers: state.hrRound.answers.map(a => 
                a.questionId === questionId ? answer : a
              )
            }
          });
        } else if (roundType === 'Technical' && state.technicalRound) {
          set({
            technicalRound: {
              ...state.technicalRound,
              answers: state.technicalRound.answers.map(a => 
                a.questionId === questionId ? answer : a
              )
            }
          });
        }
      },
      
      resetInterview: () => set({
        hrRound: null,
        technicalRound: null,
        interviewReport: null,
        currentStep: 'upload',
        activeInterviewType: null
      }),
      
      resetAll: () => set({
        resumeData: null,
        hrRound: null,
        technicalRound: null,
        interviewReport: null,
        isRecording: false,
        currentAudioBlob: null,
        currentStep: 'upload',
        activeInterviewType: null,
        isLoading: false,
        isUploading: false,
        isGeneratingQuestions: false,
        isEvaluating: false
      })
    }),
    {
      name: 'interview-ai-storage',
      partialize: (state) => ({
        resumeData: state.resumeData,
        hrRound: state.hrRound,
        technicalRound: state.technicalRound,
        interviewReport: state.interviewReport,
        currentStep: state.currentStep
      })
    }
  )
);
