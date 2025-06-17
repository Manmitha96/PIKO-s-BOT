const { cmd } = require("../command");
const axios = require("axios");
const { fetchJson } = require("../lib/functions"); // or replace with axios if you don't have fetchJson

cmd({
  pattern: "insta ?(.*)",
  react: "📸",
  desc: "Download Instagram photos, videos, reels, etc.",
  category: "download",
  filename: __filename,
}, async (robin, m, mInfo, { q, reply }) => {
  if (!q || !q.includes("instagram.com")) {
    return reply("*Please provide a valid Instagram URL.*");
  }

  try {
    reply("📥 *Fetching Instagram media...*");

    const apiUrl = `https://api.sociohive.com/instadl?url=${encodeURIComponent(q)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data || !data.media || data.media.length === 0) {
      return reply("*No media found or the post is private.*");
    }

    for (let media of data.media) {
      await robin.sendMessage(m.chat, {
        [media.type === "video" ? "video" : "image"]: { url: media.url },
        caption: "*Downloaded from Instagram* 📥",
      }, { quoted: m });
    }

  } catch (err) {
    console.error(err);
    reply("*Failed to download Instagram media.*");
  }
});
