const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "insta",
    alias: ["instagram", "ig"],
    react: "📸",
    desc: "Download Instagram Video",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, q, reply }
  ) => {
    try {
      if (!q) return reply("*Please provide a valid Instagram video URL!* ❌");

      const instaRegex = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(p|reel|tv)\/[A-Za-z0-9_\-]+/;
      if (!instaRegex.test(q.trim()))
        return reply("*Invalid Instagram URL! Please check and try again.* ❌");

      reply("*🔄 Downloading from Instagram... Please wait!*");

      // Using SL Code Lords API
      const res = await axios.get(
        `https://api.sl-code-lords.xyz/api/ig/download?url=${encodeURIComponent(q)}&apikey=slc_01`
      );

      const data = res.data;

      if (!data || !data.url || data.url.length === 0) {
        return reply("*⚠️ Failed to retrieve video. Please try again later.*");
      }

      const videoUrl = data.url[0];

      const caption = `*💟 PIKO INSTA VIDEO DOWNLOADER 💜*

👑 *Type*: ${data.type || "Video"}
📸 *User*: ${data.author || "Unknown"}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O*`;

      await robin.sendMessage(
        from,
        {
          image: {
            url: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/2025051319552258.jpg",
          },
          caption,
        },
        { quoted: mek }
      );

      await robin.sendMessage(
        from,
        {
          video: { url: videoUrl },
          caption: "*----------INSTA VIDEO----------*",
        },
        { quoted: mek }
      );

      return reply("*✅ Upload completed successfully!*");
    } catch (e) {
      console.error("Instagram download error:", e.response?.data || e.message);
      reply(`*❌ Error:* ${e.response?.data?.message || e.message || "Unknown error"}`);
    }
  }
);
