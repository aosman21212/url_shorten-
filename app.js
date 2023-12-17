const express = require('express');
const { MongoClient } = require('mongodb');
const shortUUID = require('short-uuid');

const app = express();
const port = 3000;

const mongoUrl = 'mongodb+srv://aosman:NUOtE4rNYBH4NyGj@cluster0.xambx2n.mongodb.net/test';

const dbName = 'urlShortener';
const collectionName = 'urlMappings';

let db;

async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(mongoUrl);
    console.log('Connected to MongoDB');
    db = client.db(dbName);

    // Start the Express server only if the MongoDB connection is successful
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    // Retry connection after a short delay
    setTimeout(connectToMongoDB, 5000);
  }
}

connectToMongoDB();

const uuid = shortUUID();

app.use(express.json());

app.post('/shorten', async (req, res) => {
  const originalUrl = req.body.url;
  const guid = uuid.new(); // Generate a short ID using short-uuid

  const urlMapping = { guid, originalUrl };

  try {
    // Save mapping to MongoDB
    const result = await db.collection(collectionName).insertOne(urlMapping);
    const shortenedUrl = `http://localhost:${port}/${guid}`;
    res.json({ originalUrl, shortenedUrl, guid });
  } catch (err) {
    console.error('Error saving to MongoDB:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

    //---------------------------------------------------------------------------------
app.get('/:guid', async (req, res) => {
    const guid = req.params.guid;
  
    try {
      const result = await db.collection(collectionName).findOne({ guid });
  
      if (result) {
        // Redirect to the original URL
        res.redirect(result.originalUrl);
      } else {
        // Log the error and send a 404 response
        console.error(`URL mapping not found for GUID: ${guid}`);
        res.status(404).send('Not Found');
      }
    } catch (err) {
      // Log the error and send a 500 response
      console.error('Error querying MongoDB:', err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
