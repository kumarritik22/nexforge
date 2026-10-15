import "dotenv/config";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import chokidar from "chokidar";
import {
    S3Client,
    ListObjectsV2Command,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} from "@aws-sdk/client-s3";

// 1. Validate required environment variables
const projectId = process.env.PROJECT_ID;
const bucketName = process.env.BUCKET_NAME;
const localDirectory = process.env.LOCAL_DIRECTORY || "/workspace";

if (!projectId || !bucketName) {
    console.error("[sync-agent] ERROR: Missing required environment variables: PROJECT_ID and BUCKET_NAME.");
    process.exit(1);
}

// 2. Initialize AWS S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// 3. Define ignored directories and files
const IGNORED_NAMES = new Set([
    "node_modules",
    ".git",
    ".vite",
    "dist",
    ".DS_Store",
    "Thumbs.db"
]);

/**
 * Checks whether a given path should be excluded from sync.
 * Examines all folder and file segments in the relative path.
 */
function isIgnored(targetPath) {
    const relativePath = path.relative(localDirectory, targetPath).replace(/\\/g, "/");
    if (!relativePath || relativePath === ".") return false;
    const parts = relativePath.split("/");
    return parts.some((part) => IGNORED_NAMES.has(part));
}

/**
 * Converts a local file path into an S3 object key with the project prefix.
 * Example: /workspace/src/App.jsx -> <projectId>/src/App.jsx
 */
function toS3Key(filePath) {
    const relativePath = path.relative(localDirectory, filePath).replace(/\\/g, "/");
    return `${projectId}/${relativePath}`;
}

/**
 * Converts an S3 object key back to a local file path inside the workspace.
 * Example: <projectId>/src/App.jsx -> /workspace/src/App.jsx
 */
function toLocalPath(s3Key) {
    const relativePath = s3Key.slice(`${projectId}/`.length);
    return path.join(localDirectory, relativePath);
}

// 4. S3 Operations

/**
 * Uploads a local file to S3.
 */
async function uploadFile(filePath) {
    const s3Key = toS3Key(filePath);
    try {
        const fileContent = await fs.readFile(filePath);
        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            Body: fileContent
        }));
        console.log(`[sync-agent] [UPLOADED] ${s3Key}`);
    } catch (err) {
        console.error(`[sync-agent] [UPLOAD FAILED] ${s3Key}:`, err.message);
    }
}

/**
 * Downloads a file from S3 and saves it to local workspace.
 */
async function downloadFile(s3Key) {
    const localPath = toLocalPath(s3Key);
    try {
        const response = await s3Client.send(new GetObjectCommand({
            Bucket: bucketName,
            Key: s3Key
        }));

        const byteArray = await response.Body.transformToByteArray();
        await fs.mkdir(path.dirname(localPath), { recursive: true });
        await fs.writeFile(localPath, Buffer.from(byteArray));
        console.log(`[sync-agent] [DOWNLOADED] ${s3Key} -> ${localPath}`);
    } catch (err) {
        console.error(`[sync-agent] [DOWNLOAD FAILED] ${s3Key}:`, err.message);
    }
}

/**
 * Deletes a file from S3.
 */
async function deleteFile(filePath) {
    const s3Key = toS3Key(filePath);
    try {
        await s3Client.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: s3Key
        }));
        console.log(`[sync-agent] [DELETED] ${s3Key}`);
    } catch (err) {
        console.error(`[sync-agent] [DELETE FAILED] ${s3Key}:`, err.message);
    }
}

/**
 * Lists all S3 objects under the project prefix, handling pagination if necessary.
 */
async function listProjectS3Keys() {
    let continuationToken;
    const allKeys = [];
    const prefix = `${projectId}/`;

    do {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            ContinuationToken: continuationToken
        });

        const response = await s3Client.send(command);

        if (response.Contents) {
            for (const item of response.Contents) {
                if (item.Key && !item.Key.endsWith("/")) {
                    allKeys.push(item.Key);
                }
            }
        }

        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return allKeys;
}

/**
 * Recursively scans the local workspace directory, ignoring unwanted folders like node_modules.
 */
async function scanLocalFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (isIgnored(fullPath)) continue;

        if (entry.isDirectory()) {
            const subFiles = await scanLocalFiles(fullPath);
            files.push(...subFiles);
        } else if (entry.isFile()) {
            files.push(fullPath);
        }
    }

    return files;
}

