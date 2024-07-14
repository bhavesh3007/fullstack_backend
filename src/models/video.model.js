import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // s3 link
            required: true
        },
        thumbnail: {
            type: String, // s3 link
            required: true
        },
        title: {
            type: String, 
            required: true
        },
        desciption: {
            type: String
        },
        duration: {
            type: Number, // s3 file details 
            required: true
        }, 
        views:{
            type: Number, 
            default: 0
        },
        isPublished: {
            tupe: Boolean,
            default: true
        }, 
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }


    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema)

