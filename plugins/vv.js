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

      const viewOnceMsg =
        quoted.message?.viewOnceMessageV2?.message ||
        quoted.message?.viewOnceMessage?.message;

      if (!viewOnceMsg) {
        return reply("❌ Not a valid view-once message.");
      }

      const mediaType = Object.keys(viewOnceMsg)[0];
      if (!["imageMessage", "videoMessage"].includes(mediaType)) {
        return reply("⚠️ Unsupported media type. Only *image* or *video* are allowed.");
      }

      const buffer = await downloadMediaMessage(
        { message: { [mediaType]: viewOnceMsg[mediaType] }, key: quoted.key },
        "buffer"
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
    } catch (err) {
      console.error("View Once Error:", err);
      reply("❌ Error saving media.");
    }
  }
);
