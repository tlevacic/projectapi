const mongoose=require("mongoose");

const ProjectSchema=mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    typeOfApp: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    tech:{
        type: String,
        required: true
    },
    status:{
        type: String,
        default: "pending"
    }
})

module.exports=mongoose.model('Project',ProjectSchema);
