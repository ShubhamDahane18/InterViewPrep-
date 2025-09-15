import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAppStore } from './store/appStore';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ResumeUpload from './pages/ResumeUpload';
import Interview from './pages/Interview';
import Results from './pages/Results';
import LoadingSpinner from './components/LoadingSpinner';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
`;

const MainContent = styled(motion.main)`
  padding-top: 80px;
  min-height: calc(100vh - 80px);
`;

const BackgroundPattern = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
`;

function App() {
  const { isLoading } = useAppStore();

  return (
    <AppContainer>
      <BackgroundPattern />
      <Navbar />
      <MainContent
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<ResumeUpload />} />
          <Route path="/interview/:type" element={<Interview />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </MainContent>
      {isLoading && <LoadingSpinner />}
    </AppContainer>
  );
}

export default App;
