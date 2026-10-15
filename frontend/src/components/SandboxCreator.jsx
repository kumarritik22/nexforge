import { useState } from 'react';
import NexforgeLogo from './NexforgeLogo.jsx';
import ProjectList from './ProjectList.jsx';
import CreateProjectModal from './CreateProjectModal.jsx';
import useProjects from '../hooks/useProjects.js';
import { Zap, Loader2, Plus, Sparkles } from 'lucide-react';

const TEMPLATES = [
  { id: 'react', label: 'React', color: '#22d3ee', description: 'Vite + React 19' },
  { id: 'nextjs', label: 'Next.js', color: '#fafafa', description: 'App Router + TailwindCSS' },
  { id: 'vue', label: 'Vue', color: '#10b981', description: 'Vue 3 + Vite' },
  { id: 'vanilla', label: 'Vanilla JS', color: '#f59e0b', description: 'Plain HTML/JS/CSS' },
  { id: 'svelte', label: 'SvelteKit', color: '#ef4444', description: 'SvelteKit + Vite' },
];

/**
 * Layer 3: Feature / Smart Container Component - SandboxCreator
 * Coordinates project fetching, project creation modal, and sandbox launching.
 */
const SandboxCreator = ({
  onLaunchSandbox,
  sandboxStatus = 'idle',
  launchingProjectId = null,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('react');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Layer 2: Custom domain hook for project state
  const {
    projects,
    loading: loadingProjects,
    creating,
    error: projectsError,
    fetchProjects,
    createProject,
  } = useProjects();

  const isProvisioning = sandboxStatus === 'provisioning';

  // Handle project creation from modal and immediately launch it
  const handleCreateAndLaunch = async (title) => {
    setCreateError(null);
    try {
      const newProject = await createProject(title);
      setIsModalOpen(false);
      if (onLaunchSandbox && newProject) {
        await onLaunchSandbox(newProject);
      }
    } catch (err) {
      setCreateError(err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* Top Navigation */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          flexShrink: 0,
        }}
      >
        <NexforgeLogo size={30} showText={true} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isProvisioning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#818cf8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isProvisioning ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '50px 32px 30px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            marginBottom: '20px',
          }}
        >
          <Zap size={11} color="#818cf8" />
          <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 500 }}>
            AI-Powered Sandbox Platform
          </span>
        </div>

        <h1
          style={{
            fontSize: '40px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            margin: '0 0 12px',
            background: 'linear-gradient(135deg, #fafafa 30%, #71717a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
          }}
        >
          Your Cloud-Native<br />Dev Sandbox
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: '#71717a',
            maxWidth: '500px',
            lineHeight: '1.6',
            margin: '0 0 36px',
          }}
        >
          Spin up isolated Kubernetes workspaces synced automatically with AWS S3. Build, preview, and iterate with AI assistance.
        </p>

        {/* Launch Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '24px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7', margin: 0 }}>
              Start New Project
            </h2>
            <span style={{ fontSize: '11px', color: '#71717a' }}>Choose starting template</span>
          </div>

          {/* Template Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            {TEMPLATES.map(({ id, label, color, description }) => {
              const isSelected = selectedTemplate === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedTemplate(id)}
                  style={{
                    padding: '12px 6px',
                    borderRadius: '10px',
                    border: isSelected ? `1px solid ${color}40` : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isSelected ? `${color}12` : 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: isSelected ? `0 0 12px ${color}20` : 'none',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? color : '#a1a1aa' }}>
                    {label}
                  </span>
                  <span style={{ fontSize: '9px', color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>
                    {description.split('+')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Start New Sandbox Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isProvisioning}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              background: isProvisioning
                ? 'rgba(99, 102, 241, 0.2)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: isProvisioning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isProvisioning ? 'none' : '0 0 20px rgba(99, 102, 241, 0.35)',
            }}
          >
            {isProvisioning ? (
              <>
                <Loader2 size={16} className="animate-spin-slow" />
                <span>Provisioning sandbox environment...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Create New Project Sandbox</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Layer 4: Project List Presentation Component */}
      <ProjectList
        projects={projects}
        loading={loadingProjects}
        error={projectsError}
        onLaunchProject={(project) => onLaunchSandbox(project)}
        onRefresh={fetchProjects}
        launchingProjectId={launchingProjectId}
      />

      {/* Layer 4: Modal Presentation Component */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCreateError(null);
        }}
        onSubmit={handleCreateAndLaunch}
        isSubmitting={creating || isProvisioning}
        error={createError}
      />
    </div>
  );
};

export default SandboxCreator;
