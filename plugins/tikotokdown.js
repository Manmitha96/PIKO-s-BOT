const { cmd } = require("../command");
const axios = require("axios");
const Tiklydown = require("node-tiklydown");

const tikly = new Tiklydown();

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

      const result = await tikly.video(finalUrl);

      if (!result || (!result.videoUrl && !result.images?.length)) {
        return reply("❌ *Video not found or link invalid.*");
      }

      const title = result.description || "TikTok content";

      // Handle video
      if (result.videoUrl) {
        const videoBuffer = await axios.get(result.videoUrl, { responseType: "arraybuffer" });
        await robin.sendMessage(
          from,
          {
            video: videoBuffer.data,
            mimetype: "video/mp4",
            caption: `🎥 *${title}*\n👤 Author: ${result.author || "Unknown"}\n📥 From TikTok`,
          },
          { quoted: mek }
        );
        return reply("✅ *Video sent!*");
      }

      // Handle slideshow (images)
      if (result.images && result.images.length > 0) {
        for (let i = 0; i < result.images.length; i++) {
          const imgBuffer = await axios.get(result.images[i], { responseType: "arraybuffer" });
          await robin.sendMessage(
            from,
            {
              image: imgBuffer.data,
              caption: `🖼️ Slide ${i + 1} of ${result.images.length}\n🎬 *${title}*`,
            },
            { quoted: mek }
          );
        }
        return reply("✅ *Slideshow sent!*");
      }

    } catch (err) {
      console.error("TikTok error:", err);
      reply(`❌ *Error:* ${err.message || "Something went wrong."}`);
    }
  }
);
