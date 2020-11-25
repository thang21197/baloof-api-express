var express = require('express');
var router = express.Router();
const User = require ('../model/Users');
const {registerValidation,loginValidation, updateValidation} = require('../validation');
const bcrypt = require('bcryptjs');
const  jwt = require('jsonwebtoken');
const AuthMiddleWare= require('../middleware/AuthMiddleware');
const level= require('./middleware/verifyLevel');
const jwtHelper = require('../helpers/jwt.helper');
/* GET home page. */

let tokenList = {};


const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "1h";
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-token-secret-example-trungquandev.com-green-cat-a@";
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "3650d";
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refresh-token-secret-example-trungquandev.com-green-cat-a@";

router.get('/', function(req, res) {
    //    const user = new User({
    //        name: req.body.name,
    //        email: req.body.email,
    //    })
      res.send('Register');
  });

// Register
router.post('/register', async (req, res) =>{
    // Lest validate the data before we a user
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Checking if the username is already in the data base
    const emailExist = await User.findOne({email: req.body.email});
    const usernameExist = await User.findOne({username: req.body.username});
    if(emailExist || usernameExist) return res.status(400).send('Email or Username already exists');    


    // Has passwords
    const salt = await bcrypt.genSalt(10);
    const hashPawword = await bcrypt.hash(req.body.password, salt);

   const user = new User({
       username: req.body.username,
       email: req.body.email,
       role:req.body.role,
       password:hashPawword,
       displayname:req.body.displayname,
       phone_number:req.body.phone_number,
   })

   try {
       const savedUser = await user.save();
       res.send(savedUser);
   } catch (error) {
       res.status(400).send(error)
   }
});
// Login
router.post('/login', async (req,res) => {   
    // Lest validate the data before we a user
    // res.send('asdasd');

    const {error}  = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Checking if the user exist
    const user  = await User.findOne({$or:[{username: req.body.username},{email: req.body.username}]});
    if(!user) return res.status(400).send('User is not found');

    // Password is correct
    const validPass = await bcrypt.compare(req.body.password , user.password);
    if(!validPass) return res.status(400).send('Invalid password');

    // Create and assign a token
    const userData = {
        _id:user._id,
        displayname:user.displayname,
        email:user.email,
        role:user.role,
        phone_number:user.phone_number,
    };
    const accessToken = await jwtHelper.generateToken(userData,accessTokenSecret,accessTokenLife);
    const refreshToken = await jwtHelper.generateToken(userData,refreshTokenSecret,refreshTokenLife);
    // STORE REFRESH TOKEN TO DB
    tokenList[refreshToken] = {accessToken,refreshToken}
    res.status(200).json({accessToken,refreshToken});
} )

// Refresh Token
router.post('/refresh', async (req,res)=>{
    const refreshTokenFromClient = req.body.refreshToken || req.headers['refreshtoken'];
    // Check isset refreshToken
    // res.send(req.headers);
    if(refreshTokenFromClient ){
        try{
            // Verify refresh token
            const decoded = await jwtHelper.verifyToken(refreshTokenFromClient,refreshTokenSecret);
            const userData = decoded.data;
            
            const accessToken = await jwtHelper.generateToken(userData,accessTokenSecret,accessTokenLife);
            return res.status(200).json({accessToken});
        }catch(error){
            return res.status(403).send({
                message: 'No token provided.',
            });
        }
    }
    return res.status(403).send({
        message: 'No token provided.',
    });
})


// Get current user
router.get('/profile', AuthMiddleWare.isAuth, async (req,res) => {
    const _idUser=req.body.jwtDecoded.data._id
    const currentUser= await User.findOne({_id: _idUser});
    res.send(currentUser);
})

// Update user
router.put('/profile/update', AuthMiddleWare.isAuth, async (req,res) => {
    // validation
    // res.send(req.body);
    const {error} = updateValidation(req.body);
    const currentUser= req.body.jwtDecoded.data;
    // res.send(currentUser._id);
    if (error) return res.status(400).send(error.details[0].message);
    // res.send(req.body.profile);
    // Has password
    const salt = await bcrypt.genSalt(10);
    const oldData = await User.findOne({_id:currentUser._id}).select('password username thumbnail_url phone_number');
    const newPhonenumber= (req.body.phone_number ) ? req.body.phone_number: oldData.phone_number;
    const newDisplayName= (req.body.displayname) ? req.body.displayname: oldData.username;
    const hashPassword = (req.body.password) ? await bcrypt.hash(req.body.password, salt):oldData.password;
    const urlThumbnail = (req.body.thumbnail_url) ? req.body.thumbnail_url : oldData.thumbnail_url;
    
    const userUpdate = await User.findOneAndUpdate({_id:currentUser._id},{
        displayname : newDisplayName,
        phone_number: newPhonenumber,
        password    : hashPassword,
    })
    res.send(req.body);
    // res.send('Updating account successful');
})
// GET ALL USER
router.get('/listusers', AuthMiddleWare.isAdmin, async (req,res) => {
    // const currentUser= await User.findOne({_id: req.body.profile._id});
    const allUser= await User.find();
    res.send(allUser);
})

module.exports = router;

