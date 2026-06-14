import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, Sparkles, History } from 'lucide-react';

const AICopilot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial Proactive Recommendation (Feature 9 & 11)
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setIsTyping(true);
            setTimeout(() => {
                setMessages([
                    {
                        id: 1,
                        sender: 'ai',
                        type: 'proactive',
                        text: "Hi! I'm your XenoReach Copilot. I've analyzed our system telemetry.",
                        memoryContext: "Last month, WhatsApp win-back campaigns had a 42% higher conversion rate than Email for 'High Risk' cohorts.",
                        recommendation: "I suggest we isolate the High Risk targets identified in the dashboard and deploy a WhatsApp discount sequence. Shall I draft it?"
                    }
                ]);
                setIsTyping(false);
            }, 1000);
        }
    }, [isOpen, messages.length]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userText = inputText;
        const newMsg = { id: Date.now(), sender: 'user', text: userText };
        
        // Use functional state update to ensure we have the latest messages array
        setMessages(prev => {
            const updatedMessages = [...prev, newMsg];
            
            // Fire off the API call immediately with the updated array
            (async () => {
                setIsTyping(true);
                setInputText('');
                try {
                    // 🔥 UPDATED: Now passing the 'history' to the backend
                    const res = await axios.post('https://crm-native-ai-1.onrender.com/api/ai/chat', { 
                        message: userText,
                        history: updatedMessages 
                    });

                    setMessages(current => [...current, {
                        id: Date.now() + 1,
                        sender: 'ai',
                        type: 'standard',
                        text: res.data.reply
                    }]);
                } catch (error) {
                    console.error("AI Consultant offline", error);
                    setMessages(current => [...current, {
                        id: Date.now() + 1,
                        sender: 'ai',
                        type: 'standard',
                        text: "I'm having trouble connecting to the strategy database. Please check my connection."
                    }]);
                } finally {
                    setIsTyping(false);
                }
            })();

            return updatedMessages;
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 h-[500px] flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot size={20} className="text-blue-300" />
                            <h3 className="font-bold">XenoReach Copilot</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'ai' ? (
                                    <div className="max-w-[85%]">
                                        {msg.type === 'proactive' ? (
                                            <div className="bg-white border border-blue-100 rounded-xl p-3 shadow-sm space-y-3">
                                                <p className="text-sm text-gray-800">{msg.text}</p>
                                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 mb-1">
                                                        <History size={12} /> System Memory
                                                    </span>
                                                    <p className="text-xs text-slate-600 italic">"{msg.memoryContext}"</p>
                                                </div>
                                                <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                                                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-500 mb-1">
                                                        <Sparkles size={12} /> Recommended Action
                                                    </span>
                                                    <p className="text-xs text-blue-800 font-medium">{msg.recommendation}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm text-sm text-gray-800">
                                                {msg.text}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-blue-600 text-white rounded-xl p-3 shadow-sm text-sm max-w-[80%]">
                                        {msg.text}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ask the AI Consultant..." 
                            className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-sm outline-none"
                        />
                        <button type="submit" disabled={!inputText.trim() || isTyping} className="bg-blue-600 text-white p-2 rounded-lg">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl">
                    <MessageSquare size={24} />
                </button>
            )}
        </div>
    );
};

export default AICopilot;
