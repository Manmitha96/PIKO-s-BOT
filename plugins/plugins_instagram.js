const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "instagram",
    react: "📸",
    desc: "Download Instagram Photos, Videos, Reels, or Carousel",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, q, reply }
  ) => {
    try {
      if (!q) return reply("*Provide an Instagram post, reel, or story link.* 💜");

      // Try using a different API
      const apiUrl = `https://instagram-downloader-download-instagram-videos-stories.web.app/api?url=${encodeURIComponent(q)}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.media || data.media.length === 0) {
        return reply("❌ Failed to fetch media. Make sure the link is correct and public.");
      }

      const desc = `💜 *PIKO INSTAGRAM DOWNLOADER* 💜

🔗 *Media Link*: ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️
`;

      await reply(desc);

      for (let i = 0; i < data.media.length; i++) {
        const media = data.media[i];
        if (media.includes(".mp4")) {
          await robin.sendMessage(
            from,
            { video: { url: media }, caption: i === 0 ? "📹 *Instagram Video*" : undefined },
            { quoted: mek }
          );
        } else {
          await robin.sendMessage(
            from,
            { image: { url: media }, caption: i === 0 ? "🖼️ *Instagram Photo*" : undefined },
            { quoted: mek }
          );
        }
      }

      reply("*Sent Instagram Media!* 🧧");
    } catch (e) {
      console.error(e);
      if (e.code === 'ENOTFOUND' || e.code === 'EAI_AGAIN') {
        reply("❌ Instagram downloader service is temporarily unavailable. Please try again later.");
      } else {
        reply(`❌ Error: ${e.message}`);
      }
    }
  }
);
