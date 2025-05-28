const axios = require("axios");

async function getTikTokVideoInfo(url) {
  try {
    const api = `https://api.tiklydown.me/api/download?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(api);

    if (data && data.video) {
      return {
        video: data.video, // ✅ This is NO watermark video
        title: data.title || "TikTok Video",
        author: data.author || "Unknown",
      };
    } else {
      throw new Error("Video not found or API error");
    }
  } catch (err) {
    throw new Error("TiklyDown API error: " + err.message);
  }
}

module.exports = { getTikTokVideoInfo };
