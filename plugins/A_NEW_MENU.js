const { cmd } = require("../command");

let replyTrack = {};

cmd(
  {
    pattern: "testmenu",
    filename: __filename,
  },
  async (client, m, mek, { senderNumber, reply }) => {
    const sent = await reply(`*Main Menu*\n\n1. Option One\n2. Option Two\n\n_Reply to this message with a number._`);

    replyTrack[senderNumber] = {
      msgId: sent.key.id,
      timestamp: Date.now(),
    };
  }
);

cmd(
  {
    pattern: ".*",
    filename: __filename,
  },
  async (client, m, mek, { senderNumber, reply }) => {
    const state = menuReplyState[senderNumber];
    const context = m.message?.extendedTextMessage?.contextInfo;

    if (!state || !context?.stanzaId) return;

    const repliedMsgId = context.stanzaId;

    console.log("↩️ User replied to:", repliedMsgId);
    console.log("📌 Expected msgId:", state.msgId);

    if (repliedMsgId !== state.msgId) return;

    const text = m.body.trim();
    const match = text.match(/^\.?(\d{1,2})$/);
    if (!match) return;

    const category = match[1];
    const submenu = categoryMenus[category];

    if (submenu) {
      await reply(submenu);
      delete menuReplyState[senderNumber];
    } else {
      await reply("❌ Invalid number. Please reply with a number between 1 and 10.");
    }
  }
);
