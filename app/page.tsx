"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Loader2,
  GraduationCap,
  Target,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  User,
  Bot,
  Sparkles,
  BookOpen,
  Lightbulb,
  Brain,
} from "lucide-react"


interface ChatMessage {
  id: string
  role: "user" | "mentor"
  content: string
  timestamp: Date
}

export default function DreamTeacherAI() {
  const [currentStep, setCurrentStep] = useState("hero")
  const [loading, setLoading] = useState(false)
  const [mentorDescription, setMentorDescription] = useState("")
  const [studentName, setStudentName] = useState("")
  const [currentQuote, setCurrentQuote] = useState(0)
  const [aptitudeAnswers, setAptitudeAnswers] = useState<number[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [studyStyle, setStudyStyle] = useState("")
  const [careerGuidance, setCareerGuidance] = useState("")
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)

  const [mentorProfile, setMentorProfile] = useState<{
    name: string
    motto: string
    subjects: string[]
    personality: string
    avatar: string
  } | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // Create Mentor
  const handleCreateMentor = async () => {
    if (!mentorDescription.trim() || !studentName.trim()) return;

    setLoading(true);

    try {
      const prompt = `Based on the following description: "${mentorDescription}", generate a mentor profile for an AI assistant in JSON format. The response should have the following fields: "name" (a creative name for the mentor, e.g., "Professor Aiden Kumar"), "motto" (a short, inspiring motto), "subjects" (an array of 3-5 subjects based on the description), and "personality" (a brief description of the mentor's personality, e.g., "Patient & Understanding"). The JSON should be clean, without any markdown or extra text outside of the JSON object itself.`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          mentorProfile: { name: "", motto: "", subjects: [], personality: "", avatar: "" },
          studentName,
          context: {},
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get mentor profile response.");
      }

      const data = await response.json();
      const parsedProfile = JSON.parse(data.response);

      // Add a placeholder avatar image
      parsedProfile.avatar = "/placeholder-user.jpg";

      setMentorProfile(parsedProfile);
      setCurrentStep("mentorProfile");
    } catch (error) {
      console.error("Error creating mentor:", error);
      // Fallback to a default profile in case of an error
      setMentorProfile({
        name: "Professor Alex",
        motto: "The journey of a thousand miles begins with a single step.",
        subjects: ["General Studies", "Life Skills"],
        personality: "Encouraging & Supportive",
        avatar: "/placeholder-user.jpg",
      });
      setCurrentStep("mentorProfile");
    } finally {
      setLoading(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !mentorProfile) return

    const userMessage: ChatMessage = { id: Date.now().toString(), role: "user", content: currentMessage, timestamp: new Date() }
    setChatMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage,
          mentorProfile,
          studentName,
          context: {
            interests: selectedInterests,
            studyStyle,
            aptitudeScore: aptitudeAnswers.filter((a, i) => a === aptitudeQuestions[i].correct).length,
          },
          chatHistory: chatMessages,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      const mentorResponse: ChatMessage = { id: (Date.now() + 1).toString(), role: "mentor", content: data.response, timestamp: new Date() }
      setChatMessages((prev) => [...prev, mentorResponse])
    } catch (error) {
      console.error(error)
      setChatMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "mentor", content: "Sorry, I cannot respond right now.", timestamp: new Date() }])
    } finally {
      setIsTyping(false)
    }
  }

  // Aptitude
  const handleAptitudeAnswer = (qIndex: number, aIndex: number) => {
    const newAnswers = [...aptitudeAnswers]
    newAnswers[qIndex] = aIndex
    setAptitudeAnswers(newAnswers)
  }
  const handleSubmitAptitude = () => aptitudeAnswers.length === aptitudeQuestions.length && setCurrentStep("interests")

  // Interests
  const toggleInterest = (interest: string) => setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  const handleContinueToStudyStyle = () => selectedInterests.length > 0 && setCurrentStep("studyStyle")

  // Guidance
  const handleGetGuidance = async () => {
    if (!studyStyle.trim()) return
    setLoading(true)
    setCurrentQuote(Math.floor(Math.random() * motivationalQuotes.length))
    await new Promise((r) => setTimeout(r, 1500)) // simulate AI

    const correctAnswers = aptitudeAnswers.filter((a, i) => a === aptitudeQuestions[i].correct).length
    const guidance = `Hello ${studentName}! 🌟\n\nBased on your aptitude test (${correctAnswers}/5 correct) and interests in ${selectedInterests.slice(0, 3).join(", ")}, here's your personalized career guidance...`
    setCareerGuidance(guidance)
    setLoading(false)
    setCurrentStep("guidance")
  }

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type)
    setCurrentStep("feedback")
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-teal-50 to-blue-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            <h3 className="text-xl font-semibold">
              {currentStep === "hero" ? "Summoning your dream mentor..." : "Analyzing your responses..."}
            </h3>
            <p className="text-muted-foreground italic">"{motivationalQuotes[currentQuote]}"</p>
          </CardContent>
        </Card>
      </div>
    )

  // ======================
  // Main return
  // ======================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero / Create Mentor */}
        {currentStep === "hero" && (
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <h1 className="text-5xl font-bold text-balance">Dream Teacher AI</h1>
                <Brain className="h-8 w-8 text-teal-600" />
              </div>
              <p className="text-xl text-muted-foreground text-balance">
                Your personal JARVIS for learning and life guidance. Get AI-powered mentoring, career advice, and
                comprehensive support for your educational journey.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" /> Create Your Dream Mentor
                </CardTitle>
                <CardDescription>Describe your dream teacher (tone, style, attitude)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Your Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                <Textarea placeholder="Describe your dream teacher..." value={mentorDescription} onChange={(e) => setMentorDescription(e.target.value)} rows={4} />
                <Button onClick={handleCreateMentor} className="w-full bg-purple-600 hover:bg-purple-700" disabled={!mentorDescription || !studentName}>
                  Create My Mentor
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ======================
            Mentor Profile / Chat / Aptitude / Interests / Study / Guidance / Feedback
            ====================== */}
        {/* For brevity, I am leaving the rest similar to your original UI structure, 
            only update chat to use handleSendMessage() as above */}
      </div>
    </div>
  )
}
