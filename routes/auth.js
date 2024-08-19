const express = require('express');
const router = express.Router();
const geoip = require('geoip-lite');
require('dotenv').config();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const AppError = require("./AppError");
router.use(express.urlencoded({extended: true}));
router.use(express.json());
router.use(cookieParser());

function getISTTime() {
    let currentTime = Date.now();

    let date = new Date(currentTime);

    let istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
    let istTime = new Date(currentTime + istOffset);

    let istHours = istTime.getUTCHours();
    let istMinutes = istTime.getUTCMinutes();
    let istSeconds = istTime.getUTCSeconds();
    let istDate = istTime.getUTCDate();
    let istMonth = istTime.getUTCMonth() + 1; 
    let istYear = istTime.getUTCFullYear();

    let formattedISTTime = `${istYear}-${String(istMonth).padStart(2, '0')}-${String(istDate).padStart(2, '0')} ${String(istHours).padStart(2, '0')}:${String(istMinutes).padStart(2, '0')}:${String(istSeconds).padStart(2, '0')}`;

    return formattedISTTime;
}





function authenticateToken(req, res, next) {
    // console.log(req.cookies);
    // res.send('hi');
    // next();
    const {accessToken: token} = req.cookies;
    // console.log(token);
    if (token == null) {
        return next(new AppError("Give your identity please", 401))
    }
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    //   console.log(err)
      if (err) return next(new AppError("Session timed out", 401));
      req.user = user
      if (process.env.READ_ONLY_MODE==1){
        if (req.url.includes('/api/login')){}
        else if (req.method!='GET') {
            return next(new AppError("System is in read only mode.", 503))
        }
      }
      next()
    })
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '55m' })
}

async function getHashedPassword(password){
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

router.post('/register',async (req,res, next)=>{
    try{
        // console.log(req.body);
        if (process.env.READ_ONLY_MODE==1) return next(new AppError("System is in read only mode.", 503))
        const {username, password, email, accountType = 'contestant'} = req.body;
        let user = await User.findOne({username});
        // console.log(user)
        if (user) return next(new AppError(`User with username ${username} is already registered. Please use other username.`, 400))
        if (accountType=="organiser"){
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                  user: process.env.ADMIN_GMAIL,
                  pass: process.env.GMAIL_APP_PASSWORD 
                }
            });
            const accessToken = jwt.sign({username, email, accountType, password}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '59m' });
            const info = await transporter.sendMail({
                from: process.env.ADMIN_GMAIL,
                to: process.env.ADMIN_GMAIL,
                subject: 'Company/organiser registration requires approval',
                html: `<p>Click the link below for approving the request:</p><a href="${process.env.CLIENT}/approveOrganiserRegistration/${accessToken}">Click to approve organiser registration.</a></p>`
            });
            // console.log('Email sent:', info.response);
            return res.send('successfully send mail');
        }
        user = new User({username, password: await getHashedPassword(password), email, accountType, profile: {username: username}});
        await user.save();
        const accessToken = generateAccessToken({username, email, accountType});
        // res.cookie('accessToken', accessToken, cookieOptions);;
        res.json({accessToken});
    }
    catch(err){
        // console.log("duplicate");
        next(err);
        // res.send("duplicate person");
    }
})

router.post('/login', async (req, res, next)=>{
    try{
        // console.log(req.body);
        const {username, password}  = req.body;
        const user = await User.findOne({username: username});
        if (!user) throw new AppError('user not found', 404);
        // console.log(user);
        // res.send('hi');
        const verified = await bcrypt.compare(password, user.password);
        if (verified){
            const accessToken = generateAccessToken({username, email: user.email, accountType: user.accountType});
            user.lastActive = Date.now();
            user.loginTrack.push(getISTTime());
            await user.save();
            // res.cookie('accessToken', accessToken, cookieOptions);
            return res.json({accessToken});
        }
        else{
            throw new AppError("username or password wrong", 401);
            // res.json({'verified': false});
        }
    }
    catch(err){
        return next(err);
    }

})

router.get('/logout', async (req, res, next)=>{
    try{
        // res.clearCookie('accessToken');
        req.user = undefined;
        res.send('logged out successfully');
    }
    catch(err){
        return next(err);
    }
})

router.post('/passwordRecovery', async(req, res, next)=>{
    try{
        // console.log(req.body);
        if (process.env.READ_ONLY_MODE==1) return next(new AppError("System is in read only mode.", 503))
        const {username,email} = req.body;
        const user = await User.findOne({email,username});
        if (!user) return next(new AppError("Wrong credentials", 401));
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: process.env.ADMIN_GMAIL,
              pass: process.env.GMAIL_APP_PASSWORD 
            }
        });
        const accessToken = jwt.sign({username: user.username, email: user.email, accountType: user.accountType}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
        const info = await transporter.sendMail({
            from: process.env.ADMIN_GMAIL,
            to: email,
            subject: 'Password Recovery',
            html: `<p>Click the link below for password recovery:</p><a href="${process.env.CLIENT}/updatePassword/${user._id}/${accessToken}">Click to recover your codeforces account</a></p>`
        });
        // console.log('Email sent:', info.response);
        res.send('successfully send mail');
    }
    catch(err){
        return next(err);
    }
})

router.post('/approveOrganiserRegistration/:accessToken', async(req,res,next)=>{
    try{
        if (process.env.READ_ONLY_MODE==1) return next(new AppError("System is in read only mode.", 503))
        const { accessToken: token} = req.params;
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            // console.log(err)
            if (err) return res.sendStatus(403)
            // console.log(user);
            req.user = user
        })
        const {username, password, email, accountType} = req.user;
        const user = new User({username, password: await getHashedPassword(password), email, accountType, companyProfile: {username: username}});
        await user.save();
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: process.env.ADMIN_GMAIL,
              pass: process.env.GMAIL_APP_PASSWORD 
            }
        });
        const info = await transporter.sendMail({
            from: process.env.ADMIN_GMAIL,
            to: user.email,
            subject: 'Succeful registration to codehorses.up.railway.app',
            html: `<p>You have registered as an Organiser. Please login:</p><a href="${process.env.CLIENT}/login">Codehorses</a></p>`
        });
        res.send(`Registration approval granted to ${user.username} and same is mailed to ${user.email}`);
    }
    catch(err){
        return next(err);
    }
})

router.patch('/updatePassword/:userId/:accessToken', async(req,res,next)=>{
    try{
        if (process.env.READ_ONLY_MODE==1) return next(new AppError("System is in read only mode.", 503))
        const {userId, accessToken: token} = req.params;
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            // console.log(err)
            if (err) return res.sendStatus(403)
            // console.log(user);
            req.user = user
        })
        const user = await User.findById(userId);
        const {password} = req.body;
        user.password = await getHashedPassword(password);
        await user.save();
        // const accessToken = generateAccessToken({username: user.username, email: user.email, accountType: user.accountType});
        // res.cookie('accessToken', accessToken);
        res.send("updated password");
    }
    catch(err){
        return next(err);
    }
})

router.get('/updatePassword/:userId/:accessToken', async(req,res,next)=>{
    try{
        if (process.env.READ_ONLY_MODE==1) return next(new AppError("System is in read only mode.", 503))
        const {userId, accessToken: token} = req.params;
        res.json({userId, accessToken});
    }
    catch(err){
        return next(err);
    }
})



module.exports = {authRouter: router, authenticateToken};