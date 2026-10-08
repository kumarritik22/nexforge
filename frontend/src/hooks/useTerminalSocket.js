import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * useTerminalSocket - Hook for managing Socket.IO connection to sandbox terminal
 * Connects to http://<sandboxId>.agent.localtest.me
 * Emits: 'terminal-input' with keystroke data
 * Listens: 'terminal-output' to write to xterm
 */
export function useTerminalSocket({ sandboxId, onOutput, enabled = true }) {
  const socketRef = useRef(null);
  const sandboxIdRef = useRef(sandboxId);
  sandboxIdRef.current = sandboxId;

  const [isConnected, setIsConnected] = useState(false)

  const sendInput = useCallback((data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('terminal-input', data);
    }
  }, []);

  const connect = useCallback(() => {
    if (!sandboxId || !enabled) return;

    // Cleanup existing
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const host = `http://${sandboxId}.agent.localtest.me`;

    const socket = io(host, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      onOutput?.(`\x1b[32m✓ Connected to sandbox terminal\x1b[0m\r\n`);
    });

    socket.on('terminal-output', (data) => {
      onOutput?.(typeof data === 'string' ? data : data?.data ?? '');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      onOutput?.(`\x1b[33m⚠ Terminal disconnected: ${reason}\x1b[0m\r\n`);
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      onOutput?.(`\x1b[31m✗ Connection error: ${err.message}\x1b[0m\r\n`);
    });

    socketRef.current = socket;
  }, [sandboxId, enabled, onOutput]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { sendInput, connect, disconnect, socket: socketRef, isConnected };
}

export default useTerminalSocket;
