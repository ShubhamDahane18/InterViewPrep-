# Evaluates answers (LLM-based scoring)
import google.generativeai as genai
import re
from typing import Dict, List
from config.settings import GEMINI_API_KEY, GEMINI_MODEL
from config.prompts import EVALUATION_PROMPT
from utils.logger import get_logger
from utils.custom_exception import CustomException

logger = get_logger(__name__)

class AnswerEvaluator:
    def __init__(self):
        self.logger = logger
        self._setup_gemini()
        
    def _setup_gemini(self):
        """Initialize Gemini API"""
        try:
            if not GEMINI_API_KEY:
                raise CustomException("GEMINI_API_KEY not found. Please set it in your environment variables.")
            
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel(GEMINI_MODEL)
            self.logger.info("Gemini API initialized successfully for evaluation")
        except Exception as e:
            self.logger.error(f"Error initializing Gemini API: {str(e)}")
            raise CustomException(f"Failed to initialize Gemini API: {str(e)}")
    
    def evaluate_answer(self, question: str, answer: str, question_type: str) -> Dict:
        """Evaluate a single answer and return detailed feedback"""
        try:
            self.logger.info(f"Evaluating {question_type} answer")
            
            # Create evaluation prompt
            prompt = EVALUATION_PROMPT.format(
                question=question,
                answer=answer,
                question_type=question_type
            )
            
            # Generate evaluation using Gemini
            response = self.model.generate_content(prompt)
            evaluation_text = response.text.strip()
            
            # Parse evaluation
            evaluation = self._parse_evaluation(evaluation_text)
            
            self.logger.info(f"Successfully evaluated answer with score: {evaluation.get('score', 'N/A')}")
            return evaluation
            
        except Exception as e:
            self.logger.error(f"Error evaluating answer: {str(e)}")
            raise CustomException(f"Failed to evaluate answer: {str(e)}")
    
    def evaluate_interview_round(self, questions_answers: List[Dict]) -> Dict:
        """Evaluate a complete interview round"""
        try:
            self.logger.info(f"Evaluating interview round with {len(questions_answers)} questions")
            
            evaluations = []
            total_score = 0
            
            for qa in questions_answers:
                evaluation = self.evaluate_answer(
                    qa['question'],
                    qa['answer'],
                    qa.get('type', 'Unknown')
                )
                evaluations.append(evaluation)
                total_score += evaluation.get('score', 0)
            
            # Calculate average score
            average_score = total_score / len(questions_answers) if questions_answers else 0
            
            # Generate overall feedback
            overall_feedback = self._generate_overall_feedback(evaluations, average_score)
            
            round_evaluation = {
                'evaluations': evaluations,
                'average_score': round(average_score, 2),
                'total_questions': len(questions_answers),
                'overall_feedback': overall_feedback,
                'performance_level': self._get_performance_level(average_score)
            }
            
            self.logger.info(f"Interview round evaluation completed. Average score: {average_score}")
            return round_evaluation
            
        except Exception as e:
            self.logger.error(f"Error evaluating interview round: {str(e)}")
            raise CustomException(f"Failed to evaluate interview round: {str(e)}")
    
    def _parse_evaluation(self, evaluation_text: str) -> Dict:
        """Parse evaluation text into structured format"""
        evaluation = {
            'score': 0,
            'strengths': [],
            'areas_for_improvement': [],
            'feedback': '',
            'overall_assessment': ''
        }
        
        lines = evaluation_text.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Extract score
            if line.startswith('Score:'):
                score_match = re.search(r'(\d+(?:\.\d+)?)/10', line)
                if score_match:
                    evaluation['score'] = float(score_match.group(1))
            
            # Extract strengths
            elif line.startswith('Strengths:'):
                current_section = 'strengths'
                content = line.replace('Strengths:', '').strip()
                if content:
                    evaluation['strengths'] = [item.strip() for item in content.split(',')]
            
            # Extract areas for improvement
            elif line.startswith('Areas for Improvement:'):
                current_section = 'areas_for_improvement'
                content = line.replace('Areas for Improvement:', '').strip()
                if content:
                    evaluation['areas_for_improvement'] = [item.strip() for item in content.split(',')]
            
            # Extract feedback
            elif line.startswith('Feedback:'):
                current_section = 'feedback'
                evaluation['feedback'] = line.replace('Feedback:', '').strip()
            
            # Extract overall assessment
            elif line.startswith('Overall Assessment:'):
                current_section = 'overall_assessment'
                evaluation['overall_assessment'] = line.replace('Overall Assessment:', '').strip()
            
            # Continue adding to current section
            elif current_section and line:
                if current_section == 'strengths':
                    evaluation['strengths'].extend([item.strip() for item in line.split(',')])
                elif current_section == 'areas_for_improvement':
                    evaluation['areas_for_improvement'].extend([item.strip() for item in line.split(',')])
                elif current_section == 'feedback':
                    evaluation['feedback'] += ' ' + line
                elif current_section == 'overall_assessment':
                    evaluation['overall_assessment'] += ' ' + line
        
        return evaluation
    
    def _generate_overall_feedback(self, evaluations: List[Dict], average_score: float) -> str:
        """Generate overall feedback for the interview round"""
        if not evaluations:
            return "No evaluations available."
        
        # Analyze common themes
        all_strengths = []
        all_improvements = []
        
        for eval_data in evaluations:
            all_strengths.extend(eval_data.get('strengths', []))
            all_improvements.extend(eval_data.get('areas_for_improvement', []))
        
        # Count most common strengths and improvements
        from collections import Counter
        common_strengths = Counter(all_strengths).most_common(3)
        common_improvements = Counter(all_improvements).most_common(3)
        
        feedback_parts = []
        
        if common_strengths:
            feedback_parts.append(f"Key strengths: {', '.join([s[0] for s in common_strengths])}")
        
        if common_improvements:
            feedback_parts.append(f"Areas to focus on: {', '.join([i[0] for i in common_improvements])}")
        
        feedback_parts.append(f"Overall performance: {self._get_performance_level(average_score)}")
        
        return ". ".join(feedback_parts) + "."
    
    def _get_performance_level(self, score: float) -> str:
        """Determine performance level based on score"""
        if score >= 8.5:
            return "Excellent"
        elif score >= 7.0:
            return "Good"
        elif score >= 5.5:
            return "Average"
        elif score >= 4.0:
            return "Below Average"
        else:
            return "Needs Improvement"