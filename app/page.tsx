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

const motivationalQuotes = [
  "Every great journey begins with the right guide.",
  "You are one decision away from a completely different future.",
  "Trust the process. Your mentor is listening.",
  "The best teachers show you where to look, not what to see.",
  "Your potential is endless when you have the right guidance.",
  "You already have what it takes. Now, let's bring out the best in you.",
]

const mentorNames = [
  "Dr. Sarah Chen",
  "Professor Marcus Johnson",
  "Ms. Elena Rodriguez",
  "Dr. Aiden Kumar",
  "Coach Maya Thompson",
]
const teachingMottos = [
  "Every question is a step toward wisdom",
  "Mistakes are proof you're trying",
  "Your potential is limitless",
  "Learning never stops, growing never ends",
  "Believe in yourself, I believe in you",
]

const aptitudeQuestions = [
  {
    question: "If you have 12 apples and give away 3, then buy 8 more, how many do you have?",
    options: ["15", "17", "19", "21"],
    correct: 1,
  },
  {
    question: "Which word doesn't belong: Book, Magazine, Newspaper, Television?",
    options: ["Book", "Magazine", "Newspaper", "Television"],
    correct: 3,
  },
  {
    question: "If all roses are flowers and some flowers are red, which is true?",
    options: ["All roses are red", "Some roses might be red", "No roses are red", "All flowers are roses"],
    correct: 1,
  },
  {
    question: "Complete the pattern: 2, 4, 8, 16, ?",
    options: ["24", "32", "28", "20"],
    correct: 1,
  },
  {
    question:
      "If it takes 5 machines 5 minutes to make 5 widgets, how long does it take 100 machines to make 100 widgets?",
    options: ["5 minutes", "20 minutes", "100 minutes", "500 minutes"],
    correct: 0,
  },
]

