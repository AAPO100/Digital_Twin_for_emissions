const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;
const uri = "mongodb+srv://aapo:AASbjhlxU49H1UyY@cluster0.qdcd8a5.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use(bodyParser.json());

app.post('/positions', async (req, res) => {
    try {
      const data = req.body;
      console.log('data:', data);
      await client.connect();
      const db = client.db('sensordata');
      const collection = db.collection('positions');
      console.log('collection:', collection);
      const result = await collection.insertOne(data);
      console.log('result:', result);
      res.json(result.ops[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });







// const fs = require('fs');

// // Read the ASCII file
// const signals = fs.readFileSync('test.log', 'utf-8');

// // Extract the latitude, longitude, and timestamp from each signal
// const signalRegex = /Latitude:(.*), Longitude:(.*), Timestamp:(.*)/g;
// const extractedData = [];
// let match;
// while (match = signalRegex.exec(signals)) {
//   const latitude = match[1].trim();
//   const longitude = match[2].trim();
//   const timestamp = match[3].trim();
//   extractedData.push({ latitude, longitude, timestamp });
// }

// Print the extracted data
// console.log(extractedData);
