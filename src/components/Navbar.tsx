import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mic, FileText, MessageSquare, BarChart3, Home } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const NavbarContainer = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0 2rem;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #667eea;
  font-weight: 700;
  font-size: 1.5rem;
  
  &:hover {
    color: #764ba2;
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: ${props => props.$isActive ? '#667eea' : '#6b7280'};
  font-weight: ${props => props.$isActive ? '600' : '500'};
  padding: 0.5rem 1rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }
  
  ${props => props.$isActive && `
    background: rgba(102, 126, 234, 0.1);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: #667eea;
      border-radius: 1px;
    }
  `}
`;

const StatusIndicator = styled.div<{ $hasData: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$hasData ? '#10b981' : '#6b7280'};
  margin-left: 0.5rem;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
`;

const Navbar: React.FC = () => {
  const location = useLocation();
  const { resumeData, hrRound, technicalRound, interviewReport } = useAppStore();

  const getProgress = () => {
    let progress = 0;
    if (resumeData) progress += 25;
    if (hrRound || technicalRound) progress += 50;
    if (interviewReport) progress += 25;
    return progress;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload', label: 'Upload Resume', icon: FileText },
    { path: '/interview/HR', label: 'HR Interview', icon: MessageSquare },
    { path: '/interview/Technical', label: 'Technical Interview', icon: Mic },
    { path: '/results', label: 'Results', icon: BarChart3 },
  ];

  return (
    <NavbarContainer
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Logo to="/">
        <LogoIcon>
          <Mic size={20} />
        </LogoIcon>
        Interview AI
      </Logo>

      <NavLinks>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path.includes('/interview') && location.pathname.includes('/interview'));
          
          let hasData = false;
          if (item.path === '/upload') hasData = !!resumeData;
          if (item.path === '/interview/HR') hasData = !!hrRound;
          if (item.path === '/interview/Technical') hasData = !!technicalRound;
          if (item.path === '/results') hasData = !!interviewReport;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              $isActive={isActive}
            >
              <Icon size={18} />
              {item.label}
              {hasData && <StatusIndicator $hasData={hasData} />}
            </NavLink>
          );
        })}
      </NavLinks>

      <ProgressBar $progress={getProgress()} />
    </NavbarContainer>
  );
};

export default Navbar;
