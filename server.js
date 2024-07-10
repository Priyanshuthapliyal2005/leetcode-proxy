const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
  console.log(`Proxy server is running at http://localhost:${port}`);
});
