const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");
const fs = require("fs");
const path = require("path");

// --- Configuration ---
const OPENAI_API_KEY = config.OPENAI_API_KEY;
const MAX_PROMPT_LENGTH = 400;
const CACHE_DIR = path.join(__dirname, '../temp/dalle_cache');
const BANNED_WORDS = ['nude', 'sexual', 'porn', 'violence', 'gore', 'hitler', 'nsfw', 'nazi'];

// Create cache directory
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

if (!OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is missing in config.js!");
}

cmd(
    {
        pattern: "dalle",
        alias: ["aiimg", "draw", "genimage", "dalle3"],
        react: "🎨",
        desc: "Generate AI images using DALL·E 3",
        usage: ".dalle <prompt> --hd (for higher quality) --size=1024x1792 (for portrait)",
        category: "ai",
        filename: __filename,
    },
    async (robin, mek, m, { from, q, reply }) => {
        try {
            // --- Input Validation ---
            if (!q) {
                return reply(`🎨 *DALL·E 3 Image Generator*\n\n` +
                    `🔹 *Usage:* \`.dalle <prompt>\`\n` +
                    `🔹 *Options:*\n` +
                    `   --hd - Higher quality\n` +
                    `   --size=1024x1024 | 1024x1792 | 1792x1024\n\n` +
                    `📝 *Example:* \`.dalle a cat astronaut --hd --size=1024x1792\``);
            }

            if (!OPENAI_API_KEY) {
                return reply("❌ *API key missing!* Configure OPENAI_API_KEY in config.js");
            }

            // --- Parse Options ---
            const options = {
                quality: "standard",
                size: "1024x1024"
            };

            // Handle flags
            if (q.includes("--hd")) {
                options.quality = "hd";
                q = q.replace("--hd", "").trim();
            }

            const sizeMatch = q.match(/--size=(\d+x\d+)/);
            if (sizeMatch) {
                const validSizes = ["1024x1024", "1024x1792", "1792x1024"];
                if (validSizes.includes(sizeMatch[1])) {
                    options.size = sizeMatch[1];
                    q = q.replace(sizeMatch[0], "").trim();
                } else {
                    return reply(`❌ Invalid size! Use one of: ${validSizes.join(", ")}`);
                }
            }

            // Validate prompt
            if (q.length > MAX_PROMPT_LENGTH) {
                return reply(`❌ Prompt too long! Max ${MAX_PROMPT_LENGTH} chars.`);
            }

            // Check for banned content
            const lowerPrompt = q.toLowerCase();
            const bannedWord = BANNED_WORDS.find(word => lowerPrompt.includes(word));
            if (bannedWord) {
                return reply(`⚠️ *Content blocked:* Prompt contains restricted term "${bannedWord}"`);
            }

            // --- Generate Image ---
            const processingMsg = await reply(`🔄 *Generating image...*\n` +
                `📝: "${q.substring(0, 50)}${q.length > 50 ? '...' : ''}"` +
                `\n⚙️: ${options.quality.toUpperCase()} ${options.size}`);

            const response = await axios.post(
                "https://api.openai.com/v1/images/generations",
                {
                    model: "dall-e-3",
                    prompt: q,
                    n: 1,
                    size: options.size,
                    quality: options.quality,
                    response_format: "b64_json"
                },
                {
                    headers: {
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 45000
                }
            );

            // Process and send image
            const imageData = response.data.data[0].b64_json;
            const imageBuffer = Buffer.from(imageData, 'base64');

            await robin.sendMessage(
                from,
                {
                    image: imageBuffer,
                    caption: `🎨 *Generated Image*\n` +
                        `📝: "${q}"\n` +
                        `⚙️: ${options.quality.toUpperCase()} ${options.size}\n` +
                        `🕒 ${new Date().toLocaleTimeString()}`
                },
                { quoted: mek }
            );

            // Clean up
            await robin.sendMessage(from, { delete: processingMsg.key });

        } catch (e) {
            console.error("DALL·E Generation Error:", e.response?.data || e.message);
            
            let errorMsg = "❌ *Image generation failed*";
            const errorData = e.response?.data?.error || {};

            // Handle specific error types
            if (errorData.type === 'image_generation_user_error') {
                errorMsg = "⚠️ *Cannot generate this image*\n" +
                           "The prompt may:\n" +
                           "• Contain blocked content\n" +
                           "• Be too vague\n" +
                           "• Violate safety policies";
            } 
            else if (errorData.code === 'billing_hard_limit_reached') {
                errorMsg = "💳 *API limit reached*\nCheck your OpenAI account billing";
            }
            else if (e.code === 'ECONNABORTED') {
                errorMsg = "⏳ *Timeout* - Try again later";
            }
            else if (e.message?.includes("ENOTFOUND")) {
                errorMsg = "🌐 *Network error* - Check your connection";
            }
            else if (errorData.message) {
                errorMsg = `❌ OpenAI Error: ${errorData.message}`;
            }

            reply(errorMsg + "\n\n💡 *Tip:* Try rephrasing your prompt");
        }
    }
);