// 5. Initial Sync on Pod Startup
async function initialSync() {
    console.log(`[sync-agent] Checking existing files in S3 for project: ${projectId}...`);
    const s3Keys = await listProjectS3Keys();

    if (s3Keys.length === 0) {
        console.log(`[sync-agent] No files found in S3. Seeding initial template files from ${localDirectory}...`);
        const filesToSeed = await scanLocalFiles(localDirectory);
        console.log(`[sync-agent] Found ${filesToSeed.length} files to upload.`);

        for (const file of filesToSeed) {
            await uploadFile(file);
        }

        console.log(`[sync-agent] Initial seed complete. All starting template files synced to S3.`);
    } else {
        console.log(`[sync-agent] Existing project detected. Restoring ${s3Keys.length} files from S3...`);
        for (const key of s3Keys) {
            await downloadFile(key);
        }
        console.log(`[sync-agent] Project restoration complete. Workspace is ready.`);
    }
}

// 6. Live Watcher with Debounced Batch Sync
const pendingUploads = new Set();
const pendingDeletes = new Set();
let debounceTimer = null;
let isFlushing = false;
const DEBOUNCE_DELAY_MS = 2500;

function scheduleFlush() {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
        flushBatch();
    }, DEBOUNCE_DELAY_MS);
}

async function flushBatch() {
    if (isFlushing) {
        // If a flush is currently in progress, re-schedule so newly queued items aren't missed
        scheduleFlush();
        return;
    }

    if (pendingUploads.size === 0 && pendingDeletes.size === 0) {
        return;
    }

    isFlushing = true;

    // Snapshot and drain sets
    const filesToUpload = Array.from(pendingUploads);
    const filesToDelete = Array.from(pendingDeletes);
    pendingUploads.clear();
    pendingDeletes.clear();

    console.log(`[sync-agent] Syncing batch: ${filesToUpload.length} uploads, ${filesToDelete.length} deletions...`);

    try {
        // Process uploads concurrently
        await Promise.all(
            filesToUpload.map(async (filePath) => {
                if (existsSync(filePath)) {
                    await uploadFile(filePath);
                }
            })
        );

        // Process deletions concurrently
        await Promise.all(
            filesToDelete.map(async (filePath) => {
                await deleteFile(filePath);
            })
        );

        console.log(`[sync-agent] Batch sync completed successfully.`);
    } catch (err) {
        console.error(`[sync-agent] Batch sync encountered an error:`, err);
    } finally {
        isFlushing = false;

        // If changes arrived while flushing was active, re-arm the timer
        if (pendingUploads.size > 0 || pendingDeletes.size > 0) {
            scheduleFlush();
        }
    }
}

function startWatcher() {
    console.log(`[sync-agent] Starting live file watcher on ${localDirectory}...`);

    const watcher = chokidar.watch(localDirectory, {
        persistent: true,
        ignoreInitial: true,
        ignored: (targetPath) => isIgnored(targetPath),
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100
        }
    });

    watcher.on("add", (filePath) => {
        if (isIgnored(filePath)) return;
        pendingUploads.add(filePath);
        pendingDeletes.delete(filePath);
        scheduleFlush();
    });

    watcher.on("change", (filePath) => {
        if (isIgnored(filePath)) return;
        pendingUploads.add(filePath);
        pendingDeletes.delete(filePath);
        scheduleFlush();
    });

    watcher.on("unlink", (filePath) => {
        if (isIgnored(filePath)) return;
        pendingDeletes.add(filePath);
        pendingUploads.delete(filePath);
        scheduleFlush();
    });

    watcher.on("error", (error) => {
        console.error(`[sync-agent] Watcher error:`, error);
    });

    return watcher;
}

// 7. Graceful Termination Handlers
async function handleShutdown(signal) {
    console.log(`[sync-agent] Received ${signal}. Flushing remaining changes to S3 before exit...`);
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    await flushBatch();
    console.log(`[sync-agent] Graceful shutdown complete. Exiting.`);
    process.exit(0);
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

// 8. Main Lifecycle Entrypoint
async function main() {
    try {
        await fs.mkdir(localDirectory, { recursive: true });
        await initialSync();
        startWatcher();
    } catch (err) {
        console.error(`[sync-agent] Fatal startup error:`, err);
        process.exit(1);
    }
}

main();