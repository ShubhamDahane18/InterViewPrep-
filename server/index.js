const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and DOC files are allowed.'));
    }
  }
});

// Import services
const resumeParser = require('./services/resumeParser');
const questionGenerator = require('./services/questionGenerator');
const answerEvaluator = require('./services/answerEvaluator');
const reportGenerator = require('./services/reportGenerator');
const voiceService = require('./services/voiceService');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Interview AI API is running' });
});

// Resume parsing endpoint
app.post('/api/resume/parse', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();

    // Parse resume based on file type
    let parsedData;
    if (fileType === '.pdf') {
      parsedData = await resumeParser.parsePDF(filePath);
    } else if (fileType === '.docx' || fileType === '.doc') {
      parsedData = await resumeParser.parseDOCX(filePath);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Unsupported file type' 
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to parse resume'
    });
  }
});

// Question generation endpoint
app.post('/api/questions/generate', async (req, res) => {
  try {
    const { resumeData, type, count = 5 } = req.body;

    if (!resumeData || !type) {
      return res.status(400).json({
        success: false,
        error: 'Resume data and question type are required'
      });
    }

    const questions = await questionGenerator.generateQuestions(resumeData, type, count);

    res.json({
      success: true,
      data: { questions }
    });

  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate questions'
    });
  }
});

// Answer evaluation endpoint
app.post('/api/evaluation/evaluate', async (req, res) => {
  try {
    const { questions, answers, type } = req.body;

    if (!questions || !answers || !type) {
      return res.status(400).json({
        success: false,
        error: 'Questions, answers, and type are required'
      });
    }

    const evaluation = await answerEvaluator.evaluateAnswers(questions, answers, type);

    res.json({
      success: true,
      data: evaluation
    });

  } catch (error) {
    console.error('Answer evaluation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to evaluate answers'
    });
  }
});

// Report generation endpoint
app.post('/api/reports/generate', async (req, res) => {
  try {
    const { resumeData, hrEvaluation, technicalEvaluation } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        error: 'Resume data is required'
      });
    }

    const report = await reportGenerator.generateReport(
      resumeData, 
      hrEvaluation, 
      technicalEvaluation
    );

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate report'
    });
  }
});

// Voice transcription endpoint
app.post('/api/voice/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file uploaded'
      });
    }

    const audioPath = req.file.path;
    const transcription = await voiceService.transcribeAudio(audioPath);

    // Clean up uploaded file
    fs.unlinkSync(audioPath);

    res.json({
      success: true,
      text: transcription
    });

  } catch (error) {
    console.error('Voice transcription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transcribe audio'
    });
  }
});

// Text to speech endpoint
app.post('/api/voice/synthesize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for synthesis'
      });
    }

    const audioBuffer = await voiceService.synthesizeText(text);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });

    res.send(audioBuffer);

  } catch (error) {
    console.error('Text to speech error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to synthesize text'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Interview AI API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
