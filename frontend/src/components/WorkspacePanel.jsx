import { useState, useCallback } from 'react';
import { Eye, Terminal, FolderOpen } from 'lucide-react';
import LivePreviewPanel from './LivePreviewPanel.jsx';
import TerminalPanel from './TerminalPanel.jsx';
import FileExplorerPanel from './FileExplorerPanel.jsx';

const TABS = [
  { key: 'preview', label: 'Live Preview', icon: Eye },
  { key: 'terminal', label: 'Terminal', icon: Terminal },
  { key: 'files', label: 'Files', icon: FolderOpen },
];

const WorkspacePanel = ({
  sandboxId,
  previewUrl,
  files,
  loadingFiles,
  selectedFile,
  fileContent,
  onSelectFile,
  onRefreshFiles,
}) => {
  const [activeTab, setActiveTab] = useState('preview');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: '#0d0d0f',
          padding: '0 4px',
          flexShrink: 0,
          gap: '2px',
        }}
      >
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                border: 'none',
                borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                background: 'transparent',
                color: isActive ? '#e4e4e7' : '#52525b',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                letterSpacing: '0.01em',
                position: 'relative',
                bottom: '-1px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#a1a1aa';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = '#52525b';
              }}
            >
              <Icon size={13} />
              {label}
              {key === 'terminal' && sandboxId && (
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'block',
                  }}
                />
              )}
              {key === 'files' && files.length > 0 && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#71717a',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {files.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'hidden' }} className="tab-content-enter">
        {activeTab === 'preview' && (
          <LivePreviewPanel sandboxId={sandboxId} previewUrl={previewUrl} />
        )}
        {activeTab === 'terminal' && (
          <TerminalPanel sandboxId={sandboxId} />
        )}
        {activeTab === 'files' && (
          <FileExplorerPanel
            files={files}
            loadingFiles={loadingFiles}
            selectedFile={selectedFile}
            fileContent={fileContent}
            onSelectFile={onSelectFile}
            onRefreshFiles={onRefreshFiles}
          />
        )}
      </div>
    </div>
  );
};

export default WorkspacePanel;
