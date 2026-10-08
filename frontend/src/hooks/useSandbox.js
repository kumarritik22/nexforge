import { useState, useCallback } from 'react';
import axios from 'axios';

const SANDBOX_API_BASE = '/api/sandbox';

/**
 * useSandbox - Hook for managing sandbox lifecycle and file system operations
 */
export function useSandbox() {
  const [sandboxId, setSandboxId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sandboxStatus, setSandboxStatus] = useState('idle'); // idle | provisioning | live | error
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState(null);

  // Helper to build sandbox agent base URL
  const agentBase = useCallback(
    (id = sandboxId) => `http://${id}.agent.localtest.me`,
    [sandboxId]
  );

  /** Start a new sandbox environment */
  const startSandbox = useCallback(async () => {
    setSandboxStatus('provisioning');
    setError(null);

    try {
      const { data } = await axios.post(`${SANDBOX_API_BASE}/start`);
      setSandboxId(data.sandboxId);
      setPreviewUrl(data.previewUrl);
      setSandboxStatus('live');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message;
      setError(msg);
      setSandboxStatus('error');
      throw err;
    }
  }, []);

  /** List all files in the sandbox workspace */
  const listFiles = useCallback(
    async (id = sandboxId) => {
      if (!id) return;
      setLoadingFiles(true);
      try {
        const { data } = await axios.get(`${agentBase(id)}/list-files`);
        setFiles(data.files ?? []);
        return data.files ?? [];
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        setLoadingFiles(false);
      }
    },
    [sandboxId, agentBase]
  );

  /** Read file content(s) from the sandbox */
  const readFile = useCallback(
    async (filePath, id = sandboxId) => {
      if (!id) return null;
      try {
        const { data } = await axios.get(`${agentBase(id)}/read-files`, {
          params: { files: filePath },
        });
        // Returns array: [{ "/path": "content" }]
        const fileEntry = data.files?.[0];
        if (fileEntry) {
          const content = Object.values(fileEntry)[0];
          return content;
        }
        return null;
      } catch (err) {
        setError(err.message);
        return null;
      }
    },
    [sandboxId, agentBase]
  );

  /** Update existing files in the sandbox */
  const updateFiles = useCallback(
    async (updates, id = sandboxId) => {
      if (!id) return;
      try {
        const { data } = await axios.patch(`${agentBase(id)}/update-files`, { updates });
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [sandboxId, agentBase]
  );

  /** Create new files in the sandbox */
  const createFiles = useCallback(
    async (filesList, id = sandboxId) => {
      if (!id) return;
      try {
        const { data } = await axios.post(`${agentBase(id)}/create-files`, { files: filesList });
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [sandboxId, agentBase]
  );

  return {
    sandboxId,
    previewUrl,
    sandboxStatus,
    files,
    loadingFiles,
    error,
    startSandbox,
    listFiles,
    readFile,
    updateFiles,
    createFiles,
    setSandboxId,
    setPreviewUrl,
    setSandboxStatus,
  };
}

export default useSandbox;
