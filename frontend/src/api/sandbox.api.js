import apiClient from './client.js';

/**
 * Layer 1: Sandbox & Project Network Endpoints
 */

/**
 * Creates a new project in the database.
 * POST /api/sandbox/project
 * @param {string} title - The title of the project.
 * @returns {Promise<{ message: string, project: { _id: string, user: string, title: string, __v: number } }>}
 */
export async function createProjectApi(title) {
  return apiClient.post('/sandbox/project', { title });
}

/**
 * Fetches all projects belonging to the authenticated user.
 * GET /api/sandbox/project
 * @returns {Promise<{ message: string, projects: Array<{ _id: string, user: string, title: string, __v: number }> }>}
 */
export async function getProjectsApi() {
  return apiClient.get('/sandbox/project');
}

/**
 * Provisions and starts a Kubernetes sandbox for a given project.
 * POST /api/sandbox/start
 * @param {string} projectId - MongoDB ObjectId of the project.
 * @returns {Promise<{ message: string, sandboxId: string, previewUrl: string }>}
 */
export async function startSandboxApi(projectId) {
  return apiClient.post('/sandbox/start', { projectId });
}
