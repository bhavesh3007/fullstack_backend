import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    /*
    to register user
    1. get user details
    2. validation user data
    3. user already exit: username and email
    4. check images (s3)
    5. upload to s3
    6. create user object - create emtry
    7. remove password and token from response
    8. user creation check and return 
    */
   console.log(req.body)
   const { username, email, fullname, password } = req.body
   if(
    [fullname, email, username, password].some((field) => field?.trim() === "")
   ){
    throw new ApiError(400, "All fields are required" )
   }

   const existeduser = await User.findOne({
    $or: [{ username }, { email }]
   })

   if (existeduser){
    throw new ApiError(409, "username or email is already in use")
   }

   const newuser = await User.create({
    fullname,
    email,
    password,
    username
   })

   const createduser = await User.findById(newuser._id).select(
    "-password -refreshToken"
   )

   if(!createduser){
    throw new ApiError(500, "something went wrong at creation")
   }

   return res.status(201).json(
    new ApiResponse(200, createduser, "user created sucessfully")
   )





})

export { registerUser }