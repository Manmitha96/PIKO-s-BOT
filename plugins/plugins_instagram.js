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

      // Example API: saveig.app (change if you have a preferred one)
      const apiUrl = `https://igdl.app/api/download?url=${encodeURIComponent(q)}`;
      const { data } = await axios.get(apiUrl, {
        headers: {
          "x-requested-with": "XMLHttpRequest"
        }
      });

      if (!data || !data.data || !Array.isArray(data.data.medias) || data.data.medias.length === 0) {
        return reply("❌ Failed to fetch media. Make sure the link is correct and public.");
      }

      const desc = `💜 *PIKO INSTAGRAM DOWNLOADER* 💜

🔗 *Media Link*: ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️
`;

      // Send metadata first
      await reply(desc);

      // Send all media (photos, videos, etc.)
      for (let i = 0; i < data.data.medias.length; i++) {
        const media = data.data.medias[i];
        if (media.type === "video") {
          await robin.sendMessage(
            from,
            {
              video: { url: media.url },
              caption: i === 0 ? "📹 *Instagram Video*" : undefined,
            },
            { quoted: mek }
          );
        } else if (media.type === "image") {
          await robin.sendMessage(
            from,
            {
              image: { url: media.url },
              caption: i === 0 ? "🖼️ *Instagram Photo*" : undefined,
            },
            { quoted: mek }
          );
        }
      }

      reply("*Sent Instagram Media!* 🧧");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
