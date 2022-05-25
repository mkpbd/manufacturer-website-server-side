const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
require('dotenv').config();
const objectId = require('mongodb').ObjectId;

const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 5QAQBudMgOOaogVq
// mostofakamal

const uri = "mongodb+srv://mostofakamal:5QAQBudMgOOaogVq@cluster01.cfkl3.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



const run = async ()=>{
 try{

    client.connect();

    const partsCollection = client.db('bicycles').collection('cycle_parts');

    const bookingCollection = client.db('bicycles').collection('bookings');
    const userCollection = client.db('bicycles').collection('users');
    const paymentCollection = client.db('doctors_portal').collection('payments');

    app.get('/parts', async(req, res)=>{
        const query = {};
        const cursor = partsCollection.find(query);
        const part = await cursor.toArray();
        res.send(part);
        console.log(part);
    })

    app.get('/pats/:id',  async(req, res) =>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const part = await partsCollection.findOne(query);
        res.send(part);
      })

      app.post('/parts', async (req, res) => {
        const part = req.body;
        const exists = await partsCollection.findOne(query);
        if (exists) {
          return res.send({ success: false, booking: exists })
        }
        const result = await bookingCollection.insertOne(booking);
        console.log('sending email');
       // sendAppointmentEmail(booking);
        return res.send({ success: true, result });
      });

      app.put('/parts/:id', async(req, res) =>{
        const id  = req.params.id;
        const payment = req.body;
        const filter = {_id: ObjectId(id)};
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            paid: true,
            transactionId: payment.transactionId
          }
        }
        const pats = await partsCollection.updateOne(filter, updatedDoc, options);
        res.send(pats);
      })

 }finally{

 }


}

run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send("Server is running");
})









app.listen(port, () => {
    console.log(`Bicycle listening on port ${port}`)
  })