import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import './index.css'

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [messages, setMessages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilesUploaded = (newFiles, newSessionId) => {
    setUploadedFiles(prev => [...prev, ...newFiles])
    if (newSessionId && !sessionId) {
      setSessionId(newSessionId)
    }
  }

  const handleFileRemoved = (filename) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== filename))
  }

  const handleClearSession = () => {
    setSessionId(null)
    setUploadedFiles([])
    setMessages([])
  }

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message])
  }

  return (
    <div className="app">
      <Sidebar
        uploadedFiles={uploadedFiles}
        onFilesUploaded={handleFilesUploaded}
        onFileRemoved={handleFileRemoved}
        onClearSession={handleClearSession}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        sessionId={sessionId}
        setSessionId={setSessionId}
      />
      <ChatArea
        sessionId={sessionId}
        messages={messages}
        onNewMessage={handleNewMessage}
        uploadedFiles={uploadedFiles}
      />
    </div>
  )
}

export default App
