const express = require("express");
const axios = require("axios");
const tlSigning = require("truelayer-signing");

const app = express();
app.use(express.json());

app.post("/generate-signature", async (req, res) => {
  const {
    kid,
    privateKeyPem,
    apiUrl,
    path,
    body,
    idempotencyKey,
    accessToken,
  } = req.body;

  try {
    // Generate the signature
    const signature = tlSigning.sign({
      kid,
      privateKeyPem,
      method: "POST",
      path: "/payments",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
    });

    // Send the request to TrueLayer
    const response = await axios.post(`${apiUrl}${path}`, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Idempotency-Key": idempotencyKey,
        "Tl-Signature": signature,
      },
    });

    console.log(response);
    res.json(response.data);
  } catch (error) {
    console.error("Error during request:", error);
    res.status(500).json({ error: "Request failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Signature server running on port ${PORT}`);
});
