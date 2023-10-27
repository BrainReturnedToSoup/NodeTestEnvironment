const { MongoClient } = require("mongodb");

const userCollection = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .connect()
  .then((client) => {
    console.log("Connected to MongoDB");
    return client.db("members_only_users").collection("users");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

module.exports = userCollection;
