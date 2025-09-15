# Interview AI - Voice-Driven Interview Practice

A modern, AI-powered interview practice application built with React and Node.js that provides personalized interview questions based on your resume and conducts voice-driven interviews with real-time evaluation.

## 🚀 Features

- **🎤 Voice-Driven Interviews**: Natural conversation flow using advanced speech recognition and synthesis
- **📄 Smart Resume Analysis**: AI-powered resume parsing extracts skills, experience, and generates personalized questions
- **❓ HR & Technical Rounds**: Separate interview tracks for behavioral and technical assessments
- **🤖 Real-time Evaluation**: Instant feedback on answers with detailed scoring and improvement suggestions
- **📊 Comprehensive Reports**: Detailed performance analytics with visualizations and actionable recommendations
- **🎨 Modern UI**: Beautiful, responsive interface with smooth animations and intuitive design

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Styled Components** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Zustand** for state management
- **Recharts** for data visualization
- **Web Speech API** for voice functionality

### Backend
- **Node.js** with Express
- **OpenAI API** for question generation and evaluation
- **Whisper API** for speech-to-text
- **TTS API** for text-to-speech
- **Multer** for file uploads
- **PDF-Parse** and **Mammoth** for resume parsing

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd interview-ai-react
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit the `.env` file and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
NODE_ENV=development
```

### 4. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 5. Run the Application

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Frontend on `http://localhost:3000`
- Backend API on `http://localhost:5000`

## 📱 Usage

### 1. Upload Resume
- Navigate to the Upload page
- Upload your PDF or DOCX resume
- AI will analyze and extract skills, experience, and contact information

### 2. Choose Interview Type
- **HR Interview**: Behavioral questions about teamwork, leadership, problem-solving
- **Technical Interview**: Questions based on your technical skills and experience

### 3. Voice Interview
- Click "Start Recording" to begin answering questions
- Speak naturally - the AI will transcribe your responses
- Listen to AI-generated follow-up questions
- Complete all questions in the round

### 4. View Results
- Get detailed performance analysis
- Review scores and feedback for each question
- See strengths and areas for improvement
- Download comprehensive reports

## 🎯 Key Features Explained

### Voice-Driven Interaction
- **Speech-to-Text**: Uses OpenAI Whisper for accurate transcription
- **Text-to-Speech**: AI responses are spoken back to you
- **Real-time Processing**: Immediate feedback and follow-up questions

### Smart Question Generation
- **Resume-Based**: Questions tailored to your specific background
- **Difficulty Scaling**: Questions adapt to your experience level
- **Category Coverage**: Comprehensive coverage of relevant topics

### Advanced Evaluation
- **Multi-Criteria Scoring**: Evaluates relevance, depth, examples, and communication
- **Detailed Feedback**: Specific strengths and improvement areas
- **Performance Analytics**: Visual charts and progress tracking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `PORT` | Backend server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MAX_FILE_SIZE` | Max upload size in bytes | 10485760 (10MB) |

### Customization

- **Question Count**: Modify `count` parameter in question generation
- **Voice Settings**: Adjust speech rate, pitch, and voice selection
- **Evaluation Criteria**: Customize scoring rubrics in the evaluator service

## 📁 Project Structure

```
interview-ai-react/
├── public/                 # Static assets
├── src/                   # Frontend source code
│   ├── components/        # Reusable UI components
│   ├── pages/            # Main application pages
│   ├── services/         # API and voice services
│   ├── store/            # State management
│   └── App.tsx           # Main application component
├── server/               # Backend source code
│   ├── services/         # Business logic services
│   └── index.js          # Express server setup
├── package.json          # Frontend dependencies
└── README.md            # This file
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
npm run build
```

2. Deploy the `build` folder to your hosting service

3. Set environment variables:
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Backend Deployment (Railway/Heroku)

1. Set environment variables in your hosting platform
2. Deploy the `server` folder
3. Ensure file uploads directory is writable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- OpenAI for providing the GPT and Whisper APIs
- React and Node.js communities for excellent documentation
- Contributors and testers who helped improve the application

## 🔮 Future Enhancements

- [ ] Multi-language support
- [ ] Video interview simulation
- [ ] Integration with job boards
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Collaborative interview sessions

---

**Happy Interviewing! 🎯**