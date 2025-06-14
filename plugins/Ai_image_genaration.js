const { cmd } = require("../command");
const { Configuration, OpenAIApi } = require("openai");
const axios = require("axios");
const fs = require("fs");
const configKey = require("../config"); // import your config.js

const configuration = new Configuration({
  apiKey: config.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

cmd(
  {
    pattern: "imagine",
    react: "🎨",
    desc: "Generate AI image using DALL·E",
    category: "ai",
    filename: __filename,
  },
  async (conn, m, text, { reply }) => {
    if (!text) return reply("❌ Please provide a prompt.\n*Example:* `.imagine a dragon flying over a volcano`");

    try {
      await reply("🎨 Generating image... please wait...");

      const res = await openai.createImage({
        prompt: text,
        n: 1,
        size: "1024x1024",
        response_format: "url",
      });

      const imageUrl = res.data.data[0].url;
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      await conn.sendMessage(m.chat, { image: buffer, caption: `🖼️ Prompt: ${text}` }, { quoted: m });

    } catch (err) {
      console.error("❌ DALL·E error:", err.message);
      reply("❌ Error generating image. Try again later.");
    }
  }
);
