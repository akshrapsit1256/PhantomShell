import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { Bookmark, ShieldAlert, Check, Loader2 } from 'lucide-react';

export default function SaveJournalModal({
  isOpen,
  onClose,
  initialTitle = '',
  entryType = 'chat',
  languageOrSubject = 'General',
  originalPrompt = '',
  aiResponse = '',
  defaultTags = ''
}) {
  const { addToast } = useApp();
  const [title, setTitle] = useState(initialTitle);
  const [type, setType] = useState(entryType);
  const [lang, setLang] = useState(languageOrSubject);
  const [tags, setTags] = useState(defaultTags);
  const [isSaving, setIsSaving] = useState(false);
  const [secretWarnings, setSecretWarnings] = useState([]);
  const [isCheckingSecrets, setIsCheckingSecrets] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle || `${entryType.toUpperCase()}: ${new Date().toLocaleTimeString()}`);
      setType(entryType);
      setLang(languageOrSubject || 'General');
      setTags(defaultTags);
      setSecretWarnings([]);

      // Auto-scan for secrets before user saves
      const combinedText = `${originalPrompt}\n${aiResponse}`;
      setIsCheckingSecrets(true);
      api.checkSecrets(combinedText)
        .then((res) => {
          if (res.has_potential_secrets) {
            setSecretWarnings(res.findings || []);
          }
        })
        .catch(() => {})
        .finally(() => setIsCheckingSecrets(false));
    }
  }, [isOpen, initialTitle, entryType, languageOrSubject, defaultTags, originalPrompt, aiResponse]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast({ title: 'Validation Error', message: 'Please enter a title for the journal entry.', type: 'warning' });
      return;
    }

    setIsSaving(true);
    try {
      await api.createJournalEntry({
        title: title.trim(),
        entry_type: type,
        language_or_subject: lang.trim(),
        original_prompt: originalPrompt,
        ai_response: aiResponse,
        tags: tags.trim()
      });

      addToast({
        title: 'Archived in Journal',
        message: `"${title}" has been saved locally to SQLite.`,
        type: 'success'
      });
      onClose();
    } catch (err) {
      addToast({
        title: 'Save Failed',
        message: err.message || 'Could not save entry to SQLite database.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save to Session Journal">
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {secretWarnings.length > 0 && (
          <div
            style={{
              background: 'rgba(255, 93, 115, 0.1)',
              border: '1px solid var(--error-red)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}
          >
            <ShieldAlert size={18} className="text-error" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--error-red)' }}>Security Notice: Sensitive Data Detected</div>
              <p style={{ margin: '4px 0 0', color: 'var(--moonlight-white)' }}>
                Found potential secrets: <strong>{secretWarnings.join(', ')}</strong>. Ensure no production credentials or personal tokens are saved to local history.
              </p>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="phantom-label">Entry Title</label>
          <input
            type="text"
            className="phantom-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Binary Search Loop Invariant Explanation"
            required
            maxLength={200}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="phantom-label">Entry Type</label>
            <select
              className="phantom-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="chat">Haunted Terminal Chat</option>
              <option value="error">Error Exorcism</option>
              <option value="command">Command Oracle</option>
              <option value="code">Code Crypt Analysis</option>
            </select>
          </div>

          <div className="form-group">
            <label className="phantom-label">Language / Subject</label>
            <input
              type="text"
              className="phantom-input"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              placeholder="e.g. Python or System Design"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="phantom-label">Tags (comma-separated)</label>
          <input
            type="text"
            className="phantom-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. algorithm, recursion, leetcode"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Bookmark size={15} />
                Save Entry
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
