"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, MessageCircle, X } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

// ============================================================================
// HARDCODE SCRIPTED RESPONSES HERE
// Add your question->answer pairs below.
// The bot will look for keywords in the user's input or do an exact match.
// ============================================================================
const SCRIPTED_RESPONSES: Record<string, string> = {
  "hello": "Hi there! How can I help you with ChroniSync today?",
  "how are you": "I'm just a scripted bot, but I'm doing great! How are you?",
  "appointment": "You have a cardiologist appointment scheduled for next Tuesday.",
  "medication": "Your current medication is Lisinopril 10mg once daily. Do you need a refill?",
  "default": "I'm a demo bot. I don't understand that yet. Please add more scripted responses!"
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate network delay and bot response
    setTimeout(() => {
      let botResponseContent = SCRIPTED_RESPONSES["default"] || "I'm a demo bot. Please ask something else.";
      
      // Simple matching logic: find a key that is included in the user's message
      const lowerInput = userMessage.content.toLowerCase();
      for (const [key, response] of Object.entries(SCRIPTED_RESPONSES)) {
        if (key !== "default" && lowerInput.includes(key.toLowerCase())) {
          botResponseContent = response;
          break;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: botResponseContent,
      };
      
      setMessages((prev) => [...prev, botMessage]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-4 animate-in slide-in-from-bottom-5">
          <CardHeader className="border-b px-4 py-3 bg-muted/30 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              ChroniSync AI
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      {msg.role === "bot" ? (
                        <>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarFallback className="bg-muted">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm border border-border/50"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t bg-muted/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2 items-center"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full focus-visible:ring-1 bg-background"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="rounded-full shrink-0 shadow-md transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-2xl hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}

