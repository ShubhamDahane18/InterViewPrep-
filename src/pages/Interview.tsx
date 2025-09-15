import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Clock,
  MessageSquare,
  Brain
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';
import { voiceService } from '../services/voiceService';
import LoadingSpinner from '../components/LoadingSpinner';

const InterviewContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ProgressFill = styled(motion.div)<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.$progress}%;
  border-radius: 4px;
`;

const InterviewContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  flex: 1;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QuestionPanel = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const QuestionIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const QuestionInfo = styled.div`
  flex: 1;
`;

const QuestionNumber = styled.div`
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const QuestionCategory = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const QuestionText = styled.div`
  color: white;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  min-height: 80px;
`;

const AnswerPanel = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
`;

const AnswerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const AnswerIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const AnswerTitle = styled.div`
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
`;

const VoiceControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const RecordButton = styled(motion.button)<{ $isRecording: boolean }>`
  background: ${props => props.$isRecording ? 
    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
    'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  };
  color: white;
  border: none;
  padding: 1.5rem;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AudioVisualizer = styled.div<{ $isRecording: boolean }>`
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
  
  ${props => props.$isRecording && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.3), transparent);
      animation: recording 2s infinite;
    }
  `}
  
  @keyframes recording {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const RecordingStatus = styled.div<{ $isRecording: boolean }>`
  color: ${props => props.$isRecording ? '#ef4444' : 'rgba(255, 255, 255, 0.7)'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AnswerText = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  min-height: 120px;
  color: white;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  white-space: pre-wrap;
`;

const PlaybackControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const PlayButton = styled.button`
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: #667eea;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.3);
  }
`;

const NavigationControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
`;

const NavButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
`;

const Interview: React.FC = () => {
  const { type } = useParams<{ type: 'HR' | 'Technical' }>();
  const navigate = useNavigate();
  const {
    resumeData,
    hrRound,
    technicalRound,
    setHRRound,
    setTechnicalRound,
    setGeneratingQuestions,
    setEvaluating,
    addAnswer,
    isGeneratingQuestions,
    isEvaluating
  } = useAppStore();

  const generateQuestions = useCallback(async () => {
    if (!resumeData || !type) return;

    setGeneratingQuestions(true);
    try {
      const response = await apiService.generateQuestions(resumeData, type, 5);
      
      if (response.success) {
        const round: any = {
          type,
          questions: response.data.questions,
          answers: []
        };

        if (type === 'HR') {
          setHRRound(round);
        } else {
          setTechnicalRound(round);
        }

        // Speak the first question
        if (response.data.questions.length > 0) {
          await speakQuestion(response.data.questions[0].question);
        }
      } else {
        toast.error(response.error || 'Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate questions');
    } finally {
      setGeneratingQuestions(false);
    }
  }, [resumeData, type, setHRRound, setTechnicalRound, setGeneratingQuestions]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentRound = type === 'HR' ? hrRound : technicalRound;
  const currentQuestion = currentRound?.questions[currentQuestionIndex];

  useEffect(() => {
    if (!resumeData) {
      navigate('/upload');
      return;
    }

    if (!currentRound) {
      generateQuestions();
    }
  }, [resumeData, currentRound, type, navigate, generateQuestions]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const speakQuestion = async (question: string) => {
    try {
      setIsSpeaking(true);
      await voiceService.speakText(question, {
        rate: 0.8,
        pitch: 1,
        volume: 1
      });
    } catch (error) {
      console.error('Error speaking question:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const startRecording = async () => {
    try {
      const hasPermission = await voiceService.requestMicrophonePermission();
      if (!hasPermission) {
        toast.error('Microphone permission is required for voice recording');
        return;
      }

      setIsRecording(true);
      setTimeElapsed(0);
      setCurrentAnswer('');

      await voiceService.startRecording({
        onStart: () => {
          console.log('Recording started');
        },
        onStop: () => {
          console.log('Recording stopped');
        },
        onData: async (audioBlob) => {
          try {
            const transcribedText = await voiceService.transcribeAudio(audioBlob);
            setCurrentAnswer(transcribedText);
            setAudioUrl(URL.createObjectURL(audioBlob));
            toast.success('Voice transcribed successfully!');
          } catch (error) {
            console.error('Transcription error:', error);
            toast.error('Failed to transcribe audio');
          }
        },
        onError: (error) => {
          console.error('Recording error:', error);
          toast.error('Recording failed');
          setIsRecording(false);
        }
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    voiceService.stopRecording();
    setIsRecording(false);
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!currentQuestion || !currentAnswer.trim()) {
      toast.error('Please provide an answer before proceeding');
      return;
    }

    // Save current answer
    const answer = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      audioUrl: audioUrl || undefined,
      timestamp: Date.now()
    };

    if (type === 'HR') {
      addAnswer('HR', answer);
    } else {
      addAnswer('Technical', answer);
    }

    // Move to next question
    if (currentQuestionIndex < (currentRound?.questions.length || 0) - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentAnswer('');
      setAudioUrl(null);
      setTimeElapsed(0);

      // Speak next question
      const nextQuestion = currentRound?.questions[nextIndex];
      if (nextQuestion) {
        await speakQuestion(nextQuestion.question);
      }
    } else {
      // All questions answered, evaluate
      await evaluateAnswers();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer('');
      setAudioUrl(null);
      setTimeElapsed(0);
    }
  };

  const evaluateAnswers = async () => {
    if (!currentRound) return;

    setEvaluating(true);
    try {
      const response = await apiService.evaluateAnswers(
        currentRound.questions,
        currentRound.answers,
        type!
      );

      if (response.success) {
        const updatedRound = {
          ...currentRound,
          evaluation: response.data
        };

        if (type === 'HR') {
          setHRRound(updatedRound);
        } else {
          setTechnicalRound(updatedRound);
        }

        toast.success('Interview evaluation completed!');
        navigate('/results');
      } else {
        toast.error(response.error || 'Failed to evaluate answers');
      }
    } catch (error) {
      console.error('Error evaluating answers:', error);
      toast.error('Failed to evaluate answers');
    } finally {
      setEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentRound ? 
    ((currentQuestionIndex + 1) / currentRound.questions.length) * 100 : 0;

  if (isGeneratingQuestions) {
    return <LoadingSpinner message="Generating interview questions..." />;
  }

  if (!currentRound || !currentQuestion) {
    return <LoadingSpinner message="Loading interview..." />;
  }

  return (
    <InterviewContainer>
      <Header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>
          {type === 'HR' ? <MessageSquare size={40} /> : <Brain size={40} />}
          {type} Interview
        </Title>
        <Subtitle>
          Answer the questions using voice recording. Speak naturally and clearly.
        </Subtitle>
        <ProgressBar>
          <ProgressFill $progress={progress} />
        </ProgressBar>
      </Header>

      <InterviewContent>
        <QuestionPanel
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <QuestionHeader>
            <QuestionIcon>
              <MessageSquare size={24} />
            </QuestionIcon>
            <QuestionInfo>
              <QuestionNumber>
                Question {currentQuestionIndex + 1} of {currentRound.questions.length}
              </QuestionNumber>
              <QuestionCategory>
                {currentQuestion.category} • {currentQuestion.difficulty}
              </QuestionCategory>
            </QuestionInfo>
          </QuestionHeader>
          
          <QuestionText>
            {currentQuestion.question}
          </QuestionText>

          <Timer>
            <Clock size={16} />
            {formatTime(timeElapsed)}
          </Timer>
        </QuestionPanel>

        <AnswerPanel
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <AnswerHeader>
            <AnswerIcon>
              <Mic size={24} />
            </AnswerIcon>
            <AnswerTitle>Your Answer</AnswerTitle>
          </AnswerHeader>

          <VoiceControls>
            <AudioVisualizer $isRecording={isRecording}>
              <RecordingStatus $isRecording={isRecording}>
                {isRecording ? (
                  <>
                    <Mic size={20} />
                    Recording... {formatTime(timeElapsed)}
                  </>
                ) : (
                  <>
                    <MicOff size={20} />
                    Ready to record
                  </>
                )}
              </RecordingStatus>
            </AudioVisualizer>

            <RecordButton
              $isRecording={isRecording}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSpeaking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isRecording ? (
                <>
                  <MicOff size={24} />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic size={24} />
                  Start Recording
                </>
              )}
            </RecordButton>
          </VoiceControls>

          {currentAnswer && (
            <AnswerText>
              {currentAnswer}
            </AnswerText>
          )}

          {audioUrl && (
            <PlaybackControls>
              <PlayButton onClick={isPlaying ? pauseAudio : playAudio}>
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Play'} Audio
              </PlayButton>
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
              />
            </PlaybackControls>
          )}

          <NavigationControls>
            <NavButton
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft size={16} />
              Previous
            </NavButton>

            <SubmitButton
              onClick={handleNextQuestion}
              disabled={!currentAnswer.trim() || isEvaluating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {currentQuestionIndex === currentRound.questions.length - 1 ? (
                <>
                  <CheckCircle size={16} />
                  Finish Interview
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight size={16} />
                </>
              )}
            </SubmitButton>
          </NavigationControls>
        </AnswerPanel>
      </InterviewContent>
    </InterviewContainer>
  );
};

export default Interview;
