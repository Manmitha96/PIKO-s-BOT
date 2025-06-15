const { cmd } = require("../command");
const axios = require("axios");

// This is an unofficial, public API endpoint for Bing/Copilot Image Generation (DALL-E 3).
// Its availability is not guaranteed, but it is currently a popular choice for bots.
const API_URL = "https://aemt.me/bingimg";

cmd(
  {
    pattern: "codraw",
    react: "🖌️",
    desc: "Generate images using Microsoft Copilot's AI (DALL-E 3).",
    category: "ai",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, q, reply }
  ) => {
    try {
      if (!q) {
        return reply(
          "🖌️ *Please provide a detailed prompt to generate an image with Copilot.*\n\n" +
          "*Example:* .codraw a cinematic, photorealistic shot of an astronaut discovering a glowing forest on a distant alien planet"
        );
      }

      // 1. Send a loading message to the user
      await reply("🤖 *Accessing Microsoft Copilot's AI...*\n*Please wait, DALL-E 3 is creating your vision...* ✨");

      // 2. Prepare the prompt for the API
      const encodedPrompt = encodeURIComponent(q);
      const requestUrl = `${API_URL}?text=${encodedPrompt}`;

      // 3. Get the image URLs from the API
      const apiResponse = await axios.get(requestUrl, {
          timeout: 120000, // 2-minute timeout as DALL-E 3 can be slow
      });

      // 4. Validate the API response
      if (!apiResponse.data || !apiResponse.data.result || apiResponse.data.result.length === 0) {
        throw new Error("The AI did not return any images. Your prompt might be unsafe or the service is currently down.");
      }

      // 5. Download the first image from the returned URLs
      const imageUrl = apiResponse.data.result[0];
      const imageBuffer = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      
      if (!imageBuffer.data) {
          throw new Error("Failed to download the generated image from the URL.");
      }

      // 6. Prepare the caption
      const caption = `🖌️ *Copilot (DALL-E 3) Image* 🖌️\n\n` +
                      `*✨ Prompt:* ${q}\n\n` +
                      `*Powered by Microsoft*`;

      // 7. Send the final image with the caption
      await robin.sendMessage(
        from,
        {
          image: imageBuffer.data,
          caption: caption,
        },
        { quoted: mek }
      );

    } catch (e) {
      console.error("CoDraw Error:", e);
      
      // Provide specific and helpful error messages
      if (e.code === 'ECONNABORTED') {
        reply("❌ *Error:* The request to the AI timed out. It's likely under heavy load. Please try again in a few moments.");
      } else if (e.message.includes("unsafe")) {
        reply("❌ *Error:* Your prompt was flagged as unsafe by the AI. Please modify your text and try again.");
      } else if (e.response && e.response.status >= 500) {
        reply("❌ *Error:* The AI service (Copilot/DALL-E 3) is currently unavailable or experiencing issues. Please try again later.");
      } else {
        reply(`❌ *An error occurred while generating the image:*\n${e.message}`);
      }
    }
  }
);
