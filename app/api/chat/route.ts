import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: NextRequest) {
  try {
    const { message, mentorProfile, studentName, context } = await req.json()

    let systemPrompt = `You are ${mentorProfile.name}, an AI mentor with the following characteristics:
    
    Personality: ${mentorProfile.personality}
    Subjects: ${mentorProfile.subjects?.join(", ") || "Not specified"}
    Motto: "${mentorProfile.motto}"
    
    You are mentoring ${studentName}, a student with these details:
    - Interests: ${context.interests?.join(", ") || "Not specified"}
    - Study Style: ${context.studyStyle || "Not specified"}
    - Career Interests: ${context.careerPath || "Exploring options"}
    - Aptitude Strengths: ${context.aptitudeResults || "Not assessed"}
    
    Your role is to be a comprehensive life-long learning assistant like Jarvis - helping with academics, career guidance, personal development, motivation, and any questions the student has. Always be encouraging, personalized, and educational. Adapt your responses to match your personality and teaching style while being helpful and supportive.
    
    Keep responses conversational but informative, and always try to connect topics back to the student's interests and goals when relevant.`
    
    // Check for mentor creation prompt
    if (message.startsWith("MENTOR_CREATION_PROMPT:")) {
      systemPrompt = `You are a creative AI assistant. Your task is to generate a complete mentor profile and related learning data based on a user's description. The output must be a single, clean JSON object with no extra text or markdown outside of the object itself.

      The JSON must have the following fields:
      - "name": A creative, human-sounding name for the mentor (e.g., "Dr. Amelia Hart").
      - "motto": A short, inspiring motto or saying for the mentor.
      - "subjects": An array of 3-5 subjects that the mentor specializes in, based on the user's description.
      - "personality": A brief description of the mentor's personality and teaching style (e.g., "Patient and encouraging").
      - "aptitudeQuestions": An array of 5 aptitude test questions. Each question object should have "question" (string), "options" (array of 4 strings), and "correct" (number index of the correct option, starting from 0).
      - "interestOptions": An array of 10-15 interest topics as strings (e.g., "🎨 Art", "🔬 Science").

      Do not include any other fields, explanations, or markdown.`;
    }

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      prompt: message,
      maxTokens: 500,
      temperature: 0.7,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate response. Please check your API configuration.",
      },
      { status: 500 },
    )
  }
}