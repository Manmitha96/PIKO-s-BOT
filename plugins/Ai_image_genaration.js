const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

cmd(
    {
        pattern: "dalle",
        alias: ["aiimg", "draw", "genimage", "dalle3"],
        react: "🎨",
        desc: "Generate AI images using DALL·E 3",
        usage: ".dalle <prompt> [--hd] [--size=1024x1024|1024x1792|1792x1024]",
        category: "ai",
        filename: __filename,
    },
    async (robin, mek, m, { from, q, reply }) => {
        try {
            // --- Input Validation ---
            if (!q) {
                return reply(`🎨 *DALL·E 3 Image Generator*\n\n` +
                    `📝 *Example:* .dalle a cat astronaut wearing sunglasses\n` +
                    `⚙️ *Options:*\n` +
                    `--hd : Higher quality (2x cost)\n` +
                    `--size=1024x1792 : Portrait orientation`);
            }

            if (!config.OPENAI_API_KEY) {
                return reply("❌ OpenAI API key is not configured");
            }

            // --- Parse Options ---
            let prompt = q;
            let quality = "standard";
            let size = "1024x1024";

            // Extract --hd flag
            if (prompt.includes("--hd")) {
                quality = "hd";
                prompt = prompt.replace("--hd", "").trim();
            }

            // Extract size parameter
            const sizeMatch = prompt.match(/--size=(\d+x\d+)/);
            if (sizeMatch) {
                const validSizes = ["1024x1024", "1024x1792", "1792x1024"];
                if (validSizes.includes(sizeMatch[1])) {
                    size = sizeMatch[1];
                    prompt = prompt.replace(sizeMatch[0], "").trim();
                } else {
                    return reply("❌ Invalid size. Use: 1024x1024, 1024x1792, or 1792x1024");
                }
            }

            // Validate prompt
            if (prompt.length > 400) {
                return reply("❌ Prompt too long (max 400 characters)");
            }

            // --- Content Moderation ---
            const blockedTerms = ["nude", "sexual", "violence", "gore", "hate"];
            const containsBlocked = blockedTerms.some(term => 
                prompt.toLowerCase().includes(term)
            );
            
            if (containsBlocked) {
                return reply("⚠️ This prompt may violate content policies. Please try something else.");
            }

            // --- API Request ---
            const processingMsg = await reply("🔄 Creating your artwork...");

            const response = await axios.post(
                "https://api.openai.com/v1/images/generations",
                {
                    model: "dall-e-3",
                    prompt: prompt,
                    n: 1,
                    size: size,
                    quality: quality,
                    response_format: "b64_json"
                },
                {
                    headers: {
                        "Authorization": `Bearer ${config.OPENAI_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 60000
                }
            );

            // --- Handle Response ---
            if (!response.data.data || !response.data.data[0].b64_json) {
                throw new Error("Invalid API response format");
            }

            const imageBuffer = Buffer.from(response.data.data[0].b64_json, 'base64');

            await robin.sendMessage(
                from,
                {
                    image: imageBuffer,
                    caption: `🎨 *Generated Image*\n` +
                            `📝 "${prompt}"\n` +
                            `⚙️ ${quality.toUpperCase()} ${size}`
                },
                { quoted: mek }
            );

            // Clean up processing message
            await robin.sendMessage(from, { delete: processingMsg.key });

        } catch (error) {
            console.error("DALL·E Error:", error.response?.data || error.message);

            let userMessage = "❌ Failed to generate image";
            const errorData = error.response?.data?.error || {};

            // Handle specific error cases
            if (errorData.type === 'image_generation_user_error') {
                userMessage = "⚠️ DALL·E couldn't generate this image\n" +
                             "Possible reasons:\n" +
                             "• Content policy violation\n" +
                             "• Overly abstract/vague prompt\n" +
                             "• Technical limitations";
            } 
            else if (error.response?.status === 429) {
                userMessage = "⏳ Too many requests - Please try again later";
            }
            else if (error.code === 'ECONNABORTED') {
                userMessage = "⌛ Request timed out - Try again";
            }
            else if (error.message.includes("ENOTFOUND")) {
                userMessage = "🌐 Network error - Check your connection";
            }
            else if (error.response?.status === 401) {
                userMessage = "🔑 Invalid API key - Check your configuration";
            }

            reply(`${userMessage}\n\n💡 *Tip:* Try making your prompt more specific`);
        }
    }
);
