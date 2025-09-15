const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

class ResumeParser {
  constructor() {
    this.skillPatterns = [
      // Programming Languages
      /\b(?:Python|Java|JavaScript|TypeScript|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|R|MATLAB)\b/gi,
      // Web Technologies
      /\b(?:React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel|ASP\.NET|jQuery|Bootstrap|Tailwind|SASS|LESS)\b/gi,
      // Databases
      /\b(?:SQL|MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Oracle|SQLite|Cassandra|DynamoDB)\b/gi,
      // Cloud & DevOps
      /\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|GitHub|GitLab|CI\/CD|DevOps|Terraform|Ansible)\b/gi,
      // Data Science & AI
      /\b(?:Machine Learning|AI|Data Science|Analytics|Statistics|TensorFlow|PyTorch|Pandas|NumPy|Scikit-learn|Jupyter)\b/gi,
      // Soft Skills
      /\b(?:Project Management|Leadership|Communication|Teamwork|Problem Solving|Agile|Scrum|Kanban)\b/gi,
      // Other Technologies
      /\b(?:Linux|Windows|macOS|REST|GraphQL|Microservices|Blockchain|IoT|Mobile Development)\b/gi
    ];
  }

  async parsePDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      return this.extractInformation(data.text);
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  async parseDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      
      return this.extractInformation(result.value);
    } catch (error) {
      throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
  }

  extractInformation(text) {
    const skills = this.extractSkills(text);
    const contactInfo = this.extractContactInfo(text);
    const sections = this.parseSections(text);

    return {
      rawText: text,
      skills: skills,
      contactInfo: contactInfo,
      sections: sections
    };
  }

  extractSkills(text) {
    const skills = new Set();
    
    this.skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          skills.add(match.trim());
        });
      }
    });

    return Array.from(skills);
  }

  extractContactInfo(text) {
    const contactInfo = {};

    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatch = text.match(emailPattern);
    if (emailMatch) {
      contactInfo.email = emailMatch[0];
    }

    // Phone pattern (various formats)
    const phonePattern = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) {
      contactInfo.phone = phoneMatch[0];
    }

    // LinkedIn pattern
    const linkedinPattern = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?/gi;
    const linkedinMatch = text.match(linkedinPattern);
    if (linkedinMatch) {
      contactInfo.linkedin = linkedinMatch[0];
    }

    // GitHub pattern
    const githubPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9-]+\/?/gi;
    const githubMatch = text.match(githubPattern);
    if (githubMatch) {
      contactInfo.github = githubMatch[0];
    }

    // Extract name (first line that looks like a name)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0];
      // Simple name detection - not an email, phone, or common resume headers
      if (!firstLine.includes('@') && 
          !firstLine.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) &&
          !firstLine.toLowerCase().includes('resume') &&
          !firstLine.toLowerCase().includes('curriculum') &&
          firstLine.length < 50) {
        contactInfo.name = firstLine;
      }
    }

    return contactInfo;
  }

  parseSections(text) {
    const sections = {};
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const sectionHeaders = [
      'experience', 'work experience', 'employment', 'professional experience',
      'education', 'academic background', 'educational background',
      'skills', 'technical skills', 'core competencies', 'key skills',
      'projects', 'personal projects', 'portfolio',
      'certifications', 'certificates', 'licenses',
      'summary', 'objective', 'profile', 'about',
      'achievements', 'accomplishments', 'awards',
      'languages', 'interests', 'hobbies'
    ];

    let currentSection = 'other';
    let currentContent = [];

    for (const line of lines) {
      // Check if line is a section header
      const isHeader = sectionHeaders.some(header => {
        const headerLower = header.toLowerCase();
        const lineLower = line.toLowerCase();
        return lineLower.includes(headerLower) && 
               line.length <= 50 && 
               line.length > headerLower.length;
      });

      if (isHeader) {
        // Save previous section
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        
        // Start new section
        currentSection = line.toLowerCase().replace(/[^a-z\s]/g, '').trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n');
    }

    return sections;
  }
}

module.exports = new ResumeParser();
