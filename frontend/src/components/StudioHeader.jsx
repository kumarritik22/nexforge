import NexforgeLogo from './NexforgeLogo.jsx';
import {
  ExternalLink,
  Plus,
  RefreshCw,
  ChevronDown,
  Zap,
  Settings,
  Activity,
} from 'lucide-react';

const STATUS_CONFIG = {
  live: {
    label: 'Live',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)',
  },
  provisioning: {
    label: 'Provisioning',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
  },
  idle: {
    label: 'Idle',
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.12)',
    border: 'rgba(107,114,128,0.25)',
  },
  error: {
    label: 'Error',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
  },
};

const StudioHeader = ({
  sandboxId,
  previewUrl,
  sandboxStatus = 'idle',
  onNewSandbox,
  onRestart,
}) => {
  const status = STATUS_CONFIG[sandboxStatus] ?? STATUS_CONFIG.idle;
  const truncatedId = sandboxId
    ? `${sandboxId.slice(0, 8)}...${sandboxId.slice(-4)}`
    : 'No sandbox';

  return (
    <header
      style={{
        height: '56px',
        background: '#0d0d0f',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <NexforgeLogo size={28} showText={true} />

      <div
        style={{
          width: '1px',
          height: '20px',
          background: 'rgba(255,255,255,0.1)',
          margin: '0 4px',
        }}
      />

      {/* Sandbox ID + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        {sandboxId ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'default',
            }}
          >
            <Activity size={11} color="#6b7280" />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: '#a1a1aa',
                letterSpacing: '0.02em',
              }}
            >
              {truncatedId}
            </span>
          </div>
        ) : null}

        {/* Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '20px',
            background: status.bg,
            border: `1px solid ${status.border}`,
          }}
        >
          <span
            className={sandboxStatus === 'live' ? 'animate-pulse-dot' : ''}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: status.color,
              display: 'block',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: status.color,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {sandboxStatus === 'provisioning' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={10} className="animate-spin-slow" />
                {status.label}
              </span>
            ) : (
              status.label
            )}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(34,211,238,0.3)',
              background: 'rgba(34,211,238,0.06)',
              color: '#22d3ee',
              fontSize: '12px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34,211,238,0.12)';
              e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(34,211,238,0.06)';
              e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)';
            }}
          >
            <ExternalLink size={12} />
            Open Preview
          </a>
        )}

        <button
          onClick={onRestart}
          disabled={!sandboxId}
          title="Restart Sandbox"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: sandboxId ? '#a1a1aa' : '#3f3f46',
            cursor: sandboxId ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (sandboxId) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          }}
        >
          <RefreshCw size={13} />
        </button>

        <button
          onClick={onNewSandbox}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: '1px solid rgba(99,102,241,0.4)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 0 12px rgba(99,102,241,0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 12px rgba(99,102,241,0.25)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Plus size={13} />
          New Sandbox
        </button>

        <button
          title="Settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: '#71717a',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#a1a1aa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#71717a';
          }}
        >
          <Settings size={13} />
        </button>
      </div>
    </header>
  );
};

export default StudioHeader;
