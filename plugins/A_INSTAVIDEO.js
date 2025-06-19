const { cmd } = require('../command');
const { igdl } = require('ruhend-scraper');

cmd(
  {
    pattern: 'igvideo',
    desc: 'Download Instagram Reels only',
    category: 'download',
    filename: __filename,
  },
  async (client, m, mek, { q, reply }) => {
    try {
      if (!q || !q.includes("instagram.com")) {
        return reply('*🚫 Please provide a valid Instagram URL.*');
      }

      await m.react('⏳');
      let result;
      try {
        result = await igdl(q);
      } catch (err) {
        console.error("Scraper error:", err);
        return reply('*❌ Failed to fetch data. Instagram may have changed or the link is private.*');
      }

      if (!result?.data || result.data.length === 0) {
        return reply('*🔍 No media found for this link.*');
      }

      // Reject if content is not video (e.g., image post)
      const video = result.data.find(v => v.url?.includes("http") && v.url.endsWith(".mp4"));
      if (!video) {
        return reply('*⚠️ This command only supports Reels (video content). Post with images are not supported.*');
      }

      await m.react('✅');
      await client.sendMessage(m.chat, {
        video: { url: video.url },
        caption: '📥 *Downloaded via IG Downloader*\n_PIKO BOT 🤖_',
        fileName: 'instagram_video.mp4',
        mimetype: 'video/mp4'
      }, { quoted: m });
    } catch (e) {
      console.error("IG command error:", e);
      await m.react('❌');
      reply('*🚫 Unexpected error occurred while downloading.*');
    }
  }
);
