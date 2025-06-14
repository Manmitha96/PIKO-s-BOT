const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");
const fs = require("fs");
const path = require("path");

// --- Configuration ---
const OPENAI_API_KEY = config.OPENAI_API_KEY;
const MAX_PROMPT_LENGTH = 400; // DALL·E 3 has a 400 character limit
const CACHE_DIR = path.join(__dirname, '../temp/dalle_cache');
const BANNED_WORDS = ['nude', 'sexual', 'porn', 'violence', 'gore', 'hitler', 'nsfw']; // Add more as needed

// Create cache directory if it doesn't exist
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
        // --- Input Validation ---
        if (!q) {
            const helpText = `🎨 *DALL·E 3 Image Generator*\n\n` +
                `🔹 *Usage:* \`.dalle <prompt>\`\n` +
                `🔹 *Options:*\n` +
                `   --hd - Higher quality (2x credits)\n` +
                `   --size=1024x1024 (default) | 1024x1792 (portrait) | 1792x1024 (landscape)\n\n` +
                `📝 *Example:* \`.dalle a futuristic city at sunset --hd --size=1792x1024\``;
            return reply(helpText);
        }

        if (!OPENAI_API_KEY) {
            return reply("❌ *OpenAI API key is missing!* Add it in config.js.");
        }

        // --- Parse Options ---
        const options = {
            quality: "standard",
            size: "1024x1024"
        };

        // Check for HD flag
        if (q.includes("--hd")) {
            options.quality = "hd";
            q = q.replace("--hd", "").trim();
        }

        // Check for size parameter
        const sizeMatch = q.match(/--size=(\d+x\d+)/);
        if (sizeMatch) {
            const validSizes = ["1024x1024", "1024x1792", "1792x1024"];
            if (validSizes.includes(sizeMatch[1])) {
                options.size = sizeMatch[1];
            } else {
                return reply(`❌ Invalid size! Valid options: ${validSizes.join(", ")}`);
            }
            q = q.replace(sizeMatch[0], "").trim();
        }

        // Validate prompt length
        if (q.length > MAX_PROMPT_LENGTH) {
            return reply(`❌ Prompt too long! Maximum ${MAX_PROMPT_LENGTH} characters. Your prompt has ${q.length} characters.`);
        }

        // Check for banned words
        const lowerPrompt = q.toLowerCase();
        const foundBannedWord = BANNED_WORDS.find(word => lowerPrompt.includes(word));
        if (foundBannedWord) {
            return reply(`⚠️ *Content warning:* Your prompt contains "${foundBannedWord}" which violates content policies. Please try a different prompt.`);
        }

        // --- Generate Image ---
        try {
            const processingMsg = await reply(`🎨 *Generating your DALL·E 3 image...*\n` +
                `📝 *Prompt:* ${q}\n` +
                `⚙️ *Settings:* ${options.quality.toUpperCase()} quality, ${options.size} size`);

            // Call DALL·E 3 API
            const response = await axios.post(
                "https://api.openai.com/v1/images/generations",
                {
                    model: "dall-e-3",
                    prompt: q,
                    n: 1,
                    size: options.size,
                    quality: options.quality,
                    response_format: "b64_json" // Get image as base64 to avoid URL expiration
                },
                {
                    headers: {
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 30000 // 30 seconds timeout
                }
            );

            // Process the image
            const imageData = response.data.data[0].b64_json;
            const imageBuffer = Buffer.from(imageData, 'base64');
            
            // Generate a filename with timestamp and first 10 chars of prompt
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const promptPrefix = q.replace(/[^a-z0-9]/gi, '_').substring(0, 10);
            const filename = `dalle_${promptPrefix}_${timestamp}.png`;
            const filePath = path.join(CACHE_DIR, filename);
            
            // Save to cache (optional)
            fs.writeFileSync(filePath, imageBuffer);

            // Send the image with detailed caption
            await robin.sendMessage(
                from,
                {
                    image: imageBuffer,
                    caption: `🖼️ *DALL·E 3 Generated Image*\n\n` +
                        `📝 *Prompt:* ${q}\n` +
                        `⚙️ *Settings:* ${options.quality.toUpperCase()} quality, ${options.size} size\n` +
                        `🕒 ${new Date().toLocaleString()}`,
                    mimetype: 'image/png'
                },
                { quoted: mek }
            );

            // Delete the processing message
            await robin.sendMessage(from, { delete: processingMsg.key });

        } catch (e) {
            console.error("DALL·E Error:", e.response?.data || e.message);
            let errorMsg = "❌ *Failed to generate image.*";

            // Enhanced error handling
            if (e.response?.data?.error) {
                const openaiError = e.response.data.error;
                
                if (openaiError.type === 'image_generation_user_error') {
                    errorMsg = "⚠️ *Image generation failed.* The prompt might contain content that DALL·E cannot process.";
                } else if (openaiError.message?.includes("safety system")) {
                    errorMsg = "⚠️ *Content policy violation.* Your prompt may contain restricted content.\n\n" +
                              "Try modifying your prompt to be more generic or less controversial.";
                } else if (openaiError.message?.includes("billing")) {
                    errorMsg = "💳 *Billing issue.* The OpenAI account has no credit or payment method.";
                } else if (openaiError.message?.includes("invalid_size")) {
                    errorMsg = "📏 *Invalid image size.* Valid sizes: 1024x1024, 1024x1792, or 1792x1024.";
                } else {
                    errorMsg = `❌ *OpenAI Error:* ${openaiError.message || openaiError.type || 'Unknown error'}`;
                }
            } else if (e.code === 'ECONNABORTED') {
                errorMsg = "⏳ *Request timeout.* The server took too long to respond. Try again later.";
            } else if (e.message?.includes("ENOTFOUND")) {
                errorMsg = "🌐 *Network error.* Could not connect to OpenAI servers.";
            }

            reply(errorMsg);
        }
    }
);
