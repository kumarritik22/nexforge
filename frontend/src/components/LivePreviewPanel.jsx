import { useState, useRef, useCallback, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';

const DEVICE_MODES = [
  { key: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { key: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
  { key: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' },
];

const LivePreviewPanel = ({ sandboxId, previewUrl, sandboxStatus = 'idle' }) => {
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef(null);

  const activeUrl = previewUrl ?? (sandboxId ? `http://${sandboxId}.preview.localtest.me` : null);
  const activeDevice = DEVICE_MODES.find((d) => d.key === deviceMode);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  useEffect(() => {
    if (sandboxId) {
      setIsLoading(true);
      const t = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(t);
    }
  }, [sandboxId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Preview Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: '#0d0d0f',
          flexShrink: 0,
        }}
      >
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={!activeUrl}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: activeUrl ? '#a1a1aa' : '#3f3f46',
            cursor: activeUrl ? 'pointer' : 'not-allowed',
          }}
          title="Refresh Preview"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin-slow' : ''} />
        </button>

        {/* URL Bar */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              color: activeUrl ? '#a1a1aa' : '#52525b',
              fontFamily: "'JetBrains Mono', monospace",
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {activeUrl ?? 'No sandbox active — start a sandbox to preview'}
          </span>
        </div>

        {/* Device toggles */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            padding: '2px',
            borderRadius: '7px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {DEVICE_MODES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setDeviceMode(key)}
              title={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '24px',
                borderRadius: '5px',
                border: 'none',
                background:
                  deviceMode === key
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))'
                    : 'transparent',
                color: deviceMode === key ? '#818cf8' : '#52525b',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={12} />
            </button>
          ))}
        </div>

        {activeUrl && (
          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: '#a1a1aa',
            }}
            title="Open in new tab"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Preview Frame */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: '#0a0a0c',
          overflow: 'auto',
          padding: deviceMode === 'desktop' ? '0' : '20px',
        }}
      >
        {!activeUrl ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Monitor size={26} color="#4f4f6f" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#71717a', fontSize: '13px', marginBottom: '4px' }}>
                No preview available
              </p>
              <p style={{ color: '#3f3f46', fontSize: '12px' }}>
                Start a sandbox to see your live preview
              </p>
            </div>
          </div>
        ) : sandboxStatus === 'provisioning' ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '14px',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Loader2 size={24} color="#818cf8" className="animate-spin-slow" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#fafafa', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                Booting Sandbox Environment...
              </p>
              <p style={{ color: '#71717a', fontSize: '12px', maxWidth: '300px' }}>
                Starting container and Vite dev server. Your preview will appear automatically in a few seconds.
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: activeDevice.width,
              height: '100%',
              position: 'relative',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              flexShrink: 0,
              borderRadius: deviceMode === 'desktop' ? '0' : '12px',
              overflow: deviceMode === 'desktop' ? 'hidden' : 'hidden',
              border: deviceMode !== 'desktop' ? '1px solid rgba(255,255,255,0.1)' : 'none',
              boxShadow: deviceMode !== 'desktop' ? '0 20px 60px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            {isLoading && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #6366f1, #22d3ee, #6366f1)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1s linear infinite',
                  zIndex: 10,
                }}
              />
            )}
            <iframe
              key={refreshKey}
              ref={iframeRef}
              src={activeUrl}
              title="Sandbox Live Preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
                background: '#fff',
              }}
              onLoad={() => setIsLoading(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePreviewPanel;
