const { cmd } = require('../command');
const fs = require('fs');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "setgroupphoto",
    alias: ["setppgc", "setgroupicon", "setgrouppic"],
    react: "🖼️",
    desc: "Set group profile picture",
    category: "group",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");
        if (!isAdmins) return reply("⚠️ Only admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ Bot needs admin rights to do this!");

        // Enhanced image detection
        const isImage = quoted?.mimetype?.startsWith('image/') || 
                       quoted?.message?.imageMessage || 
                       quoted?.image;

        if (!quoted || !isImage) {
            return reply("⚠️ Please reply to an image message (JPEG/PNG)!");
        }

        // Download the image
        let mediaBuffer;
        try {
            mediaBuffer = await robin.downloadMediaMessage(quoted);
            if (!mediaBuffer || mediaBuffer.length === 0) {
                return reply("❌ Couldn't download the image. Try another image!");
            }
        } catch (e) {
            console.error("Download error:", e);
            return reply("❌ Failed to download image. Try a different image format.");
        }

        // Set group picture
        try {
            await robin.updateProfilePicture(from, mediaBuffer);
            return reply("✅ Group profile picture updated successfully!");
        } catch (e) {
            console.error("Update error:", e);
            return reply("❌ Failed to update. Image may be too large or corrupted.");
        }
    } catch (e) {
        console.error("Set Group Photo Error:", e);
        return reply(`❌ Error: ${e.message}`);
    }
});

cmd({
    pattern: "tagall",
    alias: ["mentionall"],
    react: "🏷️",
    desc: "Mention all group members",
    category: "group",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");

        const groupMetadata = await robin.groupMetadata(from);
        const participants = groupMetadata.participants;
        
        let mentions = [];
        let text = "👥 Group Members:\n";
        
        participants.forEach((member, i) => {
            mentions.push(member.id);
            text += `@${member.id.split('@')[0]}${i < participants.length - 1 ? ', ' : ''}`;
        });

        await robin.sendMessage(from, { text, mentions }, { quoted: m });
    } catch (e) {
        console.error("Tagall Error:", e);
        reply(`❌ Failed to tag all members. Error: ${e.message}`);
    }
});

cmd({
    pattern: "hidetag",
    alias: ["hmention", "stealtag"],
    react: "👻",
    desc: "Mention all group members invisibly",
    category: "group",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply, args }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");
        if (!isAdmins) return reply("⚠️ Only admins can use this command!");

        const message = args.join(" ") || "📢 Silent notification!";
        const groupMetadata = await robin.groupMetadata(from);
        const participants = groupMetadata.participants;
        
        let mentions = [];
        participants.forEach(member => {
            mentions.push(member.id);
        });

        await robin.sendMessage(from, { 
            text: message, 
            mentions,
            ephemeralMessage: true 
        }, { quoted: m });
    } catch (e) {
        console.error("Hidetag Error:", e);
        reply(`❌ Failed to send hidden mention. Error: ${e.message}`);
    }
});

cmd({
    pattern: "setname",
    alias: ["changename", "setgroupname"],
    react: "✏️",
    desc: "Change group name",
    category: "group",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, args }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");
        if (!isAdmins) return reply("⚠️ Only admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ Bot needs admin rights to do this!");

        const newName = args.join(" ");
        if (!newName) return reply("⚠️ Please provide a new group name!");

        await robin.groupUpdateSubject(from, newName);
        return reply(`✅ Group name changed to: ${newName}`);
    } catch (e) {
        console.error("Setname Error:", e);
        return reply(`❌ Failed to change group name. Error: ${e.message}`);
    }
});

cmd({
    pattern: "setdesc",
    alias: ["changedesc", "setgroupdesc"],
    react: "📝",
    desc: "Change group description",
    category: "group",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, args }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");
        if (!isAdmins) return reply("⚠️ Only admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ Bot needs admin rights to do this!");

        const newDesc = args.join(" ");
        if (!newDesc) return reply("⚠️ Please provide a new group description!");

        await robin.groupUpdateDescription(from, newDesc);
        return reply(`✅ Group description updated!`);
    } catch (e) {
        console.error("Setdesc Error:", e);
        return reply(`❌ Failed to change group description. Error: ${e.message}`);
    }
});

cmd({
    pattern: "invite",
    alias: ["invitelink", "gclink"],
    react: "🔗",
    desc: "Get group invite link",
    category: "group",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");
        if (!isAdmins) return reply("⚠️ Only admins can use this command!");

        const inviteCode = await robin.groupInviteCode(from);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        
        return reply(`🔗 Group invite link:\n${inviteLink}`);
    } catch (e) {
        console.error("Invite Error:", e);
        return reply(`❌ Failed to get invite link. Error: ${e.message}`);
    }
});

cmd({
    pattern: "join",
    alias: ["joingroup"],
    react: "➕",
    desc: "Join a group using invite link",
    category: "group",
    filename: __filename
},
async (robin, mek, m, { isOwner, reply, args }) => {
    try {
        if (!isOwner) return reply("⚠️ Only bot owner can use this command!");

        const link = args[0];
        if (!link) return reply("⚠️ Please provide a WhatsApp group invite link!");

        const inviteCode = link.split("https://chat.whatsapp.com/")[1];
        if (!inviteCode) return reply("⚠️ Invalid invite link format!");

        await robin.groupAcceptInvite(inviteCode);
        return reply("✅ Successfully joined the group!");
    } catch (e) {
        console.error("Join Error:", e);
        return reply(`❌ Failed to join group. Error: ${e.message}`);
    }
});
