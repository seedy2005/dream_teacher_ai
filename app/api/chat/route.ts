import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: NextRequest) {
  try {
    const { message, mentorProfile, studentName, context } = await req.json()

    // Create a comprehensive system prompt based on the mentor profile and student context
    const systemPrompt = `You are ${mentorProfile.name}, an AI mentor with the following characteristics:
    
    Personality: ${mentorProfile.personality}
    Teaching Style: ${mentorProfile.teachingStyle}
    Subjects: ${mentorProfile.subjects.join(", ")}
    Motto: "${mentorProfile.motto}"
    
    You are mentoring ${studentName}, a student with these details:
    - Interests: ${context.interests?.join(", ") || "Not specified"}
    - Study Style: ${context.studyStyle || "Not specified"}
    - Career Interests: ${context.careerPath || "Exploring options"}
    - Aptitude Strengths: ${context.aptitudeResults || "Not assessed"}
    
    Your role is to be a comprehensive life-long learning assistant like Jarvis - helping with academics, career guidance, personal development, motivation, and any questions the student has. Always be encouraging, personalized, and educational. Adapt your responses to match your personality and teaching style while being helpful and supportive.
    
    Keep responses conversational but informative, and always try to connect topics back to the student's interests and goals when relevant.`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      prompt: message,
      maxTokens: 500,
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
