import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, Mic } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';

const UploadContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const UploadSection = styled(motion.section)`
  width: 100%;
  text-align: center;
  margin-bottom: 3rem;
`;

const SectionTitle = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
`;

const SectionSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
`;

const DropzoneContainer = styled(motion.div)<{ $isDragActive: boolean; $hasFile: boolean }>`
  border: 2px dashed ${props => 
    props.$hasFile ? '#10b981' : 
    props.$isDragActive ? '#667eea' : 'rgba(255, 255, 255, 0.3)'
  };
  border-radius: 20px;
  padding: 3rem 2rem;
  background: ${props => 
    props.$hasFile ? 'rgba(16, 185, 129, 0.1)' :
    props.$isDragActive ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.05)'
  };
  backdrop-filter: blur(20px);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }
`;

const DropzoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const UploadIcon = styled.div<{ $hasFile: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${props => props.$hasFile ? 
    'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
`;

const DropzoneText = styled.div`
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const DropzoneSubtext = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
`;

const FileInfo = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FileIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #667eea;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const FileDetails = styled.div`
  flex: 1;
  text-align: left;
`;

const FileName = styled.div`
  color: white;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const RemoveButton = styled.button`
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
  }
`;

const UploadButton = styled(motion.button)`
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
  margin: 2rem auto 0;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AnalysisResults = styled(motion.div)`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
`;

const ResultsTitle = styled.h3`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ResultCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
`;

const ResultNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const ResultLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const SkillsContainer = styled.div`
  margin-top: 1rem;
`;

const SkillsTitle = styled.h4`
  color: white;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SkillTag = styled.span`
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const NextStepButton = styled(motion.button)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
  margin: 2rem auto 0;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
  }
`;

const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const { setResumeData, setUploading } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResults(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const response = await apiService.parseResume(selectedFile);
      
      if (response.success) {
        setResumeData(response.data);
        setAnalysisResults(response.data);
        toast.success('Resume analyzed successfully!');
      } else {
        toast.error(response.error || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload and analyze resume');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAnalysisResults(null);
  };

  const handleStartInterview = () => {
    navigate('/interview/HR');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <UploadContainer>
      <UploadSection
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <SectionTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Upload Your Resume
        </SectionTitle>
        <SectionSubtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Upload your resume to get personalized interview questions and start practicing
        </SectionSubtitle>

        <DropzoneContainer
          $isDragActive={isDragActive}
          $hasFile={!!selectedFile}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <div {...getRootProps()}>
            <input {...getInputProps()} />
          <DropzoneContent>
            <UploadIcon $hasFile={!!selectedFile}>
              {selectedFile ? <CheckCircle size={40} /> : <Upload size={40} />}
            </UploadIcon>
            <DropzoneText>
              {selectedFile ? 'File Selected' : 'Drop your resume here'}
            </DropzoneText>
            <DropzoneSubtext>
              {selectedFile ? 
                'Click to upload or drag another file' : 
                'or click to browse files (PDF, DOCX, DOC)'
              }
            </DropzoneSubtext>
          </DropzoneContent>

          {selectedFile && (
            <FileInfo
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FileIcon>
                <FileText size={20} />
              </FileIcon>
              <FileDetails>
                <FileName>{selectedFile.name}</FileName>
                <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
              </FileDetails>
              <RemoveButton onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}>
                <AlertCircle size={20} />
              </RemoveButton>
            </FileInfo>
          )}
          </div>
        </DropzoneContainer>

        {selectedFile && !analysisResults && (
          <UploadButton
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            <Upload size={20} />
            Analyze Resume
            <ArrowRight size={20} />
          </UploadButton>
        )}

        {analysisResults && (
          <>
            <AnalysisResults
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ResultsTitle>
                <CheckCircle size={24} />
                Resume Analysis Complete
              </ResultsTitle>
              
              <ResultsGrid>
                <ResultCard>
                  <ResultNumber>{analysisResults.skills?.length || 0}</ResultNumber>
                  <ResultLabel>Skills Found</ResultLabel>
                </ResultCard>
                <ResultCard>
                  <ResultNumber>{Object.keys(analysisResults.sections || {}).length}</ResultNumber>
                  <ResultLabel>Sections</ResultLabel>
                </ResultCard>
                <ResultCard>
                  <ResultNumber>
                    {analysisResults.contactInfo?.email ? '✓' : '✗'}
                  </ResultNumber>
                  <ResultLabel>Contact Info</ResultLabel>
                </ResultCard>
                <ResultCard>
                  <ResultNumber>Ready</ResultNumber>
                  <ResultLabel>Status</ResultLabel>
                </ResultCard>
              </ResultsGrid>

              {analysisResults.skills && analysisResults.skills.length > 0 && (
                <SkillsContainer>
                  <SkillsTitle>Detected Skills</SkillsTitle>
                  <SkillsList>
                    {analysisResults.skills.slice(0, 10).map((skill: string, index: number) => (
                      <SkillTag key={index}>{skill}</SkillTag>
                    ))}
                    {analysisResults.skills.length > 10 && (
                      <SkillTag>+{analysisResults.skills.length - 10} more</SkillTag>
                    )}
                  </SkillsList>
                </SkillsContainer>
              )}
            </AnalysisResults>

            <NextStepButton
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartInterview}
            >
              <Mic size={20} />
              Start Voice Interview
              <ArrowRight size={20} />
            </NextStepButton>
          </>
        )}
      </UploadSection>
    </UploadContainer>
  );
};

export default ResumeUpload;
