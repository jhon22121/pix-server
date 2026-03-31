const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const API_KEY = "c7_live_f333452c0d48e3e2ba9dc58e7a5aa41c0c79629b4a9aaf732aed948e04acc01b";
const API_SECRET = "dcb854ddd68651aec85e1f9994d3bd50f92e601fd0399c481f6a6fd781a3685fcd530ee0a9154a8820fb8d9c97b5ac72c5c0849bfc31501dd0b8881c7b6e290e";

function sign(body) {
  const ts = Math.floor(Date.now() / 1000).toString();

  const signature = crypto
    .createHmac("sha256", API_SECRET)
    .update(ts + "." + body)
    .digest("hex");

  return { ts, signature };
}

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
    res.status(500).send("Erro");
  }
});

app.listen(3000, () => console.log("Rodando"));