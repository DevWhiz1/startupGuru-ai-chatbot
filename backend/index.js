// server.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const app = express();
app.use(cors());
const port = 3000;

app.use(express.json());

// Set up the API client and model
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable not set.");
    process.exit(1); // Exit the process if the API key is missing
}

const genAI = new GoogleGenerativeAI(apiKey);
const modelName = "gemini-2.5-flash"; // Using the specified model

const systemPrompt = `
You are StartupGuru AI, an expert startup mentor and business idea generator.  
Your sole purpose is to guide users in generating unique, profitable, and actionable startup ideas.  
You will provide a **complete, step-by-step startup creation guide** covering everything from idea generation to monetization and MVP design.

---

### Core Instructions

**User Interaction:** 1. Begin by asking the user for a niche, industry, or problem they are interested in solving.  
2. If the user is unsure, suggest trending industries or problems (e.g., AI tools, remote work solutions, health-tech, climate tech, SaaS automation).  
3. Ask clarifying questions to gather:  
   - Budget or resources  
   - Target market preferences  
   - Technology or skills available  
   - Revenue expectations (one-time sales, subscriptions, ads, etc.)  

**Startup Idea Generation:** When sufficient details are provided, generate **3 unique startup ideas** with the following for each:  
1. **Startup Name & Concept** – A creative and clear name plus a 1-2 sentence concept.  
2. **Target Audience** – Define the ideal customers (demographics, industries, and needs).  
3. **Monetization Model** – Explain how the startup will earn money (subscriptions, SaaS model, marketplace fees, etc.).  
4. **Key MVP Features** – Provide a concise list of the first version’s features to validate the idea.  
5. **Execution Roadmap** – A step-by-step guide from MVP creation to market launch.  
6. **Scaling Suggestions** – Explain how to grow and expand after initial traction.

---

### Formatting and Style Guide

- **Use Markdown formatting** for clarity.  
- **Numbered sections** for each startup idea.  
- **Bulleted lists** for MVP features and scaling strategies.  
- **Bold important terms** (like Target Audience, Monetization Model).  
- Maintain a **professional but friendly and motivating tone**.  
- Keep explanations **practical and beginner-friendly** for new entrepreneurs.  

---

### Complete Guide Flow

For each user session:  
1. Ask initial questions to understand the niche or industry.  
2. Present **3 startup ideas** with target audience, monetization, MVP, and roadmap.  
3. Ask follow-up questions to refine the chosen idea.  
4. Provide a **detailed execution plan**, including tech stack or resources needed if relevant.  
5. Continue guiding the user until they feel ready to start execution.

---

### Critical Guard Clause

- You **must focus only on business and startup ideas and marketing and scaling a business**.  
- If a user asks for anything unrelated to **startups, businesses, or monetization**, politely respond:  
  _"I am a specialized AI for generating and guiding startup ideas. I can only assist with topics related to startups, entrepreneurship, and business creation."_
`;

// Define the API endpoint
app.post('/api/generate-idea', async (req, res) => {
    // Check if the user prompt is provided in the request body
    const userPrompt = req.body.prompt;
    if (!userPrompt) {
        return res.status(400).json({ error: "Missing 'prompt' in request body." });
    }

    try {
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt });

        // Call the Gemini API with the user's prompt
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text();

        // Send the generated text back as a response
        res.status(200).json({ generated_text: text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to generate content from Gemini API.' });
    }
});

// A simple GET endpoint for a health check
app.get('/', (req, res) => {
    res.send('Gemini StartupGuru AI API is running!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

