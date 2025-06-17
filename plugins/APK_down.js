const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "insta",
  react: "📥",
  desc: "Download Instagram posts, reels & stories via RapidAPI",
  category: "download",
  filename: __filename,
}, async (robin, m, mInfo, { q, reply }) => {
  if (!q || !q.match(/instagram\.com\/(p|reel|stories)\//i)) {
    return reply("*Please provide a valid Instagram URL.*");
  }

  try {
    reply("🔍 Fetching media...");

    const options = {
      method: 'GET',
      url: 'https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/rapid',
      params: { url: q },
      headers: {
        'x-rapidapi-host': 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com',
        'x-rapidapi-key': '357f2a3860msh11033c39446b348p1ef9d8jsn14785ad5bd6d'
      }
    };

    const { data } = await axios.request(options);

    if (!data.media || data.media.length === 0) {
      return reply("*No media found or the post is private.*");
    }

    // Send each media item (photo/video)
    for (let item of data.media) {
      const sendOptions = item.type === 'video'
        ? { video: { url: item.url } }
        : { image: { url: item.url } };

      await robin.sendMessage(m.chat, sendOptions, { quoted: m });
    }

  } catch (err) {
    console.error(err);
    reply("*Failed to download Instagram media.*");
  }
});
