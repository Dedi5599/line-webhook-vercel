export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const body = req.body;

  console.log("📥 Incoming request:", JSON.stringify(body));

  // ✅ รองรับ LINE webhook test
  if (!body.token && !body.events) {
    return res.status(200).send("✅ LINE Webhook test OK");
  }

  // ✅ ดึง message และ groupId จาก LINE
  const event = body.events?.[0];
  const message = event?.message?.text;
  const groupId = event?.source?.groupId;

  if (!groupId || !message) {
    return res.status(400).send("Missing groupId or message");
  }

  const webhookMap = {
    "C8384b60ad365d59bf95ad1c9f9977737": "https://discord.com/api/webhooks/1357786124260610199/h59tUTYS1JTWV9K-inbfRMJ6UIjRPorn8Ek-NzkQ-QvAHecAzGIjuLzgib8ctfZVbl6W"
  };

  const deviceNameMap = {
    "C8384b60ad365d59bf95ad1c9f9977737": "เครื่องสแกนหน้า (จุดที่ 1)"
  };

  const lineAccessToken = "2df1zFuCIrhA0n0jvTPKmlxchDdkPCPAWKDHRKsMHfYEzXZcSsYUESDGaCv1GFXVHSHVSFqeSG2v36ZBa1N66ZaZHLkD8ym7o3Mj4uow33pD71KMpPi4RTg9sMIK3R8VB6E/ri2qwBgxWCFPHUOTTAdB04t89/1O/w1cDnyilFU=";

  const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  const fullMessage = `📌 [${deviceNameMap[groupId] || "ไม่ทราบชื่อเครื่อง"}]\n${message}\n🕓 เวลา: ${now}`;

  // ส่ง Discord
  try {
    await fetch(webhookMap[groupId], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: fullMessage })
    });
  } catch (err) {
    console.error("Discord Error:", err);
  }

  // ส่ง LINE (ถ้าอยากส่งกลับ)
  try {
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + lineAccessToken
      },
      body: JSON.stringify({
        to: groupId,
        messages: [{ type: "text", text: fullMessage }]
      })
    });
  } catch (err) {
    console.error("LINE Error:", err);
  }

  res.status(200).send("✅ Message sent to Discord + LINE");
}
