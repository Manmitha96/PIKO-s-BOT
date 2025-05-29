const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "tiktok",
    react: "🎵",
    desc: "Download TikTok Video",
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
      if (!q) return reply("*Provide a TikTok video link or ID.* 🎵💜");

      // Optional: Validate TikTok link or ID here
      
      // API endpoint (using tikwm.com as an example)
      const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(q)}`;

      const { data } = await axios.get(apiUrl);

      if (!data || data.code !== 0 || !data.data) {
        return reply("❌ Failed to fetch video. Make sure the link is correct.");
      }

      const videoUrl = data.data.play; // No watermark
      const title = data.data.title || "TikTok Video";
      const author = data.data.author.nickname || data.data.author.unique_id || "";
      const thumbnail = data.data.cover;

      let desc = `🎵 *PIKO TIKTOK DOWNLOADER* 🎵

👤 *Author*: ${author}
📝 *Title*: ${title}
🔗 *Video Link*: ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️
`;

      // Send metadata and thumbnail message
      await robin.sendMessage(
        from,
        { image: { url: thumbnail }, caption: desc },
        { quoted: mek }
      );

      // Fetch video buffer
      const videoBuffer = await axios.get(videoUrl, { responseType: "arraybuffer" });

      // Send video
      await robin.sendMessage(
        from,
        {
          video: videoBuffer.data,
          caption: `🎵 *${title}*\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`,
        },
        { quoted: mek }
      );
      reply("*Thanks for using my bot!* 🎵💙");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);