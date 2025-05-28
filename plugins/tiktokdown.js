const { cmd } = require("../command");
const axios = require("axios");
const { tiktokdl } = require("@xct007/tiktok-scraper"); // ✅ correct function

// Expand short TikTok links (like https://vt.tiktok.com/...)
async function expandShortUrl(url) {
  try {
    const response = await axios.get(url, { maxRedirects: 5 });
    return response.request.res.responseUrl || url;
  } catch (err) {
    console.error("URL expansion failed:", err.message);
    return url; // fallback if expansion fails
  }
}

cmd(
  {
    pattern: "tiktok",
    react: "🎵",
    desc: "Download TikTok video/slideshow",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      if (!q || !q.includes("tiktok.com"))
        return reply("❌ *Please provide a valid TikTok link.*\n\n📌 Example: `.tiktok https://vt.tiktok.com/abc123/`");

      const finalUrl = await expandShortUrl(q);
      console.log("Expanded TikTok URL:", finalUrl);

      const result = await tiktokdl(finalUrl);

      if (!result || !result.video || !result.video.no_watermark) {
        return reply("❌ *Video not found or the link is invalid.*");
      }

      const videoUrl = result.video.no_watermark;
      const caption = `🎥 *${result.description || "TikTok video"}*\n👤 Author: ${result.author?.nickname || "Unknown"}`;

      const videoBuffer = await axios.get(videoUrl, { responseType: "arraybuffer" });

      await robin.sendMessage(
        from,
        {
          video: videoBuffer.data,
          mimetype: "video/mp4",
          caption,
        },
        { quoted: mek }
      );

      return reply("✅ *Video sent!*");

    } catch (err) {
      console.error("TikTok command error:", err);
      reply(`❌ *Error:* ${err.message || "Something went wrong."}`);
    }
  }
);
