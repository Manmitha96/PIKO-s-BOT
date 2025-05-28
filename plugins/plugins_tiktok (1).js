const { cmd } = require("../command");
const tiklydown = require("node-tiklydown");

cmd(
  {
    pattern: "tiktok",
    react: "🎵",
    desc: "Get TikTok video or slideshow download link",
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
      if (!q) return reply("*Provide a TikTok link.* 🎵");

      // Use tiklydown to fetch download info
      const result = await tiklydown(q);

      if (!result || (!result.video && !result.images)) {
        return reply("❌ Could not fetch download link. Make sure the TikTok link is valid.");
      }

      let msg = "🎵 *TikTok Downloader*\n\n";

      if (result.video) {
        msg += `🔗 *Video Download Link*: ${result.video}\n`;
      }

      if (result.images && result.images.length > 0) {
        msg += `🖼️ *Slideshow Images Download Links:*\n`;
        result.images.forEach((img, i) => {
          msg += `${i + 1}. ${img}\n`;
        });
      }

      reply(msg + "\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);