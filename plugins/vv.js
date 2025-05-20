const { cmd } = require("../command");
const { downloadMediaMessage } = require("../lib/msg.js");
const fs = require("fs");
const path = require("path");

const accessFile = path.join(__dirname, "../vv_access.json");

cmd(
  {
    pattern: "vv",
    alias: ["viewonce", "savevo"],
    desc: "Save a view-once image or video",
    category: "utility",
    filename: __filename,
  },
  async (robin, mek, m, { from, quoted, reply, isOwner, senderNumber }) => {
    try {
      let mode = "owner";
      if (fs.existsSync(accessFile)) {
        const data = JSON.parse(fs.readFileSync(accessFile));
        mode = data.mode || "owner";
      }

      const allowedUsers = ["94726939427@s.whatsapp.net"]; // Change to your number
      if (mode === "owner" && !isOwner && !allowedUsers.includes(senderNumber)) {
        return reply("❌ Only the *owner* can use this command right now.");
      }

      if (!quoted || !quoted.viewOnceMessage) {
        return reply("🔒 Please reply to a *view-once photo or video*.");
      }

      const message = quoted.viewOnceMessage.message;
      const type = Object.keys(message)[0];

      if (type !== "imageMessage" && type !== "videoMessage") {
        return reply("⚠️ Only *view-once images or videos* are supported.");
      }

      const buffer = await downloadMediaMessage({ message }, "viewOnce");
      if (!buffer) return reply("⚠️ Failed to download media.");

      await robin.sendMessage(
        from,
        {
          [type === "imageMessage" ? "image" : "video"]: buffer,
          caption: "🔓 Here's your saved view-once media.",
        },
        { quoted: mek }
      );
    } catch (err) {
      console.error("VV Error:", err);
      reply("❌ Something went wrong.");
    }
  }
);
