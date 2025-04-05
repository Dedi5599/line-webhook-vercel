export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const body = req.body;

  // ✅ เพิ่มตรงนี้ เพื่อให้รองรับ webhook test จาก LINE
  if (!body.token) {
    return res.status(200).send("✅ LINE Webhook test OK");
  }

  // ดึง token & message ตามปกติ
  const { token, message } = body;

  if (!token || !message) {
    return res.status(400).send("Missing token or message");
  }

  const webhookMap = {
    "neocal001": "https://discord.com/api/webhooks/xxxx",
    "neocal002": "https://discord.com/api/webhooks/yyyy"
  };

  const lineMap = {
    "neocal001": "Cxxxxxxxxxxxxxxxxxxxx",
    "neocal002": "Uxxxxxxxxxxxxxxxxxxxx"
  };

  const deviceNameMap = {
    "neocal001": "เครื่องสแกนหน้า (จุดที่ 1)",
    "neocal002": "เครื่องสแกนนิ้วมือ (จุดที่ 2)"
  };

  const lineAccessToken = "ใส่ LINE Channel access token ตรงนี้";

  const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  const fullMessage = `📌 [${deviceNameMap[token] || "ไม่ทราบชื่อเครื่อง"}]\n${message}\n🕓 เวลา: ${now}`;

  // ส่งไป Discord
  try {
    await fetch(webhookMap[token], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: fullMessage })
    });
  } catch (err) {
    console.error("Discord Error:", err);
  }

  // ส่งไป LINE
  try {
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + lineAccessToken
      },
      body: JSON.stringify({
        to: lineMap[token],
        messages: [{ type: "text", text: fullMessage }]
      })
    });
  } catch (err) {
    console.error("LINE Error:", err);
  }

  res.status(200).send("✅ Message sent to Discord + LINE");
}
