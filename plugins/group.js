const { cmd } = require("../command");

// Add member to group
cmd(
  {
    pattern: "add",
    desc: "Add a member to the group",
    category: "group",
    filename: __filename,
  },
  async (robin, mek, m, { from, args, isGroup, isBotAdmin, isAdmin, reply }) => {
    if (!isGroup) return reply("This command is only for groups.");
    if (!isAdmins) return reply("You must be a group admin to use this command.");
    if (!args[0]) return reply("Please provide the number to add (without @).");
    let number = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    await robin.groupParticipantsUpdate(from, [number], "add");
    reply("Requested to add member.");
  }
);

// Promote member
cmd(
  {
    pattern: "promote",
    desc: "Promote a member to admin",
    category: "group",
    filename: __filename,
  },
  async (robin, mek, m, { from, mentionByTag, isGroup, isAdmin, isBotAdmin, reply }) => {
    if (!isGroup) return reply("This command is only for groups.");
    if (!isAdmins) return reply("Only group admins can promote members.");
    const users = mentionByTag || [];
    if (users.length === 0) return reply("Tag a member to promote.");
    await robin.groupParticipantsUpdate(from, users, "promote");
    reply("Promoted the tagged member(s) to admin.");
  }
);

// Demote member
cmd(
  {
    pattern: "demote",
    desc: "Demote an admin to member",
    category: "group",
    filename: __filename,
  },
  async (robin, mek, m, { from, mentionByTag, isGroup, isAdmin, isBotAdmin, reply }) => {
    if (!isGroup) return reply("This command is only for groups.");
    if (!isAdmins) return reply("Only group admins can demote admins.");
    const users = mentionByTag || [];
    if (users.length === 0) return reply("Tag an admin to demote.");
    await robin.groupParticipantsUpdate(from, users, "demote");
    reply("Demoted the tagged admin(s).");
  }
);

// Mute group
cmd(
  {
    pattern: "mutegroup",
    desc: "Mute group (only admins can send messages)",
    category: "group",
    filename: __filename,
  },
  async (robin, mek, m, { from, isGroup, isAdmin, isBotAdmin, reply }) => {
    if (!isGroup) return reply("This command is only for groups.");
    if (!isGroup ? groupAdmins.includes(sender) : false;) return reply("Only group admins can mute the group.");
    await robin.groupSettingUpdate(from, "announcement");
    reply("Group has been muted. Only admins can send messages.");
  }
);

// Unmute group
cmd(
  {
    pattern: "unmutegroup",
    desc: "Unmute group (everyone can send messages)",
    category: "group",
    filename: __filename,
  },
  async (robin, mek, m, { from, isGroup, isAdmin, isBotAdmin, reply }) => {
    if (!isGroup) return reply("This command is only for groups.");
    if (!isAdmins) return reply("Only group admins can unmute the group.");
    await robin.groupSettingUpdate(from, "not_announcement");
    reply("Group has been unmuted. Everyone can send messages.");
  }
);

// Tag all members
cmd(
  {
    pattern: "tagall",
    desc: "Tag all group members",
    category: "group",
    filename: __filename,
  },
  async (robin, mek, m, { from, participants, isGroup, isAdmin, reply }) => {
    if (!isGroup) return reply("This command is only for groups.");
    let text = "👥 *Tagging all members:*\n\n";
    let mentions = [];
    for (let p of participants) {
      text += `@${p.id.split("@")[0]} `;
      mentions.push(p.id);
    }
    await robin.sendMessage(from, { text: text.trim(), mentions }, { quoted: mek });
  }
);

// Hidden tag (send a message mentioning everyone, but only admins see @)
cmd(
  {
    pattern: "hidetag",
    desc: "Send a hidden tag message to all members",
    category: "group",
    filename: __filename,
  },
  async (robin, mek, m, { from, participants, isGroup, isAdmin, args, reply }) => {
    if (!isGroup) return reply("This command is only for groups.");
    let message = args.join(" ") || "Hidden tag!";
    let mentions = participants.map(p => p.id);
    await robin.sendMessage(from, { text: message, mentions }, { quoted: mek });
  }
);
