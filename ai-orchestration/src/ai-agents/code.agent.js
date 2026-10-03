import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { listFiles, readFiles, updateFiles } from "./tools.js";
import { createAgent } from "langchain";

const model = new ChatMistralAI({
    model: "codestral-latest",
    apiKey: process.env.MISTRALAI_API_KEY,
    temperature: 0
});

const agent = (createAgent({
    model,
    tools: [ listFiles, readFiles, updateFiles ]
})).withConfig({
    recursionLimit: 100
})

export default agent;