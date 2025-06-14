const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

cmd(
  {
    pattern: "imagine",
    react: "🎨",
    desc: "Free AI image generation via DeepAI",
    category: "ai",
    filename: __filename,
  },
  async (conn, m, text) => {
    // Robust prompt extraction
    let prompt = "";
    if (m && m.body) {
      prompt = m.body.replace(/^\.?imagine\s*/i, "").trim();
    } else if (typeof text === "string") {
      prompt = text.trim();
    }

    if (!prompt) return await m.reply("❌ Please provide a prompt.\nExample: `.imagine a cute cat`");

    await m.reply("🔄 Generating image (Free DeepAI Model)...");

    try {
      // DeepAI API Call
      const { data } = await axios.post(
        "https://api.deepai.org/api/text2img",
        { text: prompt },
        { 
          headers: { "api-key": config.DEEPAI_API_KEY },
          timeout: 30000 // 30-second timeout
        }
      );

      if (!data.output_url) throw new Error("No image URL returned");

      // Download with timeout
      const imageResponse = await axios.get(data.output_url, {
        responseType: "arraybuffer",
        timeout: 15000 // 15-second timeout
      });

      await conn.sendMessage(
        m.chat,
        { 
          image: Buffer.from(imageResponse.data),
          caption: `🎨 ${prompt}\n(Generated via DeepAI)` 
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("DeepAI Error:", err.response?.data || err.message);
      let errorMsg = "❌ Error generating image";
      if (err.response?.status === 403) {
        errorMsg = "❌ Free monthly quota exhausted (50 images)";
      } else if (err.message.includes("timeout")) {
        errorMsg = "❌ Server took too long to respond";
      }
      await m.reply(errorMsg);
    }
  }
);
