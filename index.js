// index.js

// — Quick startup log to verify we’re here —
console.log("▶︎ index.js starting up…");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");

const fs    = require("fs");
const P     = require("pino");
const express = require("express");
const axios = require("axios");
const { File } = require("megajs");
const qrcode  = require("qrcode-terminal");
const util    = require("util");
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
} = require("./lib/functions");
const { sms } = require("./lib/msg");
const config      = require("./config");
const prefix      = config.PREFIX;
const ownerNumber = config.OWNER_NUM;

// Load your commands array
const { commands } = require("./command");

// Safely load menuReplyState from plugins/menu.js
let menuReplyState = {};
try {
  ({ menuReplyState } = require("./plugins/menu"));
  console.log("▶︎ menuReplyState loaded:", typeof menuReplyState);
} catch (e) {
  console.error("❌ Failed to load menu plugin:", e);
  // leave menuReplyState = {} so bot still runs
}

const app  = express();
const port = process.env.PORT || 8000;

// If no saved session, download from MEGA
if (!fs.existsSync(__dirname + "/auth_info_baileys/creds.json")) {
  if (!config.SESSION_ID) {
    console.error("Please add your SESSION_ID to the environment!");
    process.exit(1);
  }
  const filer = File.fromURL(`https://mega.nz/file/${config.SESSION_ID}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.writeFileSync(__dirname + "/auth_info_baileys/creds.json", data);
    console.log("SESSION DOWNLOADED ✅");
  });
}

async function connectToWA() {
  console.log("Connecting to WhatsApp…");

  // load auth state
  const { state, saveCreds } = await useMultiFileAuthState(
    __dirname + "/auth_info_baileys/"
  );
  const { version } = await fetchLatestBaileysVersion();

  const robin = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version,
  });

  robin.ev.on("connection.update", (u) => {
    const { connection, lastDisconnect } = u;
    if (connection === "close" &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
      connectToWA();
    } else if (connection === "open") {
      console.log("► Connected — loading plugins…");
      // load plugins folder
      fs.readdirSync("./plugins/")
        .filter(f => f.endsWith(".js"))
        .forEach(f => require(`./plugins/${f}`));
      console.log("► All plugins loaded. Bot is ready.");
      // notify owner
      robin.sendMessage(ownerNumber + "@s.whatsapp.net", {
        image: { url: config.ALIVE_IMG },
        caption: "Bot connected successfully ✅",
      });
    }
  });

  robin.ev.on("creds.update", saveCreds);

  robin.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    let mek = messages[0];
    if (!mek.message) return;

    // unwrap ephemeral
    if (getContentType(mek.message) === "ephemeralMessage") {
      mek.message = mek.message.ephemeralMessage.message;
    }
    if (mek.key.remoteJid === "status@broadcast") return;

    const m      = sms(robin, mek);
    const msgType = getContentType(mek.message);
    const from   = mek.key.remoteJid;
    const sender = mek.key.fromMe
      ? robin.user.id.split(":")[0] + "@s.whatsapp.net"
      : mek.key.participant || from;
    const senderNumber = sender.split("@")[0];

    // extract body text
    const body =
      msgType === "conversation"
        ? mek.message.conversation
        : msgType === "extendedTextMessage"
        ? mek.message.extendedTextMessage.text
        : msgType === "imageMessage" && mek.message.imageMessage.caption
        ? mek.message.imageMessage.caption
        : msgType === "videoMessage" && mek.message.videoMessage.caption
        ? mek.message.videoMessage.caption
        : "";

    // —— MENU‑REPLY HANDLER ——
    if (menuReplyState[senderNumber]?.expecting) {
      const selected = body.trim();
      const categoryMap = {
        "1": "main",
        "2": "download",
        "3": "group",
        "4": "owner",
        "5": "convert",
        "6": "search",
      };
      if (categoryMap[selected]) {
        const cat = categoryMap[selected];
        const list = commands
          .filter(c => c.category === cat && c.pattern && !c.dontAddCommandList)
          .map(c => `▫️ ${config.PREFIX}${c.pattern}`)
          .join("\n");
        await robin.sendMessage(from, {
          text: `📂 *${cat.toUpperCase()} COMMANDS*\n\n${list || "No commands found."}`
        }, { quoted: mek });
      } else {
        await robin.sendMessage(from, {
          text: "❌ Invalid selection. Please type `.menu` again."
        }, { quoted: mek });
      }
      delete menuReplyState[senderNumber];
      return;
    }
    // — end MENU‑REPLY HANDLER —

    // normal command parsing
    const isCmd = body.startsWith(prefix);
    const commandName = isCmd
      ? body.slice(prefix.length).trim().split(/ +/)[0].toLowerCase()
      : "";
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(" ");
    const isGroup = from.endsWith("@g.us");
    const pushname = mek.pushName || "No Name";
    const isOwner = ownerNumber.includes(senderNumber) || mek.key.fromMe;

    // permission gates
    if (!isOwner && config.MODE === "private") return;
    if (!isOwner && isGroup  && config.MODE === "inbox") return;
    if (!isOwner && !isGroup && config.MODE === "groups") return;

    if (isCmd) {
      const cmdObj =
        commands.find(c => c.pattern === commandName) ||
        commands.find(c => c.alias && c.alias.includes(commandName));
      if (cmdObj) {
        if (cmdObj.react) {
          robin.sendMessage(from, { react: { text: cmdObj.react, key: mek.key } });
        }
        try {
          await cmdObj.function(robin, mek, m, {
            from,
            quoted:
              msgType === "extendedTextMessage"
                ? mek.message.extendedTextMessage.contextInfo.quotedMessage
                : {},
            body,
            isCmd,
            command: commandName,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2: await jidNormalizedUser(robin.user.id),
            botNumber: robin.user.id.split(":")[0],
            pushname,
            isOwner,
            groupMetadata: isGroup
              ? await robin.groupMetadata(from).catch(() => ({}))
              : {},
            participants: isGroup
              ? await getGroupAdmins((await robin.groupMetadata(from)).participants)
              : [],
          });
        } catch (e) {
          console.error("[PLUGIN ERROR]", e);
        }
      }
    }
  });

  // cleanup stale menu states
  setInterval(() => {
    const now = Date.now();
    for (let u in menuReplyState) {
      if (now - menuReplyState[u].timestamp > 60000) {
        delete menuReplyState[u];
      }
    }
  }, 30000);

  // HTTP keepalive
  app.get("/", (req, res) => res.send("Bot is up ✅"));
  app.listen(port, () => console.log(`Server on http://localhost:${port}`));
}

connectToWA();
