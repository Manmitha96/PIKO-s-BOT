const { cmd } = require("../command");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

cmd(
  {
    pattern: "vv",
    alias: ["viewonce", "savevo"],
    desc: "Download View Once media (image, video, audio)",
    category: "media",
    filename: __filename,
  },
  async (robin, m, msg, { from, quoted, reply }) => {
    try {
      if (
        !quoted ||
        !quoted.message ||
        !quoted.message.viewOnceMessage ||
        typeof quoted.message.viewOnceMessage !== "object"
      ) {
        return reply("❌ Please reply to a *view-once photo, video or voice* message.");
      }

      // Get the actual media message inside viewOnce
      const viewOnceMsg = quoted.message.viewOnceMessage.message;
      const mediaType = Object.keys(viewOnceMsg)[0]; // e.g., 'imageMessage'

      if (!["imageMessage", "videoMessage", "audioMessage"].includes(mediaType)) {
        return reply("⚠️ Unsupported media type. Only image, video, or voice is allowed.");
      }

      const buffer = await downloadMediaMessage(
        { message: quoted.message.viewOnceMessage },
        "buffer",
        {},
        {
          logger: undefined,
          reuploadRequest: async () => {},
        }
      );

      if (!buffer) return reply("⚠️ Failed to download media.");

      await robin.sendMessage(
        from,
        {
          [mediaType === "imageMessage"
            ? "image"
            : mediaType === "videoMessage"
            ? "video"
            : "audio"]: buffer,
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
