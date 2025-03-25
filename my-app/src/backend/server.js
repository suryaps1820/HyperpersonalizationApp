require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = globalThis.fetch;
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
const PYTHON_SERVER_URL = 'http://localhost:8002'; 

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
                        res.flush?.();
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

app.get('/api/fetch_recommendations/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
    
    try {
        const response = await axios.get(`${PYTHON_SERVER_URL}/fetch_recommendations/${customerId}`);
        const filteredOffers = response.data.map(offer => ({
            title: offer.title,
            details: offer.details
        }));
        res.json(filteredOffers);
    } catch (error) {
        console.error('Error fetching data from Python server:', error.message);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});


app.get("/api/get_transactions/:customerId", async (req, res) => {
    const customerId = req.params.customerId;

    try {
        const response = await axios.get(`${PYTHON_SERVER_URL}/get_transactions/${customerId}`);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching data from FastAPI server:", error.message);

        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to fetch transactions" });
        }
    }
});

app.listen(3000, () => console.log("🚀 Proxy server running on port 3000"));
