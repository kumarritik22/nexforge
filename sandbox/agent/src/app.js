import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";

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


// @route PATCH /update-files
// @description Updates the content of files specified in the request body. The request body should be a JSON array of object, each object should have a "file" property specifying the file path (relative to the working directory) and a "content" property specifying the new content for the file.
app.patch("/update-files", async (req, res) => {
    
    const updates = req.body.updates;

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            message: "Invalid request body. Expected a JSON object with an 'updates' property containing an array of file updates.",
            status: "error"
        });
    }

    const results = await Promise.all(updates.map(async (update) => {
        const { file, content } = update;
        const filePath = path.join(WORKING_DIR, file);

        try {
            await fs.promises.writeFile(filePath, content, "utf-8")
            return {
                [ filePath ] : "File updated successfully."
            }
        } catch (error) {
            return {
                [ filePath ] : `Error updating file: ${error.message}`
            }
        }
    }));

    res.status(200).json({
        message: "File update results.",
        results
    });
});


export default app;