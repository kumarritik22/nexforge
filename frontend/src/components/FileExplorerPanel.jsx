import { useState, useCallback, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  File,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Search,
  Code2,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Determine file icon and language from extension
function getFileInfo(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const langMap = {
    js: { lang: 'javascript', color: '#f59e0b', Icon: FileCode },
    jsx: { lang: 'jsx', color: '#22d3ee', Icon: FileCode },
    ts: { lang: 'typescript', color: '#6366f1', Icon: FileCode },
    tsx: { lang: 'tsx', color: '#818cf8', Icon: FileCode },
    html: { lang: 'html', color: '#ef4444', Icon: FileCode },
    css: { lang: 'css', color: '#a855f7', Icon: FileCode },
    json: { lang: 'json', color: '#10b981', Icon: FileCode },
    md: { lang: 'markdown', color: '#a1a1aa', Icon: FileText },
    sh: { lang: 'bash', color: '#22d3ee', Icon: FileCode },
    py: { lang: 'python', color: '#f59e0b', Icon: FileCode },
  };
  return langMap[ext] ?? { lang: 'text', color: '#71717a', Icon: File };
}

// Build tree from flat file list
function buildFileTree(files) {
  const root = {};
  for (const filePath of files) {
    const parts = filePath.split('/');
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // File
        node[part] = { __type: 'file', path: filePath };
      } else {
        // Directory
        if (!node[part]) node[part] = { __type: 'dir' };
        node = node[part];
      }
    }
  }
  return root;
}

// Recursive tree node
const TreeNode = ({ name, node, depth = 0, onSelectFile, selectedPath }) => {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.__type === 'dir';
  const isFile = node.__type === 'file';
  const isSelected = isFile && node.path === selectedPath;

  const { color, Icon } = isFile ? getFileInfo(name) : { color: '#71717a', Icon: isDir ? Folder : File };

  if (isFile) {
    return (
      <button
        onClick={() => onSelectFile(node.path)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          width: '100%',
          padding: `4px 8px 4px ${depth * 12 + 8}px`,
          borderRadius: '5px',
          border: 'none',
          background: isSelected ? 'rgba(99,102,241,0.15)' : 'transparent',
          color: isSelected ? '#818cf8' : '#a1a1aa',
          fontSize: '12px',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.1s ease',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.01em',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#fafafa';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#a1a1aa';
          }
        }}
      >
        <Icon size={12} color={isSelected ? '#818cf8' : color} style={{ flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </span>
      </button>
    );
  }

  if (isDir) {
    const children = Object.entries(node).filter(([k]) => k !== '__type');
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            width: '100%',
            padding: `4px 8px 4px ${depth * 12 + 8}px`,
            borderRadius: '5px',
            border: 'none',
            background: 'transparent',
            color: '#71717a',
            fontSize: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.1s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.color = '#a1a1aa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#71717a';
          }}
        >
          {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          {open ? (
            <FolderOpen size={12} color="#f59e0b" style={{ flexShrink: 0 }} />
          ) : (
            <Folder size={12} color="#f59e0b" style={{ flexShrink: 0 }} />
          )}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.01em' }}>
            {name}
          </span>
        </button>
        {open && (
          <div>
            {children
              .sort(([, a], [, b]) => {
                if (a.__type === 'dir' && b.__type !== 'dir') return -1;
                if (b.__type === 'dir' && a.__type !== 'dir') return 1;
                return 0;
              })
              .map(([childName, childNode]) => (
                <TreeNode
                  key={childName}
                  name={childName}
                  node={childNode}
                  depth={depth + 1}
                  onSelectFile={onSelectFile}
                  selectedPath={selectedPath}
                />
              ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

const FileExplorerPanel = ({ files = [], loadingFiles, selectedFile, fileContent, onSelectFile, onRefreshFiles }) => {
  const [search, setSearch] = useState('');

  const filteredFiles = useMemo(
    () => files.filter((f) => f.toLowerCase().includes(search.toLowerCase())),
    [files, search]
  );

  const fileTree = useMemo(() => buildFileTree(filteredFiles), [filteredFiles]);

  const selectedFileInfo = selectedFile ? getFileInfo(selectedFile.split('/').pop()) : null;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* File Tree Sidebar */}
      <div
        style={{
          width: '220px',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#0e0e10',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1 }}>
            Files
          </span>
          <button
            onClick={onRefreshFiles}
            disabled={loadingFiles}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '5px',
              border: 'none',
              background: 'transparent',
              color: '#52525b',
              cursor: 'pointer',
            }}
            title="Refresh files"
          >
            <RefreshCw size={11} className={loadingFiles ? 'animate-spin-slow' : ''} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '6px 8px', flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 8px',
              borderRadius: '5px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <Search size={10} color="#52525b" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#a1a1aa',
                fontSize: '11px',
                width: '100%',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>
        </div>

        {/* Tree */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px' }}>
          {loadingFiles ? (
            <div style={{ padding: '12px' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: '20px', marginBottom: '4px', width: `${60 + i * 10}%` }}
                />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 12px',
                gap: '8px',
                opacity: 0.5,
              }}
            >
              <Folder size={24} color="#52525b" />
              <p style={{ color: '#52525b', fontSize: '11px', textAlign: 'center', margin: 0 }}>
                No files yet
              </p>
            </div>
          ) : (
            Object.entries(fileTree)
              .sort(([, a], [, b]) => {
                if (a.__type === 'dir' && b.__type !== 'dir') return -1;
                if (b.__type === 'dir' && a.__type !== 'dir') return 1;
                return 0;
              })
              .map(([name, node]) => (
                <TreeNode
                  key={name}
                  name={name}
                  node={node}
                  depth={0}
                  onSelectFile={onSelectFile}
                  selectedPath={selectedFile}
                />
              ))
          )}
        </div>
      </div>

      {/* Code Viewer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedFile ? (
          <>
            {/* File Tab */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: '#0d0d0f',
                flexShrink: 0,
              }}
            >
              {selectedFileInfo && (
                <selectedFileInfo.Icon size={12} color={selectedFileInfo.color} />
              )}
              <span
                style={{
                  fontSize: '12px',
                  color: '#a1a1aa',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {selectedFile.split('/').pop()}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: '#3f3f46',
                  marginLeft: 'auto',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {selectedFile}
              </span>
            </div>

            {/* Code Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {fileContent === null ? (
                <div style={{ padding: '20px' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="skeleton"
                      style={{
                        height: '14px',
                        marginBottom: '8px',
                        width: `${40 + Math.random() * 50}%`,
                      }}
                    />
                  ))}
                </div>
              ) : fileContent !== undefined ? (
                <SyntaxHighlighter
                  language={selectedFileInfo?.lang ?? 'text'}
                  style={oneDark}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: '#09090b',
                    fontSize: '12px',
                    minHeight: '100%',
                    border: 'none',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  lineNumberStyle={{
                    color: '#3f3f46',
                    minWidth: '36px',
                    userSelect: 'none',
                  }}
                >
                  {fileContent}
                </SyntaxHighlighter>
              ) : null}
            </div>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              opacity: 0.5,
            }}
          >
            <Code2 size={32} color="#3f3f46" />
            <p style={{ color: '#52525b', fontSize: '13px', margin: 0 }}>
              Select a file to view its contents
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorerPanel;
