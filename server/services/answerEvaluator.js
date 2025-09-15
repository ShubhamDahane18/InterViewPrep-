const OpenAI = require('openai');

class AnswerEvaluator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async evaluateAnswers(questions, answers, type) {
    try {
      const evaluations = [];
      let totalScore = 0;

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const answer = answers.find(a => a.questionId === question.id);
        
        if (answer) {
          const evaluation = await this.evaluateAnswer(question, answer, type);
          evaluations.push(evaluation);
          totalScore += evaluation.score;
        }
      }

      const averageScore = evaluations.length > 0 ? totalScore / evaluations.length : 0;
      const overallFeedback = this.generateOverallFeedback(evaluations, averageScore);

      return {
        evaluations: evaluations,
        averageScore: Math.round(averageScore * 10) / 10,
        totalQuestions: questions.length,
        overallFeedback: overallFeedback,
        performanceLevel: this.getPerformanceLevel(averageScore)
      };
    } catch (error) {
      console.error('Answer evaluation error:', error);
      throw new Error(`Failed to evaluate answers: ${error.message}`);
    }
  }

  async evaluateAnswer(question, answer, type) {
    try {
      const prompt = this.createEvaluationPrompt(question, answer, type);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert interview evaluator. Provide detailed, constructive feedback on interview answers. Be fair, specific, and helpful in your assessment."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const evaluationText = response.choices[0].message.content;
      return this.parseEvaluation(evaluationText, question.id);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to evaluate answer: ${error.message}`);
    }
  }

  createEvaluationPrompt(question, answer, type) {
    return `Evaluate the following interview answer and provide a detailed assessment.

Question: ${question.question}
Answer: ${answer.answer}
Question Type: ${type}
Question Category: ${question.category}
Question Difficulty: ${question.difficulty}

Please provide a comprehensive evaluation in JSON format with the following structure:
{
  "score": 8.5,
  "strengths": ["Clear communication", "Relevant examples", "Good structure"],
  "areasForImprovement": ["Could provide more specific details", "Missing quantifiable results"],
  "feedback": "Overall, this is a strong answer that demonstrates good understanding of the topic. The candidate provides relevant examples and communicates clearly. However, they could strengthen their response by including more specific metrics and quantifiable results.",
  "overallAssessment": "Good answer with room for improvement in providing specific details and metrics."
}

Evaluation criteria:
- Relevance to the question
- Depth and detail of the response
- Use of specific examples
- Communication clarity
- Technical accuracy (for technical questions)
- Problem-solving approach
- Professional presentation

Score on a scale of 1-10 where:
- 9-10: Excellent (comprehensive, detailed, well-structured)
- 7-8: Good (solid answer with minor gaps)
- 5-6: Average (adequate but lacking depth)
- 3-4: Below Average (significant gaps or issues)
- 1-2: Poor (inadequate or incorrect response)`;
  }

  parseEvaluation(evaluationText, questionId) {
    try {
      // Try to parse as JSON first
      const evaluation = JSON.parse(evaluationText);
      
      return {
        questionId: questionId,
        score: Math.max(1, Math.min(10, evaluation.score || 5)),
        strengths: evaluation.strengths || [],
        areasForImprovement: evaluation.areasForImprovement || [],
        feedback: evaluation.feedback || 'No specific feedback provided.',
        overallAssessment: evaluation.overallAssessment || 'Assessment completed.'
      };
    } catch (error) {
      // Fallback: parse from text format
      return this.parseEvaluationFromText(evaluationText, questionId);
    }
  }

  parseEvaluationFromText(evaluationText, questionId) {
    const lines = evaluationText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let score = 5;
    const strengths = [];
    const areasForImprovement = [];
    let feedback = '';
    let overallAssessment = '';

    for (const line of lines) {
      if (line.toLowerCase().includes('score:')) {
        const scoreMatch = line.match(/(\d+(?:\.\d+)?)/);
        if (scoreMatch) {
          score = Math.max(1, Math.min(10, parseFloat(scoreMatch[1])));
        }
      } else if (line.toLowerCase().includes('strengths:')) {
        const content = line.replace(/strengths?:/i, '').trim();
        if (content) {
          strengths.push(...content.split(',').map(s => s.trim()).filter(s => s.length > 0));
        }
      } else if (line.toLowerCase().includes('areas for improvement:') || 
                 line.toLowerCase().includes('improvements:')) {
        const content = line.replace(/areas for improvement:|improvements?:/i, '').trim();
        if (content) {
          areasForImprovement.push(...content.split(',').map(s => s.trim()).filter(s => s.length > 0));
        }
      } else if (line.toLowerCase().includes('feedback:')) {
        feedback = line.replace(/feedback:/i, '').trim();
      } else if (line.toLowerCase().includes('overall assessment:')) {
        overallAssessment = line.replace(/overall assessment:/i, '').trim();
      }
    }

    return {
      questionId: questionId,
      score: score,
      strengths: strengths.length > 0 ? strengths : ['Answer provided'],
      areasForImprovement: areasForImprovement.length > 0 ? areasForImprovement : ['Could be more detailed'],
      feedback: feedback || 'Evaluation completed.',
      overallAssessment: overallAssessment || 'Assessment completed.'
    };
  }

  generateOverallFeedback(evaluations, averageScore) {
    if (evaluations.length === 0) {
      return "No evaluations available.";
    }

    // Analyze common themes
    const allStrengths = [];
    const allImprovements = [];

    evaluations.forEach(evaluation => {
      allStrengths.push(...evaluation.strengths);
      allImprovements.push(...evaluation.areasForImprovement);
    });

    // Count most common strengths and improvements
    const strengthCounts = {};
    const improvementCounts = {};

    allStrengths.forEach(strength => {
      strengthCounts[strength] = (strengthCounts[strength] || 0) + 1;
    });

    allImprovements.forEach(improvement => {
      improvementCounts[improvement] = (improvementCounts[improvement] || 0) + 1;
    });

    const commonStrengths = Object.entries(strengthCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([strength]) => strength);

    const commonImprovements = Object.entries(improvementCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([improvement]) => improvement);

    const feedbackParts = [];

    if (commonStrengths.length > 0) {
      feedbackParts.push(`Key strengths: ${commonStrengths.join(', ')}`);
    }

    if (commonImprovements.length > 0) {
      feedbackParts.push(`Areas to focus on: ${commonImprovements.join(', ')}`);
    }

    feedbackParts.push(`Overall performance: ${this.getPerformanceLevel(averageScore)}`);

    return feedbackParts.join('. ') + '.';
  }

  getPerformanceLevel(score) {
    if (score >= 8.5) {
      return "Excellent";
    } else if (score >= 7.0) {
      return "Good";
    } else if (score >= 5.5) {
      return "Average";
    } else if (score >= 4.0) {
      return "Below Average";
    } else {
      return "Needs Improvement";
    }
  }
}

module.exports = new AnswerEvaluator();
