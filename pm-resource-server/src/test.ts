import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost/pm', { useNewUrlParser: true, useUnifiedTopology: true })

const test = async () => {
  await client.connect()
  console.log('123')
}

test().catch(console.log)
