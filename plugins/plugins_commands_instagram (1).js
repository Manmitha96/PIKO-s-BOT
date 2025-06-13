const { cmd } = require("../command");
const { instagram } = require("instagram-url-direct");

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

      reply("*🔄 Fetching video... Please wait!*");

      const result = await instagram(q.trim());

      if (!result || !result.url_list || result.url_list.length === 0) {
        return reply("*⚠️ Failed to retrieve video. Please try again later.*");
      }

      const videoUrl = result.url_list[0]; // Usually first item is the main video

      const caption = `*💟 PIKO INSTA VIDEO DOWNLOADER 💜*

👑 *Type*: ${result.type || "Video"}
📸 *User*: ${result.username || "Unknown"}

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
      console.error("Instagram download error:", e);
      reply(`*❌ Error:* ${e.message || e}`);
    }
  }
);
