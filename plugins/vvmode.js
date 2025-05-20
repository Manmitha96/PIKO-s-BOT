const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");

const accessFile = path.join(__dirname, "../vv_access.json");

cmd(
  {
    pattern: "vvmode",
    desc: "Toggle who can use the .vv command (owner/all)",
    category: "utility",
    filename: __filename,
  },
  async (robin, mek, m, { args, reply, isOwner }) => {
    if (!isOwner) return reply("❌ Only the *owner* can change this setting.");

    const mode = args[0]?.toLowerCase();
    if (!["owner", "all"].includes(mode)) {
      return reply("ℹ️ Usage: .vvmode owner | all");
    }

    fs.writeFileSync(accessFile, JSON.stringify({ mode }, null, 2));
    reply(`✅ VV access mode changed to: *${mode}*`);
  }
);
