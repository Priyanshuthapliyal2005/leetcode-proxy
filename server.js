const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
let db;

// Function to connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('Connecting to MongoDB with URI:', uri);
    const client = new MongoClient(uri, {
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });
    await client.connect();
    db = client.db('coders'); // Replace 'coders' with your actual database name
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Route to save username
app.post('/save-username', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const collection = db.collection('usernames');
    const result = await collection.insertOne({ username });
    res.status(200).json({ message: 'Username saved successfully', result });
  } catch (error) {
    console.error('Error saving username:', error);
    res.status(500).json({ error: 'Failed to save username' });
  }
});

// Route to proxy GraphQL requests to LeetCode
app.post('/graphql', async (req, res) => {
  try {
    const response = await axios.post('https://leetcode.com/graphql', req.body, {
      headers: {
        'Content-Type': 'application/json',
        'x-csrftoken': req.headers['x-csrftoken'],
        'Cookie': req.headers['cookie'],
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Proxy server is running');
});

// Start the server after connecting to MongoDB
connectToMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`Proxy server is running at http://localhost:${port}`);
  });
});
