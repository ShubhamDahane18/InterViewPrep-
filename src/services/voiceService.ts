import { apiService } from './api';

export interface VoiceRecorderOptions {
  onStart?: () => void;
  onStop?: () => void;
  onData?: (audioBlob: Blob) => void;
  onError?: (error: Error) => void;
}

export interface SpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
}

class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;
  private recognition: any = null;

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  // Check if browser supports required APIs
  isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition) &&
      window.speechSynthesis
    );
  }

  // Request microphone permission
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  // Start voice recording
  async startRecording(options: VoiceRecorderOptions = {}): Promise<void> {
    try {
      if (this.isRecording) {
        throw new Error('Recording is already in progress');
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        options.onData?.(audioBlob);
        options.onStop?.();
        this.cleanup();
      };

      this.mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event}`);
        options.onError?.(error);
        this.cleanup();
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      options.onStart?.();

    } catch (error) {
      const err = error as Error;
      options.onError?.(err);
      this.cleanup();
      throw err;
    }
  }

  // Stop voice recording
  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  // Check if currently recording
  getRecordingStatus(): boolean {
    return this.isRecording;
  }

  // Transcribe audio using Web Speech API (fallback)
  async transcribeWithWebSpeech(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        // Recognition ended
      };

      this.recognition.start();
    });
  }

  // Transcribe audio using backend service
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const response = await apiService.transcribeAudio(audioBlob);
      if (response.success) {
        return response.text;
      } else {
        throw new Error(response.error || 'Transcription failed');
      }
    } catch (error) {
      console.warn('Backend transcription failed, trying Web Speech API:', error);
      // Fallback to Web Speech API
      return this.transcribeWithWebSpeech(audioBlob);
    }
  }

  // Text to speech
  async speakText(
    text: string, 
    options: SpeechSynthesisOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      // Try to use a preferred voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      window.speechSynthesis.speak(utterance);
    });
  }

  // Stop current speech
  stopSpeaking(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return window.speechSynthesis.speaking;
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return window.speechSynthesis.getVoices();
  }

  // Cleanup resources
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  // Destroy service
  destroy(): void {
    this.stopRecording();
    this.stopSpeaking();
    this.cleanup();
  }
}

// Create singleton instance
export const voiceService = new VoiceService();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
