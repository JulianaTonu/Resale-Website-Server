const express=require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

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



app.get ('/categories', async(req, res)=>{
    const query ={}
    const categories = await categoriesCollection.find(query).toArray()
    res.send(categories)
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