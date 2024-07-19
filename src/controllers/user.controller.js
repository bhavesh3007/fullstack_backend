import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { uploadons3 } from "../utils/fileupload.js";


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

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const avatarfilename = req.files?.avatar[0]?.originalname.split(" ").join("");

   if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
   }

   let coverImageLocalPath;
   let coverImagefilename;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
    coverImagefilename = req.files?.coverImage[0]?.originalname.split(" ").join("")
   }
   



   const avatar = await uploadons3(avatarLocalPath, avatarfilename)
   const coverImage = await uploadons3(coverImageLocalPath, coverImagefilename)

   if(!avatar){
    throw new ApiError(500, "failed while uploading")
   }

   const newuser = await User.create({
    fullname,
    email,
    password,
    avatar: avatar.Location,
    coverImage: coverImage?.Location || "",
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


const generateAccessAndRefreshTokens = async(userId) =>
{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforsave: false})

        return {accessToken, refreshToken}

    } catch (error){
        throw new ApiError(500, "something went wrong while generating access and refresh tokens")
    }

}

const loginuser = asyncHandler( async (req, res) => {
    /*
    1. get user login details 
    2. verify the user gave all req details
    3. verify user exist
    4. verify password
    5. generate tokens and share in cookie
    */

    const {email, username, password} = req.body

    if (!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "user is not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(403, "Invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInuser= await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }


    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInuser, accessToken, refreshToken
            },
            "user logged in Succesfully"
        )
    )

})


const logoutuser = asyncHandler( async (req, res) =>{
    /*
    1. find user id 
    2. remove tokens
     
    */
   await User.findByIdAndUpdate(
    req.user._id,
    {
        $set: {
            refreshToken: undefined,
        }
    },
    {
        new: true
    }
   )

   const options = {
    httpOnly: true,
    secure: true
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json( new ApiResponse(200, {}, "User logged Out"))

})

const refreshAccessToken = asyncHandler( async (req, res) =>{
    const incomingRefreshToken = req.cookies.refreshToken ||  req.body.refreshToken

    if (!incomingRefreshToken){
        throw new ApiError(401, "unauthorised request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken},
                "accessToken is regenerated"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message ||  "Invalid Refresh Token" )

    }

})

const changeCurrentPassword = asyncHandler( async (req, res) =>{
    const {currentPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect= await user.isPasswordCorrect(currentPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid cuurent Password")
    }

    user.password = newPassword
    await user.save({validateBeforsave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed Successfully"))
  

})

const getCurrentUser = asyncHandler( async(req, res) =>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched Successfully"))

})


const updateAccountDetails = asyncHandler( async(req, res) =>{
    const {fullname, email} = req.body


    if (!(fullname || email)){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return  res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated"))

})

export {
    registerUser,
    loginuser,
    logoutuser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails
}