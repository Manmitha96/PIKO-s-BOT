const { cmd } = require('../command');
const { exec } = require('child_process');
const fs = require("fs");

// 7. Get Bot JID
cmd({
    pattern: "jid",
    desc: "Get the bot's JID.",
    category: "owner",
    react: "🤖",
    filename: __filename
},
async (robin, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    reply(`🤖 *Bot JID:* ${robin.user.jid}`);
});
