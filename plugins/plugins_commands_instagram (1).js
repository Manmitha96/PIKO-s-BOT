const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "instagram",
    react: "📸",
    desc: "Download Instagram Post, Reel, or Video",
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
      if (!q) return reply("*Provide an Instagram post/reel/video link.* 💜");

      // You can replace this API endpoint if you have a better one!
      const apiUrl = `https://igdl-api.com/api/instagram?url=${encodeURIComponent(q)}`;

      const { data } = await axios.get(apiUrl);

      if (!data || !data.success || !data.result) {
        return reply("❌ Failed to fetch media. Make sure the link is correct and public.");
      }

      const results = Array.isArray(data.result) ? data.result : [data.result];

      let metaSent = false;

      for (const media of results) {
        const caption = media.caption || "";
        const author = media.username || "";
        let desc = `💜 *PIKO INSTAGRAM DOWNLOADER* 💜

👤 *Author*: ${author}
📝 *Caption*: ${caption}

🔗 *Post Link*: ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️
`;

        // Send thumbnail and info only once (for first media)
        if (!metaSent && media.thumbnail) {
          await robin.sendMessage(
            from,
            { image: { url: media.thumbnail }, caption: desc },
            { quoted: mek }
          );
          metaSent = true;
        }

        // Send media
        if (media.type === "image" || media.url.endsWith(".jpg")) {
          await robin.sendMessage(
            from,
            { image: { url: media.url } },
            { quoted: mek }
          );
        } else if (media.type === "video" || media.url.endsWith(".mp4")) {
          // Fetch video buffer for reliability
          const videoBuffer = await axios.get(media.url, { responseType: "arraybuffer" });
          await robin.sendMessage(
            from,
            { video: videoBuffer.data, caption: !metaSent ? desc : undefined },
            { quoted: mek }
          );
          metaSent = true;
        }
      }

      reply("*Thanks for using my Instagram downloader!* 💙");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);