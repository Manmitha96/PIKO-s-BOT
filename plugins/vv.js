const { cmd } = require("../command");
const { downloadMediaMessage } = require('@adiwajshing/baileys');  // Baileys library to download media
const fs = require("fs");
const path = require("path");

cmd(
  {
    pattern: "vv",  // Command to use
    alias: ["viewonce", "savevo"],  // Aliases for the command
    desc: "Save a view-once image, video, or voice message",  // Description
    category: "utility",  // Command category
    filename: __filename,  // Filename for logging
  },
  async (robin, mek, m, { from, quoted, reply }) => {
    try {
      // Check if the message contains a view-once media (photo, video, or voice)
      if (!quoted || !quoted.viewOnceMessage) {
        return reply("❌ Please reply to a *view-once photo, video, or voice* message.");
      }

      const message = quoted.viewOnceMessage.message;
      const type = Object.keys(message)[0];  // Get the type of the media (image, video, etc.)

      // If it's an image, video, or voice message, download it
      if (type === "imageMessage" || type === "videoMessage" || type === "audioMessage") {
        const buffer = await downloadMediaMessage({ message }, "viewOnce");

        // Handle if download fails
        if (!buffer) return reply("⚠️ Failed to download media. Please try again.");

        // Send the saved media back to the user
        await robin.sendMessage(
          from,
          {
            [type === "imageMessage" ? "image" : type === "videoMessage" ? "video" : "audio"]: buffer,
            caption: "📥 Here is your saved view-once media!",
          },
          { quoted: mek }
        );
      } else {
        return reply("⚠️ Only *view-once images, videos, or voice messages* are supported.");
      }
    } catch (err) {
      console.error("Error in .vv command:", err);
      reply("❌ Something went wrong. Please try again later.");
    }
  }
);
