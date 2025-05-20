const { cmd } = require("../command");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

cmd(
  {
    pattern: "vv",
    alias: ["viewonce", "savevo"],
    desc: "Download View Once media (image, video)",
    category: "media",
    filename: __filename,
  },
  async (robin, m, msg, { from, quoted, reply }) => {
    try {
      if (!quoted || !quoted.message) {
        return reply("❌ Please reply to a *view-once photo or video* message.");
      }

      // Support both viewOnceMessage and viewOnceMessageV2
      const voMsg =
        quoted.message.viewOnceMessage || quoted.message.viewOnceMessageV2;

      if (!voMsg || typeof voMsg !== "object" || !voMsg.message) {
        return reply("❌ This is not a valid view-once media message.");
      }

      const viewOnceMsg = voMsg.message;
      const mediaType = Object.keys(viewOnceMsg)[0];

      if (!["imageMessage", "videoMessage"].includes(mediaType)) {
        return reply("⚠️ Unsupported media type. Only *image* or *video* are allowed.");
      }

      const buffer = await downloadMediaMessage(
        { message: voMsg },
        "buffer",
        {},
        {
          logger: undefined,
          reuploadRequest: async () => {},
        }
      );

      if (!buffer) return reply("⚠️ Failed to download media.");

      const mediaKey = mediaType === "imageMessage" ? "image" : "video";

      await robin.sendMessage(
        from,
        {
          [mediaKey]: buffer,
          caption: "✅ View-once media saved.",
        },
        { quoted: m }
      );
    } catch (e) {
      console.error("View Once Error:", e);
      reply("❌ Error saving media.");
    }
  }
);
