const { cmd } = require('../command');
const { igdl } = require('ruhend-scraper');

cmd(
  {
    pattern: 'ig',
    desc: 'Download Instagram videos, images, and carousels.',
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

      const mediaList = result?.data;
      if (!mediaList || mediaList.length === 0) {
      return reply('*🔍 No media found at this URL.*');
      }

// 🔧 Filter out duplicates
const uniqueUrls = new Set();
const uniqueMedia = [];

for (const media of mediaList) {
  if (media?.url && !uniqueUrls.has(media.url)) {
    uniqueUrls.add(media.url);
    uniqueMedia.push(media);
  }
}

await m.react('✅');

for (let i = 0; i < uniqueMedia.length; i++) {
  const media = uniqueMedia[i];
  const isVideo = media.url.includes('.mp4');

  await client.sendMessage(m.chat, {
    [isVideo ? 'video' : 'image']: { url: media.url },
    caption: `📥 *Downloaded via IG Downloader*\n_Media ${i + 1} of ${uniqueMedia.length}_\n_CUDU NONA Bot 🤖_`,
    fileName: `instagram_media_${i + 1}.${isVideo ? 'mp4' : 'jpg'}`,
    mimetype: isVideo ? 'video/mp4' : 'image/jpeg'
  }, { quoted: m });
}

    } catch (e) {
      console.error("IG command error:", e);
      await m.react('❌');
      reply('*🚫 Unexpected error occurred while downloading Instagram content.*');
    }
  }
);
