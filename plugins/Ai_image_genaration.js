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
    const prompt = text?.trim() || m?.body?.replace(/^\.?imagine\s+/i, "").trim();
    if (!prompt) return await m.reply("Example: .imagine a cute cat");

    await m.reply("🔄 Generating image (Free DeepAI Model)...");

    try {
      // DeepAI API Call
      const { data } = await axios.post(
        "https://api.deepai.org/api/text2img",
        { text: prompt },
        { headers: { "api-key": config.DEEPAI_API_KEY } }
      );

      // Download and send image
      const imageBuffer = (await axios.get(data.output_url, { 
        responseType: "arraybuffer" 
      })).data;

      await conn.sendMessage(
        m.chat,
        { 
          image: Buffer.from(imageBuffer), 
          caption: `🎨 ${prompt}\n(Generated via DeepAI)` 
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("DeepAI Error:", err.response?.data || err);
      await m.reply(
        err.response?.data?.detail?.includes("limit") 
          ? "❌ Free monthly quota exhausted (50 images)"
          : "❌ Error: " + (err.message || "Check console")
      );
    }
  }
);
