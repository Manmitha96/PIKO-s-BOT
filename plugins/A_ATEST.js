const { cmd } = require('../command');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

cmd(
  {
    pattern: 'setgpp',
    desc: 'Set group profile picture',
    category: 'group',
    filename: __filename,
  },
  async (client, m, mek, { isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
      if (!isGroup) return reply('*❌ This command only works in group chats.*');
      if (!isAdmins) return reply('*⛔ Only group admins can use this command.*');
      if (!isBotAdmins) return reply('*🤖 I need admin rights to change the group picture.*');

      const quoted = m?.quoted;
      if (!quoted || !quoted.message || !quoted.mtype.includes('image')) {
        return reply('*🖼️ Please reply to an image to set it as group profile picture.*');
      }

      reply('*📥 Downloading image...*');

      const buffer = await downloadMediaMessage(quoted, 'buffer', {}, {});

      await client.updateProfilePicture(m.chat, buffer);
      reply('*✅ Group profile picture updated successfully!*');

    } catch (e) {
      console.error(e);
      reply('*❌ Failed to update group profile picture.*');
    }
  }
);
