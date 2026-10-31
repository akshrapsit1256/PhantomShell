import React, { useState, useRef, useEffect } from 'react';
import GhostMascot from '../components/GhostMascot';
import MarkdownView from '../components/MarkdownView';
import SaveJournalModal from '../components/SaveJournalModal';
import Modal from '../components/Modal';
import { useApp } from '../context/AppContext';
import { api, ApiError } from '../api/client';
import {
  Send,
  Trash2,
  PlusCircle,
  Copy,
  Check,
  Bookmark,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  Loader2,
  Terminal as TerminalIcon,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

const PROGRAMMING_LANGUAGES = [
  'Auto Detect',
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C',
  'C++',
  'C#',
  'Go',
  'Rust',
  'SQL',
  'Bash',
  'PowerShell',
  'HTML',
  'CSS',
  'PHP',
  'Ruby',
  'Kotlin',
  'Swift',
  'Dart',
  'R',
  'Scala',
  'Lua',
  'Perl',
  'MATLAB',
  'Other'
];

const CS_TOPICS = [
  'Auto Detect',
  'Data Structures and Algorithms',
  'Object-Oriented Programming',
  'Database Management Systems',
  'Operating Systems',
  'Computer Networks',
  'Software Engineering',
  'System Design',
  'Distributed Systems',
  'Computer Architecture',
  'Compiler Design',
  'Theory of Computation',
  'Artificial Intelligence',
  'Machine Learning',
  'Web Development',
  'Mobile Development',
  'DevOps',
  'Cybersecurity and secure coding',
  'Cloud Computing',
  'Git and Version Control',
  'Testing and Debugging',
  'General Computer Science',
  'Other'
];

const PROMPT_SUGGESTIONS = [
  'Explain binary search loop invariant with an example.',
  'What is a deadlock and how do operating systems prevent it?',
  'Explain TCP 3-way handshake vs UDP connectionless protocol.',
  'How do Python decorators work behind the scenes?',
  'Explain dependency injection with a clean code example.',
  'Explain how hash maps handle collisions and resizing.',
  'What is the difference between REST and GraphQL?'
];

export default function HauntedTerminal() {
  const { activePersonality, setActivePersonality, addToast } = useApp();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Greetings, mortal developer. I am the ghost inhabiting your terminal.\n\nWhether you need an algorithm dissected, a tricky exception untangled, or a computer science concept explained, speak your query.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Auto Detect');
  const [customLanguage, setCustomLanguage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Auto Detect');
  const [customTopic, setCustomTopic] = useState('');
  const [isSummoning, setIsSummoning] = useState(false);
  const [errorAlert, setErrorAlert] = useState(null);

  // Modals
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [saveModalData, setSaveModalData] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSummoning]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isSummoning) return;

    setErrorAlert(null);
    const effectiveLang = selectedLanguage === 'Other' && customLanguage ? customLanguage : selectedLanguage;
    const effectiveTopic = selectedTopic === 'Other' && customTopic ? customTopic : selectedTopic;

    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString()
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsSummoning(true);

    try {
      // Build history for backend
      const historyPayload = newHistory.slice(-8).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.sendChat({
        message: query,
        language: effectiveLang,
        topic: effectiveTopic,
        personality: activePersonality,
        history: historyPayload
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.response,
          timestamp: new Date().toLocaleTimeString(),
          language: res.language,
          topic: res.topic,
          personality: res.personality,
          model: res.model
        }
      ]);
    } catch (err) {
      let msg = err.message || 'Failed to summon ghost.';
      setErrorAlert({
        title: 'Summoning Disrupted',
        message: msg,
        details: err.details
      });
      addToast({
        title: 'Ollama Communication Error',
        message: msg,
        type: 'error'
      });
    } finally {
      setIsSummoning(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputResize = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const handleCopyMessage = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    addToast({ title: 'Copied', message: 'Response copied to clipboard.', type: 'info', duration: 2000 });
  };

  const handleOpenSaveModal = (msg, index) => {
    // Find preceding user prompt
    let userPrompt = '';
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userPrompt = messages[i].content;
        break;
      }
    }
    setSaveModalData({
      title: userPrompt.slice(0, 60) || 'Haunted Terminal Response',
      entryType: 'chat',
      languageOrSubject: msg.language || selectedLanguage || 'Computer Science',
      originalPrompt: userPrompt || 'General chat query',
      aiResponse: msg.content,
      defaultTags: `${msg.language || 'CS'}, chat, phantomshell`
    });
  };

  const handleClearConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chamber cleansed. The terminal is quiet once more. What mystery shall we investigate next?",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setIsClearModalOpen(false);
    addToast({ title: 'Chamber Cleared', message: 'Conversation history reset.', type: 'info' });
  };

  return (
    <div className="page-wrapper" style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header & Controls */}
      <div className="page-header" style={{ paddingBottom: '12px' }}>
        <div className="page-header-left">
          <GhostMascot size={36} mood="happy" />
          <div className="page-header-titles">
            <h1>Haunted Terminal</h1>
            <p>Converse with the local ghost on programming, algorithms, and system concepts.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleClearConversation()}
            className="btn btn-secondary btn-sm"
            title="Start new conversation"
          >
            <PlusCircle size={14} />
            <span>New Chat</span>
          </button>
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="btn btn-danger btn-sm"
            title="Clear conversation"
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          background: 'var(--bg-charcoal)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-card)'
        }}
      >
        {/* Language Selector */}
        <div>
          <label className="phantom-label" style={{ fontSize: '0.74rem', marginBottom: '3px' }}>
            Programming Language
          </label>
          <select
            className="phantom-select"
            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          {selectedLanguage === 'Other' && (
            <input
              type="text"
              placeholder="Enter language..."
              className="phantom-input"
              style={{ marginTop: '4px', padding: '4px 8px', fontSize: '0.8rem' }}
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
            />
          )}
        </div>

        {/* CS Topic Selector */}
        <div>
          <label className="phantom-label" style={{ fontSize: '0.74rem', marginBottom: '3px' }}>
            CS Subject Area
          </label>
          <select
            className="phantom-select"
            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            {CS_TOPICS.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
          {selectedTopic === 'Other' && (
            <input
              type="text"
              placeholder="Enter subject..."
              className="phantom-input"
              style={{ marginTop: '4px', padding: '4px 8px', fontSize: '0.8rem' }}
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
          )}
        </div>

        {/* Ghost Personality Selector */}
        <div>
          <label className="phantom-label" style={{ fontSize: '0.74rem', marginBottom: '3px' }}>
            Ghost Personality
          </label>
          <select
            className="phantom-select"
            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
            value={activePersonality}
            onChange={(e) => setActivePersonality(e.target.value)}
          >
            <option value="Friendly Ghost">Friendly Ghost (Supportive & Patient)</option>
            <option value="Ancient Phantom">Ancient Phantom (Wise & Cryptic)</option>
            <option value="Sassy Poltergeist">Sassy Poltergeist (Witty & Playful)</option>
          </select>
        </div>
      </div>

      {/* Suggestion Pills (Shown if only welcome message) */}
      {messages.length <= 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {PROMPT_SUGGESTIONS.slice(0, 4).map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="tag-btn"
              style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}
            >
              <Sparkles size={11} style={{ marginRight: '4px' }} />
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Error Alert Box */}
      {errorAlert && (
        <div
          style={{
            background: 'rgba(255, 93, 115, 0.1)',
            border: '1px solid var(--error-red)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}
        >
          <AlertCircle size={18} className="text-error" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '0.84rem' }}>
            <strong style={{ color: 'var(--error-red)' }}>{errorAlert.title}:</strong>{' '}
            <span>{errorAlert.message}</span>
            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--muted-gray)' }}>
              Verify that Ollama is running (`ollama serve`) and the configured model is installed.
            </div>
          </div>
          <button
            onClick={() => setErrorAlert(null)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '2px 6px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Thread Container */}
      <div
        className="phantom-card"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minHeight: '260px'
        }}
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                flexDirection: isUser ? 'row-reverse' : 'row'
              }}
            >
              {/* Avatar: strictly small */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isUser ? 'rgba(101, 231, 255, 0.15)' : 'rgba(169, 112, 255, 0.15)',
                  border: `1px solid ${isUser ? 'rgba(101, 231, 255, 0.3)' : 'rgba(169, 112, 255, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {isUser ? (
                  <User size={16} className="text-cyan" />
                ) : (
                  <GhostMascot size={22} mood="happy" animated={false} glow={false} />
                )}
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.74rem',
                    color: 'var(--muted-gray)',
                    justifyContent: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <span style={{ fontWeight: 600, color: isUser ? 'var(--spectral-cyan)' : 'var(--ghost-purple-light)' }}>
                    {isUser ? 'You' : `PhantomShell (${msg.personality || activePersonality})`}
                  </span>
                  <span>{msg.timestamp}</span>
                  {msg.model && (
                    <span className="pill pill-ghost" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                      {msg.model}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    background: isUser ? '#1a1f33' : 'var(--bg-charcoal)',
                    border: `1px solid ${isUser ? 'rgba(101, 231, 255, 0.2)' : 'var(--border-card)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    boxShadow: 'var(--shadow-sm)',
                    color: 'var(--moonlight-white)'
                  }}
                >
                  {isUser ? (
                    <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)', fontSize: '0.92rem' }}>
                      {msg.content}
                    </div>
                  ) : (
                    <MarkdownView content={msg.content} />
                  )}
                </div>

                {/* Assistant Message Actions */}
                {!isUser && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <button
                      onClick={() => handleCopyMessage(msg.content, index)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check size={12} className="text-toxic" />
                          <span className="text-toxic">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenSaveModal(msg, index)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                    >
                      <Bookmark size={12} />
                      <span>Save to Journal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Summoning Loading Indicator */}
        {isSummoning && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <GhostMascot size={28} mood="happy" animated glow />
            <div
              style={{
                background: 'var(--bg-charcoal)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: 'var(--ghost-purple-light)'
              }}
            >
              <Loader2 size={16} className="animate-spin text-ghost" />
              <span>Summoning the ghost from local Ollama...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <div
        style={{
          background: 'var(--bg-charcoal)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <textarea
            ref={textareaRef}
            className="phantom-textarea"
            style={{
              minHeight: '44px',
              maxHeight: '180px',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              fontSize: '0.92rem'
            }}
            placeholder="Ask about an algorithm, debug a stack trace, or explore system design... (Enter to send, Shift+Enter for newline)"
            value={input}
            onChange={handleInputResize}
            onKeyDown={handleKeyDown}
            disabled={isSummoning}
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isSummoning}
            className="btn btn-primary"
            style={{ height: '40px', padding: '0 16px', flexShrink: 0 }}
          >
            {isSummoning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>Summon</span>
                <Send size={14} />
              </>
            )}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted-dark)', padding: '0 4px' }}>
          <span>Enter to send · Shift+Enter for newline</span>
          <span>Ghost: {activePersonality} · Lang: {selectedLanguage}</span>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Banish Conversation History"
      >
        <p style={{ color: 'var(--moonlight-white)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Are you sure you wish to banish the current conversation? This will clear the chat view, but any entries already saved to your Session Journal will remain intact.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setIsClearModalOpen(false)}>
            Keep History
          </button>
          <button className="btn btn-danger" onClick={handleClearConversation}>
            <Trash2 size={14} />
            <span>Confirm Banishment</span>
          </button>
        </div>
      </Modal>

      {/* Save to Journal Modal */}
      {saveModalData && (
        <SaveJournalModal
          isOpen={true}
          onClose={() => setSaveModalData(null)}
          {...saveModalData}
        />
      )}
    </div>
  );
}
