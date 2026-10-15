import { useState } from 'react';
import { X, FolderPlus, Loader2, Sparkles } from 'lucide-react';

/**
 * Layer 4: Presentation Component - CreateProjectModal
 * Clean modal dialog for entering project details.
 */
export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error = null,
}) {
  const [title, setTitle] = useState('');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setLocalError('Please enter a project title');
      return;
    }
    setLocalError('');
    onSubmit(title.trim());
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#121215',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          color: '#fafafa',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <FolderPlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Create New Project</h3>
              <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0' }}>
                Your project will be synced automatically to cloud storage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="project-title-input"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: '#a1a1aa',
                marginBottom: '8px',
              }}
            >
              Project Title
            </label>
            <input
              id="project-title-input"
              type="text"
              placeholder="e.g. ecommerce-dashboard, ai-landing-page"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (localError) setLocalError('');
              }}
              autoFocus
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: localError || error ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#fafafa',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.15s ease',
                boxSizing: 'border-box',
              }}
            />
            {(localError || error) && (
              <span style={{ display: 'block', fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>
                {localError || error}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'transparent',
                color: '#a1a1aa',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                background: isSubmitting
                  ? 'rgba(99, 102, 241, 0.3)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isSubmitting ? 'none' : '0 0 15px rgba(99, 102, 241, 0.3)',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin-slow" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Create & Launch
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
