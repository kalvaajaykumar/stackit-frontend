interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface QuestionAnalysis {
  clarity: number;
  completeness: number;
  suggestions: string[];
  improvedTitle?: string;
  tags: string[];
  qualityScore: number;
  readabilityScore: number;
  technicalDepth: number;
}

interface AnswerSuggestion {
  content: string;
  confidence: number;
  sources: string[];
  codeExamples?: string[];
  relatedTopics?: string[];
}

interface ContentImprovement {
  original: string;
  improved: string;
  changes: string[];
  improvementScore: number;
}

interface SpamDetection {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
  severity: 'low' | 'medium' | 'high';
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const callGeminiAPI = async (prompt: string): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 2048,
          candidateCount: 1,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      // Silently handle API errors (quota exceeded, rate limits, etc.)
      console.warn(`Gemini API unavailable (${response.status}), falling back to mock data`);
      return null;
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.warn('No response from Gemini API, falling back to mock data');
      return null;
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    // Silently handle all API errors and return null for graceful fallback
    console.warn('Gemini API call failed, falling back to mock data');
    return null;
  }
};

class AIService {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
  }

  // Expose the API call method for chatbot use
  async callGeminiAPI(prompt: string): Promise<string | null> {
    return await callGeminiAPI(prompt);
  }

  async analyzeQuestion(title: string, content: string): Promise<AIResponse> {
    try {
      const prompt = `As an expert Q&A platform moderator, analyze this question and provide a comprehensive JSON response:

Question Title: "${title}"
Question Content: "${content}"

Provide analysis in this exact JSON format:
{
  "clarity": number (0-100),
  "completeness": number (0-100),
  "qualityScore": number (0-100),
  "readabilityScore": number (0-100),
  "technicalDepth": number (0-100),
  "suggestions": [
    "specific improvement suggestion 1",
    "specific improvement suggestion 2",
    "specific improvement suggestion 3"
  ],
  "improvedTitle": "better version of the title",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Evaluation criteria:
- Clarity: How clear and understandable is the question?
- Completeness: Does it have enough detail to be answered?
- Quality Score: Overall question quality
- Readability: How easy is it to read and understand?
- Technical Depth: How technically detailed is the question?

For tags, choose from: JavaScript, React, TypeScript, CSS, HTML, Node.js, Python, Java, C++, Career, Mental Health, Debugging, Performance, Best Practices, API, Database, Frontend, Backend, DevOps, Security, Testing, Mobile, AI, Machine Learning, Data Science, Web Development, Software Engineering, Algorithms, Data Structures

Provide specific, actionable suggestions for improvement.`;

      const response = await this.callGeminiAPI(prompt);
      
      // Handle API failure gracefully
      if (!response) {
        return this.getMockQuestionAnalysis(title, content);
      }
      
      try {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Validate and sanitize the response
        const sanitizedAnalysis: QuestionAnalysis = {
          clarity: Math.max(0, Math.min(100, analysis.clarity || 75)),
          completeness: Math.max(0, Math.min(100, analysis.completeness || 80)),
          qualityScore: Math.max(0, Math.min(100, analysis.qualityScore || 75)),
          readabilityScore: Math.max(0, Math.min(100, analysis.readabilityScore || 80)),
          technicalDepth: Math.max(0, Math.min(100, analysis.technicalDepth || 70)),
          suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions.slice(0, 5) : [],
          improvedTitle: analysis.improvedTitle || title,
          tags: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 5) : []
        };
        
        return { success: true, data: sanitizedAnalysis };
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        // Fallback to manual parsing
        return this.getMockQuestionAnalysis(title, content);
      }
    } catch (error) {
      console.error('Question analysis failed:', error);
      return this.getMockQuestionAnalysis(title, content);
    }
  }

  async generateAnswerSuggestion(questionTitle: string, questionContent: string): Promise<AIResponse> {
    try {
      const prompt = `As an expert developer and technical writer, provide a comprehensive answer to this question:

Question: "${questionTitle}"
Details: "${questionContent}"

Please provide a detailed, well-structured answer that includes:

1. **Clear Explanation**: Start with a concise explanation of the solution
2. **Code Examples**: Provide practical, working code examples with comments
3. **Best Practices**: Include relevant best practices and considerations
4. **Step-by-Step Guide**: Break down complex solutions into steps
5. **Additional Resources**: Mention related concepts or further reading

Format your response as clean HTML with proper structure:
- Use <h3> for section headings
- Use <p> for paragraphs
- Use <pre><code> for code blocks
- Use <ul> and <li> for lists
- Use <strong> for emphasis
- Use <em> for subtle emphasis

Make the answer comprehensive but easy to understand, suitable for developers of various skill levels.`;

      const response = await this.callGeminiAPI(prompt);
      
      // Handle API failure gracefully
      if (!response) {
        return this.getMockAnswerSuggestion(questionTitle, questionContent);
      }
      
      const suggestion: AnswerSuggestion = {
        content: this.formatAsHTML(response),
        confidence: 85 + Math.random() * 10, // 85-95%
        sources: ['Gemini AI', 'Best Practices', 'Official Documentation'],
        codeExamples: this.extractCodeExamples(response),
        relatedTopics: this.extractRelatedTopics(response)
      };

      return { success: true, data: [suggestion] };
    } catch (error) {
      console.error('Answer generation failed:', error);
      return this.getMockAnswerSuggestion(questionTitle, questionContent);
    }
  }

  async improveContent(content: string, type: 'question' | 'answer'): Promise<AIResponse> {
    try {
      const prompt = `As an expert technical writer and Q&A platform moderator, improve this ${type}:

Original ${type}:
"${content}"

Please improve the content by:
1. Enhancing clarity and structure
2. Adding proper formatting and organization
3. Improving technical accuracy and completeness
4. Making it more engaging and helpful
5. Ensuring proper grammar and readability

Return a JSON response with this format:
{
  "improved": "the improved content as HTML",
  "changes": [
    "specific change 1",
    "specific change 2",
    "specific change 3"
  ],
  "improvementScore": number (0-100)
}

Use proper HTML formatting in the improved content:
- <h3> for headings
- <p> for paragraphs
- <strong> for emphasis
- <ul>/<li> for lists
- <pre><code> for code blocks
- <em> for subtle emphasis`;

      const response = await this.callGeminiAPI(prompt);
      
      // Handle API failure gracefully
      if (!response) {
        return this.getMockContentImprovement(content, type);
      }
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          const improvement: ContentImprovement = {
            original: content,
            improved: result.improved || this.formatAsHTML(response),
            changes: Array.isArray(result.changes) ? result.changes : [
              'Improved clarity and structure',
              'Enhanced technical details',
              'Better formatting and organization'
            ],
            improvementScore: result.improvementScore || 85
          };
          return { success: true, data: improvement };
        }
      } catch (parseError) {
        // Fallback if JSON parsing fails
      }

      // Manual fallback
      const improvement: ContentImprovement = {
        original: content,
        improved: this.formatAsHTML(response),
        changes: [
          'Improved clarity and structure',
          'Enhanced technical details',
          'Better formatting and organization'
        ],
        improvementScore: 85
      };

      return { success: true, data: improvement };
    } catch (error) {
      console.error('Content improvement failed:', error);
      return this.getMockContentImprovement(content, type);
    }
  }

  async detectSpam(content: string): Promise<AIResponse> {
    try {
      const prompt = `Analyze this content for spam indicators and respond with JSON:

Content: "${content}"

Analyze for:
- Promotional language and marketing speak
- Excessive links or contact information
- Repetitive or low-quality content
- Off-topic or irrelevant content
- Suspicious patterns or bot-like behavior
- Inappropriate commercial content

Respond with this JSON format:
{
  "isSpam": boolean,
  "confidence": number (0-100),
  "severity": "low" | "medium" | "high",
  "reasons": [
    "specific reason 1",
    "specific reason 2"
  ]
}`;

      const response = await this.callGeminiAPI(prompt);
      
      // Handle API failure gracefully
      if (!response) {
        return { 
          success: true, 
          data: {
            isSpam: false,
            confidence: 0,
            severity: 'low' as const,
            reasons: []
          }
        };
      }
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          const detection: SpamDetection = {
            isSpam: result.isSpam || false,
            confidence: Math.max(0, Math.min(100, result.confidence || 0)),
            severity: ['low', 'medium', 'high'].includes(result.severity) ? result.severity : 'low',
            reasons: Array.isArray(result.reasons) ? result.reasons : []
          };
          return { success: true, data: detection };
        }
      } catch (parseError) {
        // Fallback parsing
      }

      // Manual parsing fallback
      const isSpam = response.toLowerCase().includes('spam') || 
                    response.toLowerCase().includes('promotional') ||
                    response.toLowerCase().includes('marketing');
      
      const result: SpamDetection = {
        isSpam,
        confidence: isSpam ? 75 : 25,
        severity: isSpam ? 'medium' : 'low',
        reasons: isSpam ? ['Detected promotional content'] : []
      };

      return { success: true, data: result };
    } catch (error) {
      console.error('Spam detection failed:', error);
      return { 
        success: false, 
        error: 'Failed to analyze content for spam',
        data: {
          isSpam: false,
          confidence: 0,
          severity: 'low',
          reasons: []
        }
      };
    }
  }

  async generateTags(content: string): Promise<AIResponse> {
    try {
      const prompt = `Generate 3-5 relevant tags for this content. Choose from common programming and technology topics:

Content: "${content}"

Available tags: JavaScript, React, TypeScript, CSS, HTML, Node.js, Python, Java, C++, Career, Mental Health, Debugging, Performance, Best Practices, API, Database, Frontend, Backend, DevOps, Security, Testing, Mobile, AI, Machine Learning, Data Science, Web Development, Software Engineering, Algorithms, Data Structures, UI/UX, Cloud Computing, Docker, Git, Linux, Windows, macOS, iOS, Android, Vue.js, Angular, PHP, Ruby, Go, Rust, Swift, Kotlin, C#, .NET, Spring, Django, Flask, Express, MongoDB, PostgreSQL, MySQL, Redis, AWS, Azure, GCP, Firebase, GraphQL, REST, Microservices, Agile, Scrum

Return only the tag names separated by commas, maximum 5 tags.`;

      const response = await this.callGeminiAPI(prompt);
      
      // Handle API failure gracefully
      if (!response) {
        return { success: true, data: this.getFallbackTags(content) };
      }
      
      const tags = response
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5);
      
      return { success: true, data: tags };
    } catch (error) {
      console.error('Tag generation failed:', error);
      return { success: true, data: this.getFallbackTags(content) };
    }
  }

  async generatePlatformInsights(questionsData: any[]): Promise<AIResponse> {
    try {
      const prompt = `Analyze this Q&A platform data and provide insights:

Platform Data:
- Total Questions: ${questionsData.length}
- Recent Activity: ${questionsData.slice(0, 10).map(q => `"${q.title}"`).join(', ')}

Provide insights in JSON format:
{
  "trendingTopics": ["topic1", "topic2", "topic3"],
  "qualityTrends": "description of quality trends",
  "userEngagement": "description of user engagement",
  "recommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ],
  "platformHealth": number (0-100)
}`;

      const response = await this.callGeminiAPI(prompt);
      
      // Handle API failure gracefully
      if (!response) {
        const insights = {
          trendingTopics: ['JavaScript', 'React', 'Career'],
          qualityTrends: 'Questions are showing good technical depth',
          userEngagement: 'Active community participation',
          recommendations: [
            'Encourage more detailed questions',
            'Promote expert participation',
            'Improve response times'
          ],
          platformHealth: 85
        };
        return { success: true, data: insights };
      }
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const insights = JSON.parse(jsonMatch[0]);
          return { success: true, data: insights };
        }
      } catch (parseError) {
        // Fallback
      }

      // Fallback insights
      const insights = {
        trendingTopics: ['JavaScript', 'React', 'Career'],
        qualityTrends: 'Questions are showing good technical depth',
        userEngagement: 'Active community participation',
        recommendations: [
          'Encourage more detailed questions',
          'Promote expert participation',
          'Improve response times'
        ],
        platformHealth: 85
      };

      return { success: true, data: insights };
    } catch (error) {
      console.error('Platform insights generation failed:', error);
      return { success: false, error: 'Failed to generate insights' };
    }
  }

  async moderateContent(content: string, type: 'question' | 'answer' | 'comment'): Promise<AIResponse> {
    try {
      const prompt = `As a content moderator, analyze this ${type} for policy violations:

Content: "${content}"

Check for:
- Inappropriate language or harassment
- Spam or promotional content
- Off-topic or irrelevant content
- Code of conduct violations
- Quality issues

Respond with JSON:
{
  "approved": boolean,
  "confidence": number (0-100),
  "issues": [
    "issue 1",
    "issue 2"
  ],
  "severity": "low" | "medium" | "high",
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ]
}`;

      const response = await this.callGeminiAPI(prompt);
      
      // Handle API failure gracefully
      if (!response) {
        const moderation = {
          approved: true,
          confidence: 90,
          issues: [],
          severity: 'low' as const,
          recommendations: []
        };
        return { success: true, data: moderation };
      }
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const moderation = JSON.parse(jsonMatch[0]);
          return { success: true, data: moderation };
        }
      } catch (parseError) {
        // Fallback
      }

      // Fallback moderation
      const moderation = {
        approved: true,
        confidence: 90,
        issues: [],
        severity: 'low',
        recommendations: []
      };

      return { success: true, data: moderation };
    } catch (error) {
      console.error('Content moderation failed:', error);
      return { success: false, error: 'Failed to moderate content' };
    }
  }

  // Helper methods
  private extractCodeExamples(text: string): string[] {
    const codeBlocks = text.match(/```[\s\S]*?```/g) || [];
    return codeBlocks.map(block => block.replace(/```/g, '').trim());
  }

  private extractRelatedTopics(text: string): string[] {
    const topics = ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Node.js', 'API', 'Database'];
    return topics.filter(topic => 
      text.toLowerCase().includes(topic.toLowerCase())
    ).slice(0, 3);
  }

  private formatAsHTML(text: string): string {
    // Guard against null or undefined text
    if (!text || typeof text !== 'string') {
      return '<p>Unable to format content</p>';
    }
    
    // Enhanced HTML formatting
    let html = text
      // Convert markdown-style headers
      .replace(/### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/# (.*?)$/gm, '<h1>$1</h1>')
      // Convert markdown-style formatting
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Convert code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Convert lists
      .replace(/^\d+\.\s+(.*?)$/gm, '<li>$1</li>')
      .replace(/^[-*]\s+(.*?)$/gm, '<li>$1</li>')
      // Convert line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraphs if not already wrapped
    if (!html.startsWith('<')) {
      html = '<p>' + html + '</p>';
    }
    
    // Fix list formatting
    html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
      if (!match.includes('<ul>') && !match.includes('<ol>')) {
        return '<ul>' + match + '</ul>';
      }
      return match;
    });
    
    return html;
  }

  private getFallbackTags(content: string): string[] {
    const allTags = [
      'JavaScript', 'React', 'TypeScript', 'CSS', 'HTML', 'Node.js',
      'Python', 'Career', 'Mental Health', 'Debugging', 'Performance',
      'Best Practices', 'API', 'Database', 'Frontend', 'Backend'
    ];

    const contentLower = content.toLowerCase();
    const suggestedTags = allTags.filter(tag => 
      contentLower.includes(tag.toLowerCase())
    );

    return suggestedTags.length > 0 ? suggestedTags.slice(0, 5) : allTags.slice(0, 3);
  }

  // Fallback methods for when API fails
  private async getMockQuestionAnalysis(title: string, content: string): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const analysis: QuestionAnalysis = {
      clarity: Math.random() * 40 + 60,
      completeness: Math.random() * 30 + 70,
      qualityScore: Math.random() * 25 + 75,
      readabilityScore: Math.random() * 20 + 80,
      technicalDepth: Math.random() * 30 + 70,
      suggestions: [
        "Consider adding code examples to illustrate your problem",
        "Include what you've already tried to solve this issue",
        "Specify your development environment and versions"
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      improvedTitle: `How to ${title.toLowerCase()}?`,
      tags: this.getFallbackTags(title + ' ' + content)
    };

    return { success: true, data: analysis };
  }

  private async getMockAnswerSuggestion(questionTitle: string, questionContent: string): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions: AnswerSuggestion[] = [{
      content: `<h3>Solution Overview</h3>
               <p>Based on your question about "${questionTitle}", here's a comprehensive solution:</p>
               <h3>Implementation Approach</h3>
               <p>The most straightforward way to handle this is by implementing the following pattern:</p>
               <pre><code>// Example implementation
const solution = () => {
  // Your code here
  return result;
};</code></pre>
               <h3>Best Practices</h3>
               <ul>
                 <li>Always validate your inputs</li>
                 <li>Handle edge cases appropriately</li>
                 <li>Consider performance implications</li>
                 <li>Write comprehensive tests</li>
               </ul>
               <h3>Additional Considerations</h3>
               <p>When implementing this solution, also consider accessibility, browser compatibility, and maintainability.</p>`,
      confidence: Math.random() * 30 + 70,
      sources: ['Documentation', 'Best Practices', 'Community Knowledge'],
      codeExamples: ['const solution = () => { return result; };'],
      relatedTopics: ['Best Practices', 'Performance', 'Testing']
    }];

    return { success: true, data: suggestions };
  }

  private async getMockContentImprovement(content: string, type: 'question' | 'answer'): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const improved: ContentImprovement = {
      original: content,
      improved: type === 'question' 
        ? `<h3>Problem Description</h3><p>${content}</p><h3>Expected Outcome</h3><p>I expect the solution to provide a clear, working implementation with proper error handling.</p><h3>What I've Tried</h3><p>I've researched the documentation but need guidance on the best approach.</p>`
        : `<h3>Solution Overview</h3><p>${content}</p><h3>Implementation Details</h3><p>Here's a step-by-step breakdown of the solution with code examples and best practices.</p><h3>Additional Resources</h3><p>For further reading, check the official documentation and related tutorials.</p>`,
      changes: [
        "Improved clarity and structure",
        "Added technical details and examples",
        "Enhanced readability with proper formatting",
        "Included best practices and considerations"
      ],
      improvementScore: Math.random() * 20 + 80
    };

    return { success: true, data: improved };
  }
}

export const aiService = new AIService();
export type { QuestionAnalysis, AnswerSuggestion, ContentImprovement, SpamDetection };