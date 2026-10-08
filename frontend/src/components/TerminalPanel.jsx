import { useEffect, useRef, useCallback } from 'react';
import { Terminal as TerminalIcon, Wifi, WifiOff } from 'lucide-react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import useTerminalSocket from '../hooks/useTerminalSocket.js';

const XTERM_THEME = {
  background: '#09090b',
  foreground: '#e4e4e7',
  cursor: '#6366f1',
  cursorAccent: '#09090b',
  black: '#09090b',
  red: '#ef4444',
  green: '#10b981',
  yellow: '#f59e0b',
  blue: '#6366f1',
  magenta: '#a855f7',
  cyan: '#22d3ee',
  white: '#e4e4e7',
  brightBlack: '#52525b',
  brightRed: '#f87171',
  brightGreen: '#34d399',
  brightYellow: '#fbbf24',
  brightBlue: '#818cf8',
  brightMagenta: '#c084fc',
  brightCyan: '#67e8f9',
  brightWhite: '#fafafa',
  selectionBackground: 'rgba(99, 102, 241, 0.3)',
};

const TerminalPanel = ({ sandboxId }) => {
  const termRef = useRef(null);
  const terminalInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const handleOutput = useCallback((data) => {
    terminalInstanceRef.current?.write(data);
  }, []);

  const { sendInput, socket } = useTerminalSocket({
    sandboxId,
    onOutput: handleOutput,
    enabled: !!sandboxId,
  });

  // Initialize xterm
  useEffect(() => {
    if (!termRef.current) return;

    const term = new Terminal({
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.5,
      letterSpacing: 0.5,
      theme: XTERM_THEME,
      cursorBlink: true,
      cursorStyle: 'bar',
      allowTransparency: true,
      scrollback: 5000,
      rows: 24,
      cols: 80,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(termRef.current);
    fitAddon.fit();

    terminalInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[38;2;99;102;241m┌──────────────────────────────────────────┐\x1b[0m');
    term.writeln('\x1b[38;2;99;102;241m│\x1b[0m  \x1b[1m\x1b[38;2;250;250;250mNexforge\x1b[0m Terminal  \x1b[38;2;34;211;238m⚡ ready\x1b[0m                \x1b[38;2;99;102;241m│\x1b[0m');
    term.writeln('\x1b[38;2;99;102;241m└──────────────────────────────────────────┘\x1b[0m');
    term.writeln('');

    if (!sandboxId) {
      term.writeln('\x1b[38;2;113;113;122m→ Start a sandbox to connect the terminal\x1b[0m');
    }

    // Handle user input
    term.onData((data) => {
      sendInput(data);
    });

    // Resize observer
    const observer = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch {}
    });

    if (termRef.current.parentElement) {
      observer.observe(termRef.current.parentElement);
    }
    resizeObserverRef.current = observer;

    return () => {
      observer.disconnect();
      term.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When sandboxId changes, re-fit
  useEffect(() => {
    setTimeout(() => {
      try {
        fitAddonRef.current?.fit();
      } catch {}
    }, 100);
  }, [sandboxId]);

  const isConnected = socket.current?.connected ?? false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Terminal Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: '#0d0d0f',
          flexShrink: 0,
        }}
      >
        <TerminalIcon size={13} color="#71717a" />
        <span style={{ fontSize: '12px', color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
          bash
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
          {sandboxId ? (
            <>
              {isConnected ? (
                <Wifi size={11} color="#10b981" />
              ) : (
                <WifiOff size={11} color="#f59e0b" />
              )}
              <span
                style={{
                  fontSize: '10px',
                  color: isConnected ? '#10b981' : '#f59e0b',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {isConnected ? 'connected' : 'connecting...'}
              </span>
            </>
          ) : (
            <>
              <WifiOff size={11} color="#3f3f46" />
              <span style={{ fontSize: '10px', color: '#3f3f46', fontFamily: "'JetBrains Mono', monospace" }}>
                no sandbox
              </span>
            </>
          )}
        </div>
      </div>

      {/* Terminal Container */}
      <div
        ref={termRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '8px',
          background: '#09090b',
        }}
      />
    </div>
  );
};

export default TerminalPanel;
