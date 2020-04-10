const express = require("express");
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var nodemailer = require('nodemailer');

//Only admin can create new users--works!!
router.post('/create-account', (req, res, next) => {
    User.find({ email: req.body.data.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(422).json({ status: 422, message: "Email exists" })
            } else {
                let password = Math.random().toString(36).substring(8);

                bcrypt.hash(password, 10, async (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            email: req.body.data.email,
                            password: hash,
                            role: req.body.data.role,
                            phone: req.body.data.phone,
                            name: req.body.data.name
                        });
                        user.save()
                            .then((result) => {
                                let transporter = nodemailer.createTransport({
                                    host: 'smtp.gmail.com',
                                    port: 587,
                                    secure: false,
                                    requireTLS: true,
                                    auth: {
                                        user: 'projectschoolmanagement@gmail.com',
                                        pass: 'qwe123QWE123'
                                    }
                                });
                                
                                let mailOptions = {
                                    from: 'projectschoolmanagement@gmail.com',
                                    to: `${user.email}`,
                                    subject: 'Credentials',
                                    text: `Hello, ${user.name},
                                    You have been added to Project Management System,
                                    please first time when you log in change your password on account page.
                                    Password: ${password}
                                    Feel free to contact us for any questions.`
                                };
                                
                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        return console.log(error.message);
                                    }
                                    console.log('success');
                                    return res.status(200).json({message: "User Created"})
                                });
                               
                            })
                            .catch((error) => {
                                res.status(500).json({ error });
                            });
                    }
                })
            }
        })

})
router.post('/reset-password', async (req, res, next) => {
    const loginUser = await User.findOne({ _id: req.body.data.id })
    try {
        bcrypt.hash(req.body.data.password, 10, async (err, hash) => {
            if (err) {
                return res.status(500).json({
                    error: err
                });
            } else {
                User.findOneAndUpdate({ _id: req.body.data.id },
                    {
                        $set:
                        {
                            password: hash
                        }
                    },
                    { new: true },
                    (err, doc) => {
                        if (err) {
                            res.json({ status: 404, message: "Reset failed" })
                        }

                        res.status(200).json({ message: "Pasword reseted" })
                    });
            }
        })
    }
    catch (error) {
        return res.status(404).json({ status: 404, message: "Failed" })
    }
})
//Login--works!!
router.post('/login', async (req, res, next) => {
    const loginUser = await User.findOne({ email: req.body.email })
    try {
        bcrypt.compare(req.body.password, loginUser.password, (err, result) => {
            if (err) {
                return res.json({ status: 404, message: "Auth Failed" })
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
                return res.status(404).json({ status: 404, message: "Auth Failed" })
            }
        })
    }
    catch (error) {
        return res.status(404).json({ status: 404, message: "Auth Failed" })
    }
})


//Returns all users and projects--works!!!
router.get('/all-users', async (req, res, next) => {
    try {
        const users = await User.find().populate("projects").exec((err, result) => {
            res.json(result)
        });
    } catch (error) {
        res.json(error)
    }
})

//Returns user information for populating form!!!
router.get('/user-current', async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.query.id });
        res.json({
            name: user.name,
            email: user.email,
            phone: user.phone
        })
    } catch (error) {
        res.json(error)
    }

})


//Update user info
router.post('/user-update', async (req, res, next) => {
    try {
        User.findOneAndUpdate({ _id: req.body.data.id },
            {
                $set:
                {
                    name: req.body.data.name,
                    phone: req.body.data.phone,
                }
            },
            { new: true },
            (err, doc) => {
                if (err) {
                    res.json({ status: 404, message: "Update not completed" })
                }

                res.send({
                    name: doc.name,
                    email: doc.email,
                    phone: doc.phone
                })
            });
    } catch (error) {
        res.json(error)
    }

})


//Returns one user with all projects--works!!
//Input: userId
router.get('/user', async (req, res, next) => {
    try {
        const id = req.body.id;
        if (id) {
            await User.findOne({ _id: id }).populate("projects").exec(function (err, project) {
                res.json(project)
            })
        } else {
            res.json({ status: 204, message: "Id not provided" })
        }
    } catch (error) {
        res.json({ error: error })
    }
})







//Development only//
/////////////////////////////
/////////////////////////////
/////////////////////////////
/////////////////////////////
router.post('/delete-users', async (req, res, next) => {
    try {
        await User.deleteMany();
        res.json("Users deleted")
    } catch (error) {
        res.json({ error: error })
    }
})

module.exports = router;