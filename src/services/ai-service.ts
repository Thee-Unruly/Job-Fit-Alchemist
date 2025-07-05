// frontend/src/services/ai-service.ts
interface AIResponse {
  text?: string;
  error?: string;
}

// CV Analysis API
export const analyzeCv = async (
  cvText: string,
  apiKey: string = import.meta.env.VITE_CV_ANALYSIS_API_KEY,
  model: string = "mistralai/mistral-small-3.1-24b-instruct:free"
): Promise<AIResponse> => {
  try {
    console.log(`Analyzing CV with model: ${model}`);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'CV Analyzer'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a CV analyzer that provides concise, actionable feedback. Your response MUST include an 'ATS Score: X%' on a line by itself"
          },
          {
            role: "user",
            content: `Analyze this CV/resume for job fit and ATS optimization. Be brief but specific.

1. Give an ATS Score (0-100%)
2. List 3-5 key strengths 
3. List 3-5 improvement suggestions
4. Mention 2-3 keywords missing for ATS

CV content:
${cvText}`
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    const data = await response.json();
    return { text: data.choices[0].message.content };
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return { error: 'Failed to analyze CV. Please check your API key and try again.' };
  }
};

// Job Match API
export const matchJobDescription = async (
  cvText: string,
  jobDescription: string,
  apiKey: string = import.meta.env.VITE_JOB_MATCH_API_KEY,
  model: string = "mistralai/mistral-small-3.1-24b-instruct:free"
): Promise<AIResponse> => {
  try {
    console.log(`Matching job with model: ${model}`);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are an AI job match analyzer. Compare the CV and job description, then provide a concise match analysis with a percentage score (0-100%) and 2-3 specific improvement suggestions. Format the score as 'ATS Score: X%'."
          },
          {
            role: "user",
            content: `CV: ${cvText}\nJob Description: ${jobDescription}`
          }
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(data.error?.message || "No content returned from API");
    }

    return { text: content };
  } catch (error) {
    console.error("Error matching job description:", error);
    return {
      error: error instanceof Error ? error.message : 'Failed to match job description.'
    };
  }
};

// Career Chat API
export const getCareerAdvice = async (
  question: string,
  apiKey: string = import.meta.env.VITE_CAREER_ADVICE_API_KEY,
  model: string = "mistralai/mistral-small-3.1-24b-instruct:free"
): Promise<AIResponse> => {
  try {
    console.log(`Getting career advice with model: ${model}`);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a professional career advisor AI assistant. Respond with thoughtful, actionable, and empathetic guidance tailored to the user's career stage, goals, and challenges. Use a warm and encouraging tone, provide relevant examples when appropriate, and aim to empower the user to take confident next steps."
          },
          {
            role: "user",
            content: `Career question: ${question}`
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return { text: data.choices[0].message.content };
  } catch (error) {
    console.error('Error getting career advice:', error);
    return {
      error: 'Failed to get career advice. Please check your API key and try again.'
    };
  }
};

// Skills Map API
export const generateSkillsMap = async (
  profile: any,
  targetRole: string,
  apiKey: string = import.meta.env.VITE_SKILLS_MAP_API_KEY,
  model: string = "mistralai/mistral-small-3.1-24b-instruct:free"
): Promise<AIResponse> => {
  try {
    console.log(`Generating skills map with model: ${model}`);
    const profileText = `
      Name: ${profile.name || 'Not specified'}
      Education: ${profile.education || 'Not specified'}
      Experience: ${profile.experience || 'Not specified'}
      Skills: ${profile.skills?.join(', ') || 'Not specified'}
      Career Goals: ${profile.goals || 'Not specified'}
      Target Role: ${targetRole || 'Not specified'}
    `;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a career development AI assistant. Based on the provided professional profile and target role, create a detailed skills roadmap with learning resources and milestones."
          },
          {
            role: "user",
            content: `Profile: ${profileText}\n\nGenerate a skills roadmap for the target role.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return { text: data.choices[0].message.content };
  } catch (error) {
    console.error('Error generating skills map:', error);
    return {
      error: 'Failed to generate skills map. Please check your API key and try again.'
    };
  }
};

// Mock Interview API
export const conductMockInterview = async (
  jobTitle: string,
  jobDescription: string,
  questionResponse: string = '',
  isStarting: string = 'true',
  apiKey: string = import.meta.env.VITE_MOCK_INTERVIEW_API_KEY,
  model: string = "mistralai/mistral-small-3.1-24b-instruct:free"
): Promise<AIResponse> => {
  try {
    console.log(`Conducting mock interview with model: ${model}`);
    let prompt;

    if (isStarting === 'true') {
      prompt = `
        You are an experienced interviewer conducting a mock interview for the position of "${jobTitle}". 
        Here is the job description: "${jobDescription}"
        
        Ask the first relevant interview question tailored to the role's requirements. 
        Ensure the question is **professional**, *encouraging*, and clear. 
        Format the response in Markdown, using **bold** for emphasis (e.g., job title, key skills) and *italics* for a friendly tone. Avoid excessive Markdown symbols like code blocks.
        Example:
        **Interview Question**  
        *Thank you for joining us!* Please share your experience as a **${jobTitle}**...
      `;
    } else {
      prompt = `
        You are an experienced interviewer conducting a mock interview for the position of "${jobTitle}". 
        Here is the job description: "${jobDescription}"
        
        The candidate's response to the previous question is: "${questionResponse}"
        
        Evaluate the candidate's response and provide:
        1. **Feedback**: Highlight **strengths** and **areas for improvement** using bullet points (-). Use *italics* for suggestions and emphasis on tone.
        2. **Next Question**: Ask the next relevant interview question, building on the conversation and aligning with the job description. Use **bold** for the question title and *italics* for a friendly tone.
        
        Format the response in **Markdown** with:
        - **Bold** section headers (e.g., **Feedback**, **Improved Answer**) and key terms (e.g., **${jobTitle}**, **skills**).
        - *Italics* for encouraging tone and suggestions (e.g., *quantify impact*).
        - Bullet points (-) for feedback and numbered lists (1.) for multi-part questions.
        - Horizontal rules (---) to separate sections.
        - Avoid code blocks (e.g., \`Python\`) unless essential for technical terms.
        - Clear, professional, and encouraging language.
        
        Example:
        **Feedback**  
        - **Strength**: Your experience as a **${jobTitle}** is relevant.  
        - **Improvement**: *Quantify* your impact for stronger answers.  

        ---
        **Next Question**  
        *Great response!* Can you describe...
      `;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return { text: data.choices[0].message.content };
  } catch (error) {
    console.error('Error in mock interview:', error);
    return {
      error: 'Failed to process interview response. Please check your API key and try again.',
    };
  }
};