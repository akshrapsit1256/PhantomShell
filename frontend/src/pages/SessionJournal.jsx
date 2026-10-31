import React, { useState, useEffect, useCallback } from 'react';
import GhostMascot from '../components/GhostMascot';
import MarkdownView from '../components/MarkdownView';
import Modal from '../components/Modal';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  BookOpen,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  Calendar,
  Tag,
  Clock,
  Terminal,
  Flame,
  Cpu,
  Code2,
  ExternalLink,
  ShieldAlert,
  Loader2,
  X
} from 'lucide-react';

export default function SessionJournal() {
  const { addToast } = useApp();
  const [entries, setEntries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Detail Modal & Delete Confirmation
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listJournal({
        search: searchQuery.trim() || undefined,
        entry_type: selectedType === 'all' ? undefined : selectedType,
        limit: 100
      });
      setEntries(data.entries || []);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      addToast({
        title: 'Archives Inaccessible',
        message: err.message || 'Could not load journal entries from SQLite.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, addToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEntries();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchEntries]);

  const handleDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteJournalEntry(entryToDelete.id);
      addToast({
        title: 'Entry Banished',
        message: `"${entryToDelete.title}" was purged from local history.`,
        type: 'info'
      });
      if (selectedEntry?.id === entryToDelete.id) {
        setSelectedEntry(null);
      }
      setEntryToDelete(null);
      fetchEntries();
    } catch (err) {
      addToast({
        title: 'Banishment Failed',
        message: err.message || 'Could not delete entry from SQLite.',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = (entry) => {
    const text = `TITLE: ${entry.title}\nTYPE: ${entry.entry_type}\nLANGUAGE: ${entry.language_or_subject}\nDATE: ${entry.created_at}\n\n=== PROMPT ===\n${entry.original_prompt}\n\n=== AI RESPONSE ===\n${entry.ai_response}`;
    navigator.clipboard.writeText(text);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({ title: 'Copied', message: 'Full entry copied to clipboard.', type: 'info' });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'chat': return <Terminal size={14} className="text-ghost" />;
      case 'error': return <Flame size={14} className="text-error" />;
      case 'command': return <Cpu size={14} className="text-cyan" />;
      case 'code': return <Code2 size={14} className="text-toxic" />;
      default: return <BookOpen size={14} className="text-ghost" />;
    }
  };

  const getTypePill = (type) => {
    switch (type) {
      case 'chat': return <span className="pill pill-ghost">Chat</span>;
      case 'error': return <span className="pill pill-error">Error</span>;
      case 'command': return <span className="pill pill-cyan">Command</span>;
      case 'code': return <span className="pill pill-toxic">Code Crypt</span>;
      default: return <span className="pill pill-muted">{type}</span>;
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <GhostMascot size={36} mood="wise" />
          <div className="page-header-titles">
            <h1>Session Journal</h1>
            <p>Persistent local SQLite archive of debugging sessions, code analyses, and command breakdowns.</p>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--muted-gray)' }}>
          Total Inscriptions: <strong style={{ color: 'var(--moonlight-white)' }}>{totalCount}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          background: 'var(--bg-charcoal)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-card)'
        }}
      >
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-gray)' }} />
          <input
            type="text"
            className="phantom-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search entries by title, prompt, response, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Type Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Inscriptions' },
            { id: 'chat', label: 'Chat' },
            { id: 'error', label: 'Errors' },
            { id: 'command', label: 'Commands' },
            { id: 'code', label: 'Code Crypt' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`tag-btn ${selectedType === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List or Empty State */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted-gray)', fontSize: '0.9rem' }}>
          <Loader2 size={24} className="animate-spin text-ghost" style={{ margin: '0 auto 12px' }} />
          <div>Consulting local SQLite archives...</div>
        </div>
      ) : entries.length === 0 ? (
        /* Empty State with strictly 72px mascot (within 64-96px limit) */
        <div
          className="phantom-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <GhostMascot size={72} mood="sleeping" />
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--moonlight-white)' }}>
              No Entries Found in the Tomb
            </h3>
            <p style={{ maxWidth: '440px', margin: '6px auto 16px', fontSize: '0.86rem', color: 'var(--muted-gray)' }}>
              {searchQuery || selectedType !== 'all'
                ? 'No inscribed entries matched your current search filters. Try clearing your search query.'
                : 'Your Session Journal is currently empty. While using Haunted Terminal, Error Exorcist, or Code Crypt, click "Save to Journal" to preserve insights here.'}
            </p>
            {(searchQuery || selectedType !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedType('all'); }}
                className="btn btn-secondary btn-sm"
              >
                Clear Search Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="phantom-card phantom-card-interactive"
              onClick={() => setSelectedEntry(entry)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getTypeIcon(entry.entry_type)}
                    {getTypePill(entry.entry_type)}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} />
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1rem',
                    color: 'var(--moonlight-white)',
                    marginBottom: '6px',
                    lineHeight: '1.4'
                  }}
                >
                  {entry.title}
                </h3>

                <div style={{ fontSize: '0.8rem', color: 'var(--muted-gray)', marginBottom: '8px' }}>
                  Subject: <strong style={{ color: 'var(--spectral-cyan)' }}>{entry.language_or_subject}</strong>
                </div>

                <div
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--muted-gray)',
                    background: 'var(--bg-midnight)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {entry.original_prompt}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '8px',
                  fontSize: '0.74rem',
                  color: 'var(--muted-gray)'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                  {entry.tags ? `Tags: ${entry.tags}` : 'No tags'}
                </span>

                <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleCopy(entry)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '3px 6px' }}
                    title="Copy full entry"
                  >
                    {copiedId === entry.id ? <Check size={13} className="text-toxic" /> : <Copy size={13} />}
                  </button>
                  <button
                    onClick={() => setEntryToDelete(entry)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '3px 6px' }}
                    title="Delete entry"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEntry(null)}
          title={selectedEntry.title}
          maxWidth="750px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Meta Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getTypePill(selectedEntry.entry_type)}
                <span className="pill pill-cyan">{selectedEntry.language_or_subject}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted-gray)' }}>
                  Inscribed: {new Date(selectedEntry.created_at).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleCopy(selectedEntry)}
                  className="btn btn-secondary btn-sm"
                >
                  {copiedId === selectedEntry.id ? <Check size={14} className="text-toxic" /> : <Copy size={14} />}
                  <span>{copiedId === selectedEntry.id ? 'Copied' : 'Copy Entry'}</span>
                </button>
                <button
                  onClick={() => setEntryToDelete(selectedEntry)}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Original Input */}
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--muted-gray)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Original Input / Prompt
              </h4>
              <div
                style={{
                  background: 'var(--bg-terminal)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.86rem',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  color: 'var(--spectral-cyan)'
                }}
              >
                {selectedEntry.original_prompt}
              </div>
            </div>

            {/* AI Response */}
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--muted-gray)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                PhantomShell Inscription / Response
              </h4>
              <div
                style={{
                  background: 'var(--bg-charcoal)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  maxHeight: '380px',
                  overflowY: 'auto'
                }}
              >
                <MarkdownView content={selectedEntry.ai_response} />
              </div>
            </div>

            {selectedEntry.tags && (
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-gray)' }}>
                <strong>Tags:</strong> {selectedEntry.tags}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setEntryToDelete(null)}
          title="Banish Journal Entry"
        >
          <p style={{ color: 'var(--moonlight-white)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Are you sure you want to permanently delete <strong>"{entryToDelete.title}"</strong> from your local SQLite database? This cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setEntryToDelete(null)} disabled={isDeleting}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              <span>Delete Permanently</span>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
