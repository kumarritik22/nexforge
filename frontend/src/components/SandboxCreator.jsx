import { useState, useCallback } from 'react';
import NexforgeLogo from './NexforgeLogo.jsx';
import { Plus, Zap, Globe, Box, Layers, MoreHorizontal, ExternalLink, Trash2, Loader2 } from 'lucide-react';

const TEMPLATES = [
  { id: 'react', label: 'React', color: '#22d3ee', description: 'Vite + React 19' },
  { id: 'nextjs', label: 'Next.js', color: '#fafafa', description: 'App Router + TailwindCSS' },
  { id: 'vue', label: 'Vue', color: '#10b981', description: 'Vue 3 + Vite' },
  { id: 'vanilla', label: 'Vanilla JS', color: '#f59e0b', description: 'Plain HTML/JS/CSS' },
  { id: 'svelte', label: 'SvelteKit', color: '#ef4444', description: 'SvelteKit + Vite' },
];

const STATUS_CONFIG = {
  live: { color: '#10b981', label: 'Live', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  idle: { color: '#6b7280', label: 'Idle', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.25)' },
  error: { color: '#ef4444', label: 'Error', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  provisioning: { color: '#f59e0b', label: 'Provisioning', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
};

const SandboxCreator = ({ onLaunchSandbox, recentSandboxes = [], onOpenStudio, sandboxStatus }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('react');
  const launching = sandboxStatus === 'provisioning';

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* Top Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <NexforgeLogo size={30} showText={true} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          {['Dashboard', 'Docs', 'Settings'].map((item) => (
            <button
              key={item}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#71717a',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fafafa';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#71717a';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '60px 32px 40px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
            marginBottom: '24px',
          }}
        >
          <Zap size={11} color="#818cf8" />
          <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 500 }}>
            AI-Powered Sandbox Platform
          </span>
        </div>

        <h1
          style={{
            fontSize: '42px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            margin: '0 0 12px',
            background: 'linear-gradient(135deg, #fafafa 30%, #71717a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
          }}
        >
          Your AI-Powered<br />Dev Sandbox
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: '#71717a',
            maxWidth: '480px',
            lineHeight: '1.6',
            margin: '0 0 48px',
          }}
        >
          Spin up isolated sandbox environments. Build, iterate, and deploy with AI assistance in seconds.
        </p>

        {/* Launch Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '28px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e4e4e7', marginBottom: '16px', textAlign: 'left' }}>
            Start New Sandbox
          </h2>

          {/* Template Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            {TEMPLATES.map(({ id, label, color, description }) => {
              const isSelected = selectedTemplate === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedTemplate(id)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: isSelected ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? `${color}12` : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isSelected ? `0 0 12px ${color}20` : 'none',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? color : '#a1a1aa' }}>
                    {label}
                  </span>
                  <span style={{ fontSize: '9px', color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>
                    {description.split('+')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Launch Button */}
          <button
            onClick={onLaunchSandbox}
            disabled={launching}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              border: '1px solid rgba(99,102,241,0.4)',
              background: launching
                ? 'rgba(99,102,241,0.2)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: launching ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: launching ? 'none' : '0 0 20px rgba(99,102,241,0.35), 0 4px 20px rgba(0,0,0,0.3)',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              if (!launching) {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.5), 0 8px 30px rgba(0,0,0,0.4)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.35), 0 4px 20px rgba(0,0,0,0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {launching ? (
              <>
                <Loader2 size={16} className="animate-spin-slow" />
                Provisioning sandbox environment...
              </>
            ) : (
              <>
                <Zap size={16} />
                Launch Sandbox
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Sandboxes */}
      {recentSandboxes.length > 0 && (
        <div style={{ padding: '0 32px 48px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h3
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            Recent Sandboxes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentSandboxes.map((sb) => {
              const st = STATUS_CONFIG[sb.status] ?? STATUS_CONFIG.idle;
              return (
                <div
                  key={sb.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box size={16} color="#52525b" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontFamily: "'JetBrains Mono', monospace",
                          color: '#a1a1aa',
                        }}
                      >
                        {sb.id}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '1px 7px',
                          borderRadius: '20px',
                          background: st.bg,
                          border: `1px solid ${st.border}`,
                        }}
                      >
                        <span
                          className={sb.status === 'live' ? 'animate-pulse-dot' : ''}
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: st.color,
                          }}
                        />
                        <span style={{ fontSize: '10px', color: st.color, fontWeight: 500 }}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#52525b' }}>{sb.template ?? 'React'} • {sb.createdAt}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => onOpenStudio(sb)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(99,102,241,0.3)',
                        background: 'rgba(99,102,241,0.08)',
                        color: '#818cf8',
                        fontSize: '11px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Open Studio
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SandboxCreator;
