const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require('multer');
const fs = require('fs')

//image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    }
});

var upload = multer({
    storage: storage
}).single("image")


router.get("/", async (req, res) => {
    try{
        const userRes = await User.find();
        res.render("index", {title: "Home Page", users: userRes});

    }catch (e) {
        res.send(e)
    }

});

router.get("/addUser", (req, res) => {
    res.render("addUser", {title: "Add User"})
});

router.post(
    "/addUser",
     upload,
     async (req, res)=>{
        const {
            body: {
                name,
                email,
                phone,
                image
            }
        } = req;
        
        const user = new User({
            name: name,
            email: email,
            phone: phone,
            image: req.file.filename
        });

        const userResponse = await user.save();
        if(userResponse){
            req.session.message ={
                type: "success",
                message: "user added successfully"
            }
            // res.json({type: "success", message: "user added successfully"})
            res.redirect('/');
        }else{
            res.json({type: "danger", message: "something wend wrong"})
        } 
     }
);

router.get("/editUser/:id", async (req, res) => {
    let id = req.params.id;
    try{
        let user = await User.findById(id);
        if(user){
            res.render('editUser', { title: 'Edit user', user: user})
        }else{
            res.redirect('/')
        }

    }catch (e){
        res.redirect('/')
        console.log(e)
    }
});

router.post("/update/:id", upload, async (req, res) => {
    let id = req.params.id; 
    let newImage = '';
    if(req.file){
        newImage = req.file.filename;
        try{
            fs.unlinkSync("./uploads/" + req.body.old_image)
        }catch(e){
            console.log(e)
        }
    }else{
        newImage = req.body.old_image;
    }

    const response = await User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: newImage
    });

    if(response){
        req.session.message ={
            type: "success",
            message: "user edit successfully"
        }
        // res.json({type: "success", message: "user added successfully"})
        res.redirect('/');
    }else{
        res.json({type: "danger", message: "something wend wrong"})
    } 

});

router.get("/deleteUser/:id", async (req,res) => {
    let id = req.params.id; 
    const response = await User.findByIdAndRemove(id);
    if(response){
        try{
            fs.unlinkSync("./uploads/" + response.image);
            req.session.message ={
                type: "success",
                message: "user deleted successfully"
            }
            res.redirect("/");
        }catch(e){
            res.json(e)
            console.log(e)
        }
    }

   
})


router.get("/users", (req, res) => {
    res.send("All users")
});

module.exports = router;