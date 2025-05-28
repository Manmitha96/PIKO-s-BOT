const { cmd } = require("../command");
const axios = require("node-tiklydown");

cmd(
  {
    pattern: "tiktok",
    react: "🎵",
    desc: "Download TikTok Video by link",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      if (!q || !q.includes("tiktok.com")) {
        return reply("*Please provide a valid TikTok video link.* 🎵💜");
      }

      // API endpoint for TikTok video download (no watermark)
      const apiUrl = `https://api.tiklydown.net/api/download?url=${encodeURIComponent(q)}`;

      const response = await axios.get(apiUrl);
      if (
        response.data &&
        response.data.status &&
        response.data.video &&
        response.data.video.noWatermark
      ) {
        const videoUrl = response.data.video.noWatermark;
        const author = response.data.author ? response.data.author.unique_id : "Unknown";
        const desc = response.data.desc || "No description";

        // Send video
        await robin.sendMessage(
          from,
          {
            video: { url: videoUrl },
            caption: `🎵 *TikTok Video*\n👤 Author: ${author}\n📝 Description: ${desc}\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`,
          },
          { quoted: mek }
        );

        reply("*Thanks for using my bot!* 🎵💙");
      } else {
        reply("❌ Failed to fetch TikTok video. Try another link.");
      }
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
