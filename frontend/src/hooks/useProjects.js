import { useState, useCallback, useEffect } from 'react';
import { getProjectsApi, createProjectApi } from '../api/sandbox.api.js';

/**
 * Layer 2: Domain Hook for Projects
 * Manages fetching, caching, creating, and error states for user projects.
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Refreshes the project list from the backend.
   */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProjectsApi();
      const list = response?.projects || [];
      setProjects(list);
      return list;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Creates a new project and optimistically prepends it to the project list.
   * @param {string} title
   */
  const createProject = useCallback(async (title) => {
    if (!title || !title.trim()) {
      throw new Error('Project title is required');
    }
    setCreating(true);
    setError(null);
    try {
      const response = await createProjectApi(title.trim());
      const newProj = response?.project;
      if (newProj) {
        setProjects((prev) => [newProj, ...prev.filter((p) => p._id !== newProj._id)]);
      }
      return newProj;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    creating,
    error,
    fetchProjects,
    createProject,
  };
}

export default useProjects;
