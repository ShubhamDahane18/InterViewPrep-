const OpenAI = require('openai');

class QuestionGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateQuestions(resumeData, type, count = 5) {
    try {
      const prompt = this.createPrompt(resumeData, type, count);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert interview coach who generates personalized interview questions based on resume data. Generate questions that are relevant, challenging, and help assess the candidate's skills and experience."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const questionsText = response.choices[0].message.content;
      return this.parseQuestions(questionsText, type);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  createPrompt(resumeData, type, count) {
    const resumeText = this.prepareResumeText(resumeData);
    
    if (type === 'HR') {
      return `Based on the following resume information, generate ${count} HR interview questions that would be appropriate for this candidate.

Resume Information:
${resumeText}

The questions should cover:
1. Behavioral questions about past experiences
2. Motivation and career goals
3. Teamwork and leadership
4. Problem-solving abilities
5. Cultural fit and values

Generate questions that are:
- Relevant to the candidate's background
- Open-ended to encourage detailed responses
- Professional and appropriate
- Varied in difficulty and topic

Return the questions in JSON format with the following structure:
[
  {
    "id": "unique_id",
    "question": "Question text here",
    "type": "HR",
    "difficulty": "Easy|Medium|Hard",
    "category": "Category name"
  }
]`;
    } else {
      return `Based on the following resume information, generate ${count} technical interview questions that would be appropriate for this candidate.

Resume Information:
${resumeText}

The questions should cover:
1. Technical skills mentioned in the resume
2. Programming languages and frameworks
3. Problem-solving and coding challenges
4. System design concepts (if applicable)
5. Industry-specific knowledge

Generate questions that are:
- Relevant to the candidate's technical background
- Appropriate for their experience level
- Mix of conceptual and practical questions
- Varied in difficulty

Return the questions in JSON format with the following structure:
[
  {
    "id": "unique_id",
    "question": "Question text here",
    "type": "Technical",
    "difficulty": "Easy|Medium|Hard",
    "category": "Category name"
  }
]`;
    }
  }

  prepareResumeText(resumeData) {
    const textParts = [];

    // Add contact info
    if (resumeData.contactInfo) {
      const contact = resumeData.contactInfo;
      if (contact.name) textParts.push(`Name: ${contact.name}`);
      if (contact.email) textParts.push(`Email: ${contact.email}`);
      if (contact.phone) textParts.push(`Phone: ${contact.phone}`);
    }

    // Add sections
    if (resumeData.sections) {
      for (const [sectionName, content] of Object.entries(resumeData.sections)) {
        textParts.push(`${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}: ${content}`);
      }
    }

    // Add skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      const skillsText = resumeData.skills.join(', ');
      textParts.push(`Skills: ${skillsText}`);
    }

    // Add raw text if sections are not available
    if (textParts.length === 0 && resumeData.rawText) {
      textParts.push(resumeData.rawText);
    }

    return textParts.join('\n\n');
  }

  parseQuestions(questionsText, type) {
    try {
      // Try to parse as JSON first
      const questions = JSON.parse(questionsText);
      
      // Validate and format questions
      return questions.map((q, index) => ({
        id: q.id || `q_${type.toLowerCase()}_${index + 1}`,
        question: q.question || '',
        type: type,
        difficulty: q.difficulty || this.assessDifficulty(q.question),
        category: q.category || this.categorizeQuestion(q.question, type)
      }));
    } catch (error) {
      // Fallback: parse from text format
      return this.parseQuestionsFromText(questionsText, type);
    }
  }

  parseQuestionsFromText(questionsText, type) {
    const questions = [];
    const lines = questionsText.split('\n').filter(line => line.trim().length > 0);
    
    let questionIndex = 1;
    for (const line of lines) {
      // Remove numbering (1., 2., etc.)
      const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
      
      if (cleanLine.length > 10 && cleanLine.includes('?')) {
        questions.push({
          id: `q_${type.toLowerCase()}_${questionIndex}`,
          question: cleanLine,
          type: type,
          difficulty: this.assessDifficulty(cleanLine),
          category: this.categorizeQuestion(cleanLine, type)
        });
        questionIndex++;
      }
    }

    return questions;
  }

  assessDifficulty(question) {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('explain') || 
        questionLower.includes('describe') || 
        questionLower.includes('analyze') || 
        questionLower.includes('compare') || 
        questionLower.includes('evaluate')) {
      return 'Hard';
    } else if (questionLower.includes('what') || 
               questionLower.includes('how') || 
               questionLower.includes('why') || 
               questionLower.includes('when') || 
               questionLower.includes('where')) {
      return 'Medium';
    } else {
      return 'Easy';
    }
  }

  categorizeQuestion(question, type) {
    const questionLower = question.toLowerCase();
    
    if (type === 'HR') {
      if (questionLower.includes('team') || questionLower.includes('teamwork') || questionLower.includes('collaboration')) {
        return 'Teamwork';
      } else if (questionLower.includes('lead') || questionLower.includes('leadership') || questionLower.includes('manage')) {
        return 'Leadership';
      } else if (questionLower.includes('problem') || questionLower.includes('challenge') || questionLower.includes('difficult')) {
        return 'Problem Solving';
      } else if (questionLower.includes('goal') || questionLower.includes('career') || questionLower.includes('future')) {
        return 'Career Goals';
      } else {
        return 'General HR';
      }
    } else {
      if (questionLower.includes('code') || questionLower.includes('programming') || questionLower.includes('algorithm')) {
        return 'Programming';
      } else if (questionLower.includes('database') || questionLower.includes('sql') || questionLower.includes('data')) {
        return 'Database';
      } else if (questionLower.includes('system') || questionLower.includes('architecture') || questionLower.includes('design')) {
        return 'System Design';
      } else if (questionLower.includes('framework') || questionLower.includes('library') || questionLower.includes('tool')) {
        return 'Frameworks & Tools';
      } else {
        return 'General Technical';
      }
    }
  }
}

module.exports = new QuestionGenerator();
