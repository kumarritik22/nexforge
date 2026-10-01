import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { listFiles, readFiles, updateFiles } from "./tools.js";
import { createAgent } from "langchain";

const model = new ChatMistralAI({
    model: "codestral-latest",
    apiKey: process.env.MISTRALAI_API_KEY
});

const agent = createAgent({
    model,
    tools: [ listFiles, readFiles, updateFiles ]
});

const result = await agent.invoke({
    messages: [
        {
            role: "user",
            content: "You have access to tools to inspect and modify project files. Please inspect the project files and build a snake game using React and tailwind css. The game should be playable."
        }
    ]
});

console.log(result);