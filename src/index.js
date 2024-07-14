// require('dotenv').config({path: '../.env'})

import dotenv from "dotenv";
import connetDB from "./db/index.js";

dotenv.config({
    path: './env'
})
connetDB()
.then(() =>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(` server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) =>{
    console.log("Mongo DB connrction failed !!!", err)
})


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