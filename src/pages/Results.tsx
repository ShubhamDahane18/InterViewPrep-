import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Star,
  Award,
  ArrowLeft,
  RefreshCw,
  Target
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ResultsContainer = styled.div`
  min-height: calc(100vh - 80px);
  padding: 2rem;
  max-width: 1200px;
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

const BackButton = styled(motion.button)`
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
  margin-bottom: 2rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const OverviewSection = styled(motion.section)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const OverviewCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  background: ${props => props.$color};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1rem;
`;

const CardValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
`;

const CardLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const ChartsSection = styled(motion.section)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
`;

const ChartTitle = styled.h3`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailedSection = styled(motion.section)`
  margin-bottom: 3rem;
`;

const DetailedCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const RoundHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const RoundIcon = styled.div<{ $type: 'HR' | 'Technical' }>`
  width: 50px;
  height: 50px;
  background: ${props => props.$type === 'HR' ? 
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  };
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const RoundTitle = styled.h3`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
`;

const RoundScore = styled.div`
  margin-left: auto;
  text-align: right;
`;

const ScoreValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #10b981;
`;

const ScoreLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QuestionItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const QuestionText = styled.div`
  color: white;
  font-weight: 500;
  margin-bottom: 0.5rem;
  flex: 1;
`;

const QuestionScore = styled.div<{ $score: number }>`
  background: ${props => props.$score >= 7 ? 
    'rgba(16, 185, 129, 0.2)' : 
    props.$score >= 5 ? 
    'rgba(245, 158, 11, 0.2)' : 
    'rgba(239, 68, 68, 0.2)'
  };
  color: ${props => props.$score >= 7 ? 
    '#10b981' : 
    props.$score >= 5 ? 
    '#f59e0b' : 
    '#ef4444'
  };
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-left: 1rem;
`;

const AnswerText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const FeedbackSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeedbackCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
`;

const FeedbackTitle = styled.h4`
  color: white;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FeedbackList = styled.ul`
  color: rgba(255, 255, 255, 0.8);
  padding-left: 1rem;
`;

const FeedbackItem = styled.li`
  margin-bottom: 0.25rem;
`;

const RecommendationsSection = styled(motion.section)`
  margin-bottom: 3rem;
`;

const RecommendationsCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
`;

const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RecommendationItem = styled(motion.div)`
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const RecommendationIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const RecommendationText = styled.div`
  color: white;
  line-height: 1.6;
`;

const ActionButtons = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
  }
