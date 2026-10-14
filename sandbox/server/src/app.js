import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import SandboxRouter from "./routes/sandbox.routes.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/sandbox/health", (req, res) => {
    res.status(200).json({
        message: "Sandbox api is healthy.",
        status: "Ok"
    });
});

app.use("/api/sandbox", SandboxRouter);

export default app;