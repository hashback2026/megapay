require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

async function sendSTK(msisdn, amount, reference) {
  try {
    const payload = {
      api_key: process.env.MEGAPAY_API_KEY,
      email: process.env.MEGAPAY_EMAIL,
      amount: amount,
      msisdn: msisdn,
      reference: reference
    };

    const response = await axios.post('https://megapay.co.ke/backend/v1/initiatestk', payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data;
  } catch (error) {
    return { error: error.message };
  }
}

app.post('/send-bulk', async (req, res) => {
  const { numbers, amount, reference } = req.body;
  const results = [];

  for (let msisdn of numbers) {
    if (msisdn.startsWith("0")) {
      msisdn = "254" + msisdn.slice(1);
    }

    const result = await sendSTK(msisdn, amount, reference);
    results.push({ phone: msisdn, result });

    await new Promise(r => setTimeout(r, 1500));
  }

  res.json(results);
});

app.post('/callback', (req, res) => {
  console.log('Callback:', req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
