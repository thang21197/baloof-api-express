const mongoose = require('mongoose');

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        min:6,
        max: 255,
    },
    email:{
        type:String,
        required:true,
        min:6,
        max: 255,
    }
    ,
    password:{
        type:String,
        required:true,
        min:6,
        max: 1024,
    },
    displayname:{
        type:String,
        min:6,
        max: 1024,
        default: ''
    },
    role:{
        type:String,
        required:true,
        default:'member'
    },
    phone_number:{
        type:String,
        default:''
    },
    thumbnail_url:{
        type:String,
        default:''
    },
    date:{
        type:Date,
        default:Date.now
    }
})

userSchema.pre('save', function(next) {
    if(this.displayname === ''){
        this.displayname = this.get('username');
    }
    next();
});

module.exports = mongoose.model('User',userSchema);