import React, { useState, useEffect, useMemo } from 'react';
import { X, Code, FileText, Check, Sparkles, Terminal } from 'lucide-react';
import { CODE_SNIPPETS, DEFAULT_CUSTOM_TEXT } from '../constants/codeSnippets';

export function CustomTextModal({
  isOpen,
  onClose,
  customText,
  onApplyCustomText
}) {
  const [activeTab, setActiveTab] = useState('snippets'); // 'snippets' | 'custom'
  const [selectedSnippetId, setSelectedSnippetId] = useState(CODE_SNIPPETS[0].id);
  const [rawText, setRawText] = useState(customText || DEFAULT_CUSTOM_TEXT);
  const [prevCustomText, setPrevCustomText] = useState(customText);

  if (customText !== prevCustomText) {
    setPrevCustomText(customText);
    setRawText(customText || DEFAULT_CUSTOM_TEXT);
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeSnippet = useMemo(() => {
    return CODE_SNIPPETS.find(s => s.id === selectedSnippetId) || CODE_SNIPPETS[0];
  }, [selectedSnippetId]);

  const currentWordsCount = useMemo(() => {
    const textToCount = activeTab === 'snippets' ? activeSnippet.text : rawText;
    return textToCount.trim().split(/\s+/).filter(Boolean).length;
  }, [activeTab, activeSnippet, rawText]);

  const currentCharCount = useMemo(() => {
    const textToCount = activeTab === 'snippets' ? activeSnippet.text : rawText;
    return textToCount.length;
  }, [activeTab, activeSnippet, rawText]);

  if (!isOpen) return null;

  const handleApply = () => {
    const finalContent = activeTab === 'snippets' ? activeSnippet.text : rawText;
    const trimmed = finalContent.trim();
    if (!trimmed) return;
    onApplyCustomText(trimmed);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      {/* Dimming Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(18, 15, 12, 0.65)',
          transform: 'translateZ(0)',
          animation: 'fadeIn 0.26s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />

      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '88vh',
          backgroundColor: 'var(--surface)',
          borderRadius: '20px',
          border: '1.5px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)'
              }}
            >
              <Code size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Custom Text & Code Snippets
              </h2>
              <p style={{ fontSize: '11.5px', color: 'var(--text-sub)', margin: 0 }}>
                Practice real code or paste your own custom passage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="action-btn"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-sub)'
            }}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            padding: '12px 24px 0 24px',
            gap: '8px',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <button
            onClick={() => setActiveTab('snippets')}
            className={`pill-btn ${activeTab === 'snippets' ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              borderRadius: '8px 8px 0 0',
              borderBottom: activeTab === 'snippets' ? '2px solid var(--accent)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Terminal size={14} />
            <span>Code Snippets</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pill-btn ${activeTab === 'custom' ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              borderRadius: '8px 8px 0 0',
              borderBottom: activeTab === 'custom' ? '2px solid var(--accent)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={14} />
            <span>Custom Text / Paste</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === 'snippets' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                {CODE_SNIPPETS.map((snippet) => {
                  const isSelected = selectedSnippetId === snippet.id;
                  return (
                    <button
                      key={snippet.id}
                      onClick={() => setSelectedSnippetId(snippet.id)}
                      className="pill-btn"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        backgroundColor: isSelected ? 'rgba(var(--accent-rgb, 184, 120, 65), 0.1)' : 'var(--bg)',
                        color: isSelected ? 'var(--accent)' : 'var(--text-main)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>
                          {snippet.name}
                        </span>
                        {isSelected && <Check size={13} color="var(--accent)" />}
                      </div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                        {snippet.lang}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Code Preview Box */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
                    Snippet Preview
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                    {currentWordsCount} words • {currentCharCount} chars
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12.5px',
                    lineHeight: '1.6',
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '160px',
                    overflowY: 'auto'
                  }}
                >
                  {activeSnippet.text}
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
                  Paste or Write Custom Passage
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setRawText(DEFAULT_CUSTOM_TEXT)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={11} />
                    <span>Sample Cozy Text</span>
                  </button>
                  <span style={{ fontSize: '11px', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                    {currentWordsCount} words • {currentCharCount} chars
                  </span>
                </div>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste code, poem, lyrics, or custom text to type..."
                rows={7}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: 'var(--text-main)',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '130px'
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.02)'
          }}
        >
          <span style={{ fontSize: '11.5px', color: 'var(--text-sub)' }}>
            Press <kbd className="kbd" style={{ fontSize: '10px' }}>Esc</kbd> to cancel
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onClose}
              className="action-btn"
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-sub)',
                fontSize: '12.5px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleApply}
              className="action-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(var(--accent-rgb, 184, 120, 65), 0.3)'
              }}
            >
              <Check size={14} />
              <span>Apply & Start</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
