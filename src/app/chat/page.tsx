'use client'

import { useState, useRef, useEffect } from 'react'
import { FiArrowLeft, FiSend, FiBarChart2 } from "react-icons/fi";
import { useRouter } from "next/navigation";

const ChatPage = () => {
    const router = useRouter();
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm Centi, your personal finance assistant. How can I help you today?",
            timestamp: "10:00 AM",
            sender: "bot"
        },
        {
            id: 2,
            text: "You can ask me things like 'Summarize my spending last week' or 'What was my biggest purchase this month?'",
            timestamp: "10:01 AM",
            sender: "bot",
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const suggestionChips = [
      'Spending summary',
      'Largest transaction?',
      'Show recent subscriptions',
    ];

    const scrollToBottom = () => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
      scrollToBottom()
    }, [messages]);

    const handleSendMessage = () => {
      if (inputValue.trim() === '') return;

      const newMessage = {
        id: messages.length + 1,
        text: inputValue,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'me'
      };

      setMessages([...messages, newMessage]);
      setInputValue('');

      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          text: "I'm processing your request. One moment...",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'bot'
        }
        setMessages(prevMessages => [...prevMessages, botResponse]);
      }, 1000);
    };


    return (
        <div className="h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white flex flex-col">

            {/* Header */}
            <div className="bg-[#0c504a]/80 backdrop-blur-md z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors"><FiArrowLeft /></button>
                    <div className="text-center">
                        <h1 className="text-lg font-semibold">Centi</h1>
                        <p className="text-xs text-white/60">Your Financial Assistant</p>
                    </div>
                    <div className="w-10 h-10"></div>
                </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 max-w-md mx-auto w-full px-4 overflow-y-auto">
                <div className="space-y-4 py-6">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                           {message.sender === 'bot' && (
                              <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center border-2 border-white/30 text-lg">
                                <FiBarChart2/>
                              </div>
                            )}
                            <div className={`p-3 rounded-2xl max-w-xs ${message.sender === 'me' ? 'bg-white/20 rounded-br-none' : 'bg-white/5 rounded-bl-none'}`}>
                                <p className="text-sm">{message.text}</p>
                                <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-right' : 'text-left'} text-white/50`}>{message.timestamp}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </div>


            {/* Message Input */}
            <div className="bg-[#0c504a]/80 backdrop-blur-md">
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
