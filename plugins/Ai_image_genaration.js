const { cmd } = require("../command");
const { OpenAI } = require("openai");
const config = require('../config');

const OPENAI_API_KEY = config.OPENAI_API_KEY;

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
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const openai = new OpenAI(configuration);

      const res = await openai.createImage({
        prompt: q,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = res.data.data[0].url;

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
