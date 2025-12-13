"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/lib/hooks/use-user"
import { Sparkles, Send, Loader2, AlertCircle, User, Bot } from "lucide-react"

interface MediaContext {
  type: "movie" | "tv"
  id: number
  title: string
  overview?: string
  genres?: string[]
  cast?: string[]
  releaseDate?: string
  runtime?: string
  voteAverage?: number
}

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AskAIDialogProps {
  mediaContext: MediaContext
  children: React.ReactNode
}

const SUGGESTED_QUESTIONS = {
  movie: [
    "What makes this movie unique?",
    "Is this movie suitable for families?",
    "What are similar movies I might enjoy?",
    "Tell me about the director's style",
  ],
  tv: [
    "What makes this show worth watching?",
    "How many seasons are there?",
    "What are similar shows I might enjoy?",
    "Is this show still ongoing?",
  ],
}

export default function AskAIDialog({
  mediaContext,
  children,
}: AskAIDialogProps) {
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getCurrentUrl = () => {
    const queryString = searchParams.toString()
    return pathname + (queryString ? `?${queryString}` : "")
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleOpenChange = (open: boolean) => {
    if (open && !user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=${encodeURIComponent(getCurrentUrl())}`)
      return
    }

    setIsOpen(open)

    // Reset state when closing
    if (!open) {
      setMessages([])
      setInputValue("")
      setError(null)
    }
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: messageText.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaContext: {
            type: mediaContext.type,
            title: mediaContext.title,
            overview: mediaContext.overview,
            genres: mediaContext.genres,
            cast: mediaContext.cast,
            releaseDate: mediaContext.releaseDate,
            runtime: mediaContext.runtime,
            voteAverage: mediaContext.voteAverage,
          },
          message: messageText.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()

        if (response.status === 401) {
          setError("Please sign in to use Ask AI")
          router.push(`/login?redirect=${encodeURIComponent(getCurrentUrl())}`)
          return
        }

        if (response.status === 429) {
          setError("Rate limit exceeded. Please try again in a moment.")
          return
        }

        throw new Error(data.error || "Failed to get response")
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const suggestedQuestions = SUGGESTED_QUESTIONS[mediaContext.type]

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Ask AI about {mediaContext.title}
          </DialogTitle>
          <DialogDescription>
            Ask questions about this{" "}
            {mediaContext.type === "movie" ? "movie" : "TV show"} and get
            detailed answers.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-[200px] max-h-[300px]">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Try asking one of these questions:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm py-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Input area */}
          <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="min-h-[44px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AskAIDialog }