`;

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { 
    resumeData, 
    hrRound, 
    technicalRound, 
    interviewReport, 
    setInterviewReport,
  } = useAppStore();

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const generateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      const response = await apiService.generateReport(
        resumeData,
        hrRound?.evaluation,
        technicalRound?.evaluation
      );

      if (response.success) {
        setInterviewReport(response.data);
        toast.success('Interview report generated successfully!');
      } else {
        toast.error(response.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  }, [resumeData, hrRound, technicalRound, setInterviewReport, setIsGeneratingReport]);

  useEffect(() => {
    if (!resumeData) {
      navigate('/upload');
      return;
    }

    if (!hrRound && !technicalRound) {
      navigate('/');
      return;
    }

    if (!interviewReport && (hrRound?.evaluation || technicalRound?.evaluation)) {
      generateReport();
    }
  }, [resumeData, hrRound, technicalRound, interviewReport, navigate, generateReport]);

  const downloadReport = () => {
    if (!interviewReport) return;
    
    const dataStr = JSON.stringify(interviewReport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `interview_report_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };


  const getPerformanceLevel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    return 'Needs Improvement';
  };

  if (isGeneratingReport) {
    return <LoadingSpinner message="Generating interview report..." />;
  }

  if (!interviewReport) {
    return <LoadingSpinner message="Loading results..." />;
  }

  const chartData = [
    {
      name: 'HR Round',
      score: hrRound?.evaluation?.averageScore || 0,
      fill: '#f59e0b'
    },
    {
      name: 'Technical Round',
      score: technicalRound?.evaluation?.averageScore || 0,
      fill: '#3b82f6'
    }
  ];

  const pieData = [
    { name: 'Strengths', value: interviewReport.overallAssessment.strengths.length, color: '#10b981' },
    { name: 'Improvements', value: interviewReport.overallAssessment.areasForImprovement.length, color: '#ef4444' }
  ];

  return (
    <ResultsContainer>
      <Header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <BackButton
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </BackButton>
        
        <Title>
          <BarChart3 size={40} />
          Interview Results
        </Title>
        <Subtitle>
          Your comprehensive interview performance analysis
        </Subtitle>
      </Header>

      <OverviewSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <OverviewCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <CardIcon $color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <Target size={30} />
          </CardIcon>
          <CardValue>{interviewReport.overallAssessment.overallScore.toFixed(1)}/10</CardValue>
          <CardLabel>Overall Score</CardLabel>
        </OverviewCard>

        <OverviewCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <CardIcon $color="linear-gradient(135deg, #10b981 0%, #059669 100%)">
            <CheckCircle size={30} />
          </CardIcon>
          <CardValue>{interviewReport.interviewSummary.totalQuestions}</CardValue>
          <CardLabel>Questions Answered</CardLabel>
        </OverviewCard>

        <OverviewCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <CardIcon $color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
            <Award size={30} />
          </CardIcon>
          <CardValue>{interviewReport.interviewSummary.roundsCompleted.length}</CardValue>
          <CardLabel>Rounds Completed</CardLabel>
        </OverviewCard>

        <OverviewCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <CardIcon $color="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)">
            <Star size={30} />
          </CardIcon>
          <CardValue>{getPerformanceLevel(interviewReport.overallAssessment.overallScore)}</CardValue>
          <CardLabel>Performance Level</CardLabel>
        </OverviewCard>
      </OverviewSection>

      <ChartsSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <ChartCard>
          <ChartTitle>
            <BarChart3 size={24} />
            Round Scores
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <TrendingUp size={24} />
            Performance Breakdown
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsSection>

      <DetailedSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {hrRound?.evaluation && (
          <DetailedCard>
            <RoundHeader>
              <RoundIcon $type="HR">
                <CheckCircle size={24} />
              </RoundIcon>
              <RoundTitle>HR Round</RoundTitle>
              <RoundScore>
                <ScoreValue>{hrRound.evaluation.averageScore.toFixed(1)}/10</ScoreValue>
                <ScoreLabel>{hrRound.evaluation.performanceLevel}</ScoreLabel>
              </RoundScore>
            </RoundHeader>

            <QuestionList>
              {hrRound.evaluation.evaluations.map((evaluation, index) => (
                <QuestionItem key={index}>
                  <QuestionHeader>
                    <QuestionText>
                      {hrRound.questions[index]?.question}
                    </QuestionText>
                    <QuestionScore $score={evaluation.score}>
                      {evaluation.score}/10
                    </QuestionScore>
                  </QuestionHeader>
                  
                  <AnswerText>
                    {hrRound.answers[index]?.answer}
                  </AnswerText>

                  <FeedbackSection>
                    <FeedbackCard>
                      <FeedbackTitle>
                        <TrendingUp size={16} />
                        Strengths
                      </FeedbackTitle>
                      <FeedbackList>
                        {evaluation.strengths.map((strength, idx) => (
                          <FeedbackItem key={idx}>{strength}</FeedbackItem>
                        ))}
                      </FeedbackList>
                    </FeedbackCard>

                    <FeedbackCard>
                      <FeedbackTitle>
                        <TrendingDown size={16} />
                        Areas for Improvement
                      </FeedbackTitle>
                      <FeedbackList>
                        {evaluation.areasForImprovement.map((improvement, idx) => (
                          <FeedbackItem key={idx}>{improvement}</FeedbackItem>
                        ))}
                      </FeedbackList>
                    </FeedbackCard>
                  </FeedbackSection>
                </QuestionItem>
              ))}
            </QuestionList>
          </DetailedCard>
        )}

        {technicalRound?.evaluation && (
          <DetailedCard>
            <RoundHeader>
              <RoundIcon $type="Technical">
                <CheckCircle size={24} />
              </RoundIcon>
              <RoundTitle>Technical Round</RoundTitle>
              <RoundScore>
                <ScoreValue>{technicalRound.evaluation.averageScore.toFixed(1)}/10</ScoreValue>
                <ScoreLabel>{technicalRound.evaluation.performanceLevel}</ScoreLabel>
              </RoundScore>
            </RoundHeader>

            <QuestionList>
              {technicalRound.evaluation.evaluations.map((evaluation, index) => (
                <QuestionItem key={index}>
                  <QuestionHeader>
                    <QuestionText>
                      {technicalRound.questions[index]?.question}
                    </QuestionText>
                    <QuestionScore $score={evaluation.score}>
                      {evaluation.score}/10
                    </QuestionScore>
                  </QuestionHeader>
                  
                  <AnswerText>
                    {technicalRound.answers[index]?.answer}
                  </AnswerText>

                  <FeedbackSection>
                    <FeedbackCard>
                      <FeedbackTitle>
                        <TrendingUp size={16} />
                        Strengths
                      </FeedbackTitle>
                      <FeedbackList>
                        {evaluation.strengths.map((strength, idx) => (
                          <FeedbackItem key={idx}>{strength}</FeedbackItem>
                        ))}
                      </FeedbackList>
                    </FeedbackCard>

                    <FeedbackCard>
                      <FeedbackTitle>
                        <TrendingDown size={16} />
                        Areas for Improvement
                      </FeedbackTitle>
                      <FeedbackList>
                        {evaluation.areasForImprovement.map((improvement, idx) => (
                          <FeedbackItem key={idx}>{improvement}</FeedbackItem>
                        ))}
                      </FeedbackList>
                    </FeedbackCard>
                  </FeedbackSection>
                </QuestionItem>
              ))}
            </QuestionList>
          </DetailedCard>
        )}
      </DetailedSection>

      <RecommendationsSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <RecommendationsCard>
          <ChartTitle>
            <Target size={24} />
            Recommendations
          </ChartTitle>
          <RecommendationsList>
            {interviewReport.recommendations.map((recommendation, index) => (
              <RecommendationItem
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
              >
                <RecommendationIcon>
                  <Target size={20} />
                </RecommendationIcon>
                <RecommendationText>{recommendation}</RecommendationText>
              </RecommendationItem>
            ))}
          </RecommendationsList>
        </RecommendationsCard>
      </RecommendationsSection>

      <ActionButtons
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <ActionButton
          onClick={downloadReport}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={20} />
          Download Report
        </ActionButton>
        
        <ActionButton
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={20} />
          Start New Interview
        </ActionButton>
      </ActionButtons>
    </ResultsContainer>
  );
};

export default Results;
