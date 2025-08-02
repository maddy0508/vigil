"use client"

import { aiChatbot, AIChatbotOutput } from "@/ai/flows/ai-chatbot"
import { Bot, Send, User } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface AiChatbotProps {
  userName: string;
}

export function AiChatbot({ userName }: AiChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Hello ${userName}! How can I help you with your system's security today?` }
  ]);
  const [input, setInput] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, inProgress]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || inProgress) return;
  
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setInProgress(true);
  
    try {
      const result: AIChatbotOutput = await aiChatbot({ query: input, userName });
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
       const errorMessage: Message = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
        setInProgress(false);
    }
  };

  return (
    <div className="flex flex-col h-[220px] -m-6 bg-card rounded-lg">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 border border-primary">
                  <AvatarFallback><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                </Avatar>
              )}
              <div className={cn("rounded-lg px-3 py-2 text-sm max-w-[85%]", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {inProgress && (
             <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 border border-primary">
                <AvatarFallback><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-3 py-2 text-sm bg-muted flex items-center space-x-1">
                <Skeleton className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <Skeleton className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <Skeleton className="h-2 w-2 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-card rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about system security..."
            className="flex-1"
            disabled={inProgress}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={inProgress || !input.trim()}>
            <Send className="w-4 h-4" />
            <span className="sr-only">Send Message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
