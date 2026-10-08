import { useState, useCallback, useRef } from 'react';
import StudioHeader from './components/StudioHeader.jsx';
import AIAgentConsole from './components/AIAgentConsole.jsx';
import WorkspacePanel from './components/WorkspacePanel.jsx';
import SandboxCreator from './components/SandboxCreator.jsx';
import useSandbox from './hooks/useSandbox.js';
import useSSEStream from './hooks/useSSEStream.js';

// Parse SSE chunk to determine message type
function parseAgentChunk(chunk) {
  if (!chunk) return null;
  const content = chunk.content ?? chunk.text ?? chunk.message ?? '';

  // Detect tool steps
  const lower = content.toLowerCase();
  if (
    lower.includes('listing files') ||
    lower.includes('reading files') ||
    lower.includes('updating files') ||
    lower.includes('files updated') ||
    lower.includes('creating files') ||
    lower.includes('file update') ||
    lower.includes('in the project directory')
  ) {
    return { type: 'tool', content };
  }

  return { type: 'text', content };
}

// Generate a unique message ID
let msgCounter = 0;
const genId = () => `msg_${++msgCounter}_${Date.now()}`;

function App() {
  const [view, setView] = useState('creator'); // 'creator' | 'studio'
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(undefined);
  const [recentSandboxes] = useState([
    // Sample recent sandboxes for demo
    {
      id: 'b2c34567-1234-5678-90ab-cdef01234567',
      status: 'idle',
      template: 'Next.js',
      createdAt: '2 hours ago',
    },
    {
      id: 'e8f9a012-abcd-ef01-2345-678901234567',
      status: 'error',
      template: 'Vue',
      createdAt: '1 day ago',
    },
  ]);

  const {
    sandboxId,
    previewUrl,
    sandboxStatus,
    files,
    loadingFiles,
    error: sandboxError,
    startSandbox,
    listFiles,
    readFile,
  } = useSandbox();

  const { startStream, stopStream } = useSSEStream();
  const agentMsgIdRef = useRef(null);

  // Add a message to history
  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: genId(), ...msg }]);
  }, []);

  // Update last agent message
  const updateLastAgentMsg = useCallback((updater) => {
    setMessages((prev) => {
      const updated = [...prev];
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === 'agent' || updated[i].role === 'tool') {
          updated[i] = { ...updated[i], ...updater(updated[i]) };
          break;
        }
      }
      return updated;
    });
  }, []);

  // Launch a new sandbox
  const handleLaunchSandbox = useCallback(async () => {
    try {
      const data = await startSandbox();
      setView('studio');
      addMessage({
        role: 'agent',
        content: `✅ **Sandbox ready!**\n\nYour sandbox \`${data.sandboxId.slice(0, 8)}...\` is now live.\n\n- **Preview URL:** [Open Preview](${data.previewUrl})\n\nDescribe what you want to build and I'll get started!`,
        streaming: false,
      });
      // Load files automatically
      await listFiles(data.sandboxId);
    } catch (err) {
      addMessage({
        role: 'agent',
        content: `❌ **Failed to start sandbox:** ${err.message}\n\nPlease ensure the backend is running and try again.`,
        streaming: false,
      });
    }
  }, [startSandbox, addMessage, listFiles]);

  // Open an existing sandbox from recents
  const handleOpenStudio = useCallback(
    (sandbox) => {
      setView('studio');
      addMessage({
        role: 'agent',
        content: `🔄 **Opened sandbox** \`${sandbox.id.slice(0, 8)}...\`\n\nWhat would you like to work on?`,
        streaming: false,
      });
    },
    [addMessage]
  );

  // Send AI agent message
  const handleSendMessage = useCallback(
    async (text) => {
      if (!sandboxId || streaming) return;

      // Add user message
      addMessage({ role: 'user', content: text, streaming: false });
      setStreaming(true);

      // Add initial agent thinking bubble
      const agentId = genId();
      agentMsgIdRef.current = agentId;
      setMessages((prev) => [
        ...prev,
        { id: agentId, role: 'agent', content: '', streaming: true },
      ]);

      let accumulatedText = '';

      await startStream({
        message: text,
        projectId: sandboxId,
        onChunk: (chunk) => {
          const parsed = parseAgentChunk(chunk);
          if (!parsed) return;

          if (parsed.type === 'tool') {
            // Add a tool badge message
            setMessages((prev) => [
              ...prev,
              { id: genId(), role: 'tool', content: parsed.content, streaming: false },
            ]);
          } else if (parsed.type === 'text' && parsed.content) {
            // Accumulate text into agent bubble
            accumulatedText += parsed.content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === agentId
                  ? { ...m, content: accumulatedText, streaming: true }
                  : m
              )
            );
          }
        },
        onDone: async () => {
          // Finalize agent message
          setMessages((prev) =>
            prev.map((m) =>
              m.id === agentId ? { ...m, streaming: false } : m
            )
          );
          setStreaming(false);
          // Refresh file list after AI completes work
          await listFiles(sandboxId);
        },
        onError: (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === agentId
                ? {
                    ...m,
                    content: `❌ **Stream error:** ${err.message}`,
                    streaming: false,
                  }
                : m
            )
          );
          setStreaming(false);
        },
      });
    },
    [sandboxId, streaming, addMessage, startStream, listFiles]
  );

  // Handle file selection in explorer
  const handleSelectFile = useCallback(
    async (filePath) => {
      if (!sandboxId) return;
      setSelectedFile(filePath);
      setFileContent(null); // Show skeleton

      const content = await readFile(filePath);
      setFileContent(content ?? '');
    },
    [sandboxId, readFile]
  );

  // Refresh files
  const handleRefreshFiles = useCallback(() => {
    if (sandboxId) listFiles(sandboxId);
  }, [sandboxId, listFiles]);

  // ── CREATOR VIEW ──────────────────────────────────────────
  if (view === 'creator') {
    return (
      <div style={{ height: '100vh', overflow: 'auto', background: '#09090b' }}>
        <SandboxCreator
          onLaunchSandbox={handleLaunchSandbox}
          recentSandboxes={recentSandboxes}
          onOpenStudio={handleOpenStudio}
          sandboxStatus={sandboxStatus}
        />
      </div>
    );
  }

  // ── STUDIO VIEW ───────────────────────────────────────────
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#09090b',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <StudioHeader
        sandboxId={sandboxId}
        previewUrl={previewUrl}
        sandboxStatus={sandboxStatus}
        onNewSandbox={() => setView('creator')}
        onRestart={handleLaunchSandbox}
      />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Left: AI Console */}
        <div
          style={{
            width: '360px',
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.07)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AIAgentConsole
            sandboxId={sandboxId}
            messages={messages}
            streaming={streaming}
            onSendMessage={handleSendMessage}
            disabled={!sandboxId}
          />
        </div>

        {/* Right: Workspace */}
        <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <WorkspacePanel
            sandboxId={sandboxId}
            previewUrl={previewUrl}
            files={files}
            loadingFiles={loadingFiles}
            selectedFile={selectedFile}
            fileContent={fileContent}
            onSelectFile={handleSelectFile}
            onRefreshFiles={handleRefreshFiles}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
