const mongoose=require("mongoose");

const UserSchema=mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
      }]
})

module.exports=mongoose.model('User',UserSchema);

