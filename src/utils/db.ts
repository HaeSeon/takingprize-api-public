import mongodb from "mongodb"
import assert from "assert"
import { User } from "../model/user"
import { Prize } from "../model/prize"

const url = "mongodb://localhost:27017/wanna-cocktail-db"

class Database {
  private client: mongodb.MongoClient | undefined

  constructor() {
    mongodb.connect(url, { useUnifiedTopology: true }, (err, client) => {
      assert.equal(null, err)
      console.log("Connected correctly to mongodb server")
      this.client = client
    })
  }

  userCollection(): mongodb.Collection<User> {
    if (!this.client) {
      throw `db has not initialized`
    }
    return this.client.db("prizing").collection("users")
  }

  prizeCollection(): mongodb.Collection<Prize> {
    if (!this.client) {
      throw `db has not initialized`
    }
    return this.client.db("prizing").collection("prizes")
  }
}

export const db = new Database()
