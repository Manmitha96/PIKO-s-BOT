const { cmd } = require("../command");
const { v1 } = require("node-tiklydown"); // or use v2, v3, etc. if needed
const axios = require("axios");

cmd(
  {
    pattern: "tiktok",
    react: "🎵",
    desc: "Download TikTok Video or Slideshow",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      if (!q || !q.includes("tiktok.com"))
        return reply(
          "*Please provide a valid TikTok video link.* 🎯\n\n👁️‍🗨️ Example:\n.tiktok https://www.tiktok.com/@user/video/123456789"
        );

      const result = await v1(q);
      if (!result || !result.status) throw new Error("Failed to fetch TikTok media.");

      const { type, title, video, images } = result.data;

      if (type === "video" && video) {
        const buffer = await axios.get(video, { responseType: "arraybuffer" });
        await robin.sendMessage(
          from,
          {
            video: buffer.data,
            caption: `🎥 *TikTok Video*\n\n🎬 *${title}*\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`,
          },
          { quoted: mek }
        );
        return reply("*Video downloaded successfully!* ✅");
      }

      if (type === "image" && Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          const imgBuffer = await axios.get(images[i], { responseType: "arraybuffer" });
          await robin.sendMessage(
            from,
            {
              image: imgBuffer.data,
              caption: `🖼️ *Slide ${i + 1} of ${images.length}*\n🎬 *${title}*`,
            },
            { quoted: mek }
          );
        }
        return reply("*Slideshow downloaded successfully!* 🖼️✅");
      }

      throw new Error("Unsupported TikTok content or format.");
    } catch (err) {
      console.error(err);
      reply(`❌ Error: ${err.message}`);
    }
  }
);
