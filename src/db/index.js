import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const connetDB = async() => {
    try{
        const connetionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        console.log(`\n DB connected on Host : ${connetionInstance.connection.host }`)
    } catch(error){
        console.log("MONGODB connection error: ", error)

    }
}

export default connetDB;
