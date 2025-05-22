const { cmd } = require("../command");

cmd(
  {
    pattern: "dp",
    alias: ["profilepic", "getdp"],
    desc: "Download WhatsApp display picture of a user (by number or reply)",
    category: "utility",
    filename: __filename,
  },
  async (robin, mek, m, { from, args, reply, quoted }) => {
    try {
      let target;
      if (args[0]) {
        // If number is provided as argument
        target = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      } else if (quoted && quoted.sender) {
        // If replying to a message, get sender's JID
        target = quoted.sender;
      } else {
        return reply("Please provide a WhatsApp number or reply to a user's message with this command.");
      }

      let url = await robin.profilePictureUrl(target, "image").catch(() => null);
      if (!url) return reply("Couldn't fetch profile picture (maybe the user has no dp or privacy is set).");

      await robin.sendMessage(
        from,
        { image: { url }, caption: `Profile picture of ${target.split("@")[0]}` },
        { quoted: mek }
      );
    } catch (e) {
      console.error(e);
      reply("Error fetching display picture. Make sure the number is correct or reply to a user's message.");
    }
  }
);