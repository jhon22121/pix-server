const cors = require("cors");
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 pega do Render (Environment Variables)
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// 🔐 função de assinatura (fica antes de usar)
function sign(body) {
  const ts = Math.floor(Date.now() / 1000).toString();

  const signature = crypto
    .createHmac("sha256", API_SECRET)
    .update(ts + "." + body)
    .digest("hex");

  return { ts, signature };
}

// 🧪 rota teste (pra não aparecer "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// 💰 rota que gera PIX
app.post("/api/pix", async (req, res) => {
  try {
    const body = JSON.stringify({
      amount: 20.49,
      externalId: "pedido_" + Date.now(),
      callbackUrl: "https://SEU-SITE.com/webhook"
    });

    const { ts, signature } = sign(body);

    const response = await axios.post(
      "https://api.carteirado7.com/v2/payment/create",
      body,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "X-C7-Timestamp": ts,
          "X-C7-Signature": signature
        }
      }
    );

    res.json(response.data.payment);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Erro ao gerar PIX");
  }
});

// 🚀 iniciar servidor
app.listen(3000, () => console.log("Rodando"));