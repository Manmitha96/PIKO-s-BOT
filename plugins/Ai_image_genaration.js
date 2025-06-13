const { cmd } = require("../command");
const axios = require("axios"); // For API calls
const config = require("../config"); // Store your OpenAI API key here

// --- Configuration ---
const OPENAI_API_KEY = config.OPENAI_API_KEY; // Ensure this is set in config.js

if (!OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is missing in config.js!");
}

cmd(
    {
        pattern: "dalle",
        alias: ["aiimg", "draw", "genimage"],
        react: "🎨",
        desc: "Generate AI images using DALL·E 3",
        category: "ai",
        filename: __filename,
    },
    async (robin, mek, m, { from, q, reply }) => {
        // --- Input Validation ---
        if (!q) {
            return reply("✨ *Please provide a prompt!*\nExample: `.dalle a cyberpunk cat wearing sunglasses`");
        }

        if (!OPENAI_API_KEY) {
            return reply("❌ *OpenAI API key is missing!* Add it in config.js.");
        }

        // --- Generate Image ---
        try {
            reply("🎨 *Generating your DALL·E image...*");

            // Call DALL·E 3 API
            const response = await axios.post(
                "https://api.openai.com/v1/images/generations",
                {
                    model: "dall-e-3", // Use "dall-e-2" for cheaper but lower quality
                    prompt: q,
                    n: 1, // Number of images (DALL·E 3 only supports n=1)
                    size: "1024x1024", // Options: 1024x1024, 1024x1792, 1792x1024
                    quality: "standard", // Or "hd" for finer details (costs more)
                },
                {
                    headers: {
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const imageUrl = response.data.data[0].url;

            // Download the image (DALL·E returns a URL)
            const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
            const imageBuffer = Buffer.from(imageResponse.data, "binary");

            // Send the image
            await robin.sendMessage(
                from,
                {
                    image: imageBuffer,
                    caption: `🖼️ *DALL·E 3 Generated:*\n"${q}"`,
                },
                { quoted: mek }
            );

        } catch (e) {
            console.error("DALL·E Error:", e.response?.data || e.message);
            let errorMsg = "❌ *Failed to generate image.*";

            // Handle common errors
            if (e.response?.data?.error?.message.includes("safety system")) {
                errorMsg = "⚠️ *Blocked by OpenAI's safety filters.* Try a different prompt.";
            } else if (e.response?.status === 429) {
                errorMsg = "⏳ *Too many requests!* Try again later.";
            } else if (e.message.includes("ENOTFOUND")) {
                errorMsg = "🌐 *API connection failed.* Check your internet.";
            }

            reply(errorMsg);
        }
    }
);
