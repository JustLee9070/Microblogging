import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        uniquie: true,
    },
    fullName:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
        minLength: 6, 
    },
    email:{
        type: String,
        required: true,
        uniquie: true,
    },
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:[] 
        }
    ],
    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:[] 
        }
    ],
    coverImg:{
        type: String,
        defaul:""
    },
    profileImg:{
        type: String,
        defaul:""
    },
    bio:{
        type: String,
        defaul:""
    },
    link:{
        type: String,
        defaul:""
    },

}, {timestamps: true})

const User = mongoose.model("User", userSchema)
export default User 