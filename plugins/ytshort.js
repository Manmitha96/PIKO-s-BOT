const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "ytshort",
    react: "📱",
    desc: "Download YouTube Shorts",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      if (!q || !q.includes("youtube.com/shorts"))
        return reply("*Please provide a valid YouTube Shorts link.*\nExample: `.ytshort https://youtube.com/shorts/abc123`");

      // Format download request
      const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=720&url=${encodeURIComponent(q)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;

      const response = await axios.get(apiUrl);
      if (!response.data.success) throw new Error("Could not fetch video.");

      const { id, title } = response.data;
      const progressUrl = `https://p.oceansaver.in/ajax/progress.php?id=${id}`;

      // Wait for the download link to be ready
      let retries = 0;
      while (retries < 12) {
        const progress = await axios.get(progressUrl);
        if (progress.data.success && progress.data.progress === 1000) {
          const videoBuffer = await axios.get(progress.data.download_url, {
            responseType: "arraybuffer",
          });

          await robin.sendMessage(
            from,
            {
              video: videoBuffer.data,
              caption: `📱 *YouTube Shorts Downloaded*\n\n🎬 *${title}*\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`,
            },
            { quoted: mek }
          );
          return reply("*Short successfully downloaded!* 💜");
        }
        retries++;
        await new Promise((res) => setTimeout(res, 5000));
      }

      throw new Error("Timeout while processing video.");
    } catch (err) {
      console.error(err);
      reply(`❌ Error: ${err.message}`);
    }
  }
);
