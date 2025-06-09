const { cmd } = require('../command');

// Utility function to check if bot is admin
async function isBotAdmin(robin, from) {
    const metadata = await robin.groupMetadata(from);
    const botId = robin.user.id;
    return metadata.participants.some(p => p.id === botId && p.admin !== null);
}

cmd({
    pattern: "kick",
    alias: ["remove"],
    react: "⚠️",
    desc: "Remove a mentioned user from the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");

        const isBotAdmins = await isBotAdmin(robin, from);
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        if (!quoted || !quoted.sender) return reply("⚠️ Please reply to the user's message you want to kick!");

        const target = quoted.sender;
        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(a => a.id);

        if (groupAdmins.includes(target)) return reply("⚠️ I cannot remove another admin!");

        await robin.groupParticipantsUpdate(from, [target], "remove");
        return reply(`✅ Successfully removed: @${target.split('@')[0]}`, { mentions: [target] });

    } catch (e) {
        console.error("Kick Error:", e);
        reply(`❌ Failed to remove the user. Error: ${e.message}`);
    }
});

cmd({
    pattern: "mute",
    alias: ["silence", "lock"],
    react: "⚠️",
    desc: "Set group chat to admin-only messages.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ This command is only for group admins!");

        const isBotAdmins = await isBotAdmin(robin, from);
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
},
async (robin, mek, m, { from, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ This command is only for group admins!");

        const isBotAdmins = await isBotAdmin(robin, from);
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        await robin.groupSettingUpdate(from, "not_announcement");
        return reply("✅ Group has been unmuted. Everyone can send messages now!");
    } catch (e) {
        console.error("Unmute Error:", e);
        reply(`❌ Failed to unmute the group. Error: ${e.message}`);
    }
});

cmd({
    pattern: "promote",
    alias: ["admin", "makeadmin"],
    react: "⚡",
    desc: "Grant admin privileges to a mentioned user.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");

        const isBotAdmins = await isBotAdmin(robin, from);
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        if (!quoted || !quoted.sender) return reply("⚠️ Please reply to the user's message you want to promote!");

        const target = quoted.sender;
        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(a => a.id);

        if (groupAdmins.includes(target)) return reply("⚠️ The mentioned user is already an admin!");

        await robin.groupParticipantsUpdate(from, [target], "promote");
        return reply(`✅ Successfully promoted @${target.split('@')[0]} to admin!`, { mentions: [target] });

    } catch (e) {
        console.error("Promote Admin Error:", e);
        reply(`❌ Failed to promote the user. Error: ${e.message}`);
    }
});

cmd({
    pattern: "demote",
    alias: ["member"],
    react: "⚠️",
    desc: "Remove admin privileges from a mentioned user.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");

        const isBotAdmins = await isBotAdmin(robin, from);
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        if (!quoted || !quoted.sender) return reply("⚠️ Please reply to the user's message you want to demote!");

        const target = quoted.sender;
        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(a => a.id);

        if (!groupAdmins.includes(target)) return reply("⚠️ The mentioned user is not an admin!");

        await robin.groupParticipantsUpdate(from, [target], "demote");
        return reply(`✅ Successfully demoted @${target.split('@')[0]} to member!`, { mentions: [target] });

    } catch (e) {
        console.error("Demote Admin Error:", e);
        reply(`❌ Failed to demote the user. Error: ${e.message}`);
    }
});
