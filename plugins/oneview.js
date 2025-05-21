const { cmd } = require("../command");
const { downloadMediaMessage } = require("../lib/msg.js"); // Adjust path if needed

cmd(
  {
    pattern: "oneview",
    alias: ["saveview", "normalview"],
    react: "🔁",
    desc: "Convert a view-once image or video to normal",
    category: "utility",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      reply,
    }
  ) => {
    try {
      // Ensure the message contains a view-once image or video
      if (
        !quoted ||
        (!quoted.imageMessage && !quoted.videoMessage) ||
        !quoted.viewOnce
      ) {
        return reply("Please reply to a view-once image or video to convert it.");
      }

      // Download the view-once media
      const mediaBuffer = await downloadMediaMessage(quoted, quoted.imageMessage ? "image" : "video");
      if (!mediaBuffer) {
        return reply("Failed to download media. Try again!");
      }

      // Determine media type and send as normal (non-view-once)
      if (quoted.imageMessage) {
        await robin.sendMessage(
          from,
          {
            image: mediaBuffer,
            caption: "Here is your normal image!\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜",
          },
          { quoted: mek }
        );
      } else if (quoted.videoMessage) {
        await robin.sendMessage(
          from,
          {
            video: mediaBuffer,
            caption: "Here is your normal video!\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜",
          },
          { quoted: mek }
        );
      }
    } catch (e) {
      console.error(e);
      reply(`Error: ${e.message || e}`);
    }
  }
);
