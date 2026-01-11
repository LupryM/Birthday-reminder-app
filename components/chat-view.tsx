"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Send } from "lucide-react"
import { AvatarRing } from "@/components/avatar-ring"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

interface ChatViewProps {
  currentUserId: string
  friend: {
    id: string
    name: string
    avatar: string
  }
  onBack: () => void
}

export function ChatView({ currentUserId, friend, onBack }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Get or create conversation
  useEffect(() => {
    async function initConversation() {
      // Try to find existing conversation
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1.eq.${currentUserId},participant_2.eq.${friend.id}),and(participant_1.eq.${friend.id},participant_2.eq.${currentUserId})`,
        )
        .single()

      if (existing) {
        setConversationId(existing.id)
      } else {
        // Create new conversation
        const { data: newConvo } = await supabase
          .from("conversations")
          .insert({
            participant_1: currentUserId,
            participant_2: friend.id,
          })
          .select("id")
          .single()

        if (newConvo) {
          setConversationId(newConvo.id)
        }
      }
      setLoading(false)
    }

    initConversation()
  }, [currentUserId, friend.id, supabase])

  // Load messages when conversation is set
  useEffect(() => {
    if (!conversationId) return

    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (data) setMessages(data)
    }

    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId) return

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    })

    if (!error) {
      setNewMessage("")
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-xl">
        <button onClick={onBack} className="text-primary p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <AvatarRing src={friend.avatar} alt={friend.name} size="sm" />
        <span className="font-semibold text-foreground">{friend.name}</span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AvatarRing src={friend.avatar} alt={friend.name} size="lg" showRing />
            <p className="mt-4 text-foreground font-medium">Start a conversation with {friend.name}</p>
            <p className="text-muted-foreground text-sm">Say hello!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            return (
              <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] px-4 py-2.5 rounded-2xl",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card text-foreground rounded-bl-md",
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={cn("text-[10px] mt-1", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-11 bg-card border-border rounded-full text-foreground placeholder:text-muted-foreground px-4"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            size="icon"
            className="w-11 h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
