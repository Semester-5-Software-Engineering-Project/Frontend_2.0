'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, userType } from '@/contexts/AuthContext'
import { GeminiApi } from '@/apis/GeminiApi'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Bot, Copy, RotateCcw, Send, User, Plus, Edit, Trash2 } from 'lucide-react'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

// Chat turn interface
interface ChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  status?: 'pending' | 'done' | 'error';
  timestamp: Date;
  originalMessage?: string;
}

// Typing indicator component
const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2 text-muted-foreground">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
    </div>
    <span className="text-sm">Thinking...</span>
  </div>
);

// Copy to clipboard helper
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};

// Format timestamp helper
const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function AskAiPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  // Chat state
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<{ base: string; model: string } | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  // Refs
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const userNearBottomRef = useRef(true);

  // Scroll tracking
  const isNearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    const threshold = 80;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  const handleScroll = useCallback(() => {
    userNearBottomRef.current = isNearBottom();
  }, []);

  // Auth and config effects
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    GeminiApi.getConfig().then(setConfig).catch(() => {/* ignore */});
  }, []);

  // Auto-scroll when turns change
  useEffect(() => {
    if (scrollRef.current && userNearBottomRef.current) {
      if (endRef.current?.scrollIntoView) {
        endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [turns, loading]);

  // Clear copy feedback
  useEffect(() => {
    if (copyFeedback) {
      const timer = setTimeout(() => setCopyFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyFeedback]);

  // Send message function
  const send = useCallback(async (retryMessage?: string) => {
    const message = (retryMessage || input).trim();
    if (!message || loading) return;

    setError(null);
    setLoading(true);
    if (!retryMessage) setInput('');

    const timestamp = new Date();
    const userTurn: ChatTurn = {
      id: crypto.randomUUID(),
      role: 'user',
      text: message,
      status: 'done',
      timestamp,
    };

    const modelPlaceholder: ChatTurn = {
      id: crypto.randomUUID(),
      role: 'model',
      text: '',
      status: 'pending',
      timestamp: new Date(),
      originalMessage: message,
    };

    if (!retryMessage) {
      setTurns(prev => [...prev, userTurn, modelPlaceholder]);
    } else {
      setTurns(prev => [...prev, modelPlaceholder]);
    }

    try {
      const res = await GeminiApi.sendMessage(message);
      const responseText = res.text || '(empty response)';
      setTurns(prev => prev.map(t => 
        t.id === modelPlaceholder.id 
          ? { ...t, text: responseText, status: 'done', timestamp: new Date() } 
          : t
      ));
    } catch (e: any) {
      const msg = e?.message || 'Failed to get response';
      setError(msg);
      setTurns(prev => prev.map(t => 
        t.id === modelPlaceholder.id 
          ? { ...t, text: `Error: ${msg}`, status: 'error', timestamp: new Date() } 
          : t
      ));
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [input, loading]);

  // Helper functions
  const retryMessage = useCallback((originalMessage: string) => {
    send(originalMessage);
  }, [send]);

  const handleCopy = useCallback(async (text: string) => {
    const success = await copyToClipboard(text);
    setCopyFeedback(success ? 'Copied!' : 'Failed to copy');
  }, []);

  const clearChat = useCallback(() => {
    setTurns([]);
    setError(null);
    setCopyFeedback(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = '52px';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = Math.min(scrollHeight, 200) + 'px';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  if (user.role !== userType.STUDENT) {
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-muted-foreground">
          <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p>Ask AI is currently available only for students.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header - Yellow theme */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FBBF24] rounded-full flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tutorverse AI</h1>
          </div>
          <div className="flex items-center gap-2">
            {turns.length > 0 && (
              <Button
                onClick={clearChat}
                disabled={loading}
                className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                New chat
              </Button>
            )}
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto"
          >
            {/* Welcome Screen */}
            {turns.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-24 h-24 bg-[#FBBF24] rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Bot className="w-12 h-12 text-black" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  How can I help you today?
                </h2>
                <p className="text-gray-600 mb-8 max-w-md text-lg">
                  I&apos;m your study assistant. Ask me anything about your courses, homework, or academic topics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {[
                    { icon: "💡", title: "Explain concepts", subtitle: "Help me understand photosynthesis" },
                    { icon: "🔢", title: "Solve problems", subtitle: "Walk me through this math equation" },
                    { icon: "📝", title: "Review writing", subtitle: "Check my essay for improvements" },
                    { icon: "📚", title: "Research help", subtitle: "What is machine learning?" }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="p-5 border border-gray-200 rounded-xl hover:border-[#FBBF24] hover:shadow-md bg-white cursor-pointer transition-all"
                      onClick={() => setInput(item.subtitle)}
                    >
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{item.subtitle}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {turns.map(turn => (
              <div
                key={turn.id}
                className={cn(
                  "group relative py-6 px-4",
                  turn.role === 'user' 
                    ? "bg-background" 
                    : "bg-muted/30"
                )}
              >
                {turn.role === 'user' ? (
                  // User message - right aligned with yellow theme
                  <div className="max-w-3xl mx-auto flex gap-4 justify-end">
                    {/* Message Content */}
                    <div className="flex-1 min-w-0 max-w-2xl">
                      <div className="flex items-center gap-2 mb-2 justify-end">
                        <span className="text-xs text-gray-500 font-medium">
                          {formatTimestamp(turn.timestamp)}
                        </span>
                        <span className="font-semibold text-gray-900 text-sm">
                          You
                        </span>
                      </div>
                      
                      <div className="bg-[#FBBF24] text-black rounded-xl px-4 py-3 ml-8 shadow-md">
                        <div className="whitespace-pre-wrap font-medium">{turn.text}</div>
                      </div>

                      {/* Message Actions */}
                      {turn.status === 'done' && turn.text && (
                        <div className="flex items-center gap-2 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(turn.text)}
                            className="text-muted-foreground  h-8"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                ) : (
                  // AI message - left aligned with updated styling
                  <div className="max-w-3xl mx-auto flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          Study Assistant
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {formatTimestamp(turn.timestamp)}
                        </span>
                      </div>
                      
                      <div className="prose prose-sm max-w-none bg-white rounded-xl px-4 py-3 shadow-md border border-gray-200">
                        {turn.status === 'pending' ? (
                          <TypingIndicator />
                        ) : (
                          <MarkdownRenderer content={turn.text} />
                        )}
                      </div>

                      {/* Message Actions */}
                      {turn.status === 'done' && turn.text && (
                        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => handleCopy(turn.text)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-8 px-3 font-semibold"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          {turn.role === 'model' && turn.originalMessage && (
                            <Button
                              onClick={() => retryMessage(turn.originalMessage!)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-8 px-3 font-semibold"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Error State */}
                      {turn.status === 'error' && (
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded font-semibold">
                            Error
                          </span>
                          {turn.originalMessage && (
                            <Button
                              onClick={() => retryMessage(turn.originalMessage!)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 h-8 px-3 font-semibold"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </div>

        {/* Error/Feedback Display */}
        {(error || copyFeedback) && (
          <div className="px-4 py-2">
            <div className={cn(
              "text-sm rounded-xl p-3 max-w-3xl mx-auto font-semibold shadow-md",
              error 
                ? "text-red-700 bg-red-50 border border-red-200"
                : "text-green-700 bg-green-50 border border-green-200"
            )}>
              {error || copyFeedback}
            </div>
          </div>
        )}

        {/* Input Area - Yellow theme */}
        <div className="border-t border-gray-200 bg-white p-6 shadow-lg">
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative flex items-end gap-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDown}
                  placeholder="Message Study Assistant..."
                  disabled={loading}
                  className="min-h-[52px] max-h-[200px] resize-none rounded-xl border-gray-200 bg-white px-4 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBBF24] focus:border-[#FBBF24] text-gray-900 placeholder-gray-400 shadow-sm"
                  rows={1}
                  style={{ 
                    resize: 'none',
                    lineHeight: '1.5',
                    height: '52px'
                  }}
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2 bottom-2 w-9 h-9 p-0 rounded-lg bg-[#FBBF24] hover:bg-[#F59E0B] disabled:bg-gray-200 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                  ) : (
                    <Send className="w-4 h-4 text-black" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-2">
              <p className="text-xs text-gray-500 font-medium">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
