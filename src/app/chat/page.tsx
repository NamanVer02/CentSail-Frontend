'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { FiSend, FiBarChart2, FiRefreshCw } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { chatService } from '@/lib/services/chatService'
import { auth } from '@/lib/config/firebase'
import { toast } from '@/lib/utils/toast'
import ReactMarkdown from 'react-markdown'
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'
import Header from '@/app/components/Header'

type ChatMessage = {
  id: number
  text: string
  timestamp: string
  sender: 'me' | 'bot'
}

const STORAGE_KEY = 'centsail_chat_history_v1'
const MAX_STORAGE_BYTES = 100 * 1024 // ~100KB
const MAX_HISTORY_TURNS = 20

const ChatPage = () => {
    const silkSettings = useSilkSettings()
    const router = useRouter();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const suggestionChips = [
      'Spending summary',
      'Largest transaction?',
      'Show recent subscriptions',
    ];

    const trimMessages = useCallback((msgs: ChatMessage[]) => {
      const encoder = new TextEncoder()
      let trimmed = [...msgs]
      while (trimmed.length > 0) {
        const size = encoder.encode(JSON.stringify(trimmed.map(({ id, text, timestamp, sender }) => ({ id, text, timestamp, sender })))).length
        if (size <= MAX_STORAGE_BYTES) break
        trimmed = trimmed.slice(1)
      }
      return trimmed
    }, [])

    useEffect(() => {
      if (typeof window === 'undefined') return
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as ChatMessage[]
          if (Array.isArray(parsed) && parsed.length) {
            setMessages(trimMessages(parsed))
          }
        }
      } catch (error) {
        console.error('Failed to load chat history from storage', error)
      }
    }, [trimMessages])

    useEffect(() => {
      if (typeof window === 'undefined') return
      try {
        const trimmed = trimMessages(messages)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
      } catch (error) {
        console.error('Failed to persist chat history', error)
      }
    }, [messages, trimMessages])

    const scrollToBottom = () => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
      scrollToBottom()
    }, [messages]);

    const handleResetChat = () => {
      setMessages([]);
      setInputValue('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    const handleSendMessage = async () => {
      if (inputValue.trim() === '') return;

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const newMessage: ChatMessage = {
        id: Date.now(),
        text: inputValue,
        timestamp,
        sender: 'me'
      };

      const historyForRequest = messages
        .filter(m => m.sender === 'me' || m.sender === 'bot')
        .slice(-MAX_HISTORY_TURNS)
        .map(m => ({
          role: m.sender === 'me' ? 'USER' : 'ASSISTANT',
          content: m.text
        }))

      setMessages(prev => trimMessages([...prev, newMessage]));
      setInputValue('');

      // Show loader while waiting for the API response
      setIsLoading(true);

      try {
        // Ensure user is signed in for token
        const user = auth.currentUser
        if (!user) {
          throw new Error('not authenticated')
        }
        const res = await chatService.query({ question: newMessage.text, history: historyForRequest })
        if (!res.success) {
          const errorText = res.message || 'Sorry, I could not process that.'
          toast.error(errorText)
          const botResponse: ChatMessage = {
            id: Date.now() + 1,
            text: errorText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: 'bot'
          }
          setMessages(prev => trimMessages([...prev, botResponse]))
          return
        }
        const answer = res.answer ? res.answer : 'Sorry, I could not process that.'
        const botResponse: ChatMessage = {
          id: Date.now() + 1,
          text: answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'bot'
        }
        setMessages(prev => trimMessages([...prev, botResponse]))
      } catch (err) {
        const fallback = err instanceof Error ? err.message : 'Authentication required. Please log in again.'
        toast.error(fallback)
        const errorMsg: ChatMessage = {
          id: Date.now() + 1,
          text: fallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'bot'
        }
        setMessages(prev => trimMessages([...prev, errorMsg]))
      } finally {
        setIsLoading(false);
      }
    };


    return (
        <div className="h-screen w-full text-white flex flex-col relative">
            {/* Silk Background */}
            <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
                <Silk
                    speed={silkSettings.speed}
                    scale={silkSettings.scale}
                    color={silkSettings.color}
                    noiseIntensity={silkSettings.noiseIntensity}
                    rotation={silkSettings.rotation}
                />
            </div>

            <Header
              title="Centi"
              rightAction={
                messages.length > 0 ? (
                  <button 
                    onClick={handleResetChat} 
                    className="text-xl p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="New chat"
                  >
                    <FiRefreshCw />
                  </button>
                ) : (
                  <div className="w-10 h-10"></div>
                )
              }
            />

            {/* Chat messages */}
            <div className="flex-1 max-w-md mx-auto w-full px-4 overflow-y-auto relative z-10">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center px-4">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 border-2 border-white/20">
                        <FiBarChart2 className="text-2xl text-white/60" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
                      <p className="text-white/60 text-sm">Ask me about your finances, spending, or transactions.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-6">
                      {messages.map((message) => (
                          <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                             {message.sender === 'bot' && (
                                <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center border-2 border-white/30 text-lg">
                                  <FiBarChart2/>
                                </div>
                              )}
                              <div className={`p-3 rounded-2xl max-w-xs ${message.sender === 'me' ? 'bg-white/20 rounded-br-none' : 'bg-white/5 rounded-bl-none'}`}>
                                 {message.sender === 'bot' ? (
                                   <div className="text-sm prose prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-white">
                                     <ReactMarkdown>{message.text}</ReactMarkdown>
                                   </div>
                                 ) : (
                                   <p className="text-sm">{message.text}</p>
                                 )}
                                  <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-right' : 'text-left'} text-white/50`}>{message.timestamp}</p>
                              </div>
                          </div>
                      ))}
                      {isLoading && (
                        <div className="flex items-center gap-2 justify-start">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center border-2 border-white/30 text-lg">
                            <FiBarChart2/>
                          </div>
                          <div className="p-3 rounded-2xl max-w-xs bg-white/5 rounded-bl-none">
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-white/60 animate-bounce"></span>
                              <span className="inline-block w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0.15s]"></span>
                              <span className="inline-block w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0.3s]"></span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                  </div>
                )}
            </div>


            {/* Message Input */}
            <div className="bg-black/20 backdrop-blur-md pb-24 relative z-10">
              <div className="max-w-md mx-auto p-4">
                {/* Suggestion Chips */}
                <div className="flex gap-2 mb-3 justify-start overflow-x-auto pb-2 no-scrollbar">
                  {suggestionChips.map((suggestion, index) => (
                    <button 
                      key={index} 
                      onClick={() => setInputValue(suggestion)}
                      className="text-xs bg-white/10 whitespace-nowrap py-2 px-4 rounded-full hover:bg-white/20 transition-colors"
                     >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="flex items-center">
                    <input
                        type="text"
                        placeholder="Ask Centi..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-white/10 border-none rounded-full py-3 px-5 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 outline-none mr-2"
                    />
                    <button onClick={handleSendMessage} className="text-2xl p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0">
                      <FiSend />
                    </button>
                </div>
              </div>
            </div>
            <style jsx>{`
              .no-scrollbar::-webkit-scrollbar {
                  display: none;
              }
              .no-scrollbar {
                  -ms-overflow-style: none; 
                  scrollbar-width: none; 
              }
            `}</style>
        </div>
    )
}

export default ChatPage
