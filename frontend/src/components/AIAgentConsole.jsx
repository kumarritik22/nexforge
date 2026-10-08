import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Bot,
  User,
  Loader2,
  FileSearch,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Code2,
  Layout,
  Smartphone,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Tool badge config
const TOOL_BADGES = {
  listing: {
    icon: FileSearch,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    label: 'Listing files',
  },
  reading: {
    icon: FileText,
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.1)',
    border: 'rgba(34,211,238,0.25)',
    label: 'Reading files',
  },
  updating: {
    icon: Code2,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
    border: 'rgba(168,85,247,0.25)',
    label: 'Updating files',
  },
  success: {
    icon: CheckCircle2,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    label: 'Files updated successfully',
  },
  error: {
    icon: AlertCircle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
    label: 'Error',
  },
};

const QUICK_PROMPTS = [
  { label: '⚡ Build Landing Page', value: 'Build a modern landing page with hero section, features grid, and CTA' },
  { label: '🌙 Add Dark Mode', value: 'Add a dark/light mode toggle with smooth CSS transitions' },
  { label: '📱 Fix Mobile Nav', value: 'Fix the mobile navigation responsiveness and add a hamburger menu' },
  { label: '✨ Add Animations', value: 'Add smooth scroll animations and micro-interactions using CSS transitions' },
];

// Get badge type from tool step text
function getToolBadgeType(content) {
  const c = content?.toLowerCase() ?? '';
  if (c.includes('listing') || c.includes('list')) return 'listing';
  if (c.includes('reading') || c.includes('read')) return 'reading';
  if (c.includes('updating') || c.includes('update') || c.includes('writing')) return 'updating';
  if (c.includes('success') || c.includes('updated successfully') || c.includes('created')) return 'success';
  if (c.includes('error') || c.includes('failed')) return 'error';
  return 'listing';
}

// Individual tool step badge
const ToolBadge = ({ content, active = false }) => {
  const type = getToolBadgeType(content);
  const cfg = TOOL_BADGES[type];
  const Icon = cfg.icon;

  return (
    <div
      className="animate-slide-up"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '6px 10px',
        borderRadius: '8px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        marginBottom: '4px',
        maxWidth: '90%',
      }}
    >
      {active ? (
        <Loader2 size={12} color={cfg.color} className="animate-spin-slow" />
      ) : (
        <Icon size={12} color={cfg.color} />
      )}
      <span
        style={{
          fontSize: '12px',
          color: cfg.color,
          fontWeight: 500,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.01em',
        }}
      >
        {content || cfg.label}
      </span>
    </div>
  );
};

// Markdown renderer with syntax highlighting
const MarkdownContent = ({ content }) => (
  <ReactMarkdown
    components={{
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            customStyle={{
              borderRadius: '8px',
              fontSize: '12px',
              margin: '8px 0',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#0d0d0f',
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              background: 'rgba(255,255,255,0.06)',
              padding: '2px 5px',
              borderRadius: '4px',
              color: '#22d3ee',
            }}
            {...props}
          >
            {children}
          </code>
        );
      },
      p({ children }) {
        return (
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', lineHeight: '1.6', color: '#e4e4e7' }}>
            {children}
          </p>
        );
      },
      h1({ children }) {
        return <h1 style={{ fontSize: '15px', fontWeight: 700, color: '#fafafa', margin: '12px 0 6px' }}>{children}</h1>;
      },
      h2({ children }) {
        return <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#fafafa', margin: '10px 0 5px' }}>{children}</h2>;
      },
      h3({ children }) {
        return <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#e4e4e7', margin: '8px 0 4px' }}>{children}</h3>;
      },
      ul({ children }) {
        return <ul style={{ margin: '4px 0', paddingLeft: '16px', color: '#e4e4e7' }}>{children}</ul>;
      },
      li({ children }) {
        return <li style={{ fontSize: '13px', margin: '2px 0', lineHeight: '1.5' }}>{children}</li>;
      },
    }}
  >
    {content}
  </ReactMarkdown>
);

