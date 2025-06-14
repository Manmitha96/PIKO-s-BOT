const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

cmd(
    {
        pattern: "draw",
        alias: ["dalle", "abstract"],
        react: "🎨",
        desc: "Generate abstract or conceptual AI art",
        usage: ".draw <concept> [--style=artistic|photographic|painting]",
        category: "ai",
        filename: __filename,
    },
    async (robin, mek, m, { from, q, reply }) => {
        try {
            if (!q) {
                return reply(`🎨 *Abstract Art Generator*\n\n` +
                    `📝 *Examples:*\n` +
                    `.draw freedom and open road --style=artistic\n` +
                    `.draw futuristic city at night --style=photographic\n` +
                    `.draw emotional landscape --style=painting`);
            }

            if (!config.OPENAI_API_KEY) {
                return reply("❌ API key not configured");
            }

            // Parse style option
            let style = "artistic";
            const styleMatch = q.match(/--style=(\w+)/);
            if (styleMatch) {
                const validStyles = ["artistic", "photographic", "painting"];
                if (validStyles.includes(styleMatch[1])) {
                    style = styleMatch[1];
                    q = q.replace(styleMatch[0], "").trim();
                }
            }

            // Transform abstract concepts into more concrete prompts
            const promptEnhancements = {
                "freedom and open road": `An ${style} interpretation of freedom: winding road through majestic mountains, ` +
                                         `golden sunlight filtering through trees, vibrant colors blending together, ` +
                                         `sense of endless possibility, dynamic brushstrokes`,
                "emotional landscape": `A ${style} landscape that evokes deep emotion, with dramatic lighting and ` +
                                      `expressive color palette, conveying a powerful mood`,
                "abstract concept": `A ${style} composition using shapes and colors to represent the idea, ` +
                                   `with visual metaphors and symbolic elements`
            };

            let finalPrompt = q;
            for (const [concept, enhancement] of Object.entries(promptEnhancements)) {
                if (q.toLowerCase().includes(concept)) {
                    finalPrompt = enhancement;
                    break;
                }
            }

            // Ensure prompt isn't too abstract
            if (finalPrompt === q && q.split(" ").length < 5) {
                return reply("⚠️ *Too abstract!* Try adding more descriptive details\n" +
                            "Example: Instead of 'freedom', try 'open road through mountains at sunset'");
            }

            const processingMsg = await reply(`🔄 Creating your ${style} interpretation...`);

            const response = await axios.post(
                "https://api.openai.com/v1/images/generations",
                {
                    model: "dall-e-3",
                    prompt: `${finalPrompt}. ${style} style, highly detailed, visually striking composition`,
                    n: 1,
                    size: "1024x1024",
                    quality: "standard",
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

            const imageBuffer = Buffer.from(response.data.data[0].b64_json, 'base64');
            
            await robin.sendMessage(
                from,
                {
                    image: imageBuffer,
                    caption: `🎨 *Generated Artwork*\n` +
                            `📝 "${q}"\n` +
                            `🎭 Style: ${style.charAt(0).toUpperCase() + style.slice(1)}`
                },
                { quoted: mek }
            );

            await robin.sendMessage(from, { delete: processingMsg.key });

        } catch (error) {
            console.error("Art Generation Error:", error.response?.data || error.message);
            
            let errorMsg = "❌ Couldn't create artwork";
            if (error.response?.data?.error?.type === 'image_generation_user_error') {
                errorMsg = "⚠️ DALL·E struggled with this concept\n" +
                           "Try:\n" +
                           "1. Adding more concrete details\n" +
                           "2. Using a different style (--style=photographic)\n" +
                           "3. Breaking the concept into simpler elements";
            }
            
            reply(errorMsg);
        }
    }
);
