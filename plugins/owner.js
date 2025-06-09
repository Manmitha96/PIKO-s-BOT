const { cmd } = require('../command');

cmd({
    pattern: "block",
    react: "⚠️",
    alias: ["ban"],
    desc: "Block a user instantly.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { quoted, reply, isOwner }) => {
    if (!isOwner) return reply("⚠️ Only the owner can use this command!");
    if (!quoted) return reply("⚠️ Please reply to the user's message to block them!");
    const target = quoted.sender;
    await robin.updateBlockStatus(target, "block");
    return reply(`✅ Successfully blocked: @${target.split('@')[0]}`);
});

cmd({
    pattern: "kick",
    alias: ["remove"],
    react: "⚠️",
    desc: "Remove a mentioned user from the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply, quoted }) => {
    if (!isGroup) return reply("⚠️ This command can only be used in a group!");
    if (!isAdmins) return reply("⚠️ Only group admins can use this command!");

    const metadata = await robin.groupMetadata(from);
    const botId = robin.user.id;
    const botData = metadata.participants.find(p => p.id === botId);
    if (!botData?.admin) return reply("⚠️ I need to be an admin to execute this command!");

    if (!quoted) return reply("⚠️ Please reply to the user's message you want to kick!");
    const target = quoted.sender;

    const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);
    if (groupAdmins.includes(target)) return reply("⚠️ I cannot remove another admin!");

    await robin.groupParticipantsUpdate(from, [target], "remove");
    return reply(`✅ Successfully removed: @${target.split('@')[0]}`);
});

cmd({
    pattern: "mute",
    alias: ["silence"],
    react: "⚠️",
    desc: "Set group chat to admin-only messages.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply }) => {
    if (!isGroup) return reply("⚠️ This command can only be used in a group!");
    if (!isAdmins) return reply("⚠️ This command is only for group admins!");

    const metadata = await robin.groupMetadata(from);
    const botId = robin.user.id;
    const botData = metadata.participants.find(p => p.id === botId);
    if (!botData?.admin) return reply("⚠️ I need to be an admin to execute this command!");

    await robin.groupSettingUpdate(from, "announcement");
    return reply("✅ Group has been muted. Only admins can send messages now!");
});

cmd({
    pattern: "unmute",
    alias: ["unlock"],
    react: "⚠️",
    desc: "Allow everyone to send messages in the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply }) => {
    if (!isGroup) return reply("⚠️ This command can only be used in a group!");
    if (!isAdmins) return reply("⚠️ This command is only for group admins!");

    const metadata = await robin.groupMetadata(from);
    const botId = robin.user.id;
    const botData = metadata.participants.find(p => p.id === botId);
    if (!botData?.admin) return reply("⚠️ I need to be an admin to execute this command!");

    await robin.groupSettingUpdate(from, "not_announcement");
    return reply("✅ Group has been unmuted. Everyone can send messages now!");
});

cmd({
    pattern: "promote",
    alias: ["admin"],
    react: "⚡",
    desc: "Grant admin privileges to a mentioned user.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply, quoted }) => {
    if (!isGroup) return reply("⚠️ This command can only be used in a group!");
    if (!isAdmins) return reply("⚠️ Only group admins can use this command!");

    const metadata = await robin.groupMetadata(from);
    const botId = robin.user.id;
    const botData = metadata.participants.find(p => p.id === botId);
    if (!botData?.admin) return reply("⚠️ I need to be an admin to execute this command!");

    if (!quoted) return reply("⚠️ Please reply to the user’s message you want to promote!");
    const target = quoted.sender;

    const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);
    if (groupAdmins.includes(target)) return reply("⚠️ That user is already an admin!");

    await robin.groupParticipantsUpdate(from, [target], "promote");
    return reply(`✅ Promoted @${target.split('@')[0]} to admin!`);
});

cmd({
    pattern: "demote",
    alias: ["member"],
    react: "⚠️",
    desc: "Remove admin privileges from a user.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply, quoted }) => {
    if (!isGroup) return reply("⚠️ This command can only be used in a group!");
    if (!isAdmins) return reply("⚠️ Only group admins can use this command!");

    const metadata = await robin.groupMetadata(from);
    const botId = robin.user.id;
    const botData = metadata.participants.find(p => p.id === botId);
    if (!botData?.admin) return reply("⚠️ I need to be an admin to execute this command!");

    if (!quoted) return reply("⚠️ Please reply to the user’s message you want to demote!");
    const target = quoted.sender;

    const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);
    if (!groupAdmins.includes(target)) return reply("⚠️ That user is not an admin!");

    await robin.groupParticipantsUpdate(from, [target], "demote");
    return reply(`✅ Demoted @${target.split('@')[0]} from admin.`);
});

cmd({
    pattern: "botcheck",
    desc: "Check if the bot is admin in the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❗ Only available in groups.");
    const metadata = await robin.groupMetadata(from);
    const botId = robin.user.id;
    const entry = metadata.participants.find(p => p.id === botId);
    console.log("🧪 Bot ID:", botId);
    console.log("🧪 Bot Participant Entry:", entry);
    if (entry && entry.admin !== null) {
        return reply("✅ I am admin!");
    } else {
        return reply("❌ I am NOT admin!");
    }
});
