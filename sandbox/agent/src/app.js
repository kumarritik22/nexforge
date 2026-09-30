import express from "express";
import morgan from "morgan";
import fs from "fs";

const app = express();

const WORKING_DIR = "/workspace";

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello from sandbox agent!",
        status: "success"
    });
});

app.get("/list-files", async (req, res) => {
    
    const listFiles = async (dir, baseDir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const files = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            // Exlude certain directories
            if (entry.isDirectory() && [ "node_modules", ".git", "dist" ].includes(entry.name)) {
                continue;
            }

            if (entry.isDirectory()) {
                files.push(...await listFiles(fullPath, baseDir));
            } else {
                files.push(relativePath);
            }
        }

        return files;
    }

    try {
        const files = await listFiles(WORKING_DIR, WORKING_DIR);
        res.status(200).json({
            message: "Files listed successfully",
            files
        });
    } catch (error) {
        res.status(500).json({
            message: `Error listing files: ${error.message}`,
            status: "error"
        });
    }
});

// @route /read-files
// @description Read the content of all files requested in the query parameter "files" and returns their content as a JSON Object.
app.get("/read-files", async (req, res) => {

    const files = req.query.files;

    if (!files) {
        return res.status(400).json({
            message: "No files specified in query parameter.",
            status: "error"
        });
    }

    const fileList = files.split(",");

    const results = await Promise.all(fileList.map(async (file) => {
        const filePath = `${WORKING_DIR}/${file}`;

        try {
            const content = await await fs.promises.readFile(filePath, "utf-8");
            return {
                [ filePath ] : content
            }
        } catch (error) {
            return {
                [ filePath ] : `Error reading file: ${error.message}`
            }
        }
    }));

    res.status(200).json({
        message: "File contents.",
        files: results
    });
});

export default app;