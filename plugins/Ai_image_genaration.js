const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "imagine",
    react: "🎨",
    desc: "Generate AI Image",
    category: "ai",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      q,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*🖌️ Please enter a prompt to generate an image.*\nExample: .imagine a cyberpunk city at night 🌃");

      reply("🎨 *Generating image... please wait...*");

      // Use Lexica API or another free SD proxy
      const apiUrl = `https://lexica.art/api/v1/search?q=${encodeURIComponent(q)}`;
      const res = await axios.get(apiUrl);
      const images = res.data.images;

      if (!images || images.length === 0) {
        return reply("❌ No image found. Try a different prompt.");
      }

      const img = images[0].src;

      await robin.sendMessage(
        from,
        {
          image: { url: img },
          caption: `🎨 *Prompt:* ${q}\n🪄 *Made by PIKO AI*`,
        },
        { quoted: mek }
      );
    } catch (err) {
      console.error(err);
      reply("❌ Error generating image.");
    }
  }
);
