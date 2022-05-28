const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();

const objectId = require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');
const stripe =  require('stripe')(process.env.STRIPE_TOKEN_KEY);

const port = process.env.PORT || 5000;



// const corsConfig = {
//   origin: '*',
//   credential: true,
//   methods:['GET','POST','PUT','DELETE','PATCH']
// }
// const corsOptions ={
//   origin:'*', 
//   credentials:true,            //access-control-allow-credentials:true
//   optionSuccessStatus:200,
// }
// app.use(cors(corsOptions));
//app.options('*', cors(corsConfig));

const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH']
}
app.use(cors(corsConfig))
app.options("*", cors(corsConfig))
app.use(express.json())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,authorization")
  next()
})


// app.use(express.json());

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization')
//   next();
// });

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   next();
// });


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

    const profileCollection = client.db('bicycles').collection('profiles');
    const userCollection = client.db('bicycles').collection('users');
    const paymentCollection = client.db('bicycles').collection('payments');
    const ordersCollection = client.db('bicycles').collection('orders');
    const reviewCollection = client.db('bicycles').collection('reviews');


    app.get('/parts', async(req, res)=>{
        const query = {};
        const cursor = partsCollection.find(query);
        const part = await cursor.toArray();
        res.send(part);
        console.log(part);
    })

    app.get('/part/:id',  async(req, res) =>{
        const id = req.params.id;
        const query = {_id: objectId(id)};
        const part = await partsCollection.findOne(query);
        res.send(part);
       console.log("id", id)
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


      app.delete('/parts/:id', async (req, res) => {
        const _id = req.params.id;
        const query = { _id: objectId(_id) };
        const result = await partsCollection.deleteOne(query);
        return res.send({ success: true, result });
      });

      
      app.get('/order', async (req, res) => {
        
        //return res.send(cursor);

        //return res.send( req.query.clientEmail)
      const clientEmails = req.query?.clientEmail;
      console.log(clientEmails, "log");
      const decodedEmail = req.decoded?.email;
    //  if (clientEmails === decodedEmail) {
          const query = { clientEmail: clientEmails };
          const cursor = await ordersCollection.find(query).toArray();
          return res.send(cursor);
        //}
       // else {
        //  return res.status(403).send({ message: 'forbidden access' });
      // }

      });
      
      app.get('/order/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: objectId(id)};
        const cursor = await ordersCollection.findOne(query);
        console.log('load data ', cursor);
       return  res.send(cursor);
      });

      app.post('/order', async (req, res) => {
        const orderData = req.body;
      
        const result = await ordersCollection.insertOne(orderData);
        console.log(result);
       // sendAppointmentEmail(booking);
        return res.send({ success: true, result });
      });



      app.patch('/parts/:id', async(req, res) =>{
        const id  = req.params.id;
        const parts = req.body;
        const filter = {_id: objectId(id)};
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            itemName: parts.itemName,
            description: parts.description,
            price: parts.price,
            quantity: parts.quantity,
            minimumOrderQty : parts.minimumOrderQty,
            email: parts.email,
          }
        }
        const pats = await partsCollection.updateOne(filter, updatedDoc);
        res.send(pats);

        console.log("data update", parts)

      })


// user and admin area 


app.get('/user', async (req, res) => {
  const users = await userCollection.find({}).toArray();
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

app.patch('/user/admin/:id', async(req, res)=>{
  const id = req.params.id;
  console.log("objec id for pathch", id);
  const filter = {_id: objectId(id)};

  const updateDoc = {
    $set: { role: null },
  };
  const result = await userCollection.updateOne(filter, updateDoc);
  res.send(result);
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


// user profile 

app.get('/myprofile/', async(req, res) =>{

  const result = await profileCollection.find({}).toArray();
  console.log('All users ',result);
  res.send(result);
});
app.get('/myprofile/:emailId', async(req, res) =>{


  const filter = { email: email };
  const result = await profileCollection.findOne(filter);
  console.log('user profiles ',result);
  res.send(result);
});

app.put('/myprofile/:email', async(req, res) =>{
  const email = req.params.email;
  const user = req.body;
  const filter = { email: email };
  const options = { upsert: true };
  const updateDoc = {
    $set: user,
  };
  const result = await profileCollection.updateOne(filter, updateDoc, options);
  console.log(result);
  res.send(result);
})
// Review Area 
app.get('/review', async (req, res) => {

  const result = await reviewCollection.find({}).toArray();
  console.log(result);
  res.send(result);
   
});




app.post('/review', async (req, res) => {
  const part = req.body;
  console.log("parts ", part)
  const exists = await reviewCollection.findOne(part);
  // if (exists) {
  //   return res.send({ success: false, parts: exists })
  // }
  const result = await reviewCollection.insertOne(part);
  console.log('sending email');
 // sendAppointmentEmail(booking);
  return res.send({ success: true, result });
});


// payment in stripe 
app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  const price = items?.price ;
  const  amount = items?.price * 100;
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    payment_method_types: ['card']
  });

  console.log("payments", paymentIntent);
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
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