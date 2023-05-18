// Node.js Server
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());

app.get('/places/:query/:province', async (req, res) => {
  try {
    const { query, province } = req.params;
    const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

    const placesResponseThai = await axios.get(url, {
      params: {
        query: `${query} ${province}`,
        key: 'AIzaSyB3LHd0aUM90OGkBfPwR5MvnXk_AHhRODE',
      }
    });

    res.json(placesResponseThai.data.results);
  } catch (error) {
    res.json({ error: error.toString() });
  }
});

app.get('/orchards/:province', async (req, res) => {
  try {
    const province = req.params.province;
    const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

    const responseThai = await axios.get(url, {
      params: {
        query: `สวน ทุเรียน ${province} ไทย`,
        key: 'AIzaSyB3LHd0aUM90OGkBfPwR5MvnXk_AHhRODE',
      }
    });

    const responseEnglish = await axios.get(url, {
      params: {
        query: `durian farm ${province} Thai`,
        key: 'AIzaSyB3LHd0aUM90OGkBfPwR5MvnXk_AHhRODE',
      }
    });
    
    const result = [...responseThai.data.results, ...responseEnglish.data.results];
    res.json(result);
  } catch (error) {
    res.json({ error: error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
