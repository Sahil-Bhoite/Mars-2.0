import { useState, useCallback, useRef } from 'react'
import { Upload, FileText, X, Loader2, Trash2 } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const FILE_ICONS = {
    pdf: 'PDF',
    docx: 'DOC',
    doc: 'DOC',
    pptx: 'PPT',
    ppt: 'PPT',
    xlsx: 'XLS',
    xls: 'XLS',
    csv: 'CSV',
    txt: 'TXT',
    md: 'MD'
}

function Sidebar({
    uploadedFiles,
    onFilesUploaded,
    onFileRemoved,
    onClearSession,
    isProcessing,
    setIsProcessing,
    sessionId,
    setSessionId
}) {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)
        const files = Array.from(e.dataTransfer.files)
        handleFiles(files)
    }, [])

    const handleFileSelect = useCallback((e) => {
        const files = Array.from(e.target.files)
        handleFiles(files)
    }, [])

    const handleFiles = async (files) => {
        if (files.length === 0) return

        setIsProcessing(true)
        setError(null)

        const formData = new FormData()
        files.forEach(file => formData.append('files', file))

        if (sessionId) {
            formData.append('session_id', sessionId)
        }

        try {
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            const { session_id, processed_files, errors } = response.data

            if (!sessionId) {
                setSessionId(session_id)
            }

            if (processed_files.length > 0) {
                onFilesUploaded(
                    processed_files.map(f => ({
                        name: f.filename,
                        chunks: f.chunks
                    })),
                    session_id
                )
            }

            if (errors && errors.length > 0) {
                setError(`Some files failed: ${errors.map(e => e.filename).join(', ')}`)
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Make sure the backend is running.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleClear = async () => {
        if (sessionId) {
            try {
                await axios.delete(`${API_URL}/session/${sessionId}`)
            } catch (err) {
                console.error('Failed to clear session:', err)
            }
        }
        onClearSession()
    }

    const handleRemoveFile = (filename) => {
        onFileRemoved(filename)
    }

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase()
        return FILE_ICONS[ext] || 'FILE'
    }

    return (
        <aside className="sidebar">
            <header className="sidebar-header">
                <div>
                    <h1 className="sidebar-title">M.A.R.S</h1>
                    <p className="sidebar-subtitle">Agentic RAG System</p>
                </div>
            </header>

            <section className="upload-section">
                <h3 className="upload-title">Documents</h3>

                <div
                    className={`upload-dropzone ${isDragging ? 'active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload size={32} className="upload-icon" />
                    <p className="upload-text">
                        <strong>Drop files</strong> or click to upload
                    </p>
                    <p className="upload-formats">
                        PDF, DOCX, PPTX, Excel, CSV, TXT, Code, HTML, Images
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.txt,.md,.py,.java,.c,.h,.cpp,.js,.ts,.swift,.r,.rs,.sql,.html,.css,.json,.xml,.tex,.jpg,.jpeg,.png,.bmp,.zip,.wav,.mp3,.mp4,.go,.kt,.scala,.php,.rb,.sh"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>

                {isProcessing && (
                    <div className="processing-status">
                        <Loader2 size={16} className="processing-spinner" />
                        Processing documents...
                    </div>
                )}

                {error && (
                    <div className="processing-status" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}>
                        {error}
                    </div>
                )}

                {uploadedFiles.length > 0 && (
                    <div className="file-list">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                                <span className="file-item-icon" style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    background: 'var(--color-accent-primary)',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}>
                                    {getFileIcon(file.name)}
                                </span>
                                <span className="file-item-name" title={file.name}>
                                    {file.name}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    {file.chunks} chunks
                                </span>
                                <button
                                    className="file-item-remove"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemoveFile(file.name)
                                    }}
                                    title="Remove file"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={handleClear}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                marginTop: '0.5rem',
                                transition: 'all var(--transition-fast)'
                            }}
                        >
                            <Trash2 size={14} />
                            Clear all
                        </button>
                    </div>
                )}
            </section>
        </aside>
    )
}

export default Sidebar
