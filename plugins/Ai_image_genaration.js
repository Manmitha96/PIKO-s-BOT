const { cmd } = require("../command");
const { fetchJson } = require('../lib/functions');
const config = require("../config"); // Make sure your Gemini API key is in config.js

// Import the Google Generative AI SDK
const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");

// --- Configuration ---
// Load Gemini API Key from your config file
const GEMINI_API_KEY = config.GEMINI_API_KEY; // Ensure this matches the key name in your config.js

if (!GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is not set in config.js. Image generation will not work.");
    // Optionally, you might want to exit or disable the command if the key is missing.
}

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Choose the appropriate Gemini model for image generation
// 'gemini-2.0-flash-preview-image-generation' is a good starting point.
// For higher quality/control (and potentially higher cost), you might use 'imagen-3.0-generate-002'
// if you have access to it and are on the paid tier.
const MODEL_NAME = "gemini-2.0-flash-preview-image-generation";

// --- Command Definition ---
cmd(
    {
        pattern: "imggen", // You can keep this or use 'imggen_gemini' as previously suggested
        alias: ["imagegen", "aiimage", "draw"], // Keep or adjust aliases
        react: "✨", // A nice reaction emoji
        desc: "Generate AI image from a text prompt using Gemini API",
        category: "ai",
        filename: __filename,
    },
    async (robin, mek, m, { from, q, reply }) => {
        // --- Input Validation ---
        if (!q) {
            return reply(
                "*Please provide a prompt.* ✨\nExample: .imggen a serene landscape with a river and mountains"
            );
        }

        if (!GEMINI_API_KEY) {
            return reply("❌ *Gemini API key is missing. Please configure it in config.js.*");
        }

        // --- User Feedback ---
        reply("🧠 *Generating your image with Gemini... Please wait.*");

        try {
            // --- Gemini API Call ---
            const model = genAI.getGenerativeModel({
                model: MODEL_NAME,
                generationConfig: {
                    // Important: Specify that you expect an image response
                    responseMimeType: "image/jpeg", // or "image/png"
                },
                // Optional: Safety settings to control content blocking
                // Adjust these based on your application's needs and compliance.
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                ],
            });

            // Send the prompt to the Gemini model
            const result = await model.generateContent(q);
            const response = await result.response;

            // Extract the image data from the response
            // The image data is typically Base64 encoded within 'inlineData'
            const imagePart = response.candidates[0]?.content?.parts?.find(part =>
                part.inlineData && part.inlineData.mimeType.startsWith('image/')
            );

            // --- Handle No Image Output ---
            if (!imagePart) {
                console.error("Gemini API did not return an image part for prompt:", q);
                return reply("❌ *Gemini did not generate an image for that prompt. It might have returned text only, or the content was blocked by safety filters.*");
            }

            // Convert the Base64 image data to a Buffer
            const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');

            // --- Send Image to User ---
            // This assumes 'robin.sendMessage' can directly handle a Buffer for images.
            // If your bot framework requires a URL, you'll need to upload the imageBuffer
            // to a temporary hosting service and then send its URL.
            await robin.sendMessage(
                from,
                {
                    image: imageBuffer, // Send the image as a Buffer
                    caption: `✨ *Prompt:* ${q}\nGenerated with Gemini`,
                },
                { quoted: mek }
            );

        } catch (e) {
            // --- Error Handling ---
            console.error("Gemini ImageGen error:", e);
            let errorMessage = "An unknown error occurred.";

            // Provide more specific error messages if possible
            if (e.message.includes("400") || e.message.includes("bad request")) {
                errorMessage = "Invalid request or prompt. Please try a different prompt.";
            } else if (e.message.includes("429")) {
                errorMessage = "Too many requests. Please try again in a moment (rate limit exceeded).";
            } else if (e.message.includes("403") || e.message.includes("API key")) {
                 errorMessage = "Authentication error. Your Gemini API key might be invalid or improperly configured.";
            } else if (e.message.includes("safety settings")) {
                errorMessage = "The prompt or generated content was blocked by safety settings. Please try a different prompt.";
            } else {
                errorMessage = e.message; // Fallback to raw error message
            }
            reply(`❌ *Error generating image with Gemini:* ${errorMessage}`);
        }
    }
);
