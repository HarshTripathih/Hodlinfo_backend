// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI; // Update with your MongoDB connection URI

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

const cryptoSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String
});

const Crypto = mongoose.model('Crypto', cryptoSchema);

app.get('/fetch-data', async (req, res) => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const data = response.data;

    const topTenResults = Object.values(data).slice(0, 10);
    await Crypto.insertMany(topTenResults);

    res.send('Data fetched and stored successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching and storing data');
  }
});

app.get('/get-data', async (req, res) => {
  try {
    const data = await Crypto.find().limit(10).lean();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while retrieving data');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});