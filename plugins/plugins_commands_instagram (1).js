const { cmd } = require("../command");
const instagramGetUrl = require("instagram-url-direct");

cmd(
  {
    pattern: "ig",
    react: "📷",
    desc: "Download Instagram Video, Reel, or Post",
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

      // Get download links using instagram-url-direct
      const results = await instagramGetUrl(q);

      if (!results.ok || !results.url_list || results.url_list.length === 0) {
        return reply("❌ Failed to fetch media. Make sure the Instagram link is correct and public.");
      }

      // Send each media file (video/photo)
      for (let i = 0; i < results.url_list.length; i++) {
        const url = results.url_list[i].url;
        const type = results.url_list[i].type; // "video" or "image"
        const caption =
          i === 0
            ? `📮 *Instagram Downloader*\n${results.url_list.length} file(s)\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`
            : undefined;

        if (type === "video") {
          await robin.sendMessage(
            from,
            { video: { url }, caption },
            { quoted: mek }
          );
        } else {
          await robin.sendMessage(
            from,
            { image: { url }, caption },
            { quoted: mek }
          );
        }
      }

      reply("*Sent Instagram media!* 💙");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
