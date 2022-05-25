const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://mostofakamal:mk6683mk*@cluster0.jze6hqh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});




const run = async ()=>{



}

run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send("Server is running");
})









app.listen(port, () => {
    console.log(`Bicycle listening on port ${port}`)
  })