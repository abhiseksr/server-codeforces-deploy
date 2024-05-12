const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const {authRouter, authenticateToken} = require('./routes/auth');
const {contestRouter} = require("./routes/contest");
const {problemRouter} = require("./routes/problem");
const {submissionRouter} = require("./routes/submission");
const {messageRouter} = require("./routes/message");
const {commentRouter} = require("./routes/comment");
const {userRouter, runInterval, updateLastActive} = require('./routes/user');
const methodOverride = require("method-override");
const cors = require("cors");
const mongoose = require('mongoose');
const AppError = require("./routes/AppError");
const User = require('./models/user');

// https://codeforces.us.to
// https://codehorses.up.railway.app
// http://localhost:3000
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT); // Replace with your React client's domain and port
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // If you need to include cookies in cross-origin requests
  
    next();
  });
// app.use(cors());
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
    runInterval();
    console.log("CONNECTION OPEN");
})  
.catch((err)=>{
    console.log("ERROR! NO DATABASE CONNECTION");
    // console.log(err)
    next(err);
})

// app.use((req,res,next)=>{
//     if (req.method!='GET' && req.path!='/api/login') throw new AppError("The request other than GET are deliberately refused for now, you are only permitted to view the website. Use username=abhishek & password=deathnote for authentication.", 403);
//     next();
// })

app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', contestRouter);
app.use('/api', problemRouter);
app.use('/api', submissionRouter);
app.use('/api', messageRouter);
app.use('/api', commentRouter);
app.use(methodOverride('_method'));


app.use((err, req, res, next)=>{
    // console.log("hello");
    const {status = 500, message="something went wrong"} = err;
    res.status(status).send(message);
})

const PORT = process.env.PORT || 4000;

app.listen(PORT, ()=>{
    console.log(`Listening on Port ${PORT}`);
})