const interestOptions = [
  "🎨 Art",
  "🔬 Science",
  "💡 Puzzles",
  "🎤 Speaking",
  "✍️ Writing",
  "📈 Numbers",
  "👥 Helping People",
  "🎵 Music",
  "⚙️ Machines",
  "🌱 Nature",
]

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

  const handleCreateMentor = async () => {
    if (!mentorDescription.trim() || !studentName.trim()) return

    setLoading(true)
    setCurrentQuote(Math.floor(Math.random() * motivationalQuotes.length))

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const profile = {
      name: mentorNames[Math.floor(Math.random() * mentorNames.length)],
      motto: teachingMottos[Math.floor(Math.random() * teachingMottos.length)],
      subjects:
        selectedInterests.length > 0
          ? selectedInterests.slice(0, 3)
          : ["General Studies", "Life Skills", "Personal Growth"],
      personality: mentorDescription.toLowerCase().includes("patient")
        ? "Patient & Understanding"
        : mentorDescription.toLowerCase().includes("funny")
          ? "Humorous & Engaging"
          : mentorDescription.toLowerCase().includes("strict")
            ? "Structured & Disciplined"
            : "Encouraging & Supportive",
      avatar: `/placeholder.svg?height=80&width=80&query=friendly teacher avatar`,
    }

    setMentorProfile(profile)
    setLoading(false)
    setCurrentStep("mentorProfile")
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !mentorProfile) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          mentorProfile,
          studentName,
          context: {
            interests: selectedInterests,
            studyStyle,
            aptitudeScore: aptitudeAnswers.filter((answer, index) => answer === aptitudeQuestions[index].correct)
              .length,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const mentorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "mentor",
        content: data.response,
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, mentorResponse])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "mentor",
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleAptitudeAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...aptitudeAnswers]
    newAnswers[questionIndex] = answerIndex
    setAptitudeAnswers(newAnswers)
  }

  const handleSubmitAptitude = () => {
    if (aptitudeAnswers.length === aptitudeQuestions.length) {
      setCurrentStep("interests")
    }
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const handleContinueToStudyStyle = () => {
    if (selectedInterests.length > 0) {
      setCurrentStep("studyStyle")
    }
  }

  const handleGetGuidance = async () => {
    if (!studyStyle.trim()) return

    setLoading(true)
    setCurrentQuote(Math.floor(Math.random() * motivationalQuotes.length))

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 4000))

    // Generate personalized guidance
    const correctAnswers = aptitudeAnswers.filter((answer, index) => answer === aptitudeQuestions[index].correct).length
    const guidance = `Hello ${studentName}! 🌟

Based on your aptitude test (${correctAnswers}/5 correct) and interests in ${selectedInterests.slice(0, 3).join(", ")}, here's your personalized career guidance:

**Recommended Career Paths:**
${
  selectedInterests.some((i) => i.includes("Numbers") || i.includes("Puzzles"))
    ? "• Data Science & Analytics - Your logical thinking would excel here\n"
    : ""
}
${
  selectedInterests.some((i) => i.includes("Art") || i.includes("Machines"))
    ? "• UX/UI Design or Software Development - Perfect for creative problem-solving\n"
    : ""
}
${
  selectedInterests.some((i) => i.includes("Helping People") || i.includes("Speaking"))
    ? "• Healthcare, Education, or Management - Your people skills are valuable\n"
    : ""
}
${
  selectedInterests.some((i) => i.includes("Writing") || i.includes("Music"))
    ? "• Creative Arts, Content Creation, or Media - Express your creativity\n"
    : ""
}

**Study Strategy for ${studyStyle.toLowerCase().includes("visual") ? "Visual Learners" : studyStyle.toLowerCase().includes("hands") ? "Hands-on Learners" : "Your Learning Style"}:**
• Break complex topics into smaller, manageable chunks
• Use active recall and spaced repetition techniques
• ${studyStyle.toLowerCase().includes("visual") ? "Create mind maps and diagrams" : "Practice with real-world applications"}
• Join study groups to discuss concepts with peers
• Set specific, measurable goals for each study session

Remember, your dream mentor believes in your potential! Every expert was once a beginner. Stay curious, be persistent, and trust your journey. 🚀`

    setCareerGuidance(guidance)
    setLoading(false)
    setCurrentStep("guidance")
  }

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type)
    setCurrentStep("feedback")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <h3 className="text-xl font-semibold">
                {currentStep === "hero" ? "Summoning your dream mentor..." : "Analyzing your responses..."}
              </h3>
              <p className="text-muted-foreground italic">"{motivationalQuotes[currentQuote]}"</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
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
              <div className="flex items-center justify-center gap-6 text-sm text-purple-600 font-medium">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Academic Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>Career Guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Life Mentoring</span>
                </div>
              </div>
              <p className="text-lg italic text-purple-600 font-medium">
                "Every great journey begins with the right guide."
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" />
                  Create Your Dream Mentor
                </CardTitle>
                <CardDescription>Describe your dream teacher (their tone, style, attitude)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your name</label>
                  <Input
                    placeholder="Enter your name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Describe your dream teacher</label>
                  <Textarea
                    placeholder="My dream teacher is patient, encouraging, and explains things in simple terms. They use real-world examples and always believe in my potential..."
                    value={mentorDescription}
                    onChange={(e) => setMentorDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleCreateMentor}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!mentorDescription.trim() || !studentName.trim()}
                >
                  Create My Mentor
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "mentorProfile" && mentorProfile && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Meet Your Dream Mentor</h2>
              <p className="text-muted-foreground">Your personalized AI mentor is ready to guide you</p>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={mentorProfile.avatar || "/placeholder.svg"} alt={mentorProfile.name} />
                    <AvatarFallback className="text-2xl bg-purple-100 text-purple-600">
                      {mentorProfile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">{mentorProfile.name}</h3>
                    <p className="text-lg italic text-purple-600">"{mentorProfile.motto}"</p>
                    <p className="text-sm text-muted-foreground">Personality: {mentorProfile.personality}</p>
                  </div>

                  <div className="w-full space-y-2">
                    <p className="text-sm font-medium text-center">Favorite Subjects:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {mentorProfile.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary" className="bg-teal-100 text-teal-700">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={() => setCurrentStep("chat")} className="flex-1 bg-teal-600 hover:bg-teal-700">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat With Your Mentor
              </Button>
              <Button onClick={() => setCurrentStep("aptitude")} variant="outline" className="flex-1">
                Continue to Assessment
              </Button>
            </div>
          </div>
        )}

        {currentStep === "chat" && mentorProfile && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h2 className="text-3xl font-bold">Chat With {mentorProfile.name}</h2>
                <Bot className="h-6 w-6 text-teal-600" />
              </div>
              <p className="text-muted-foreground">
                Your AI-powered learning companion - ask anything about academics, career, or life!
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-purple-600">
                <span>📚 Study Help</span>
                <span>🎯 Career Advice</span>
                <span>💡 Life Skills</span>
                <span>🧠 Problem Solving</span>
              </div>
            </div>

            <Card className="h-96 flex flex-col">
              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Bot className="h-12 w-12 text-purple-400" />
                      <Sparkles className="h-6 w-6 text-teal-400" />
                    </div>
                    <p className="font-medium">Welcome to your AI learning companion!</p>
                    <div className="text-sm mt-4 space-y-2">
                      <p className="font-medium">Try asking:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto">
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-purple-50"
                          onClick={() => setCurrentMessage("How can I improve my study habits?")}
                        >
                          "How can I improve my study habits?"
                        </Badge>
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-teal-50"
                          onClick={() => setCurrentMessage("What career path suits me?")}
                        >
                          "What career path suits me?"
                        </Badge>
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50"
                          onClick={() => setCurrentMessage("Help me with time management")}
                        >
                          "Help me with time management"
                        </Badge>
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-purple-50"
                          onClick={() => setCurrentMessage("Explain quantum physics simply")}
                        >
                          "Explain quantum physics simply"
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {message.role === "user" ? (
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-3 bg-gray-100 text-gray-900">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </CardContent>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything - academics, career, life advice..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isTyping && handleSendMessage()}
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button onClick={handleSendMessage} disabled={!currentMessage.trim() || isTyping}>
                    {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Powered by Gemini AI • Your comprehensive learning assistant
                </p>
              </div>
            </Card>

            <div className="text-center">
              <Button onClick={() => setCurrentStep("aptitude")} variant="outline">
                Continue to Assessment
              </Button>
            </div>
          </div>
        )}

        {currentStep === "aptitude" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">🧪 Aptitude & Logic Test</h2>
              <p className="text-muted-foreground">Let's understand your thinking style</p>
            </div>

            <div className="grid gap-6">
              {aptitudeQuestions.map((q, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    <CardDescription>{q.question}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((option, optionIndex) => (
                        <Button
                          key={optionIndex}
                          variant={aptitudeAnswers[index] === optionIndex ? "default" : "outline"}
                          onClick={() => handleAptitudeAnswer(index, optionIndex)}
                          className="justify-start"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={handleSubmitAptitude}
                disabled={aptitudeAnswers.length !== aptitudeQuestions.length}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Submit Aptitude Test
              </Button>
            </div>
          </div>
        )}

        {currentStep === "interests" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">🎧 What Interests You?</h2>
              <p className="text-muted-foreground">Select the topics or activities that excite you</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {interestOptions.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer p-3 text-center justify-center hover:bg-teal-600 hover:text-white transition-colors"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={handleContinueToStudyStyle}
                disabled={selectedInterests.length === 0}
                size="lg"
                className="bg-teal-600 hover:bg-teal-700"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {currentStep === "studyStyle" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">📚 How Do You Learn Best?</h2>
              <p className="text-muted-foreground">Understanding your learning style helps create better guidance</p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Describe your learning preferences</label>
                  <Textarea
                    placeholder="I learn best through visual examples and hands-on practice. I like to see diagrams and try things myself. I also prefer quiet environments and breaking things into steps..."
                    value={studyStyle}
                    onChange={(e) => setStudyStyle(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleGetGuidance}
                  disabled={!studyStyle.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Get Career Guidance
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "guidance" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">🎯 Your Personalized Career Guidance</h2>
              <p className="text-muted-foreground">Based on your responses, here's what your dream mentor suggests</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-purple max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{careerGuidance}</pre>
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <p className="text-lg font-medium">🧠 Was this helpful?</p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => handleFeedback("positive")}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                >
                  <ThumbsUp className="h-5 w-5" />👍 Yes
                </Button>
                <Button
                  onClick={() => handleFeedback("negative")}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  <ThumbsDown className="h-5 w-5" />👎 No
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === "feedback" && (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Thank You for Your Feedback!</h2>
              {feedback === "positive" ? (
                <div className="space-y-2">
                  <p className="text-lg text-teal-600">🎉 We're so glad we could help guide your journey!</p>
                  <p className="text-muted-foreground">
                    Remember, every expert was once a beginner. Keep learning and growing!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg text-amber-600">
                    Thank you for letting us know. We're always working to improve!
                  </p>
                  <p className="text-muted-foreground">
                    Your feedback helps us create better guidance for future students.
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                setCurrentStep("hero")
                setMentorDescription("")
                setStudentName("")
                setAptitudeAnswers([])
                setSelectedInterests([])
                setStudyStyle("")
                setCareerGuidance("")
                setFeedback(null)
                setMentorProfile(null)
                setChatMessages([])
              }}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Start Over
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
