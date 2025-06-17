const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "insta",
    react: "📥",
    desc: "Download Instagram videos or images",
    category: "downloader",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      const url = args[0];

      if (!url || !/^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories|reels?)\//i.test(url)) {
        await robin.sendMessage(from, { react: { text: "🤨", key: mek.key } });
        return reply(`*Usage:* .${command} <instagram_url>\n\n_Example:_ .${command} https://www.instagram.com/reel/xyz`);
      }

      await robin.sendMessage(from, { react: { text: "🕥", key: mek.key } });

      const apiURL = `https://aemt.me/download/igdl?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiURL);
      const data = response.data;

      if (!data.status || !data.result || data.result.length === 0) {
        throw new Error("No media found or private account.");
      }

      for (let media of data.result) {
        if (media.url.includes(".mp4")) {
          await robin.sendMessage(
            from,
            { video: { url: media.url }, caption: "📥 *Instagram Video Downloaded*" },
            { quoted: mek }
          );
        } else if (media.url.includes(".jpg") || media.url.includes(".png")) {
          await robin.sendMessage(
            from,
            { image: { url: media.url }, caption: "📷 *Instagram Image Downloaded*" },
            { quoted: mek }
          );
        }
      }

      await robin.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
      console.error("Instagram Download Error:", e.message);
      await robin.sendMessage(from, { react: { text: "😑", key: mek.key } });
      reply(`❌ *Failed to download media.*\n\n_Error:_ ${e.message}`);
    }
  }
);
