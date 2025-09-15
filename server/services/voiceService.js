const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class VoiceService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async transcribeAudio(audioPath) {
    try {
      // Read the audio file
      const audioFile = fs.createReadStream(audioPath);
      
      // Transcribe using OpenAI Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en",
        response_format: "text"
      });

      return transcription;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  async synthesizeText(text) {
    try {
      // Generate speech using OpenAI TTS
      const response = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy", // Options: alloy, echo, fable, onyx, nova, shimmer
        input: text,
        response_format: "mp3"
      });

      // Convert response to buffer
      const buffer = Buffer.from(await response.arrayBuffer());
      return buffer;
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw new Error(`Failed to synthesize text: ${error.message}`);
    }
  }

  // Alternative TTS voices
  async synthesizeTextWithVoice(text, voice = 'alloy') {
    try {
      const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      const selectedVoice = validVoices.includes(voice) ? voice : 'alloy';

      const response = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: selectedVoice,
        input: text,
        response_format: "mp3"
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      return buffer;
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw new Error(`Failed to synthesize text: ${error.message}`);
    }
  }

  // Get available voices
  getAvailableVoices() {
    return [
      { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
      { id: 'echo', name: 'Echo', description: 'Clear, professional voice' },
      { id: 'fable', name: 'Fable', description: 'Warm, engaging voice' },
      { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice' },
      { id: 'nova', name: 'Nova', description: 'Bright, energetic voice' },
      { id: 'shimmer', name: 'Shimmer', description: 'Soft, gentle voice' }
    ];
  }

  // Validate audio file format
  validateAudioFile(filePath) {
    const validExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
    const ext = path.extname(filePath).toLowerCase();
    return validExtensions.includes(ext);
  }

  // Get file size in MB
  getFileSizeMB(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size / (1024 * 1024);
  }

  // Check if file size is within limits (25MB for OpenAI Whisper)
  isFileSizeValid(filePath) {
    const sizeMB = this.getFileSizeMB(filePath);
    return sizeMB <= 25;
  }
}

module.exports = new VoiceService();
