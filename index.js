import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB");

    const db = client.db("cashFlow");
    const collection = db.collection("allData");

    // GET all data
    app.get("/api/allData", async (req, res) => {
      try {
        const result = await collection.find().toArray();
        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // POST new data
    app.post("/api/cashflows", async (req, res) => {
      try {
        const newData = {
          ...req.body,
          addDate: new Date().toISOString().split("T")[0], // Auto date
        };

        const result = await collection.insertOne(newData);
        res.status(201).json({ success: true, data: result });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // Root test
    app.get("/", (req, res) => {
      res.send("💰 Income Expense Tracker Backend is running!");
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);