// Single message bubble
const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const isAgent = message.role === 'agent';
  const isTool = message.role === 'tool';

  if (isTool) {
    return (
      <div style={{ padding: '2px 0' }}>
        <ToolBadge content={message.content} active={message.streaming} />
      </div>
    );
  }

  if (isAgent && message.streaming && !message.content) {
    // Thinking animation
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '120px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#a855f7',
              display: 'block',
              animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="animate-slide-up"
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: '8px',
        alignItems: 'flex-start',
        padding: '2px 0',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: isUser
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            : 'linear-gradient(135deg, #1e1e24, #2a2a35)',
          border: isUser ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {isUser ? <User size={13} color="#fff" /> : <Bot size={13} color="#a855f7" />}
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: '80%',
          padding: '10px 13px',
          borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
          background: isUser
            ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))'
            : 'rgba(255,255,255,0.04)',
          border: isUser
            ? '1px solid rgba(99,102,241,0.3)'
            : '1px solid rgba(255,255,255,0.08)',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#e4e4e7',
        }}
      >
        {isAgent ? (
          <MarkdownContent content={message.content} />
        ) : (
          <span>{message.content}</span>
        )}
        {message.streaming && message.content && (
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '14px',
              background: '#a855f7',
              marginLeft: '2px',
              borderRadius: '1px',
              animation: 'pulse-dot 0.8s ease-in-out infinite',
            }}
          />
        )}
      </div>
    </div>
  );
};

const AIAgentConsole = ({ sandboxId, messages, streaming, onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() || disabled || streaming) return;
    onSendMessage(input.trim());
    setInput('');
  }, [input, disabled, streaming, onSendMessage]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleQuickPrompt = useCallback(
    (value) => {
      if (disabled || streaming) return;
      onSendMessage(value);
    },
    [disabled, streaming, onSendMessage]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#111113',
        overflow: 'hidden',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(99,102,241,0.3))',
            border: '1px solid rgba(168,85,247,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={11} color="#a855f7" />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fafafa' }}>AI Agent</span>
        {streaming && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: 'auto',
              padding: '2px 7px',
              borderRadius: '20px',
              background: 'rgba(168,85,247,0.12)',
              border: '1px solid rgba(168,85,247,0.25)',
            }}
          >
            <span
              className="animate-pulse-dot"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#a855f7',
              }}
            />
            <span style={{ fontSize: '10px', color: '#a855f7', fontWeight: 500 }}>Thinking</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              opacity: 0.6,
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(168,85,247,0.1)',
                border: '1px solid rgba(168,85,247,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={22} color="#a855f7" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '4px' }}>
                Nexforge AI is ready
              </p>
              <p style={{ color: '#52525b', fontSize: '12px' }}>
                {sandboxId ? 'Describe what you want to build' : 'Start a sandbox to begin'}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div
        style={{
          padding: '8px 16px 0',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            onClick={() => handleQuickPrompt(qp.value)}
            disabled={disabled || streaming || !sandboxId}
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: disabled || !sandboxId ? '#3f3f46' : '#a1a1aa',
              fontSize: '11px',
              cursor: disabled || !sandboxId ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!disabled && sandboxId) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#fafafa';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = disabled || !sandboxId ? '#3f3f46' : '#a1a1aa';
            }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '12px 16px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${input ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.1)'}`,
            transition: 'border-color 0.15s ease',
            boxShadow: input ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              !sandboxId
                ? 'Start a sandbox first...'
                : streaming
                ? 'AI is thinking...'
                : 'Ask Nexforge AI... (⌘↵ to send)'
            }
            disabled={!sandboxId || streaming}
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: '#fafafa',
              fontSize: '13px',
              fontFamily: "'Inter', sans-serif",
              lineHeight: '1.5',
              minHeight: '20px',
              maxHeight: '120px',
              overflow: 'auto',
              cursor: !sandboxId ? 'not-allowed' : 'text',
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !sandboxId || streaming}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              border: 'none',
              background:
                input.trim() && sandboxId && !streaming
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255,255,255,0.06)',
              color: input.trim() && sandboxId && !streaming ? '#fff' : '#3f3f46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && sandboxId && !streaming ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
              flexShrink: 0,
              alignSelf: 'flex-end',
            }}
          >
            {streaming ? <Loader2 size={13} className="animate-spin-slow" /> : <Send size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAgentConsole;
