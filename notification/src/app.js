import express from "express";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("Hello from notification service.");
});

app.get("/_status/healthz", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.get("/_status/readyz", (req, res) => {
    res.status(200).json({ status: "ready" });
});

export default app;