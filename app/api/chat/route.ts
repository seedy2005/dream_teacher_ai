import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { message, mentorProfile, studentName, context, chatHistory } = req.body;

    const prompt = `
You are ${mentorProfile.name}, a ${mentorProfile.personality} AI mentor.
You teach: ${mentorProfile.subjects.join(", ")}.
Student: ${studentName}
Interests: ${context.interests.join(", ")}
Learning Style: ${context.studyStyle}
Aptitude Score: ${context.aptitudeScore}/5

Here is the chat history:
${chatHistory.map((m: any) => `${m.role === "user" ? studentName : mentorProfile.name}: ${m.content}`).join("\n")}

Respond helpfully, encouragingly, and in the tone of the mentor. 
Answer the latest student question:
"${message}"
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful and encouraging AI mentor." },
        { role: "user", content: prompt },
      ],
    });

    res.status(200).json({ response: completion.choices[0].message?.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ response: "Oops, something went wrong. Try again!" });
  }
}
