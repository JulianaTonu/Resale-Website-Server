const express=require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } =require('mongodb');
// const { ObjectId } = require('mongodb/mongodb');

require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express()

//middleware 
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rpina.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
try{
const categoriesCollection=client.db('resaledb').collection('categories')
const productsCollection=client.db('resaledb').collection('products')
const  usersCollection=client.db('resaledb').collection('users')
const  bookingsCollection=client.db('resaledb').collection('bookings')


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

//create user
app.post('/users',async (req, res)=>{
    const user =req.body;
    const result =await usersCollection.insertOne(user)
    res.send(result)
})


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

  //create product
  app.post('/booking',async(req,res)=>{
    const product=req.body;
    console.log(product)
    const result =await bookingsCollection.insertOne(product)
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