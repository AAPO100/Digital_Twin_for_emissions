const { MongoClient } = require('mongodb')
const uri = "..."
console.log(uri,"uri")

const client = new MongoClient(uri)
const dbname = "position-data-history"
const collectionName = "positions"

const connectToDatabase = async () => {
    try {
        console.log('Connecting to the database...')
        await client.connect();
        console.log(`Connected to the ${dbname} database`);
        const db = client.db(dbname)
        const collection = db.collection(collectionName)
        const documents = await collection.find({}).toArray()
        console.log(`Retrieved ${documents.length} documents:`)
        console.log(documents)
    } catch (error) {
        console.error(`Error connecting to the database: ${error}`);
    }
}

const main = async () => {
    await connectToDatabase();
}

main();
