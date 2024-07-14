import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema(
    {
        usernmae: {
            type: String,
            required: true, 
            unique: true,
            index: true,
            trim: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true, 
            unique: true,
            trim: true,
            lowercase: true
        },
        fullname: {
            type: String,
            required: true, 
            trim: true,
            lowercase: true
        },
        avatar: {
            type: String // s3 bucket link
        },
        coverImage: {
            type: String // s3 link
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String

        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)