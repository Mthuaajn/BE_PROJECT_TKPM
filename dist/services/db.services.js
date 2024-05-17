"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c6hqecl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
class DatabaseService {
    client;
    db;
    constructor() {
        this.client = new mongodb_1.MongoClient(uri);
        this.db = this.client.db(`${process.env.DB_NAME}`);
    }
    async run() {
        try {
            // Connect the client to the server	(optional starting in v4.7)
            await this.client.connect();
            // Send a ping to confirm a successful connection
            await this.db.command({ ping: 1 });
            // Insert data into the users collection
            console.log('Pinged your deployment. You successfully connected to MongoDB!');
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    }
    get users() {
        return this.db.collection(process.env.DB_USER_COLLECTION);
    }
}
const databaseService = new DatabaseService();
exports.default = databaseService;
