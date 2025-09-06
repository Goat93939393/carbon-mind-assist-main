import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatSectionProps {
  onCreateTaskListFromAI?: (title: string, tasks: string[]) => void;
}

export const ChatSection = ({ onCreateTaskListFromAI }: ChatSectionProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Create a task list about daily productivity habits",
    "Build a study routine for learning programming",
    "Organize my morning routine for better focus",
    "Plan a workout schedule for this week",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "HTTP-Referer": "https://mindnotes.app",
          "X-Title": "Mind Notes",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-chat-v3.1:free",
          "messages": [
            {
              "role": "system",
              "content": "You are a helpful productivity assistant for Mind Notes app. When users ask you to create task lists, respond with a clear title and numbered list of tasks. Keep responses concise and actionable. Focus on helping users organize their thoughts and tasks effectively."
            },
            {
              "role": "user",
              "content": content
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request right now.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Check if the response contains a task list format and extract it
      const taskListMatch = botResponse.match(/(?:Title|List):\s*(.+?)(?:\n|\r\n)(?:Tasks?|Items?):\s*((?:\d+\.\s*.+(?:\n|\r\n)*)+)/i);
      if (taskListMatch) {
        const title = taskListMatch[1].trim();
        const taskText = taskListMatch[2];
        const tasks = taskText.split(/\d+\.\s*/).filter(task => task.trim()).map(task => task.trim());
        
        if (tasks.length > 0) {
          // Auto-create task list if it looks like a structured response
          setTimeout(() => {
            onCreateTaskListFromAI?.(title, tasks);
          }, 1000);
        }
      }

    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex-1 flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">AI CHAT</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Get help organizing your thoughts and tasks
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto mb-6 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              What do you need to organize today?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              I can help you create structured task lists and organize your thoughts
            </p>

            {/* Suggestions */}
            <div className="grid gap-2 max-w-md mx-auto">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-3 rounded-lg bg-secondary border border-border hover:bg-accent transition-colors duration-200 text-sm text-muted-foreground hover:text-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-foreground border border-border'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div className={`p-3 rounded-md text-sm ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground border border-border'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-secondary text-foreground border border-border flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-secondary border border-border p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to create a task list or organize something..."
          className="flex-1 bg-secondary border-border"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};