const express = require("express");
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


//Only admin can create new users--works!!
router.post('/create-account', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.json({status: 422, message:"Email exists"})
            } else {
                bcrypt.hash(req.body.password, 10, async (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            email: req.body.email,
                            password: hash,
                            role: req.body.role,
                            phone:req.body.phone,
                            name: req.body.name
                        });
                        user.save()
                            .then((result) => {
                                res.json({ status:200,message: 'User created!'});
                            })
                            .catch((error) => {
                                res.status(500).json({ error });
                            });
                    }
                })
            }
        })

})

//Login--works!!
router.post('/login', async (req, res, next) => {
    const loginUser = await User.findOne({ email: req.body.email })
    try {
        bcrypt.compare(req.body.password, loginUser.password, (err, result) => {
            if (err) {
                return res.json({status: 404, message:"Auth Failed"})
            }
            if (result) {
                const token = jwt.sign({
                    email: loginUser.email,
                    userId: loginUser._id
                },
                    "secretkey",
                    {
                        expiresIn: "1h"
                    })
                return res.status(200).json({
                    token: token,
                    role: loginUser.role,
                    id: loginUser._id
                });
            } else {
                return res.json({status: 404, message:"Auth Failed"})
            }
        })
    }
    catch (error) {
         return res.json({status: 404, message:"Auth Failed"})
    }
})


//Returns all users and projects--works!!!
router.get('/all-users', async (req, res, next) => {
    try {
        const users = await User.find().populate("projects").exec((err,result)=>{
            res.json(result)
        });
    } catch (error) {
        res.json(error)
    }
})

//Returns user information for populating form!!!
router.get('/user-current', async (req, res, next) => {
    if(req.body.id){
        try {
            const user = await User.findOne({_id: req.body.id});
            res.json({
                name: user.name,
                email: user.email,
                phone: user.phone
            })
        } catch (error) {
            res.json(error)
        }
    }else{
        res.json({
            status: 204,
            message: "Id not provided" 
        })
    }
})



//Returns one user with all projects--works!!
//Input: userId
router.get('/user', async (req, res, next) => {
    try {
        const id=req.body.id;
        if(id){
            await User.findOne({_id: id}).populate("projects").exec(function(err,project) {
                res.json(project)
              })
        }else{
            res.json({status: 204, message: "Id not provided"})
        }
    } catch (error) {
        res.json({error:error})
    }
})





//Development only//
/////////////////////////////
/////////////////////////////
/////////////////////////////
/////////////////////////////
router.post('/delete-users', async (req,res,next) =>{
    try {
        await User.deleteMany();
        res.json("Users deleted")
    } catch (error) {
        res.json({error:error})
    }
})

module.exports = router;