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

}


finally{

}
}
run().catch(console.log)

app.get('/', (req, res)=>{
    res.send('Bechedao portal server is running')
})

app.listen(port, ()=> console.log(`BecheDao portal running on ${port}`))