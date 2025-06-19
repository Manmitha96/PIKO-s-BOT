const { cmd } = require('../command');
const { igdl } = require('ruhend-scraper');

cmd(
  {
    pattern: 'ig',
    desc: 'Download Instagram videos, photos, or reels',
    category: 'download',
    filename: __filename,
  },
  async (client, m, mek, { q, reply }) => {
    try {
      if (!q || !q.includes('instagram.com')) {
        return reply('*🚫 Please provide a valid Instagram URL.*');
      }

      await m.react('🔎');

      let result;
      try {
        result = await igdl(q);
      } catch (err) {
        console.error('Scraper error:', err);
        return reply('*❌ Failed to fetch data. Instagram may have changed or the link is private.*');
      }

      if (!result?.data || result.data.length === 0) {
        return reply('*🕵️ No media found at this link.*');
      }

      await m.react('📤');

      // Send all media (videos/photos) found
      for (const media of result.data) {
        const mediaType = media.url.endsWith('.mp4') ? 'video' : 'image';
        const fileOptions = {
          caption: `📥 *Downloaded via IG Downloader*\n_CUDU NONA Bot 🤖_`,
          mimetype: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
          fileName: `instagram_media.${mediaType === 'video' ? 'mp4' : 'jpg'}`
        };

        await client.sendMessage(m.chat, {
          [mediaType]: { url: media.url },
          ...fileOptions
        }, { quoted: m });
      }

      await m.react('✅');
    } catch (e) {
      console.error('IG command error:', e);
      await m.react('❌');
      reply('*🚫 Unexpected error occurred while downloading.*');
    }
  }
);
