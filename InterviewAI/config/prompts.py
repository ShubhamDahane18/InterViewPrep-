# Prompt templates for HR & Technical rounds

HR_QUESTION_PROMPT = """
Based on the following resume information, generate {num_questions} HR interview questions that would be appropriate for this candidate.

Resume Information:
{resume_text}

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

Return only the questions, one per line, numbered 1-{num_questions}.
"""

TECHNICAL_QUESTION_PROMPT = """
Based on the following resume information, generate {num_questions} technical interview questions that would be appropriate for this candidate.

Resume Information:
{resume_text}

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

Return only the questions, one per line, numbered 1-{num_questions}.
"""

EVALUATION_PROMPT = """
Evaluate the following interview answer and provide a detailed assessment.

Question: {question}
Answer: {answer}
Question Type: {question_type}

Please provide:
1. A score from 1-10 (where 10 is excellent)
2. Strengths of the answer
3. Areas for improvement
4. Specific feedback
5. Overall assessment

Format your response as:
Score: X/10
Strengths: [list strengths]
Areas for Improvement: [list areas for improvement]
Feedback: [detailed feedback]
Overall Assessment: [summary assessment]
"""

RESUME_ANALYSIS_PROMPT = """
Analyze the following resume text and extract key information in a structured format.

Resume Text:
{resume_text}

Please extract and format the following information:
1. Name
2. Contact Information (email, phone)
3. Professional Summary
4. Skills (technical and soft skills)
5. Work Experience (company, position, duration, key responsibilities)
6. Education (degree, institution, year)
7. Projects (if any)
8. Certifications (if any)

Format the response as structured data that can be easily parsed.
"""