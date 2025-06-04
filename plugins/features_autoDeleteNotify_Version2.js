const targetNumber = "94726939427@s.whatsapp.net"; // WhatsApp JID for the number

module.exports = (robin) => {
  robin.ev.on('messages.delete', async (deleteEvent) => {
    try {
      const { remoteJid, participant, messages } = deleteEvent;
      // Loop through all deleted messages (can be more than one)
      for (const msg of messages) {
        // Compose notification message
        let chatType = remoteJid.endsWith("@g.us") ? "Group" : "Private";
        let sender = participant || msg?.key?.participant || msg?.key?.fromMe ? "You" : "Unknown";
        let deletedMsgId = msg?.key?.id || "Unknown";
        let chatId = remoteJid;
        let text = `❗ Message deleted!\n\nChat Type: ${chatType}\nChat ID: ${chatId}\nSender: ${sender}\nMessage ID: ${deletedMsgId}`;
        await robin.sendMessage(targetNumber, { text });
      }
    } catch (e) {
      console.error("Error in autoDeleteNotify:", e);
    }
  });
};