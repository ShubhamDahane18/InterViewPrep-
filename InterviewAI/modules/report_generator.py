# Builds performance report (PDF/JSON)
import json
import os
from datetime import datetime
from typing import Dict, List
import plotly.graph_objects as go
import plotly.express as px
from fpdf import FPDF
from config.settings import REPORTS_DIR
from utils.logger import get_logger
from utils.custom_exception import CustomException

logger = get_logger(__name__)

class ReportGenerator:
    def __init__(self):
        self.logger = logger
        self._ensure_reports_dir()
        
    def _ensure_reports_dir(self):
        """Ensure reports directory exists"""
        try:
            os.makedirs(REPORTS_DIR, exist_ok=True)
        except Exception as e:
            self.logger.error(f"Error creating reports directory: {str(e)}")
            raise CustomException(f"Failed to create reports directory: {str(e)}")
    
    def generate_interview_report(self, 
                                resume_data: Dict, 
                                hr_evaluation: Dict = None, 
                                technical_evaluation: Dict = None,
                                interview_session: Dict = None) -> Dict:
        """Generate comprehensive interview report"""
        try:
            self.logger.info("Generating interview report")
            
            report_data = {
                'candidate_info': self._extract_candidate_info(resume_data),
                'interview_summary': self._create_interview_summary(hr_evaluation, technical_evaluation),
                'detailed_evaluations': {
                    'hr_round': hr_evaluation,
                    'technical_round': technical_evaluation
                },
                'overall_assessment': self._create_overall_assessment(hr_evaluation, technical_evaluation),
                'recommendations': self._generate_recommendations(hr_evaluation, technical_evaluation),
                'generated_at': datetime.now().isoformat(),
                'session_info': interview_session
            }
            
            # Generate visualizations
            report_data['charts'] = self._generate_charts(hr_evaluation, technical_evaluation)
            
            # Save JSON report
            json_path = self._save_json_report(report_data)
            report_data['json_path'] = json_path
            
            # Generate PDF report
            pdf_path = self._generate_pdf_report(report_data)
            report_data['pdf_path'] = pdf_path
            
            self.logger.info(f"Interview report generated successfully. JSON: {json_path}, PDF: {pdf_path}")
            return report_data
            
        except Exception as e:
            self.logger.error(f"Error generating interview report: {str(e)}")
            raise CustomException(f"Failed to generate interview report: {str(e)}")
    
    def _extract_candidate_info(self, resume_data: Dict) -> Dict:
        """Extract candidate information from resume data"""
        return {
            'name': resume_data.get('contact_info', {}).get('name', 'Unknown'),
            'email': resume_data.get('contact_info', {}).get('email', 'Not provided'),
            'phone': resume_data.get('contact_info', {}).get('phone', 'Not provided'),
            'skills': resume_data.get('skills', []),
            'experience_sections': resume_data.get('sections', {}).get('experience', ''),
            'education_sections': resume_data.get('sections', {}).get('education', '')
        }
    
    def _create_interview_summary(self, hr_evaluation: Dict, technical_evaluation: Dict) -> Dict:
        """Create interview summary"""
        summary = {
            'total_questions': 0,
            'average_scores': {},
            'performance_levels': {},
            'rounds_completed': []
        }
        
        if hr_evaluation:
            summary['total_questions'] += hr_evaluation.get('total_questions', 0)
            summary['average_scores']['hr_round'] = hr_evaluation.get('average_score', 0)
            summary['performance_levels']['hr_round'] = hr_evaluation.get('performance_level', 'Unknown')
            summary['rounds_completed'].append('HR Round')
        
        if technical_evaluation:
            summary['total_questions'] += technical_evaluation.get('total_questions', 0)
            summary['average_scores']['technical_round'] = technical_evaluation.get('average_score', 0)
            summary['performance_levels']['technical_round'] = technical_evaluation.get('performance_level', 'Unknown')
            summary['rounds_completed'].append('Technical Round')
        
        # Calculate overall average
        if summary['average_scores']:
            summary['overall_average'] = sum(summary['average_scores'].values()) / len(summary['average_scores'])
        else:
            summary['overall_average'] = 0
        
        return summary
    
    def _create_overall_assessment(self, hr_evaluation: Dict, technical_evaluation: Dict) -> Dict:
        """Create overall assessment"""
        assessment = {
            'overall_score': 0,
            'strengths': [],
            'areas_for_improvement': [],
            'recommendation': 'Consider for next round'
        }
        
        # Calculate overall score
        scores = []
        if hr_evaluation and hr_evaluation.get('average_score'):
            scores.append(hr_evaluation['average_score'])
        if technical_evaluation and technical_evaluation.get('average_score'):
            scores.append(technical_evaluation['average_score'])
        
        if scores:
            assessment['overall_score'] = sum(scores) / len(scores)
        
        # Determine recommendation based on score
        if assessment['overall_score'] >= 8.0:
            assessment['recommendation'] = 'Strong candidate - Highly recommended'
        elif assessment['overall_score'] >= 6.5:
            assessment['recommendation'] = 'Good candidate - Recommended'
        elif assessment['overall_score'] >= 5.0:
            assessment['recommendation'] = 'Average candidate - Consider for specific roles'
        else:
            assessment['recommendation'] = 'Needs improvement - Not recommended at this time'
        
        return assessment
    
    def _generate_recommendations(self, hr_evaluation: Dict, technical_evaluation: Dict) -> List[str]:
        """Generate recommendations based on evaluations"""
        recommendations = []
        
        if hr_evaluation:
            hr_score = hr_evaluation.get('average_score', 0)
            if hr_score < 6.0:
                recommendations.append("Focus on improving communication and interpersonal skills")
                recommendations.append("Practice behavioral interview questions")
        
        if technical_evaluation:
            tech_score = technical_evaluation.get('average_score', 0)
            if tech_score < 6.0:
                recommendations.append("Strengthen technical knowledge in core areas")
                recommendations.append("Practice coding problems and system design questions")
        
        if not recommendations:
            recommendations.append("Continue building on current strengths")
            recommendations.append("Consider advanced training in specialized areas")
        
        return recommendations
    
    def _generate_charts(self, hr_evaluation: Dict, technical_evaluation: Dict) -> Dict:
        """Generate visualization charts"""
        charts = {}
        
        # Score comparison chart
        if hr_evaluation or technical_evaluation:
            rounds = []
            scores = []
            
            if hr_evaluation:
                rounds.append('HR Round')
                scores.append(hr_evaluation.get('average_score', 0))
            
            if technical_evaluation:
                rounds.append('Technical Round')
                scores.append(technical_evaluation.get('average_score', 0))
            
            fig = go.Figure(data=[
                go.Bar(x=rounds, y=scores, marker_color=['#FF6B6B', '#4ECDC4'])
            ])
            fig.update_layout(
                title="Interview Round Scores",
                xaxis_title="Round",
                yaxis_title="Average Score",
                yaxis=dict(range=[0, 10])
            )
            charts['score_comparison'] = fig.to_html(include_plotlyjs='cdn')
        
        return charts
    
    def _save_json_report(self, report_data: Dict) -> str:
        """Save report as JSON file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"interview_report_{timestamp}.json"
        filepath = os.path.join(REPORTS_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        return filepath
    
    def _generate_pdf_report(self, report_data: Dict) -> str:
        """Generate PDF report"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"interview_report_{timestamp}.pdf"
        filepath = os.path.join(REPORTS_DIR, filename)
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Title
        pdf.set_font("Arial", size=16, style="B")
        pdf.cell(200, 10, txt="Interview Performance Report", ln=1, align="C")
        pdf.ln(10)
        
        # Candidate Info
        pdf.set_font("Arial", size=14, style="B")
        pdf.cell(200, 10, txt="Candidate Information", ln=1)
        pdf.set_font("Arial", size=10)
        
        candidate_info = report_data['candidate_info']
        pdf.cell(200, 6, txt=f"Name: {candidate_info.get('name', 'N/A')}", ln=1)
        pdf.cell(200, 6, txt=f"Email: {candidate_info.get('email', 'N/A')}", ln=1)
        pdf.cell(200, 6, txt=f"Phone: {candidate_info.get('phone', 'N/A')}", ln=1)
        pdf.ln(5)
        
        # Interview Summary
        pdf.set_font("Arial", size=14, style="B")
        pdf.cell(200, 10, txt="Interview Summary", ln=1)
        pdf.set_font("Arial", size=10)
        
        summary = report_data['interview_summary']
        pdf.cell(200, 6, txt=f"Total Questions: {summary.get('total_questions', 0)}", ln=1)
        pdf.cell(200, 6, txt=f"Overall Average Score: {summary.get('overall_average', 0):.2f}", ln=1)
        pdf.ln(5)
        
        # Overall Assessment
        pdf.set_font("Arial", size=14, style="B")
        pdf.cell(200, 10, txt="Overall Assessment", ln=1)
        pdf.set_font("Arial", size=10)
        
        assessment = report_data['overall_assessment']
        pdf.cell(200, 6, txt=f"Overall Score: {assessment.get('overall_score', 0):.2f}/10", ln=1)
        pdf.cell(200, 6, txt=f"Recommendation: {assessment.get('recommendation', 'N/A')}", ln=1)
        pdf.ln(5)
        
        # Recommendations
        pdf.set_font("Arial", size=14, style="B")
        pdf.cell(200, 10, txt="Recommendations", ln=1)
        pdf.set_font("Arial", size=10)
        
        for i, rec in enumerate(report_data['recommendations'], 1):
            pdf.cell(200, 6, txt=f"{i}. {rec}", ln=1)
        
        pdf.output(filepath)
        return filepath