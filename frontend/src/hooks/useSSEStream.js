import { useCallback, useRef } from 'react';

/**
 * useSSEStream - Hook for consuming AI invoke SSE streams
 * Connects to POST http://localhost/api/ai/invoke with ReadableStream parsing
 */
export function useSSEStream() {
  const abortControllerRef = useRef(null);

  const startStream = useCallback(async ({ message, projectId, onChunk, onDone, onError }) => {
    // Abort any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/ai/invoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ message, projectId }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              onDone?.();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              onChunk?.(parsed);
            } catch {
              // Raw text chunk
              onChunk?.({ type: 'text', content: data });
            }
          }
        }
      }

      onDone?.();
    } catch (err) {
      if (err.name === 'AbortError') return;
      onError?.(err);
    }
  }, []);

  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  return { startStream, stopStream };
}

export default useSSEStream;
