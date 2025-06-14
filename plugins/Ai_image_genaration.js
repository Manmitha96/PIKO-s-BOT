const { cmd } = require("../command");
const OpenAI = require("openai");
const axios = require("axios");
const config = require("../config");

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

cmd(
  {
    pattern: "imagine",
    react: "🎨",
    desc: "Generate AI image using DALL·E",
    category: "ai",
    filename: __filename,
  },
  const prompt = typeof text === "string" ? text : (text?.text || "");
  if (!prompt) return reply("❌ Please provide a prompt.\n*Example:* `.imagine a dragon flying over a volcano`");

const res = await openai.images.generate({
  prompt,
  n: 1,
  size: "1024x1024"
});

    try {
      await reply("🎨 Generating image... please wait...");

      const res = await openai.images.generate({
        prompt: text,
        n: 1,
        size: "1024x1024"
      });

      const imageUrl = res.data[0].url;
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      await conn.sendMessage(m.chat, { image: buffer, caption: `🖼️ Prompt: ${text}` }, { quoted: m });

    } catch (err) {
      console.error("❌ DALL·E error:", err.response?.data || err.message);
      reply("❌ Error generating image. Please try again later.");
    }
  }
);
