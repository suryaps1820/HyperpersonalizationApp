require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = globalThis.fetch;

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/offers", require("./routes/offers"));

app.post("/api/generate", async (req, res) => {
    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: "Failed to fetch from Ollama." });
        }

        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Transfer-Encoding", "chunked");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const lines = decoder.decode(value, { stream: true }).trim().split("\n");
            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        res.write(json.response);
                        res.flush?.(); // Ensure immediate flushing if supported
                    }
                } catch (parseError) {
                    console.error("Error parsing JSON chunk:", parseError);
                }
            }
        }

        res.end();
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error connecting to AI model." });
    }
});

app.listen(3000, () => console.log("🚀 Proxy server running on port 3000"));
