cmd({
    pattern: "restart",
    desc: "restart the bot",
    category: "owner",
    filename: __filename
},
async(conn, mek, m,{
    from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        // Owner verification with your Sri Lankan number
        const ownerNumber = "94726939427@c.us"; // Your number with Sri Lanka country code
        const isActuallyOwner = sender.includes(ownerNumber) || sender.endsWith(ownerNumber);
        
        if (!isActuallyOwner) {
            return reply("*Only the bot owner can use this command.🕋*");
        }
        
        const {exec} = require("child_process");
        await reply("*Restarting bot... Please wait*");
        await sleep(1500);
        exec("pm2 restart all");
    } catch(e) {
        console.error("Restart Error:", e);
        reply(`⚠️ Restart failed: ${e.message}`);
    }
})
