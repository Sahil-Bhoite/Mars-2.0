import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, MessageSquare, Globe, Server } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function ChatArea({ sessionId, messages, onNewMessage, uploadedFiles }) {
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedModel, setSelectedModel] = useState('gemini')
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput('')
        setIsLoading(true)

        onNewMessage({
            role: 'user',
            content: userMessage
        })

        try {
            const response = await axios.post(`${API_URL}/chat`, {
                message: userMessage,
                session_id: sessionId || 'default',
                model: selectedModel
            })

            onNewMessage({
                role: 'assistant',
                content: response.data.response,
                sources: response.data.sources,
                model: response.data.model
            })
        } catch (err) {
            onNewMessage({
                role: 'assistant',
                content: `Error: ${err.response?.data?.detail || 'Failed to get response.'}`,
                isError: true
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
        }
    }

    useEffect(() => {
        adjustTextareaHeight()
    }, [input])

    return (
        <main className="chat-area">
            <header className="chat-header">
                <div className="chat-header-top">
                    <div>
                        <h1 className="chat-header-title">Chat with your Documents</h1>
                        <p className="chat-header-subtitle">
                            {uploadedFiles.length > 0
                                ? `${uploadedFiles.length} document${uploadedFiles.length > 1 ? 's' : ''} loaded`
                                : 'Upload documents to get started'}
                        </p>
                    </div>
                    <div className="model-selector">
                        <button
                            className={`model-btn ${selectedModel === 'gemini' ? 'active' : ''}`}
                            onClick={() => setSelectedModel('gemini')}
                            title="Gemini 3 Flash (Online)"
                        >
                            <Globe size={16} />
                            Gemini
                        </button>
                        <button
                            className={`model-btn ${selectedModel === 'ollama' ? 'active' : ''}`}
                            onClick={() => setSelectedModel('ollama')}
                            title="Llama 3.2:3B (Local via Ollama)"
                        >
                            <Server size={16} />
                            Llama
                        </button>
                    </div>
                </div>
            </header>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <MessageSquare size={64} className="empty-state-icon" />
                        <h2 className="empty-state-title">Welcome to M.A.R.S</h2>
                        <p className="empty-state-text">
                            Upload your documents using the sidebar, then ask questions about them.
                            The AI will find and synthesize relevant information from your files.
                        </p>
                        <div className="model-info">
                            <p><Globe size={14} /> <strong>Gemini 3 Flash</strong> - Online (Google AI)</p>
                            <p><Server size={14} /> <strong>Llama 3.2:3B</strong> - Local (Ollama)</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className={`message ${message.role}`}>
                            <div className="message-content">
                                {message.role === 'assistant' ? (
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                ) : (
                                    message.content
                                )}
                            </div>
                            {message.sources && message.sources.length > 0 && (
                                <div className="message-sources">
                                    <div className="message-sources-title">Sources:</div>
                                    {message.sources.map((source, i) => (
                                        <span key={i} style={{ marginRight: '0.5rem' }}>
                                            {source}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {message.model && (
                                <div className="message-model">
                                    {message.model === 'ollama' ? <Server size={12} /> : <Globe size={12} />}
                                    {message.model === 'ollama' ? 'Llama 3.2' : 'Gemini'}
                                </div>
                            )}
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="message assistant">
                        <div className="message-content" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Loader2 size={16} className="processing-spinner" />
                            Thinking with {selectedModel === 'ollama' ? 'Llama 3.2' : 'Gemini'}...
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-container" onSubmit={handleSubmit}>
                <div className="chat-input-wrapper">
                    <textarea
                        ref={textareaRef}
                        className="chat-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about your documents..."
                        rows={1}
                    />
                    <button
                        type="submit"
                        className="chat-send-btn"
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="processing-spinner" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
            </form>
        </main>
    )
}

export default ChatArea
