"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChat } from "@ai-sdk/react"
import { Send, Plus, Menu, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function ChatInterface() {
  const [isDark, setIsDark] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const { toast } = useToast()

  const { messages, input, setInput, handleSubmit, status, setMessages } = useChat({
    api: "/api/chat",
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [isDark])

  const triggerHaptic = (style: "light" | "medium" | "heavy" = "light") => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      const patterns = { light: 10, medium: 20, heavy: 30 }
      navigator.vibrate(patterns[style])
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleClearChat = () => {
    setMessages([])
    triggerHaptic("heavy")
    toast({ title: "Chat cleared", description: "Starting a new conversation" })
  }

  // Swipe logic for clearing chat
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    if (touchStart - touchEnd > 100) handleClearChat()
  }

  return (
    <div
      className="flex flex-col h-screen bg-background safe-top safe-bottom"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-card border-b border-border backdrop-blur-lg bg-opacity-95">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">AI Chat</h1>
        <Button variant="ghost" size="icon" onClick={handleClearChat}>
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex w-full animate-in fade-in slide-in-from-bottom-2",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border",
              )}
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border p-4 safe-bottom">
        <div className="absolute bottom-20 left-4">
          <Button variant="outline" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full shadow-lg">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message"
            className="min-h-[44px] max-h-32 rounded-3xl bg-input px-4 py-3"
          />
          <Button type="submit" size="icon" className="h-11 w-11 rounded-full">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
