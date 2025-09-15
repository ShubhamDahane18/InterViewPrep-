const OpenAI = require('openai');

class ReportGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateReport(resumeData, hrEvaluation, technicalEvaluation) {
    try {
      const candidateInfo = this.extractCandidateInfo(resumeData);
      const interviewSummary = this.createInterviewSummary(hrEvaluation, technicalEvaluation);
      const overallAssessment = await this.createOverallAssessment(hrEvaluation, technicalEvaluation, resumeData);
      const recommendations = await this.generateRecommendations(hrEvaluation, technicalEvaluation, overallAssessment);

      return {
        candidateInfo: candidateInfo,
        interviewSummary: interviewSummary,
        overallAssessment: overallAssessment,
        recommendations: recommendations,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  extractCandidateInfo(resumeData) {
    return {
      name: resumeData.contactInfo?.name || 'Unknown',
      email: resumeData.contactInfo?.email || 'Not provided',
      phone: resumeData.contactInfo?.phone || 'Not provided',
      skills: resumeData.skills || [],
      experienceSections: resumeData.sections?.experience || '',
      educationSections: resumeData.sections?.education || ''
    };
  }

  createInterviewSummary(hrEvaluation, technicalEvaluation) {
    const summary = {
      totalQuestions: 0,
      averageScores: {},
      performanceLevels: {},
      roundsCompleted: [],
      overallAverage: 0
    };

    if (hrEvaluation) {
      summary.totalQuestions += hrEvaluation.totalQuestions;
      summary.averageScores.hr_round = hrEvaluation.averageScore;
      summary.performanceLevels.hr_round = hrEvaluation.performanceLevel;
      summary.roundsCompleted.push('HR Round');
    }

    if (technicalEvaluation) {
      summary.totalQuestions += technicalEvaluation.totalQuestions;
      summary.averageScores.technical_round = technicalEvaluation.averageScore;
      summary.performanceLevels.technical_round = technicalEvaluation.performanceLevel;
      summary.roundsCompleted.push('Technical Round');
    }

    // Calculate overall average
    const scores = Object.values(summary.averageScores);
    if (scores.length > 0) {
      summary.overallAverage = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    return summary;
  }

  async createOverallAssessment(hrEvaluation, technicalEvaluation, resumeData) {
    try {
      const prompt = this.createOverallAssessmentPrompt(hrEvaluation, technicalEvaluation, resumeData);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert HR professional and interview coach. Provide comprehensive assessment and recommendations based on interview performance data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const assessmentText = response.choices[0].message.content;
      return this.parseOverallAssessment(assessmentText, hrEvaluation, technicalEvaluation);
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to basic assessment
      return this.createBasicAssessment(hrEvaluation, technicalEvaluation);
    }
  }

  createOverallAssessmentPrompt(hrEvaluation, technicalEvaluation, resumeData) {
    const evaluationData = {
      hr: hrEvaluation ? {
        averageScore: hrEvaluation.averageScore,
        performanceLevel: hrEvaluation.performanceLevel,
        totalQuestions: hrEvaluation.totalQuestions,
        overallFeedback: hrEvaluation.overallFeedback
      } : null,
      technical: technicalEvaluation ? {
        averageScore: technicalEvaluation.averageScore,
        performanceLevel: technicalEvaluation.performanceLevel,
        totalQuestions: technicalEvaluation.totalQuestions,
        overallFeedback: technicalEvaluation.overallFeedback
      } : null,
      candidate: {
        skills: resumeData.skills || [],
        experience: resumeData.sections?.experience || '',
        education: resumeData.sections?.education || ''
      }
    };

    return `Based on the following interview evaluation data, provide a comprehensive overall assessment.

Evaluation Data:
${JSON.stringify(evaluationData, null, 2)}

Please provide a detailed assessment in JSON format with the following structure:
{
  "overallScore": 7.5,
  "strengths": ["Strong technical skills", "Good communication", "Relevant experience"],
  "areasForImprovement": ["Need more specific examples", "Could improve problem-solving approach"],
  "recommendation": "Good candidate - Recommended for technical roles with some coaching on communication"
}

Consider:
- Overall performance across all rounds
- Balance between technical and soft skills
- Areas of excellence and improvement
- Suitability for different types of roles
- Specific recommendations for hiring decision`;
  }

  parseOverallAssessment(assessmentText, hrEvaluation, technicalEvaluation) {
    try {
      const assessment = JSON.parse(assessmentText);
      
      return {
        overallScore: Math.max(1, Math.min(10, assessment.overallScore || 5)),
        strengths: assessment.strengths || [],
        areasForImprovement: assessment.areasForImprovement || [],
        recommendation: assessment.recommendation || this.getBasicRecommendation(hrEvaluation, technicalEvaluation)
      };
    } catch (error) {
      // Fallback to basic assessment
      return this.createBasicAssessment(hrEvaluation, technicalEvaluation);
    }
  }

  createBasicAssessment(hrEvaluation, technicalEvaluation) {
    const scores = [];
    if (hrEvaluation) scores.push(hrEvaluation.averageScore);
    if (technicalEvaluation) scores.push(technicalEvaluation.averageScore);
    
    const overallScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    
    return {
      overallScore: Math.round(overallScore * 10) / 10,
      strengths: ['Completed interview successfully'],
      areasForImprovement: ['Could provide more detailed responses'],
      recommendation: this.getBasicRecommendation(hrEvaluation, technicalEvaluation)
    };
  }

  getBasicRecommendation(hrEvaluation, technicalEvaluation) {
    const scores = [];
    if (hrEvaluation) scores.push(hrEvaluation.averageScore);
    if (technicalEvaluation) scores.push(technicalEvaluation.averageScore);
    
    const overallScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    
    if (overallScore >= 8.0) {
      return 'Strong candidate - Highly recommended';
    } else if (overallScore >= 6.5) {
      return 'Good candidate - Recommended';
    } else if (overallScore >= 5.0) {
      return 'Average candidate - Consider for specific roles';
    } else {
      return 'Needs improvement - Not recommended at this time';
    }
  }

  async generateRecommendations(hrEvaluation, technicalEvaluation, overallAssessment) {
    try {
      const prompt = this.createRecommendationsPrompt(hrEvaluation, technicalEvaluation, overallAssessment);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert career coach. Provide specific, actionable recommendations for interview improvement based on performance data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      });

      const recommendationsText = response.choices[0].message.content;
      return this.parseRecommendations(recommendationsText);
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to basic recommendations
      return this.getBasicRecommendations(hrEvaluation, technicalEvaluation);
    }
  }

  createRecommendationsPrompt(hrEvaluation, technicalEvaluation, overallAssessment) {
    const data = {
      overallScore: overallAssessment.overallScore,
      strengths: overallAssessment.strengths,
      areasForImprovement: overallAssessment.areasForImprovement,
      hr: hrEvaluation ? {
        score: hrEvaluation.averageScore,
        feedback: hrEvaluation.overallFeedback
      } : null,
      technical: technicalEvaluation ? {
        score: technicalEvaluation.averageScore,
        feedback: technicalEvaluation.overallFeedback
      } : null
    };

    return `Based on the following interview performance data, provide 5-7 specific, actionable recommendations for improvement.

Performance Data:
${JSON.stringify(data, null, 2)}

Please provide recommendations as a JSON array of strings:
[
  "Practice providing specific examples with quantifiable results",
  "Improve technical knowledge in core programming languages",
  "Work on communication skills and clarity of expression",
  "Prepare more detailed responses for behavioral questions",
  "Focus on problem-solving methodology and approach"
]

Make recommendations:
- Specific and actionable
- Based on actual performance gaps
- Realistic and achievable
- Cover both technical and soft skills
- Include both short-term and long-term improvements`;
  }

  parseRecommendations(recommendationsText) {
    try {
      const recommendations = JSON.parse(recommendationsText);
      return Array.isArray(recommendations) ? recommendations : [];
    } catch (error) {
      // Fallback: parse from text format
      const lines = recommendationsText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && (line.startsWith('-') || line.match(/^\d+\./)));
      
      return lines.map(line => 
        line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim()
      ).filter(rec => rec.length > 0);
    }
  }

  getBasicRecommendations(hrEvaluation, technicalEvaluation) {
    const recommendations = [];
    
    if (hrEvaluation && hrEvaluation.averageScore < 6.0) {
      recommendations.push('Focus on improving communication and interpersonal skills');
      recommendations.push('Practice behavioral interview questions using the STAR method');
    }
    
    if (technicalEvaluation && technicalEvaluation.averageScore < 6.0) {
      recommendations.push('Strengthen technical knowledge in core areas');
      recommendations.push('Practice coding problems and system design questions');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue building on current strengths');
      recommendations.push('Consider advanced training in specialized areas');
    }
    
    return recommendations;
  }
}

module.exports = new ReportGenerator();
