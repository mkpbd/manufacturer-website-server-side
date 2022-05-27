const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}

const verifyAdmin = async (req, res, next) => {
  const requester = req.decoded.email;
  const requesterAccount = await userCollection.findOne({ email: requester });
  if (requesterAccount.role === 'admin') {
    next();
  }
  else {
    res.status(403).send({ message: 'forbidden' });
  }
}




const run = async ()=>{
 try{

    client.connect();

    const partsCollection = client.db('bicycles').collection('cycle_parts');

    const bookingCollection = client.db('bicycles').collection('bookings');
    const userCollection = client.db('bicycles').collection('users');
    const paymentCollection = client.db('bicycles').collection('payments');
    const ordersCollection = client.db('bicycles').collection('orders');


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
        console.log("parts ", part)
        const exists = await partsCollection.findOne(part);
        // if (exists) {
        //   return res.send({ success: false, parts: exists })
        // }
        const result = await partsCollection.insertOne(part);
        console.log('sending email');
       // sendAppointmentEmail(booking);
        return res.send({ success: true, result });
      });


      
      app.get('/order', async (req, res) => {
        const cursor = await ordersCollection.find({}).toArray();
        return res.send(cursor);
      });
      
      app.get('/order/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const cursor = await ordersCollection.findOne(query);
        return res.send(cursor);
      });

      app.post('/order', async (req, res) => {
        const orderData = req.body;
      
        const result = await ordersCollection.insertOne(orderData);
        console.log(result);
       // sendAppointmentEmail(booking);
        return res.send({ success: true, result });
      });



      app.put('/parts/:id', async(req, res) =>{
        const id  = req.params.id;
        const parts = req.body;
        const filter = {_id: ObjectId(id)};
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            title: parts.itemName,    
          }
        }
        const pats = await partsCollection.updateOne(filter, updatedDoc, options);
        res.send(pats);
      })


// user and admin area 


app.get('/user', verifyJWT, async (req, res) => {
  const users = await userCollection.find().toArray();
  res.send(users);
});

app.get('/admin/:email', async (req, res) => {
  const email = req.params.email;
  const user = await userCollection.findOne({ email: email });
  const isAdmin = user.role === 'admin';
  res.send({ admin: isAdmin })
})

// app.put('/user/admin/:email', verifyJWT,verifyAdmin, async (req, res)
app.put('/user/admin/:email', verifyJWT, async (req, res) => {
  const email = req.params.email;
  const filter = { email: email };
  const requester = req.decoded.email;
  const requesterAccount = await userCollection.findOne({email:requester});
  if(requesterAccount.role === 'admin'){
    const updateDoc = {
      $set: { role: 'admin' },
    };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send(result);
  }
  else{
    res.status(403).send({message:"forbidden"});
  }
 
})

app.put('/user/:email', async (req, res) => {
  const email = req.params.email;
  const user = req.body;
  const filter = { email: email };
  const options = { upsert: true };
  const updateDoc = {
    $set: user,
  };
  const result = await userCollection.updateOne(filter, updateDoc, options);
  const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
  res.send({ result, token });
});


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