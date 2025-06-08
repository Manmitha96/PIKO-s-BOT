const { cmd } = require('../command');

/**
 * Helper: Get bot's own WhatsApp ID (handles differences in library implementations)
 */
async function getBotId(robin) {
    if (robin.user && robin.user.id) return robin.user.id;
    if (typeof robin.getMe === 'function') {
        const me = await robin.getMe();
        if (me && me.id) return me.id;
    }
    throw new Error("Unable to determine bot's WhatsApp ID");
}

/**
 * Helper: Get all group admin IDs
 */
function getAdminIds(groupMetadata) {
    return groupMetadata.participants
        .filter(p => p.admin)
        .map(p => p.id);
}

cmd({
    pattern: "block",
    react: "⚠️",
    alias: ["ban"],
    desc: "Block a user instantly.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { quoted, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("⚠️ Only the owner can use this command!");
        if (!quoted) return reply("⚠️ Please reply to the user's message to block them!");
        const target = quoted.sender;
        await robin.updateBlockStatus(target, "block");
        return reply(`✅ Successfully blocked: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Block Error:", e);
        return reply(`❌ Failed to block the user. Error: ${e.message}`);
    }
});

cmd({
    pattern: "unblock",
    react: "⚠️",
    alias: ["unban"],
    desc: "Unblock a user instantly.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { quoted, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("⚠️ Only the owner can use this command!");
        if (!quoted) return reply("⚠️ Please reply to the user's message to unblock them!");
        const target = quoted.sender;
        await robin.updateBlockStatus(target, "unblock");
        return reply(`✅ Successfully unblocked: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Unblock Error:", e);
        return reply(`❌ Failed to unblock the user. Error: ${e.message}`);
    }
});

cmd({
    pattern: "kick",
    alias: ["remove", "ban"],
    react: "⚠️",
    desc: "Remove a mentioned user from the group.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        const botId = await getBotId(robin);
        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = getAdminIds(groupMetadata);
        const isBotAdmins = groupAdmins.includes(botId);
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");
        if (!quoted) return reply("⚠️ Please reply to the user's message you want to kick!");
        const target = quoted.sender;
        if (groupAdmins.includes(target)) return reply("⚠️ I cannot remove another admin from the group!");
        await robin.groupParticipantsUpdate(from, [target], "remove");
        return reply(`✅ Successfully removed: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Kick Error:", e);
        reply(`❌ Failed to remove the user. Error: ${e.message}`);
    }
});

cmd({
    pattern: "left",
    alias: ["leave", "exit"],
    react: "⚠️",
    desc: "Leave the current group.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isOwner, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isOwner) return reply("⚠️ Only the owner can use this command!");
        await robin.groupLeave(from);
        return reply(`✅ Bot has left the group.`);
    } catch (e) {
        console.error("Leave Error:", e);
        reply(`❌ Failed to leave the group. Error: ${e.message}`);
    }
});

cmd({
    pattern: "mute",
    alias: ["silence", "lock"],
    react: "⚠️",
    desc: "Set group chat to admin-only messages.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ This command is only for group admins!");
        const botId = await getBotId(robin);
        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = getAdminIds(groupMetadata);
        const isBotAdmins = groupAdmins.includes(botId);
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");
        await robin.groupSettingUpdate(from, "announcement");
        return reply("✅ Group has been muted. Only admins can send messages now!");
    } catch (e) {
        console.error("Mute Error:", e);
        reply(`❌ Failed to mute the group. Error: ${e.message}`);
    }
});

cmd({
    pattern: "unmute",
    alias: ["unlock"],
    react: "⚠️",
    desc: "Allow everyone to send messages in the group.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ This command is only for group admins!");
        const botId = await getBotId(robin);
        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = getAdminIds(groupMetadata);
        const isBotAdmins = groupAdmins.includes(botId);
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");
        await robin.groupSettingUpdate(from, "not_announcement");
        return reply("✅ Group has been unmuted. Everyone can send messages now!");
    } catch (e) {
        console.error("Unmute Error:", e);
        reply(`❌ Failed to unmute the group. Error: ${e.message}`);
    }
});

cmd({
    pattern: "add",
    alias: ["invite"],
    react: "➕",
    desc: "Add a user to the group.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, reply, args }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        const botId = await getBotId(robin);
        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = getAdminIds(groupMetadata);
        const isBotAdmins = groupAdmins.includes(botId);
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");
        if (!args[0]) return reply("⚠️ Please provide the phone number of the user to add!");
        const target = args[0].includes("@") ? args[0] : `${args[0].replace(/[^0-9]/g, "")}@s.whatsapp.net`;
        await robin.groupParticipantsUpdate(from, [target], "add");
        return reply(`✅ Successfully added: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Add Error:", e);
        reply(`❌ Failed to add the user. Error: ${e.message}`);
    }
});

cmd({
    pattern: "demote",
    alias: ["member"],
    react: "⚠️",
    desc: "Remove admin privileges from a mentioned user.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        const botId = await getBotId(robin);
        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = getAdminIds(groupMetadata);
        const isBotAdmins = groupAdmins.includes(botId);
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");
        if (!quoted) return reply("⚠️ Please reply to the user's message you want to remove admin privileges from!");
        const target = quoted.sender;
        if (target === botId) return reply("⚠️ I cannot remove my own admin privileges!");
        if (!groupAdmins.includes(target)) return reply("⚠️ The mentioned user is not an admin!");
        await robin.groupParticipantsUpdate(from, [target], "demote");
        return reply(`✅ Successfully removed admin privileges from: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Demote Error:", e);
        reply(`❌ Failed to remove admin privileges. Error: ${e.message}`);
    }
});

cmd({
    pattern: "promote",
    alias: ["admin", "makeadmin"],
    react: "⚡",
    desc: "Grant admin privileges to a mentioned user.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, isGroup, isAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        const botId = await getBotId(robin);
        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = getAdminIds(groupMetadata);
        const isBotAdmins = groupAdmins.includes(botId);
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");
        if (!quoted) return reply("⚠️ Please reply to the user's message you want to promote to admin!");
        const target = quoted.sender;
        if (groupAdmins.includes(target)) return reply("⚠️ The mentioned user is already an admin!");
        await robin.groupParticipantsUpdate(from, [target], "promote");
        return reply(`✅ Successfully promoted @${target.split('@')[0]} to admin!`);
    } catch (e) {
        console.error("Promote Admin Error:", e);
        reply(`❌ Failed to promote the user. Error: ${e.message}`);
    }
});
