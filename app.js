// here lies information for the computer/server noticed all dependencies except mongoose called here seems like a coincidence there should be other function specific dependencies like mongoose

const express = require ("express")
const morgan = require("morgan");
const cors = require("cors");
require ("dotenv").config();
const connectDb = require("./src/config/db");
const app = express();
const userRoutes = require("./src/routes/routes.js")

const port = process.env.PORT|| 4000;
//middle ware declare tells computer/server to use middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3900",
    credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

//routes tels computer how to use routes

app.get("/", (req,res) =>{
    res.send("Home Page!");
})
app.use("/api", userRoutes);



// funny improvement on my side this connects to db before running on port might be an inefficent format but i don't wanna use if or something like that here
connectDb().then(()=>{
    console.log("server is running for real");
})
.catch(() => {
    console.log("error connecting to mongoDB");
});
