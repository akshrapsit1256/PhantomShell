import React, { useState, useEffect } from 'react';
import GhostMascot from '../components/GhostMascot';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  Settings as SettingsIcon,
  Server,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Save,
  Check,
  Eye,
  Sliders,
  HelpCircle,
  Loader2
} from 'lucide-react';

export default function Settings() {
  const {
    settings,
    setSettings,
    refreshSettings,
    health,
    refreshHealth,
    isHealthLoading,
    activePersonality,
    setActivePersonality,
    addToast
  } = useApp();

  const [baseUrl, setBaseUrl] = useState(settings.ollama_base_url || 'http://localhost:11434');
  const [model, setModel] = useState(settings.ollama_model || 'gemma2:2b');
  const [personality, setPersonality] = useState(settings.personality || 'Friendly Ghost');
  const [reducedMotion, setReducedMotion] = useState(settings.reduced_motion || false);
  const [halloweenTheme, setHalloweenTheme] = useState(settings.halloween_theme ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setBaseUrl(settings.ollama_base_url || 'http://localhost:11434');
    setModel(settings.ollama_model || 'gemma2:2b');
    setPersonality(settings.personality || 'Friendly Ghost');
    setReducedMotion(settings.reduced_motion || false);
    setHalloweenTheme(settings.halloween_theme ?? true);
  }, [settings]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await api.testOllamaConnection({
        ollama_base_url: baseUrl.trim(),
        ollama_model: model.trim()
      });
      setTestResult(res);
      if (res.connected && res.model_found) {
        addToast({ title: 'Ghost Awakened!', message: res.status_message, type: 'success' });
      } else {
        addToast({ title: 'Diagnostic Notice', message: res.status_message, type: 'warning' });
      }
    } catch (err) {
      setTestResult({
        connected: false,
        status_message: err.message || 'Cannot reach configured Ollama address.',
        available_models: [],
        model_found: false,
        suggested_action: 'Ensure Ollama is running (`ollama serve`) and the host/port are reachable.'
      });
      addToast({ title: 'Connection Test Failed', message: err.message, type: 'error' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const updated = await api.updateSettings({
        ollama_base_url: baseUrl.trim(),
        ollama_model: model.trim(),
        personality,
        reduced_motion: reducedMotion,
        halloween_theme: halloweenTheme
      });

      setSettings(updated);
      setActivePersonality(updated.personality);

      // Apply runtime classes
      if (updated.reduced_motion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
      if (!updated.halloween_theme) {
        document.documentElement.classList.add('classic-theme');
      } else {
        document.documentElement.classList.remove('classic-theme');
      }

      refreshHealth();
      addToast({ title: 'Settings Saved', message: 'Preferences updated and persisted to SQLite.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Update Failed', message: err.message || 'Could not save settings.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <GhostMascot size={36} mood="happy" />
          <div className="page-header-titles">
            <h1>Sanctum Settings</h1>
            <p>Configure local Ollama connection, AI model selection, accessibility, and privacy controls.</p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="btn btn-primary btn-sm"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>Save Changes</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Local AI Configuration */}
        <section className="phantom-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} className="text-cyan" />
            <span>Local Ollama Configuration</span>
          </h2>

          <div className="form-group">
            <label className="phantom-label">Ollama Base URL</label>
            <input
              type="text"
              className="phantom-input text-mono"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:11434"
              required
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--muted-gray)' }}>
              Standard local Ollama daemon default: <code>http://localhost:11434</code>
            </span>
          </div>

          <div className="form-group">
            <label className="phantom-label">AI Model Identifier</label>
            <input
              type="text"
              className="phantom-input text-mono"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gemma2:2b"
              required
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--muted-gray)' }}>
              Currently configured local model (e.g. <code>gemma2:2b</code>)
            </span>
          </div>

          {/* Test Connection Controls */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="btn btn-secondary btn-sm"
            >
              {isTesting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              <span>Test Connection & Model</span>
            </button>
          </div>

          {/* Test Diagnostics Box */}
          {testResult && (
            <div
              style={{
                marginTop: '8px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: testResult.connected && testResult.model_found ? 'rgba(184, 255, 92, 0.08)' : 'rgba(255, 93, 115, 0.08)',
                border: `1px solid ${testResult.connected && testResult.model_found ? 'var(--toxic-green)' : 'var(--error-red)'}`,
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: testResult.connected && testResult.model_found ? 'var(--toxic-green)' : 'var(--error-red)' }}>
                {testResult.connected && testResult.model_found ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{testResult.status_message}</span>
              </div>

              {testResult.available_models?.length > 0 && (
                <div style={{ marginTop: '8px', color: 'var(--moonlight-white)' }}>
                  <strong>Installed models on Ollama:</strong>{' '}
                  <span className="text-mono" style={{ color: 'var(--spectral-cyan)' }}>
                    {testResult.available_models.join(', ')}
                  </span>
                </div>
              )}

              {testResult.suggested_action && (
                <div style={{ marginTop: '6px', color: 'var(--pumpkin-orange)' }}>
                  {testResult.suggested_action}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Appearance & Accessibility */}
        <section className="phantom-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} className="text-ghost" />
            <span>Appearance & Personality</span>
          </h2>

          <div className="form-group">
            <label className="phantom-label">Default Ghost Personality</label>
            <select
              className="phantom-select"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
            >
              <option value="Friendly Ghost">Friendly Ghost (Supportive, Patient, Educational)</option>
              <option value="Ancient Phantom">Ancient Phantom (Cryptic, Wise, Measured)</option>
              <option value="Sassy Poltergeist">Sassy Poltergeist (Witty, Developer Humor, Constructive)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={halloweenTheme}
                onChange={(e) => setHalloweenTheme(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--ghost-purple)', cursor: 'pointer' }}
              />
              <div>
                <strong style={{ color: 'var(--moonlight-white)' }}>Halloween Haunted Styling</strong>
                <div style={{ fontSize: '0.76rem', color: 'var(--muted-gray)' }}>
                  Enables spooky purple ambient glows and spectral aesthetic
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--toxic-green)', cursor: 'pointer' }}
              />
              <div>
                <strong style={{ color: 'var(--moonlight-white)' }}>Reduced Motion & Effects</strong>
                <div style={{ fontSize: '0.76rem', color: 'var(--muted-gray)' }}>
                  Disables floating animations and pulsating spectral effects
                </div>
              </div>
            </label>
          </div>
        </section>
      </div>

      {/* Privacy Principles Banner */}
      <section
        className="phantom-card"
        style={{
          borderLeft: '4px solid var(--ghost-purple)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} className="text-ghost" />
          <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Local Privacy & Responsible AI Principles</h2>
        </div>

        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem', color: 'var(--moonlight-white)' }}>
          <li>
            <strong>100% Local Inference:</strong> Prompts are dispatched exclusively to your locally configured Ollama instance (default: <code>http://localhost:11434</code>).
          </li>
          <li>
            <strong>No Cloud Tracking:</strong> PhantomShell does not send code, questions, or telemetry to external cloud AI providers.
          </li>
          <li>
            <strong>Local SQLite Persistence:</strong> Session journal entries and configuration values are stored entirely on your local machine in an SQLite database.
          </li>
          <li>
            <strong>Zero Command Execution:</strong> PhantomShell will never automatically execute supplied or suggested code, scripts, or terminal commands.
          </li>
          <li>
            <strong>Secret Caution:</strong> Never submit production private keys, database passwords, or secret credentials into any AI prompt.
          </li>
        </ul>
      </section>
    </div>
  );
}
