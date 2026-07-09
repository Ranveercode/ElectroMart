import { useState, useRef, useEffect } from "react";

const AIChatWidget = ({ currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: `Hi ${currentUser?.firstName || "there"}! I'm your AI Shopping Assistant. How can I help you today?` }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: "user", content: input };
        const newMessages = [...messages, userMessage];
        
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ messages: newMessages })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages([...newMessages, { role: "assistant", content: data.message }]);
            } else {
                setMessages([...newMessages, { role: "assistant", content: "Sorry, I'm having trouble connecting to my brain right now." }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages([...newMessages, { role: "assistant", content: "Oops, something went wrong." }]);
        } finally {
            setLoading(false);
        }
    };

    const chatStyle = `
        .ai-chat-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1a1a2e;
            color: white;
            border: none;
            padding: 15px 25px;
            border-radius: 30px;
            font-size: 1.1rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            transition: transform 0.2s;
        }
        .ai-chat-toggle:hover {
            transform: scale(1.05);
        }
        .ai-chat-window {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            z-index: 1000;
            overflow: hidden;
            border: 1px solid #eee;
        }
        .ai-chat-header {
            background: #1a1a2e;
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .ai-chat-header h3 {
            margin: 0;
            font-size: 1.1rem;
        }
        .ai-chat-header button {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }
        .ai-chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #f9f9f9;
        }
        .ai-message {
            display: flex;
        }
        .ai-message.user {
            justify-content: flex-end;
        }
        .ai-message-bubble {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 0.95rem;
            line-height: 1.4;
        }
        .ai-message.user .ai-message-bubble {
            background: #007bff;
            color: white;
            border-bottom-right-radius: 2px;
        }
        .ai-message.assistant .ai-message-bubble {
            background: #e9ecef;
            color: #333;
            border-bottom-left-radius: 2px;
        }
        .loading {
            font-style: italic;
            color: #666;
        }
        .ai-chat-input {
            display: flex;
            padding: 10px;
            background: white;
            border-top: 1px solid #eee;
        }
        .ai-chat-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
        }
        .ai-chat-input button {
            background: #1a1a2e;
            color: white;
            border: none;
            padding: 0 15px;
            margin-left: 10px;
            border-radius: 20px;
            cursor: pointer;
        }
        .ai-chat-input button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
    `;

    if (!isOpen) {
        return (
            <>
                <style>{chatStyle}</style>
                <button 
                    className="ai-chat-toggle"
                    onClick={() => setIsOpen(true)}
                >
                    ✨ Chat
                </button>
            </>
        );
    }

    return (
        <div className="ai-chat-window">
            <div className="ai-chat-header">
                <h3>✨ AI Assistant</h3>
                <button onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            <div className="ai-chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`ai-message ${msg.role}`}>
                        <div className="ai-message-bubble">
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="ai-message assistant">
                        <div className="ai-message-bubble loading">...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="ai-chat-input">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me to find products or add to cart..."
                    disabled={loading}
                />
                <button type="submit" disabled={!input.trim() || loading}>Send</button>
            </form>

            <style>{`
                .ai-chat-toggle {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #1a1a2e;
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 30px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    z-index: 1000;
                    transition: transform 0.2s;
                }
                .ai-chat-toggle:hover {
                    transform: scale(1.05);
                }
                .ai-chat-window {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 5px 25px rgba(0,0,0,0.2);
                    display: flex;
                    flex-direction: column;
                    z-index: 1000;
                    overflow: hidden;
                    border: 1px solid #eee;
                }
                .ai-chat-header {
                    background: #1a1a2e;
                    color: white;
                    padding: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .ai-chat-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                }
                .ai-chat-header button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                }
                .ai-chat-messages {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    background: #f9f9f9;
                }
                .ai-message {
                    display: flex;
                }
                .ai-message.user {
                    justify-content: flex-end;
                }
                .ai-message-bubble {
                    max-width: 80%;
                    padding: 10px 15px;
                    border-radius: 15px;
                    font-size: 0.95rem;
                    line-height: 1.4;
                }
                .ai-message.user .ai-message-bubble {
                    background: #007bff;
                    color: white;
                    border-bottom-right-radius: 2px;
                }
                .ai-message.assistant .ai-message-bubble {
                    background: #e9ecef;
                    color: #333;
                    border-bottom-left-radius: 2px;
                }
                .loading {
                    font-style: italic;
                    color: #666;
                }
                .ai-chat-input {
                    display: flex;
                    padding: 10px;
                    background: white;
                    border-top: 1px solid #eee;
                }
                .ai-chat-input input {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 20px;
                    outline: none;
                }
                .ai-chat-input button {
                    background: #1a1a2e;
                    color: white;
                    border: none;
                    padding: 0 15px;
                    margin-left: 10px;
                    border-radius: 20px;
                    cursor: pointer;
                }
                .ai-chat-input button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default AIChatWidget;
