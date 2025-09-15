import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mic, FileText, MessageSquare, BarChart3, ArrowRight, Play } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const HomeContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroSection = styled(motion.section)`
  text-align: center;
  margin-bottom: 4rem;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  line-height: 1.2;
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 16px;
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

const FeaturesSection = styled(motion.section)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
  width: 100%;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
`;

const HowItWorksSection = styled(motion.section)`
  width: 100%;
  margin-bottom: 4rem;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 3rem;
`;

const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const StepCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  position: relative;
`;

const StepNumber = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  margin: 0 auto 1rem;
`;

const StepTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
`;

const StepDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
`;

const StatsSection = styled(motion.section)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  width: 100%;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { resumeData } = useAppStore();

  const handleGetStarted = () => {
    if (resumeData) {
      navigate('/interview/HR');
    } else {
      navigate('/upload');
    }
  };

  const features = [
    {
      icon: Mic,
      title: "Voice-Driven Interviews",
      description: "Natural conversation flow with AI using advanced speech recognition and synthesis"
    },
    {
      icon: FileText,
      title: "Smart Resume Analysis",
      description: "AI-powered resume parsing extracts skills, experience, and generates personalized questions"
    },
    {
      icon: MessageSquare,
      title: "Real-time Evaluation",
      description: "Get instant feedback on your answers with detailed scoring and improvement suggestions"
    },
    {
      icon: BarChart3,
      title: "Comprehensive Reports",
      description: "Detailed performance analytics with visualizations and actionable recommendations"
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Upload Resume",
      description: "Upload your PDF or DOCX resume for AI analysis and skill extraction"
    },
    {
      number: 2,
      title: "Choose Interview Type",
      description: "Select between HR behavioral questions or Technical skill assessments"
    },
    {
      number: 3,
      title: "Voice Interview",
      description: "Engage in natural conversation with AI interviewer using voice interaction"
    },
    {
      number: 4,
      title: "Get Results",
      description: "Receive detailed feedback, scores, and personalized improvement recommendations"
    }
  ];

  const stats = [
    { number: "95%", label: "Accuracy Rate" },
    { number: "50+", label: "Skills Detected" },
    { number: "24/7", label: "Available" },
    { number: "100%", label: "Voice-Driven" }
  ];

  return (
    <HomeContainer>
      <HeroSection
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <HeroTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Master Your Next Interview
        </HeroTitle>
        <HeroSubtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Practice with AI-powered voice interviews tailored to your resume. 
          Get real-time feedback and improve your interview skills.
        </HeroSubtitle>
        <CTAButton
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
        >
          {resumeData ? (
            <>
              <Play size={20} />
              Start Interview
            </>
          ) : (
            <>
              <FileText size={20} />
              Upload Resume
            </>
          )}
          <ArrowRight size={20} />
        </CTAButton>
      </HeroSection>

      <FeaturesSection
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
            whileHover={{ y: -5 }}
          >
            <FeatureIcon>
              <feature.icon size={40} />
            </FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeaturesSection>

      <HowItWorksSection
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <SectionTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          How It Works
        </SectionTitle>
        <StepsContainer>
          {steps.map((step, index) => (
            <StepCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
            >
              <StepNumber>{step.number}</StepNumber>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </StepCard>
          ))}
        </StepsContainer>
      </HowItWorksSection>

      <StatsSection
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8 + index * 0.1, duration: 0.5 }}
          >
            <StatNumber>{stat.number}</StatNumber>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsSection>
    </HomeContainer>
  );
};

export default Home;
