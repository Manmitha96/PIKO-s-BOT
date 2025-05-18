if (menuReplyState[senderNumber]?.expecting) {
  const selected = body.trim().toLowerCase();
  const categoryMap = {
    "1": "main",
    "2": "download",
    "3": "group",
    "4": "owner",
    "5": "convert",
    "6": "search",
  };
  if (categoryMap[selected]) {
    const list = commands
      .filter(c => c.category === categoryMap[selected] && c.pattern && !c.dontAddCommandList)
      .map(c => `▫️ ${config.PREFIX}${c.pattern}`)
      .join("\n");
    await robin.sendMessage(from, {
      text: `📂 *${categoryMap[selected].toUpperCase()} COMMANDS*\n\n${list}`
    }, { quoted: mek });
  } else {
    await robin.sendMessage(from, {
      text: "❌ Invalid option. Please type `.menu` again."
    }, { quoted: mek });
  }
  delete menuReplyState[senderNumber];
  return;
}

