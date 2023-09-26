import 'dotenv/config'
import express from "express";
import axios from "axios";
import bodyparser from "body-parser";
import mongoose from "mongoose";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import session from "express-session";
//import cors from "cors";
//import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cookie from "js-cookie";
import cors from  "cors";
import  findOrCreate from "mongoose-findorcreate"
 var app=express();
// app.use(cors);
// var corsOptions = {
//   origin: 'https://ashokmernmovie.netlify.app',
//   optionsSuccessStatus: 200 // For legacy browser support
// }
app.use(cors({
  origin: 'https://mernmovieashokft.onrender.com',
  optionsSuccessStatus: 200 ,// For legacy browser support
  credentials: true,
}));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'https://mernmovieashokft.onrender.com');
  res.header('Access-Control-Allow-Credentials', true);
  //res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
 app.use(bodyparser.urlencoded({extended:true}));
 app.use(session({
  secret: 'moviesecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}))
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect(process.env.DATABASE);
var userschema=mongoose.Schema({
  username:String,
  password:String,
  // googleId:String,
  fav:[ {adult: String,
    backdrop_path: String,
    genre_ids: [],
    id: Number,
    original_language: String,
    original_title: String,
    overview: String,
  popularity: Number,
  poster_path: String,
    release_date: String,
      title: String,
        video: String,
          vote_average: Number,
            vote_count: Number
}]
})

userschema.plugin(passportLocalMongoose);
userschema.plugin(findOrCreate);
var userModel=mongoose.model('movie',userschema);

// passport.use(new GoogleStrategy({
//   clientID: clientid,
//   clientSecret: clientsecret,
//   callbackURL: "http://localhost:5000"
// },
// function(accessToken, refreshToken, profile, cb) {
//   User.findOrCreate({ googleId: profile.id }, function (err, user) {
//     return cb(err, user);
//   });
// }

// ));
passport.use(userModel.createStrategy());
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile'] }));

// app.get('/auth/google/', 
//   passport.authenticate('google', { failureRedirect: '/error' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.send("u r logined");
//   });

app.get("/",(req,res)=>{
  //console.log("hello");
res.send("hello");
})
// //======

app.post('/isauthenticated',async (req,res)=>{
  var {u,e}=req.body;
  //console.log(u,e);
  try{
 var d=await userModel.find({_id:u,username:e});
 if(d){
  //console.log("==",d);
  d=JSON.stringify(d);
 // console.log("===",d);
  res.send(d);
 }else{
res.send('unvalid');}
 }
 catch(err){
  res.send(err);
 }
})

//
app.post("/register",async(req,res)=>{
  var {useremail,userpassword:pass}=req.body;
  //console.log(useremail+" "+pass);
  userModel.register({username:useremail, active: false}, pass, function(err, user) {
    if (err) {//console.log(err);
       res.send("NotRegistered"); }
    res.send("Registered");
  });
})

// app.post("/register",async (req,res)=>{
  
// var {useremail,userpassword:pass}=req.body;

// try{
// var v=await userModel.find({email:req.body.useremail});

// if(v.length==0){
//    var newuser={
//     email:useremail,
//     password:pass
//    }
// await userModel.create(newuser);
// res.send("Registered");
// }
// else{
//   res.send("NotRegistered");
// }

// }
// catch(err){
//   res.send("NotRegistered");
// }

// });
//===
app.post('/login', 
  passport.authenticate('local', { failureRedirect: "/error" }),
  async function(req, res) {
   // console.log(req.user);
    var d={
      u:req.user._id,
      e:req.user.username
    }
    d=JSON.stringify(d);
    //res.cookie("ashokcookies",d,{ maxAge: 900000, httpOnly: true });
    // let ola= localStorage.setItem("lastname", "Smith");
    // console.log(ola);
    //console.log(d);
    res.send(d);
  });
// app.post("/login",async (req,res)=>{
//   console.log("login");
// var {username:useremail,password:pass}=req.body;
//  console.log(useremail+" "+pass);
// try{
//   var v=await userModel.find({username:useremail,password:pass});
//   console.log(v);
//  if(v.length==0){console.log("1");res.send("Unable to login");}
//  else{
//   passport.authenticate('local', { failureRedirect: '/error' }),
//    function(req, res) {
//     console.log("2")
//   res.send("u r login");
//  };}

// }
// catch(err){
//   console.log(err);
//   res.send("Unable to login");
// }
// });
// //===
app.get('/error',(req,res)=>{
  // console.log("3")
res.send("Unable to login");
})
//====
app.post('/logout', function(req, res, next) {
  //console.log('logout');
  req.logout(function(err) {
    if (err) { return next(err); }
    res.send("Logout");
  });
});
//====
///==================
//==========



//favset();
/////=============
app.post('/addfav',async(req,res)=>{
 // var t=JSON.parse(req.body);

 
 var {user,movie}=req.body;
 var mfav=await userModel.findById(user.u);
 mfav=[...mfav.fav,movie];;
 
 setTimeout(async() => {
  await userModel.findOneAndUpdate({_id:user.u,username:user.e},{fav:mfav});
  res.send("add done")
 },1000);


});

//=========
app.post('/deletefav',async(req,res)=>{
  // var t=JSON.parse(req.body);
 
  
  var {user,movie}=req.body;
  var mfav=await userModel.findById(user.u);
  mfav=mfav.fav;
  var newfav=mfav.filter((f)=>{
 if(f.id==movie.id)return false;
 else{return true;}
  });

  //console.log(newfav)
  setTimeout(async() => {
   await userModel.findOneAndUpdate({_id:user.u,username:user.e},{fav:newfav});
   res.send("delete done")
  },1000);
 
 
 });
//=======
var portavailable=process.env.PORT||5000;
 app.listen(portavailable,()=>{
  console.log("server started 5000");
 })
 