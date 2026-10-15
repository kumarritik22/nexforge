import { FolderGit2, Loader2, Play, RefreshCw, Box } from 'lucide-react';

/**
 * Layer 4: Presentation Component - ProjectList
 * Displays user projects fetched from GET /api/sandbox/project
 */
export default function ProjectList({
  projects = [],
  loading = false,
  error = null,
  onLaunchProject,
  onRefresh,
  launchingProjectId = null,
}) {
  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '0 32px 48px' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderGit2 size={16} color="#818cf8" />
          <h3
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#a1a1aa',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            Your Projects ({projects.length})
          </h3>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: '#71717a',
            fontSize: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
          }}
          title="Refresh projects"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin-slow' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && projects.length === 0 && (
        <div
          style={{
            padding: '32px',
            textAlign: 'center',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            color: '#71717a',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <Loader2 size={16} className="animate-spin-slow" />
          <span>Loading your projects...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#ef4444',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <span>Error loading projects: {error}</span>
          <button
            onClick={onRefresh}
            style={{
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '6px',
              color: '#ef4444',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            color: '#71717a',
          }}
        >
          <Box size={32} color="#52525b" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', color: '#e4e4e7', margin: '0 0 4px', fontWeight: 500 }}>
            No projects found
          </p>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>
            Create your first project above to spin up a persistent cloud sandbox.
          </p>
        </div>
      )}

      {/* Projects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {projects.map((project) => {
          const isLaunchingThis = launchingProjectId === project._id;

          return (
            <div
              key={project._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              {/* Project Icon */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '9px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8',
                  flexShrink: 0,
                }}
              >
                <Box size={18} />
              </div>

              {/* Title & Metadata */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fafafa',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {project.title}
                  </h4>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      color: '#71717a',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {project._id.slice(0, 8)}...
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#71717a' }}>
                  Synced with S3 • Ready to Launch
                </span>
              </div>

              {/* Launch Action */}
              <button
                onClick={() => onLaunchProject(project)}
                disabled={isLaunchingThis || launchingProjectId !== null}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  background: isLaunchingThis
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(99, 102, 241, 0.1)',
                  color: '#a5b4fc',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isLaunchingThis || launchingProjectId !== null ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!launchingProjectId) {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!launchingProjectId) {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.color = '#a5b4fc';
                  }
                }}
              >
                {isLaunchingThis ? (
                  <>
                    <Loader2 size={13} className="animate-spin-slow" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Play size={13} fill="#a5b4fc" />
                    <span>Open Studio</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
