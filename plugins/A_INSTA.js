const { cmd } = require('../command');
const { igdl } = require('ruhend-scraper');

cmd(
  {
    pattern: 'ig',
    desc: 'Download Instagram image posts only.',
    category: 'download',
    filename: __filename,
  },
  async (client, m, mek, { q, reply }) => {
    try {
      if (!q || !q.includes("instagram.com")) {
        return reply('*🚫 Please provide a valid Instagram post URL.*');
      }

      await m.react('⏳');

      let result;
      try {
        result = await igdl(q);
      } catch (err) {
        console.error("Scraper error:", err);
        return reply('*❌ Failed to fetch data. The link may be private or invalid.*');
      }

      const mediaList = result?.data;
      if (!mediaList || mediaList.length === 0) {
        return reply('*🔍 No media found at this URL.*');
      }

      // Filter unique image URLs only
      const uniqueUrls = new Set();
      const imageMedia = [];

      for (const media of mediaList) {
        if (media?.url && !uniqueUrls.has(media.url) && !media.url.includes('.mp4')) {
          uniqueUrls.add(media.url);
          imageMedia.push(media);
        }
      }

      if (imageMedia.length === 0) {
        return reply('*🚫 This command only supports Instagram image posts. No images found in the given post.*');
      }

      await m.react('✅');

      for (let i = 0; i < imageMedia.length; i++) {
        const media = imageMedia[i];

        await client.sendMessage(m.chat, {
          image: { url: media.url },
          caption: `🖼️ *Downloaded Instagram Image*\n_Media ${i + 1} of ${imageMedia.length}_\n_CUDU NONA Bot 🤖_`,
          fileName: `instagram_image_${i + 1}.jpg`,
          mimetype: 'image/jpeg'
        }, { quoted: m });
      }

    } catch (e) {
      console.error("IG command error:", e);
      await m.react('❌');
      reply('*🚫 An unexpected error occurred while downloading Instagram images.*');
    }
  }
);
