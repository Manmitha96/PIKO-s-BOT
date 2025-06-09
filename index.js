const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const P = require("pino");
const config = require("./config");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const express = require("express");
const {
  getBuffer,
  getRandom,
  runtime,
  fetchJson,
  sleep,
} = require("./lib/functions");
const { sms, downloadMediaMessage } = require("./lib/msg");
const { File } = require("megajs");
const prefix = config.PREFIX;
const ownerNumber = config.OWNER_NUM;

// Session Auth
if (!fs.existsSync(__dirname + "/auth_info_baileys/creds.json")) {
  if (!config.SESSION_ID)
    return console.log("Please add your session to SESSION_ID env !!");
  const sessdata = config.SESSION_ID;
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.writeFile(
      __dirname + "/auth_info_baileys/creds.json",
      data,
      () => {
        console.log("SESSION DOWNLOADED ✅");
      }
    );
  });
}

const app = express();
const port = process.env.PORT || 8000;

// Fix getGroupAdmins function
function getGroupAdmins(participants) {
  // Only participants with admin property set to 'admin' or 'superadmin' count as admins
  return participants
    .filter(p => p.admin === "admin" || p.admin === "superadmin")
    .map(p => p.id);
}

async function connectToWA() {
  console.log("Connecting 💟༺°•𝓟𝙸κ𝒪•°ᴮᵒˢˢ°༻🔝");
  const { state, saveCreds } = await useMultiFileAuthState(
    __dirname + "/auth_info_baileys/"
  );
  var { version } = await fetchLatestBaileysVersion();

  const robin = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version,
  });

  robin.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
      ) {
        connectToWA();
      }
    } else if (connection === "open") {
      console.log("BOT connected ✅");

      // Load plugins
      const path = require("path");
      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() == ".js") {
          require("./plugins/" + plugin);
        }
      });

      // Send startup message
      robin.sendMessage(ownerNumber + "@s.whatsapp.net", {
        image: {
          url: `https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/IMG-20250427-WA0144.jpg`,
        },
        caption: "💟 BOT connected successfully ✅",
      });
    }
  });

  robin.ev.on("creds.update", saveCreds);

  robin.ev.on("messages.upsert", async (mek) => {
    mek = mek.messages[0];
    if (!mek.message) return;

    mek.message =
      getContentType(mek.message) === "ephemeralMessage"
        ? mek.message.ephemeralMessage.message
        : mek.message;
    if (mek.key.remoteJid === "status@broadcast") return;

    const m = sms(robin, mek);
    const type = getContentType(mek.message);
    const body =
      type === "conversation"
        ? mek.message.conversation
        : type === "extendedTextMessage"
        ? mek.message.extendedTextMessage.text
        : type === "imageMessage" && mek.message.imageMessage.caption
        ? mek.message.imageMessage.caption
        : type === "videoMessage" && mek.message.videoMessage.caption
        ? mek.message.videoMessage.caption
        : "";

    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(" ");
    const from = mek.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    // Normalize sender ID
    const sender = mek.key.fromMe
      ? jidNormalizedUser(robin.user.id)
      : mek.key.participant || mek.key.remoteJid;
    const senderNumber = sender.split("@")[0];

    const botNumber = jidNormalizedUser(robin.user.id);

    const isOwner = ownerNumber.includes(senderNumber);
    const pushname = mek.pushName || "Sin Nombre";

    // Group metadata
    const groupMetadata = isGroup ? await robin.groupMetadata(from).catch(() => {}) : null;
    const groupName = isGroup && groupMetadata ? groupMetadata.subject : "";
    const participants = isGroup && groupMetadata ? groupMetadata.participants : [];

    // Correct getGroupAdmins call
    const groupAdmins = isGroup ? getGroupAdmins(participants) : [];

    // IMPORTANT FIXES HERE:
    // Both botNumber and sender must be normalized JIDs to match groupAdmins list format
    // Normalize the JIDs for matching
    const normalizedBotNumber = jidNormalizedUser(botNumber);
    const normalizedSender = jidNormalizedUser(sender);

    // Check if bot is admin
    const isBotAdmins = isGroup ? groupAdmins.includes(jidNormalizedUser(botNumber)) : false;

    // Check if sender is admin
    const isAdmins = isGroup ? groupAdmins.includes(jidNormalizedUser(sender)) : false;

    const reply = (teks) => robin.sendMessage(from, { text: teks }, { quoted: mek });

    // Debug logs for verification
    console.log({
     botNumber,
     sender,
     groupAdmins,
     isBotAdmins,
     isAdmins
   });

    // Command handler permission checks
    if (!isOwner && config.MODE === "private") return;
    if (!isOwner && isGroup && config.MODE === "inbox") return;
    if (!isOwner && !isGroup && config.MODE === "groups") return;

    const events = require("./command");
    const cmd = events.commands.find(
      (cmd) => cmd.pattern === command || (cmd.alias && cmd.alias.includes(command))
    );

    if (isCmd && cmd) {
      try {
        cmd.function(robin, mek, m, {
          from,
          quoted: mek,
          body,
          isCmd,
          command,
          args,
          q,
          isGroup,
          sender: normalizedSender,
          senderNumber,
          botNumber: normalizedBotNumber,
          pushname,
          isOwner,
          groupMetadata,
          groupName,
          participants,
          groupAdmins,
          isBotAdmins,
          isAdmins,
          reply,
        });
      } catch (e) {
        console.error("[PLUGIN ERROR]", e);
      }
    }
  });
}

app.get("/", (req, res) => {
  res.send("BOT running ✅");
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

setTimeout(() => {
  connectToWA();
}, 4000);
