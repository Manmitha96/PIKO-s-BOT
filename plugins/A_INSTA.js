const { cmd } = require('../command');
const { igdl } = require('ruhend-scraper');
const axios = require('axios');
const cheerio = require('cheerio');

cmd(
  {
    pattern: 'ig',
    desc: 'Download Instagram posts or profile picture',
    category: 'download',
    filename: __filename,
  },
  async (client, m, mek, { q, reply }) => {
    try {
      if (!q || !q.includes('instagram.com')) {
        return reply('*🚫 Please provide a valid Instagram URL.*');
      }

      await m.react('🔎');

      // === [ PROFILE PICTURE HANDLER ] ===
      const isProfileLink = /^https:\/\/(www\.)?instagram\.com\/[^\/]+\/?$/.test(q.trim());

      if (isProfileLink) {
        try {
          const res = await axios.get(q, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
          });

          const $ = cheerio.load(res.data);
          const json = JSON.parse(
            $('script[type="application/ld+json"]').html() || '{}'
          );
          const profilePic = json?.image;

          if (!profilePic) {
            return reply('*⚠️ Could not extract profile picture. Profile may be private.*');
          }

          await client.sendMessage(m.chat, {
            image: { url: profilePic },
            caption: `👤 *Profile Picture*\n🔗 ${q}`,
          }, { quoted: m });

          await m.react('✅');
          return;
        } catch (err) {
          console.error('Profile pic fetch error:', err);
          return reply('*❌ Failed to fetch profile picture.*');
        }
      }

      // === [ NORMAL POST HANDLER ] ===
      let result;
      try {
        result = await igdl(q);
      } catch (err) {
        console.error('Scraper error:', err);
        return reply('*❌ Failed to fetch post data. Link may be private.*');
      }

      if (!result?.data || result.data.length === 0) {
        return reply('*🕵️ No media found for this link.*');
      }

      const filteredMedia = result.data.filter(media =>
        q.includes('/p/') || q.includes('/reel/') || q.includes('/tv/')
          ? media.url.includes('/p/') || media.url.includes('/reel/') || media.url.includes('/tv/')
          : true
      );

      if (filteredMedia.length === 0) {
        return reply('*⚠️ No valid media found.*');
      }

      for (const media of filteredMedia) {
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
