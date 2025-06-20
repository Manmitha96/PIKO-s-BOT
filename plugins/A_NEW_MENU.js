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
    const state = replyTrack[senderNumber];
    const quoted = m.quoted;
    if (!state || !quoted) return;

    const msgId =
      quoted?.key?.id ||
      quoted?.contextInfo?.stanzaId ||
      quoted?.id;

    console.log("User replied to ID:", msgId);
    console.log("Stored ID:", state.msgId);

    if (msgId !== state.msgId) return;

    const text = m.body.trim();
    if (text === "1") {
      return reply("✅ You selected Option One.");
    } else if (text === "2") {
      return reply("✅ You selected Option Two.");
    } else {
      return reply("❌ Invalid. Reply with 1 or 2.");
    }
  }
);
