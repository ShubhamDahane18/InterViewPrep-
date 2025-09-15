import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ResumeParseResponse {
  success: boolean;
  data: {
    rawText: string;
    skills: string[];
    contactInfo: {
      name?: string;
      email?: string;
      phone?: string;
    };
    sections: Record<string, string>;
  };
  error?: string;
}

export interface QuestionGenerationResponse {
  success: boolean;
  data: {
    questions: Array<{
      id: string;
      question: string;
      type: 'HR' | 'Technical';
      difficulty: 'Easy' | 'Medium' | 'Hard';
      category: string;
    }>;
  };
  error?: string;
}

export interface EvaluationResponse {
  success: boolean;
  data: {
    evaluations: Array<{
      questionId: string;
      score: number;
      strengths: string[];
      areasForImprovement: string[];
      feedback: string;
      overallAssessment: string;
    }>;
    averageScore: number;
    totalQuestions: number;
    overallFeedback: string;
    performanceLevel: string;
  };
  error?: string;
}

export interface ReportGenerationResponse {
  success: boolean;
  data: {
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
  };
  error?: string;
}

export const apiService = {
  // Resume parsing
  parseResume: async (file: File): Promise<ResumeParseResponse> => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post('/resume/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Question generation
  generateQuestions: async (
    resumeData: any,
    type: 'HR' | 'Technical',
    count: number = 5
  ): Promise<QuestionGenerationResponse> => {
    const response = await api.post('/questions/generate', {
      resumeData,
      type,
      count,
    });
    
    return response.data;
  },

  // Answer evaluation
  evaluateAnswers: async (
    questions: any[],
    answers: any[],
    type: 'HR' | 'Technical'
  ): Promise<EvaluationResponse> => {
    const response = await api.post('/evaluation/evaluate', {
      questions,
      answers,
      type,
    });
    
    return response.data;
  },

  // Report generation
  generateReport: async (
    resumeData: any,
    hrEvaluation?: any,
    technicalEvaluation?: any
  ): Promise<ReportGenerationResponse> => {
    const response = await api.post('/reports/generate', {
      resumeData,
      hrEvaluation,
      technicalEvaluation,
    });
    
    return response.data;
  },

  // Voice transcription
  transcribeAudio: async (audioBlob: Blob): Promise<{ success: boolean; text: string; error?: string }> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await api.post('/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Text to speech
  textToSpeech: async (text: string): Promise<Blob> => {
    const response = await api.post('/voice/synthesize', { text }, {
      responseType: 'blob',
    });
    
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
