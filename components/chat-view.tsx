"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { AvatarRing } from "@/components/avatar-ring";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatViewProps {
  currentUserId: string;
  friend: {
    id: string;
    name: string;
    avatar: string;
  };
  onBack: () => void;
}

export function ChatView({ currentUserId, friend, onBack }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Get or create conversation
  useEffect(() => {
    async function initConversation() {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1.eq.${currentUserId},participant_2.eq.${friend.id}),and(participant_1.eq.${friend.id},participant_2.eq.${currentUserId})`
        )
        .single();

      if (existing) {
        setConversationId(existing.id);
      } else {
        const { data: newConvo } = await supabase
          .from("conversations")
          .insert({
            participant_1: currentUserId,
            participant_2: friend.id,
          })
          .select("id")
          .single();

        if (newConvo) {
          setConversationId(newConvo.id);
        }
      }
      setLoading(false);
    }

    initConversation();
  }, [currentUserId, friend.id, supabase]);

  // Load messages when conversation is set
  useEffect(() => {
    if (!conversationId) return;

    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    }

    loadMessages();

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
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId || sending) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });

    if (!error) {
      setNewMessage("");
    }
    setSending(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/95 backdrop-blur-xl safe-area-top">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <AvatarRing
          src={friend.avatar}
          alt={friend.name}
          size="sm"
          showRing={false}
        />
        <div className="flex-1">
          <span className="font-semibold text-foreground">{friend.name}</span>
          <p className="text-xs text-muted-foreground">Tap to view profile</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth-container custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-6"
          >
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mb-4">
              <AvatarRing
                src={friend.avatar}
                alt={friend.name}
                size="lg"
                showRing
              />
            </div>
            <p className="text-foreground font-semibold text-lg">
              Start chatting with {friend.name}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Send a message to get started
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId;
              const showAvatar =
                !isOwn &&
                (index === 0 ||
                  messages[index - 1].sender_id !== message.sender_id);

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  {!isOwn && (
                    <div className="w-8 shrink-0">
                      {showAvatar && (
                        <AvatarRing
                          src={friend.avatar}
                          alt={friend.name}
                          size="sm"
                          showRing={false}
                        />
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] px-4 py-3 rounded-2xl",
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card text-foreground rounded-bl-md border border-border"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1.5 text-right",
                        isOwn
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-card safe-area-bottom">
        <div className="flex items-center gap-3">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-12 bg-secondary border-0 rounded-full text-foreground placeholder:text-muted-foreground px-5"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
