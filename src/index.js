// require('dotenv').config({path: '../.env'})

import dotenv from "dotenv";
import connetDB from "./db/index.js";

dotenv.config({
    path: './env'
})
connetDB()



/*
( async () => {
    try{
        mongooes.connect(`${process.env.MONGODB_URI}/${DB_Name}`)

    } catch (error){
        console.error("ERROR: ",error)
        throw error

    }

})()


*/