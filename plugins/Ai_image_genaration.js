const { cmd } = require("../command");
const OpenAI = require("openai");
const { fetchJson } = require('../lib/functions');               
const config = require("../config");

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY, // ✅ pulled from config.js
});

cmd(
  {
    pattern: "imggen",
    alias: ["imagegen", "aiimage", "draw"],
    react: "🎨",
    desc: "Generate AI image from a text prompt",
    category: "ai",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    if (!q) {
      return reply(
        "*Please provide a prompt.* 🎨\nExample: .imggen a dreamy landscape at sunset"
      );
    }

    reply("🧠 *Generating your image... This may take 10–20 seconds.*");

    try {
      const res = await openai.images.generate({
        prompt: q,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = res.data[0].url;

      await robin.sendMessage(
        from,
        {
          image: { url: imageUrl },
          caption: `🎨 *Prompt:* ${q}\nPowered by DALL·E`,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("ImageGen error:", e);
      reply(`❌ *Error generating image:* ${e.message}`);
    }
  }
);
