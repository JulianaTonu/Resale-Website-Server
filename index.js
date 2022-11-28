const express=require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } =require('mongodb');
// const { ObjectId } = require('mongodb/mongodb');

const jwt=require('jsonwebtoken')

// const stripe =require("stripe")('sk_test_51M6AAFJbSd23miiftSASrzi9R0uFkwGP8YXIYO48TpZKX8JpUJnRkJmrMjXh9JBCVDYbKjdnosqD9206Iq6MxOh5004JKRdxha')

console.log('stripe',process.env.STRIPE_SECRET_KEY)
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express()
const stripe =require("stripe")(process.env.STRIPE_SECRET_KEY)
//middleware 
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rpina.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//jwt
function verifyJWT(req, res, next){
    // console.log(req.headers.authorization)
    const authHeader =req.headers.authorization;
    if(!authHeader){
      return res.status(401).send({message:'unauthorized access'})
    }
const token =authHeader.split(' ')[1];
jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
if(err){
    return res.status(403).send({message: 'unauthorized access'})
}
req.decoded = decoded;
next();
    })
}


async function run(){
try{
const categoriesCollection=client.db('resaledb').collection('categories')
const productsCollection=client.db('resaledb').collection('products')
const  usersCollection=client.db('resaledb').collection('users')
const  bookingsCollection=client.db('resaledb').collection('bookings')
const  advertiseCollection=client.db('resaledb').collection('advertise')
const reportCollection=client.db('resaledb').collection('report')
const  paymentsCollection=client.db('resaledb').collection('payment')


//read all category
app.get ('/categories', async(req, res)=>{
    const query ={}
    const categories = await categoriesCollection.find(query).toArray()
    res.send(categories)
})

app.get ('/category', async(req, res)=>{
    let query ={}
    console.log(req.query.category_name)

    if(req.query.category_name){
        query={
            category_name:req.query.category_name
        }
    }
    const cursor = productsCollection.find(query)
    const result = await cursor.toArray();
    res.send(result)
})

//read all products
app.get ('/products', async(req, res)=>{
    const query ={}
    const products = await productsCollection.find(query).toArray()
    res.send(products)
})

app.get ('/category/:id', async(req, res)=>{
    const id =req.params.id
    const query ={_id:ObjectId(id)}
    const category = await categoriesCollection.findOne(query)
    res.send(category)
})

app.post('/create-payment-intent',async(req, res)=>{

    const booking =req.body;
    const price =booking.price 
    const amount = price * 100;

   const paymentIntent = await stripe.paymentIntents.create({
        currency:'usd',
        amount: amount,
        'payment_method_types':[
            "card"
        ]

    });
    res.send({
        clientSecret : paymentIntent.client_secret,
    });
})

app.post('/payments',async(req,res)=>{
    //post payment in payment collection
    const payment=req.body;
    const result=await paymentsCollection.insertOne(payment)
    //update paid field in booking collection
    const id =payment.bookingId
    const filter ={_id: ObjectId(id)}
    const updatedDoc = {
        $set:{
            paid:true,
            transactionId: payment.transactionId
        }
    }
    const updatedResult =await bookingsCollection.updateOne(filter , updatedDoc)
  
    res.send(result)
})
  //update paid fields in products collection
//   const productid =payment.productId
//   const query ={_id: ObjectId(productid)}
//   const options ={upsert:true}
//   const updatedProduct = {
//       $set:{
//           paid:true,
          
//       }
//   }
//   const updatedProductResult =await productsCollection.updateOne(query , updatedProduct,options)

app.get('/jwt', async(req, res)=>{
    const email=req.query.email;
    const query ={email: email}
    const user =await usersCollection.findOne(query)

    if(user){
        const token = jwt.sign({email}, process.env.ACCESS_TOKEN,{expiresIn:'20 days'})
        return res.send({accessToken: token})
    }
    console.log('user', user,)
    res.status(403).send({accessToken: 'token'})

}) 

//create user
app.post('/users',async (req, res)=>{
    const email=req.body.email;
    const query ={email : email}
    const user =await usersCollection.findOne(query)
    if(!user){
        const user =req.body;
        const result =await usersCollection.insertOne(user)
        return res.send(result)
    }
   res.status(403).send({ message: 'User already exists'})
})


// app.post('/users',async (req, res)=>{
//     const user =req.body;
//     const result =await usersCollection.insertOne(user)
//     res.send(result)
// })



  //create product
  app.post('/products',async(req,res)=>{
    const product=req.body;
    console.log(product)
    const result =await productsCollection.insertOne(product)
    res.send(result)
})
//read product email wise
app.get('/product', async(req,res)=>{

    let query={};
    console.log(req.query.email)

    if(req.query.email){
        query={
            email:req.query.email 
        }
    }
    
    const cursor= productsCollection.find(query)
    const products =await cursor.toArray()
    res.send(products)

})

//delete product
app.delete('/myproduct/:id', async(req,res)=>{
    const id =req.params.id;
    const query ={_id:ObjectId(id)}
    const result =await productsCollection.deleteOne(query)
    res.send(result)
})

//get all sellers
app.get('/sellers', async(req,res)=>{

    let query={};
    console.log(req.query.role)

    if(req.query.role){
        query={
            role:req.query.role 
        }
    }
    
    const cursor= usersCollection.find(query)
    const sellers =await cursor.toArray()
    res.send(sellers)

})
//get all sellers
app.get('/alluser', async(req,res)=>{

    let query={};
    console.log(req.query.role)

    if(req.query.role){
        query={
            role:req.query.role 
        }
    }
    
    const cursor= usersCollection.find(query)
    const allusers =await cursor.toArray()
    res.send(allusers)

})

//admin
app.get('/users/admin/:email', async(req,res)=>{
    const email= req.params.email;
    const query ={email}
    const user =await usersCollection.findOne(query)
    res.send({isAdmin:user?.role === 'Admin'})
})

//sellers
app.get('/users/sellers/:email', async(req,res)=>{
    const email= req.params.email;
    const query ={email}
    const user =await usersCollection.findOne(query)
    res.send({isSeller:user?.role === 'Seller'})
})
//Buyers
app.get('/users/buyers/:email', async(req,res)=>{
    const email= req.params.email;
    const query ={email}
    const user =await usersCollection.findOne(query)
    res.send({isBuyer:user?.role === 'User'})
})




app.get ('/bookings', async(req, res)=>{
    let query ={}
    console.log(req.query.email)

    if(req.query.email){
        query={
            email:req.query.email
        }
    }
    const cursor = bookingsCollection.find(query)
    const result = await cursor.toArray();
    res.send(result)
})

  //create product
  app.post('/booking',async(req,res)=>{
    const product=req.body;
    console.log(product)
    const result =await bookingsCollection.insertOne(product)
    res.send(result)
})

  app.get('/booking/:id',async(req,res)=>{
    const id =req.params.id
    const query ={_id:ObjectId(id)}
    const order =await bookingsCollection.findOne(query)
    res.send(order)
})

// advertise
app.post('/advertise', verifyJWT,async(req,res)=>{
    const product=req.body;
    console.log(product)
    const result =await advertiseCollection.insertOne(product)
    res.send(result)
})

app.get ('/advertise', async(req, res)=>{
    const query ={}
    const products = await advertiseCollection.find(query).toArray()
    res.send(products)
})

// report
app.post('/report',async(req,res)=>{
    const product=req.body;
    console.log(product)
    const result =await reportCollection.insertOne(product)
    res.send(result)
})

app.get ('/report', async(req, res)=>{
    const query ={}
    const products = await reportCollection.find(query).toArray()
    res.send(products)
})

// change report status
app.put('/products/report/:id', async(req, res)=>{
    const id =req.params.id
    console.log(id)

    const filter ={_id:ObjectId(id)}
    const options ={ upsert:true}
    const updateDoc ={
        $set:{
            status:'reported'
        }
    }

    const result =await productsCollection.updateOne(filter, updateDoc,options)
    res.send(result)
})


//get all reported product
app.get('/reported', async(req,res)=>{

    let query={};
    console.log(req.query.status)

    if(req.query.status){
        query={
            status:req.query.status 
        }
    }
    const cursor = productsCollection.find(query)
    const result = await cursor.toArray();
    res.send(result)
})

//delete reported product
app.delete('/reported/:id', async(req,res)=>{
    const id =req.params.id;
    const query ={_id:ObjectId(id)}
    const result =await productsCollection.deleteOne(query)
    res.send(result)
})


// set verified

app.put('/products/verify/:email', async(req, res)=>{
    const email =req.params.email
    console.log(email)

    const filter ={email}

    const options ={ upsert:true}
    const updateDoc ={

        $set:{
            verify:'verified'
        }
    }

    const result =await productsCollection.updateOne(filter, updateDoc,options)
    res.send(result)
})


//get all verified product
app.get('/verified', async(req,res)=>{

    let query={};
    console.log(req.query.verify)

    if(req.query.verify){
        query={
            verify:req.query.verify 
        }
    }
    const cursor = productsCollection.find(query)
    const result = await cursor.toArray();
    res.send(result)
})

app.delete('/seller/:id', async(req,res)=>{
    const id =req.params.id;
    const query ={_id:ObjectId(id)}
    const result =await usersCollection.deleteOne(query)
    res.send(result)
})

app.delete('/buyer/:id', async(req,res)=>{
    const id =req.params.id;
    const query ={_id:ObjectId(id)}
    const result =await usersCollection.deleteOne(query)
    res.send(result)
})



}

finally{

}
}
run().catch(console.log)

app.get('/', (req, res)=>{
    res.send('Bechedao portal server is running')
})

app.listen(port, ()=> console.log(`BecheDao portal running on ${port}`))