const { MongoClient } = require("mongodb");
require('dotenv').config()

// Replace the uri string with your MongoDB deployment's connection string.
const uri =
  `mongodb+srv://closetlyAdmin:${process.env.DB_PASS}@cluster0.vt6bu.mongodb.net/closetly?retryWrites=true&w=majority&useUnifiedTopology=true`;
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db('closetly');
    const movies = database.collection('users');
    // Query for a movie that has the title 'Back to the Future'
    const query = { email: 'test@test.com' };
    const movie = await movies.findOne(query);
    console.log(movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);