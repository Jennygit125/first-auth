const mongoose = require('mongoose') /*either built by or for MongoDB quite useless otherwise wonder if it works for other databases too*/
const connectDb = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('db connected successfully')
    }
    catch(error)
    {
        console.error("error connecting to MongoDB:", error);
        process.exit(1);
    }
}
module.exports = connectDb;