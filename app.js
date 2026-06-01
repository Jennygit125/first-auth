// here lies information for the computer/server noticed all dependencies except mongoose called here seems like a coincidence there should be other function specific dependencies like mongoose

const express = require ("express");
const cors = require ("cors");//planning to link this to an existing frontend
const morgan = require("morgan");
require ("dotenv").config();
const connectDb = require("./src/config/db");
const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // This is required if you are sending cookies or authorization headers
}));
const userRoutes = require("./src/routes/routes.js")

const port = process.env.PORT|| 4000;
//middle ware declare tells computer/server to use middleware
app.use(express.json());
app.use(morgan("dev"));

//routes tels computer how to use routes
app.use("/api", userRoutes);
app.get("/", (req,res) =>{
    res.send("Home Page!");
})



// funny improvement on my side this connects to db before running on port might be an inefficent format but i don't wanna use if or something like that here
connectDb();
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}
// i like how fast vercel can be but this thing causes issues sometimes
// Export the app for Vercel's serverless environment
module.exports = app;
