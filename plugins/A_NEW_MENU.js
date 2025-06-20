// plugins/menu.js 
const { cmd } = require("../command"); const config = require("../config");

// In-memory state to track awaiting replies for each user 
const menuReplyState = {};

// 1️⃣ Main menu command

cmd( { pattern: "testmenu", alias: ["getmenu"], react: "📜", desc: "Show main command menu", category: "main", filename: __filename, }, async (robin, mek, m, { from, senderNumber, pushname, reply }) => { try { // Calculate uptime & memory usage const uptimeMinutes = (process.uptime() / 60).toFixed(2); const memoryMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

// Build the menu text
  const menuText = `👋 *Hello ${pushname}*

🕐 Uptime: ${uptimeMinutes} min 📦 RAM Usage: ${memoryMB} MB

📍 Choose a category by replying with its number:

1. ⚔️ Main Commands


2. 🔮 Download Commands


3. 🔐 Group Commands


4. 👑 Owner Commands


5. 🪄 Convert Commands


6. 🔎 Search Commands


7. 🧚🏻 Anime Commands


8. 💫 Fun Commands


9. 🤖 AI Commands


10. 🎲 Other Commands



☯️ ${config.ALIVE_MSG}`;

// Send the menu with an image
  const sent = await robin.sendMessage(
    from,
    { image: { url: config.ALIVE_IMG }, caption: menuText },
    { quoted: mek }
  );

  // Record state for reply handling
  menuReplyState[senderNumber] = {
    messageId: sent.key.id,
    timestamp: Date.now(),
  };
} catch (err) {
  console.error('[MENU ERROR]', err);
  reply(`❌ Failed to send menu: ${err.message}`);
}

} );

// 2️⃣ Handle numeric replies to main menu cmd( { on: "body",          // Listen to all text messages filename: __filename, // For logging }, async (robin, mek, m, { senderNumber, reply }) => { const state = menuReplyState[senderNumber];

// Must be a reply to a menu message
if (!state || !mek.quoted || mek.quoted.key.id !== state.messageId) return;

// Expire after 2 minutes
if (Date.now() - state.timestamp > 2 * 60 * 1000) {
  delete menuReplyState[senderNumber];
  return reply("⏰ Menu session expired. Type `.menu` to open again.");
}

const input = m.body.trim();
if (!/^[0-9]$|^10$/.test(input)) return; // Only 1–10
const choice = parseInt(input, 10);

// Generate the submenu content
let submenu;
switch (choice) {
  case 1:
    submenu = `⚔️ *Main Commands*

.menu .ping .owner .alive; break; case 2: submenu = 🔮 Download Commands .song [name] .video [name] .ytmp3 [link]; break; case 3: submenu = 🔐 Group Commands .kick [@user] .add [@user] .promote [@user] .demote [@user]; break; case 4: submenu = 👑 Owner Commands .eval [code] .shutdown .setpp [url]; break; case 5: submenu = 🪄 Convert Commands .sticker [reply] .photo [url] .gif [reply] .mp3 [reply]; break; case 6: submenu = 🔎 Search Commands .lyrics [song] .image [query] .google [query] .github [username]; break; case 7: submenu = 🧚🏻 Anime Commands .anime [name] .manga [name] .waifu; break; case 8: submenu = 💫 Fun Commands .joke .truth .dare .meme; break; case 9: submenu = 🤖 AI Commands .ask [question] .imagine [prompt]; break; case 10: submenu = 🎲 Other Commands .calc [expr] .remind [text] .short [url]`; break; }

// Send and clear state
await reply(submenu);
delete menuReplyState[senderNumber];

} );

module.exports = { menuReplyState };

