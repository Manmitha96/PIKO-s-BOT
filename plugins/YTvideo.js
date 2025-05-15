const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

const videoSessions = new Map();

cmd(
  {
    pattern: "video",
    react: "🎥",
    desc: "Download YouTube videos",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("Send a YouTube link or search term");

      const search = await yts(q);
      const video = search.videos[0];
      
      // Save user session
      videoSessions.set(from, {
        step: "waiting_resolution",
        videoData: video,
      });

      await reply(
        `📺 *${video.title}*\n\n` +
        `Choose quality:\n` +
        `1 = 144p\n2 = 240p\n3 = 360p\n` +
        `4 = 480p\n5 = 720p\n6 = 1080p\n\n` +
        `Reply with the number (e.g., "5")`,
        { quoted: mek }
      );
    } catch (e) {
      console.error(e);
      reply("❌ Error: Couldn't fetch video.");
    }
  }
);

// Handle replies
cmd(
  {
    pattern: "vdl",
    fromMe: false,
  },
  async (robin, mek, m, { from, body, reply }) => {
    const session = videoSessions.get(from);
    if (!session) return;

    // Step 1: User selects resolution
    if (session.step === "waiting_resolution") {
      const resMap = { 1: "144", 2: "240", 3: "360", 4: "480", 5: "720", 6: "1080" };
      const quality = resMap[body.trim()];
      
      if (!quality) {
        return reply("❌ Invalid! Reply with 1-6 (e.g., '5')");
      }

      // Update session
      session.step = "waiting_format";
      session.quality = quality;
      videoSessions.set(from, session);

      return reply(
        `✅ ${quality}p selected.\n\n` +
        `Send as:\n` +
        `• "video" (playable in chat)\n` +
        `• "doc" (file download)\n\n` +
        `Reply your choice.`,
        { quoted: mek }
      );
    }

    // Step 2: User selects format (doc/video)
    if (session.step === "waiting_format") {
      const format = body.trim().toLowerCase();
      if (!["video", "doc"].includes(format)) {
        return reply('❌ Reply "video" or "doc"');
      }

      // Download and send video here...
      await reply("📥 Downloading...", { quoted: mek });

      // (Add your download code here)
      // After download:
      videoSessions.delete(from); // Clear session
    }
  }
);
