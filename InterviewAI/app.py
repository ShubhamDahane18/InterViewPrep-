import streamlit as st
import os
import tempfile
from datetime import datetime
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Import our modules
from modules.resume_parser import ResumeParser
from modules.question_generator import QuestionGenerator
from modules.evaluator import AnswerEvaluator
from modules.report_generator import ReportGenerator
from config.settings import GEMINI_API_KEY, ALLOWED_EXTENSIONS, MAX_FILE_SIZE

# Optional Whisper import
try:
    from modules.whisper_handler import get_whisper_handler, AudioRecorder, WHISPER_AVAILABLE
except ImportError:
    WHISPER_AVAILABLE = False
    get_whisper_handler = None
    AudioRecorder = None

# Page configuration
st.set_page_config(
    page_title="Interview AI - AI-Powered Interview Practice",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        margin-bottom: 2rem;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .section-header {
        font-size: 1.5rem;
        font-weight: bold;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: #2c3e50;
    }
    .metric-card {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #667eea;
    }
    .success-message {
        background-color: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #c3e6cb;
    }
    .error-message {
        background-color: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #f5c6cb;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'resume_data' not in st.session_state:
    st.session_state.resume_data = None
if 'hr_questions' not in st.session_state:
    st.session_state.hr_questions = []
if 'technical_questions' not in st.session_state:
    st.session_state.technical_questions = []
if 'hr_answers' not in st.session_state:
    st.session_state.hr_answers = []
if 'technical_answers' not in st.session_state:
    st.session_state.technical_answers = []
if 'hr_evaluation' not in st.session_state:
    st.session_state.hr_evaluation = None
if 'technical_evaluation' not in st.session_state:
    st.session_state.technical_evaluation = None
if 'interview_report' not in st.session_state:
    st.session_state.interview_report = None

def main():
    # Header
    st.markdown('<h1 class="main-header">🎯 Interview AI</h1>', unsafe_allow_html=True)
    st.markdown('<p style="text-align: center; font-size: 1.2rem; color: #666;">AI-Powered Interview Practice with Resume Analysis</p>', unsafe_allow_html=True)
    
    # Check API key
    if not GEMINI_API_KEY:
        st.error("⚠️ Please set your GEMINI_API_KEY in the environment variables or .env file")
        st.stop()
    
    # Sidebar
    with st.sidebar:
        st.header("📋 Navigation")
        page = st.selectbox(
            "Choose a page:",
            ["🏠 Home", "📄 Resume Upload", "❓ HR Interview", "💻 Technical Interview", "📊 Results & Report"]
        )
        
        st.markdown("---")
        st.header("🎤 Voice Settings")
        
        if WHISPER_AVAILABLE:
            # Whisper model selection
            whisper_model = st.selectbox(
                "Whisper Model:",
                ["tiny", "base", "small", "medium", "large"],
                index=1,  # Default to "base"
                help="Larger models are more accurate but slower"
            )
            
            if st.button("🔄 Reload Whisper Model"):
                try:
                    with st.spinner("Loading Whisper model..."):
                        whisper_handler = get_whisper_handler(whisper_model)
                        if whisper_handler:
                            st.success(f"✅ Loaded {whisper_model} model")
                        else:
                            st.error("❌ Failed to load Whisper model")
                except Exception as e:
                    st.error(f"❌ Error loading model: {str(e)}")
        else:
            st.warning("⚠️ Whisper not available. Install with: `pip install openai-whisper soundfile`")
            if st.button("📦 Install Whisper"):
                st.info("Run this command in your terminal: `pip install openai-whisper soundfile`")
        
        st.markdown("---")
        st.header("ℹ️ About")
        st.markdown("""
        **Interview AI** helps you practice interviews with AI-generated questions based on your resume.
        
        **Features:**
        - Resume parsing and analysis
        - HR and Technical question generation
        - AI-powered answer evaluation
        - **🎤 Voice input with Whisper**
        - Detailed performance reports
        - Interactive visualizations
        """)
    
    # Main content based on selected page
    if page == "🏠 Home":
        show_home_page()
    elif page == "📄 Resume Upload":
        show_resume_upload_page()
    elif page == "❓ HR Interview":
        show_hr_interview_page()
    elif page == "💻 Technical Interview":
        show_technical_interview_page()
    elif page == "📊 Results & Report":
        show_results_page()

def show_home_page():
    st.markdown('<h2 class="section-header">Welcome to Interview AI! 🚀</h2>', unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        ### How it works:
        1. **Upload your resume** - PDF or DOCX format
        2. **Choose interview type** - HR or Technical rounds
        3. **Answer questions** - AI-generated based on your resume
        4. **Get evaluated** - Detailed feedback and scoring
        5. **View reports** - Comprehensive performance analysis
        """)
    
    with col2:
        st.markdown("""
        ### Features:
        - 🎯 **Personalized Questions** - Based on your resume content
        - 🤖 **AI Evaluation** - Powered by Google Gemini
        - 🎤 **Voice Input** - Speak your answers with Whisper transcription {'✅' if WHISPER_AVAILABLE else '⚠️ (Install Whisper)'}
        - 📊 **Detailed Reports** - Performance insights and recommendations
        - 📈 **Visual Analytics** - Charts and progress tracking
        - 💾 **Export Options** - PDF and JSON reports
        """)
    
    # Quick stats if resume is uploaded
    if st.session_state.resume_data:
        st.markdown('<h3 class="section-header">Your Resume Analysis</h3>', unsafe_allow_html=True)
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Skills Found", len(st.session_state.resume_data.get('skills', [])))
        
        with col2:
            sections = st.session_state.resume_data.get('sections', {})
            st.metric("Resume Sections", len(sections))
        
        with col3:
            contact_info = st.session_state.resume_data.get('contact_info', {})
            st.metric("Contact Info", "Complete" if contact_info.get('email') else "Incomplete")
        
        with col4:
            st.metric("Status", "Ready for Interview" if st.session_state.resume_data else "Upload Resume")

def show_resume_upload_page():
    st.markdown('<h2 class="section-header">📄 Resume Upload & Analysis</h2>', unsafe_allow_html=True)
    
    # File upload
    uploaded_file = st.file_uploader(
        "Choose your resume file",
        type=['pdf', 'docx', 'doc'],
        help="Upload a PDF or DOCX file of your resume"
    )
    
    if uploaded_file is not None:
        # Validate file size
        if uploaded_file.size > MAX_FILE_SIZE:
            st.error(f"File size too large. Please upload a file smaller than {MAX_FILE_SIZE / (1024*1024):.1f}MB")
            return
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(uploaded_file.name)[1]) as tmp_file:
            tmp_file.write(uploaded_file.getvalue())
            tmp_file_path = tmp_file.name
        
        try:
            # Parse resume
            with st.spinner("Analyzing your resume..."):
                parser = ResumeParser()
                resume_data = parser.parse_resume(tmp_file_path)
                st.session_state.resume_data = resume_data
            
            # Clean up temp file
            os.unlink(tmp_file_path)
            
            # Display results
            st.success("✅ Resume analyzed successfully!")
            
            # Show extracted information
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("### 📋 Extracted Information")
                
                # Contact info
                contact_info = resume_data.get('contact_info', {})
                if contact_info:
                    st.markdown("**Contact Information:**")
                    for key, value in contact_info.items():
                        st.write(f"- {key.title()}: {value}")
                
                # Skills
                skills = resume_data.get('skills', [])
                if skills:
                    st.markdown("**Skills Found:**")
                    skill_chips = " ".join([f"`{skill}`" for skill in skills[:10]])
                    st.markdown(skill_chips)
                    if len(skills) > 10:
                        st.write(f"... and {len(skills) - 10} more skills")
            
            with col2:
                st.markdown("### 📊 Resume Sections")
                
                sections = resume_data.get('sections', {})
                if sections:
                    for section_name, content in sections.items():
                        with st.expander(f"📁 {section_name.title()}"):
                            st.text(content[:200] + "..." if len(content) > 200 else content)
                else:
                    st.info("No structured sections found. Raw text will be used for question generation.")
            
            # Navigation hint
            st.info("🎯 Great! Your resume is ready. Navigate to the HR or Technical Interview pages to start practicing!")
            
        except Exception as e:
            st.error(f"❌ Error analyzing resume: {str(e)}")
            # Clean up temp file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)

def show_hr_interview_page():
    st.markdown('<h2 class="section-header">❓ HR Interview Round</h2>', unsafe_allow_html=True)
    
    if not st.session_state.resume_data:
        st.warning("⚠️ Please upload your resume first before starting the HR interview.")
        return
    
    # Generate questions if not already generated
    if not st.session_state.hr_questions:
        if st.button("🎯 Generate HR Questions", type="primary"):
            with st.spinner("Generating HR questions based on your resume..."):
                try:
                    generator = QuestionGenerator()
                    st.session_state.hr_questions = generator.generate_hr_questions(st.session_state.resume_data)
                    st.success("✅ HR questions generated successfully!")
                except Exception as e:
                    st.error(f"❌ Error generating questions: {str(e)}")
                    return
    
    # Display questions and collect answers
    if st.session_state.hr_questions:
        st.markdown("### Answer the following HR questions:")
        
        # Initialize answers if not exists
        if len(st.session_state.hr_answers) != len(st.session_state.hr_questions):
            st.session_state.hr_answers = [""] * len(st.session_state.hr_questions)
        
        # Display questions
        for i, question_data in enumerate(st.session_state.hr_questions):
            with st.container():
                st.markdown(f"**Question {i+1}:** {question_data['question']}")
                st.markdown(f"*Category: {question_data['category']} | Difficulty: {question_data['difficulty']}*")
                
                # Voice recording option
                col1, col2 = st.columns([3, 1])
                
                with col1:
                    answer = st.text_area(
                        f"Your answer:",
                        value=st.session_state.hr_answers[i],
                        key=f"hr_answer_{i}",
                        height=100,
                        placeholder="Type your answer here or use voice recording below..."
                    )
                    st.session_state.hr_answers[i] = answer
                
                with col2:
                    if WHISPER_AVAILABLE:
                        st.markdown("**🎤 Voice Input**")
                        if st.button(f"Record Answer {i+1}", key=f"record_hr_{i}"):
                            st.session_state[f"recording_hr_{i}"] = True
                        
                        if st.button(f"Stop Recording {i+1}", key=f"stop_hr_{i}"):
                            st.session_state[f"recording_hr_{i}"] = False
                    else:
                        st.markdown("**🎤 Voice Input**")
                        st.caption("Install Whisper for voice input")
                
                # Voice recording interface
                if WHISPER_AVAILABLE and st.session_state.get(f"recording_hr_{i}", False):
                    st.markdown("🎙️ **Recording... Speak your answer**")
                    
                    # Audio file uploader for voice input
                    audio_file = st.file_uploader(
                        f"Upload your voice answer for Question {i+1}",
                        type=['wav', 'mp3', 'm4a', 'ogg'],
                        key=f"audio_hr_{i}",
                        help="Record your answer and upload the audio file"
                    )
                    
                    if audio_file is not None:
                        if st.button(f"Transcribe Audio {i+1}", key=f"transcribe_hr_{i}"):
                            try:
                                with st.spinner("Transcribing your voice..."):
                                    whisper_handler = get_whisper_handler()
                                    if whisper_handler:
                                        transcribed_text = whisper_handler.transcribe_audio_bytes(audio_file.read())
                                        
                                        # Update the answer with transcribed text
                                        st.session_state.hr_answers[i] = transcribed_text
                                        st.success("✅ Voice transcribed successfully!")
                                        st.rerun()
                                    else:
                                        st.error("❌ Whisper handler not available")
                                    
                            except Exception as e:
                                st.error(f"❌ Error transcribing audio: {str(e)}")
                
                st.markdown("---")
        
        # Submit button
        if st.button("📊 Evaluate HR Interview", type="primary"):
            # Check if all questions are answered
            if any(answer.strip() == "" for answer in st.session_state.hr_answers):
                st.warning("⚠️ Please answer all questions before submitting.")
                return
            
            with st.spinner("Evaluating your HR interview answers..."):
                try:
                    # Prepare questions and answers for evaluation
                    qa_pairs = []
                    for i, question_data in enumerate(st.session_state.hr_questions):
                        qa_pairs.append({
                            'question': question_data['question'],
                            'answer': st.session_state.hr_answers[i],
                            'type': 'HR'
                        })
                    
                    # Evaluate answers
                    evaluator = AnswerEvaluator()
                    st.session_state.hr_evaluation = evaluator.evaluate_interview_round(qa_pairs)
                    
                    st.success("✅ HR interview evaluation completed!")
                    st.balloons()
                    
                except Exception as e:
                    st.error(f"❌ Error evaluating answers: {str(e)}")

def show_technical_interview_page():
    st.markdown('<h2 class="section-header">💻 Technical Interview Round</h2>', unsafe_allow_html=True)
    
    if not st.session_state.resume_data:
        st.warning("⚠️ Please upload your resume first before starting the technical interview.")
        return
    
    # Generate questions if not already generated
    if not st.session_state.technical_questions:
        if st.button("🎯 Generate Technical Questions", type="primary"):
            with st.spinner("Generating technical questions based on your resume..."):
                try:
                    generator = QuestionGenerator()
                    st.session_state.technical_questions = generator.generate_technical_questions(st.session_state.resume_data)
                    st.success("✅ Technical questions generated successfully!")
                except Exception as e:
                    st.error(f"❌ Error generating questions: {str(e)}")
                    return
    
    # Display questions and collect answers
    if st.session_state.technical_questions:
        st.markdown("### Answer the following technical questions:")
        
        # Initialize answers if not exists
        if len(st.session_state.technical_answers) != len(st.session_state.technical_questions):
            st.session_state.technical_answers = [""] * len(st.session_state.technical_questions)
        
        # Display questions
        for i, question_data in enumerate(st.session_state.technical_questions):
            with st.container():
                st.markdown(f"**Question {i+1}:** {question_data['question']}")
                st.markdown(f"*Category: {question_data['category']} | Difficulty: {question_data['difficulty']}*")
                
                # Voice recording option
                col1, col2 = st.columns([3, 1])
                
                with col1:
                    answer = st.text_area(
                        f"Your answer:",
                        value=st.session_state.technical_answers[i],
                        key=f"tech_answer_{i}",
                        height=120,
                        placeholder="Type your technical answer here or use voice recording below..."
                    )
                    st.session_state.technical_answers[i] = answer
                
                with col2:
                    if WHISPER_AVAILABLE:
                        st.markdown("**🎤 Voice Input**")
                        if st.button(f"Record Answer {i+1}", key=f"record_tech_{i}"):
                            st.session_state[f"recording_tech_{i}"] = True
                        
                        if st.button(f"Stop Recording {i+1}", key=f"stop_tech_{i}"):
                            st.session_state[f"recording_tech_{i}"] = False
                    else:
                        st.markdown("**🎤 Voice Input**")
                        st.caption("Install Whisper for voice input")
                
                # Voice recording interface
                if WHISPER_AVAILABLE and st.session_state.get(f"recording_tech_{i}", False):
                    st.markdown("🎙️ **Recording... Speak your answer**")
                    
                    # Audio file uploader for voice input
                    audio_file = st.file_uploader(
                        f"Upload your voice answer for Question {i+1}",
                        type=['wav', 'mp3', 'm4a', 'ogg'],
                        key=f"audio_tech_{i}",
                        help="Record your answer and upload the audio file"
                    )
                    
                    if audio_file is not None:
                        if st.button(f"Transcribe Audio {i+1}", key=f"transcribe_tech_{i}"):
                            try:
                                with st.spinner("Transcribing your voice..."):
                                    whisper_handler = get_whisper_handler()
                                    if whisper_handler:
                                        transcribed_text = whisper_handler.transcribe_audio_bytes(audio_file.read())
                                        
                                        # Update the answer with transcribed text
                                        st.session_state.technical_answers[i] = transcribed_text
                                        st.success("✅ Voice transcribed successfully!")
                                        st.rerun()
                                    else:
                                        st.error("❌ Whisper handler not available")
                                    
                            except Exception as e:
                                st.error(f"❌ Error transcribing audio: {str(e)}")
                
                st.markdown("---")
        
        # Submit button
        if st.button("📊 Evaluate Technical Interview", type="primary"):
            # Check if all questions are answered
            if any(answer.strip() == "" for answer in st.session_state.technical_answers):
                st.warning("⚠️ Please answer all questions before submitting.")
                return
            
            with st.spinner("Evaluating your technical interview answers..."):
                try:
                    # Prepare questions and answers for evaluation
                    qa_pairs = []
                    for i, question_data in enumerate(st.session_state.technical_questions):
                        qa_pairs.append({
                            'question': question_data['question'],
                            'answer': st.session_state.technical_answers[i],
                            'type': 'Technical'
                        })
                    
                    # Evaluate answers
                    evaluator = AnswerEvaluator()
                    st.session_state.technical_evaluation = evaluator.evaluate_interview_round(qa_pairs)
                    
                    st.success("✅ Technical interview evaluation completed!")
                    st.balloons()
                    
                except Exception as e:
                    st.error(f"❌ Error evaluating answers: {str(e)}")

def show_results_page():
    st.markdown('<h2 class="section-header">📊 Results & Performance Report</h2>', unsafe_allow_html=True)
    
    # Check if any evaluations are available
    if not st.session_state.hr_evaluation and not st.session_state.technical_evaluation:
        st.info("📝 No interview evaluations available yet. Complete some interview rounds to see your results!")
        return
    
    # Generate report if not exists
    if not st.session_state.interview_report:
        if st.button("📋 Generate Complete Report", type="primary"):
            with st.spinner("Generating comprehensive interview report..."):
                try:
                    report_generator = ReportGenerator()
                    st.session_state.interview_report = report_generator.generate_interview_report(
                        st.session_state.resume_data,
                        st.session_state.hr_evaluation,
                        st.session_state.technical_evaluation
                    )
                    st.success("✅ Report generated successfully!")
                except Exception as e:
                    st.error(f"❌ Error generating report: {str(e)}")
                    return
    
    # Display results
    if st.session_state.interview_report:
        report = st.session_state.interview_report
        
        # Overall Performance
        st.markdown("### 🎯 Overall Performance")
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            overall_score = report['overall_assessment']['overall_score']
            st.metric("Overall Score", f"{overall_score:.1f}/10")
        
        with col2:
            recommendation = report['overall_assessment']['recommendation']
            st.metric("Recommendation", recommendation)
        
        with col3:
            total_questions = report['interview_summary']['total_questions']
            st.metric("Total Questions", total_questions)
        
        with col4:
            rounds_completed = len(report['interview_summary']['rounds_completed'])
            st.metric("Rounds Completed", rounds_completed)
        
        # Individual Round Performance
        st.markdown("### 📈 Round-wise Performance")
        
        if st.session_state.hr_evaluation:
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("#### ❓ HR Round")
                hr_eval = st.session_state.hr_evaluation
                
                st.metric("Average Score", f"{hr_eval['average_score']:.1f}/10")
                st.metric("Performance Level", hr_eval['performance_level'])
                st.metric("Questions Answered", hr_eval['total_questions'])
                
                # HR Round Chart
                if 'charts' in report and 'score_comparison' in report['charts']:
                    st.plotly_chart(go.Figure(data=[go.Bar(x=['HR Round'], y=[hr_eval['average_score']], marker_color='#FF6B6B')]), use_container_width=True)
        
        if st.session_state.technical_evaluation:
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("#### 💻 Technical Round")
                tech_eval = st.session_state.technical_evaluation
                
                st.metric("Average Score", f"{tech_eval['average_score']:.1f}/10")
                st.metric("Performance Level", tech_eval['performance_level'])
                st.metric("Questions Answered", tech_eval['total_questions'])
                
                # Technical Round Chart
                if 'charts' in report and 'score_comparison' in report['charts']:
                    st.plotly_chart(go.Figure(data=[go.Bar(x=['Technical Round'], y=[tech_eval['average_score']], marker_color='#4ECDC4')]), use_container_width=True)
        
        # Detailed Evaluations
        st.markdown("### 📝 Detailed Evaluations")
        
        # HR Round Details
        if st.session_state.hr_evaluation:
            with st.expander("❓ HR Round Details"):
                hr_eval = st.session_state.hr_evaluation
                
                for i, evaluation in enumerate(hr_eval['evaluations']):
                    st.markdown(f"**Question {i+1}:** {st.session_state.hr_questions[i]['question']}")
                    st.markdown(f"**Score:** {evaluation['score']}/10")
                    st.markdown(f"**Strengths:** {', '.join(evaluation['strengths'])}")
                    st.markdown(f"**Areas for Improvement:** {', '.join(evaluation['areas_for_improvement'])}")
                    st.markdown(f"**Feedback:** {evaluation['feedback']}")
                    st.markdown("---")
        
        # Technical Round Details
        if st.session_state.technical_evaluation:
            with st.expander("💻 Technical Round Details"):
                tech_eval = st.session_state.technical_evaluation
                
                for i, evaluation in enumerate(tech_eval['evaluations']):
                    st.markdown(f"**Question {i+1}:** {st.session_state.technical_questions[i]['question']}")
                    st.markdown(f"**Score:** {evaluation['score']}/10")
                    st.markdown(f"**Strengths:** {', '.join(evaluation['strengths'])}")
                    st.markdown(f"**Areas for Improvement:** {', '.join(evaluation['areas_for_improvement'])}")
                    st.markdown(f"**Feedback:** {evaluation['feedback']}")
                    st.markdown("---")
        
        # Recommendations
        st.markdown("### 💡 Recommendations")
        
        recommendations = report['recommendations']
        for i, rec in enumerate(recommendations, 1):
            st.markdown(f"{i}. {rec}")
        
        # Download options
        st.markdown("### 📥 Download Report")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if os.path.exists(report['pdf_path']):
                with open(report['pdf_path'], 'rb') as f:
                    st.download_button(
                        label="📄 Download PDF Report",
                        data=f.read(),
                        file_name=f"interview_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                        mime="application/pdf"
                    )
        
        with col2:
            if os.path.exists(report['json_path']):
                with open(report['json_path'], 'rb') as f:
                    st.download_button(
                        label="📊 Download JSON Report",
                        data=f.read(),
                        file_name=f"interview_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                        mime="application/json"
                    )

if __name__ == "__main__":
    main()
