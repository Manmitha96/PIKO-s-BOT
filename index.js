// index.js
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
const express = require("express");
const axios = require("axios");
const qrcode = require("qrcode-terminal");
const util = require("util");
const { File } = require("megajs");
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
const { sms, downloadMediaMessage } = require("./lib/msg");
const config = require("./config");
const prefix = config.PREFIX;
const ownerNumber = config.OWNER_NUM;

// import menu state and commands
const { menuReplyState } = require("./commands/menu");
const { commands } = require("./command");

// SESSION AUTH
if (!fs.existsSync(__dirname + "/auth_info_baileys/creds.json")) {
  if (!config.SESSION_ID) {
    console.log("Please add your session to SESSION_ID env !!");
    process.exit(1);
  }
  const sessdata = config.SESSION_ID;
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.writeFileSync(__dirname + "/auth_info_baileys/creds.json", data);
    console.log("SESSION DOWNLOADED ✅");
  });
}

const app = express();
const port = process.env.PORT || 8000;

async function connectToWA() {
  console.log("Connecting 💟༺°•𝓟𝙸κ𝒪•°ᴮᵒˢˢ°༻🔝");
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

  // connection events
  robin.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (
        lastDisconnect.error.output.statusCode !==
        DisconnectReason.loggedOut
      ) {
        connectToWA();
      }
    } else if (connection === "open") {
      console.log("Bot installed & connected ✅");
      // load plugins
      const path = require("path");
      fs.readdirSync("./plugins/")
        .filter((f) => f.endsWith(".js"))
        .forEach((plugin) => require(path.join(__dirname, "plugins", plugin)));
      // notify owner
      const upMsg = "Bot connected successfully ✅";
      robin.sendMessage(ownerNumber + "@s.whatsapp.net", {
        image: {
          url:
            config.ALIVE_IMG ||
            "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/IMG-20250427-WA0144.jpg",
        },
        caption: upMsg,
      });
    }
  });

  robin.ev.on("creds.update", saveCreds);

  // global message handler
  robin.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    let mek = messages[0];
    if (!mek.message) return;

    // unwrap ephemeral
    if (getContentType(mek.message) === "ephemeralMessage") {
      mek.message = mek.message.ephemeralMessage.message;
    }
    if (mek.key.remoteJid === "status@broadcast") return;

    const m = sms(robin, mek);
    const typeMsg = getContentType(mek.message);
    const from = mek.key.remoteJid;
    const sender = mek.key.fromMe
      ? robin.user.id.split(":")[0] + "@s.whatsapp.net"
      : mek.key.participant || from;
    const senderNumber = sender.split("@")[0];
    const body =
      typeMsg === "conversation"
        ? mek.message.conversation
        : typeMsg === "extendedTextMessage"
        ? mek.message.extendedTextMessage.text
        : typeMsg === "imageMessage" && mek.message.imageMessage.caption
        ? mek.message.imageMessage.caption
        : typeMsg === "videoMessage" && mek.message.videoMessage.caption
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
        const selectedCat = categoryMap[selected];
        const cmds = commands
          .filter(
            (c) =>
              c.category === selectedCat &&
              c.pattern &&
              !c.dontAddCommandList
          )
          .map((c) => `▫️ ${config.PREFIX}${c.pattern}`)
          .join("\n");
        const response = `📂 *${selectedCat.toUpperCase()} COMMANDS*\n\n${
          cmds || "No commands found."
        }`;
        await robin.sendMessage(from, { text: response }, { quoted: mek });
      } else {
        await robin.sendMessage(
          from,
          { text: "❌ Invalid selection. Please use .menu again." },
          { quoted: mek }
        );
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
    const isOwner =
      ownerNumber.includes(senderNumber) || mek.key.fromMe === true;

    // permission checks
    if (!isOwner && config.MODE === "private") return;
    if (!isOwner && isGroup && config.MODE === "inbox") return;
    if (!isOwner && !isGroup && config.MODE === "groups") return;

    // dispatch command
    if (isCmd) {
      const cmdObj =
        commands.find((c) => c.pattern === commandName) ||
        commands.find((c) => c.alias && c.alias.includes(commandName));
      if (cmdObj) {
        if (cmdObj.react)
          robin.sendMessage(from, {
            react: { text: cmdObj.react, key: mek.key },
          });
        try {
          await cmdObj.function(robin, mek, m, {
            from,
            quoted:
              typeMsg === "extendedTextMessage"
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
              ? await getGroupAdmins(
                  (await robin.groupMetadata(from)).participants
                )
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
    for (let user in menuReplyState) {
      if (now - menuReplyState[user].timestamp > 60000) {
        delete menuReplyState[user];
      }
    }
  }, 30000);

  app.get("/", (req, res) => res.send("Bot is running ✅"));
  app.listen(port, () =>
    console.log(`Server listening on http://localhost:${port}`)
  );
}

connectToWA();
