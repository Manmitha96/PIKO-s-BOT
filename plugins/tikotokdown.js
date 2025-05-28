const { cmd } = require("../command");
const axios = require("axios");
const fetch = require("node-fetch");
const { v1 } = require("node-tiklydown");

// Utility to expand TikTok short links
async function expandShortUrl(url) {
  const response = await fetch(url, { redirect: "follow" });
  return response.url;
}

cmd(
  {
    pattern: "tiktok",
    react: "🎵",
    desc: "Download TikTok video or slideshow",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      if (!q || !q.includes("tiktok.com"))
        return reply("❌ *Please provide a valid TikTok link.*\nExample: `.tiktok https://vt.tiktok.com/abc123/`");

      // Expand short link if needed
      const tiktokUrl = q.includes("vt.tiktok.com") ? await expandShortUrl(q) : q;

      // Fetch media info using node-tiklydown
      const result = await v1(tiktokUrl);
      if (!result || !result.status) throw new Error("⚠️ Video not found or link is invalid!");

      const { type, title, video, images } = result.data;

      if (type === "video" && video) {
        const videoBuffer = await axios.get(video, { responseType: "arraybuffer" });
        await robin.sendMessage(
          from,
          {
            video: videoBuffer.data,
            mimetype: "video/mp4",
            caption: `🎥 *TikTok Video*\n\n🎬 *${title || "No Title"}*\n\n🛠️ By *P_I_K_O* ☯️`,
          },
          { quoted: mek }
        );
        return reply("✅ *Video downloaded successfully!*");
      }

      if (type === "image" && Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          const imgBuffer = await axios.get(images[i], { responseType: "arraybuffer" });
          await robin.sendMessage(
            from,
            {
              image: imgBuffer.data,
              caption: `🖼️ *Slide ${i + 1} of ${images.length}*\n🎬 *${title || "TikTok Slideshow"}*`,
            },
            { quoted: mek }
          );
        }
        return reply("✅ *Slideshow downloaded successfully!*");
      }

      throw new Error("Unsupported TikTok content or download URL not found.");
    } catch (err) {
      console.error("TikTok downloader error:", err);
      reply(`❌ *Error:* ${err.message}`);
    }
  }
);
