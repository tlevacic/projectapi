const express = require("express");
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const mongoose = require("mongoose")


//Create project for specific user--works
//Input: userId, project: title, desc, tech, typeOfApp
router.post('/create-project', async (req, res) => {
    try {
        const projectId = null;
        const id = req.body.id;
        if (id) {
            const project = new Project({
                title: req.body.title,
                description: req.body.description,
                tech: req.body.tech,
                typeOfApp: req.body.typeOfApp
            });

            const newProject = await project.save();
            try {
                res.json(newProject)
                User.findByIdAndUpdate(id,
                    { "$push": { "projects": newProject._id } },
                    { "new": true, "upsert": true },
                    function (err, newData) {
                        if (err) throw err;
                    }
                );
            } catch (error) {
                res.json({ error: error })
            }
        } else {
            res.json({ status: 204, message: "Id of user not provided" })
        }
    } catch (error) {
        res.json({ error: error })
    }
})

//Returns specific project

router.get('/project', async (req, res, next) => {
    try {
        const id = req.query.id;
        
            const project = await Project.findOne({ _id: id });
            try {
                res.json(project)
            } catch (error) {
                res.json({ error: error })
            }
        }
    catch (error) {
        res.json({ error: error })
    }
})

router.post('/update-project', async (req, res, next) => {
    try {
        const id = req.body.data.id;
        if (id) {
            const oldProject = await Project.findById(id);


            const title = req.body.data.title ? req.body.data.title : oldProject.title;
            const typeOfApp = req.body.data.typeOfApp ? req.body.data.typeOfApp : oldProject.typeOfApp;
            const description = req.body.data.description ? req.body.data.description : oldProject.description;
            const tech = req.body.data.tech ? req.body.data.tech : oldProject.tech;
            const status = req.body.data.status ? req.body.data.status : oldProject.status;

            Project.findOneAndUpdate({ _id: id },
                {
                    $set:
                    {
                        title: title,
                        typeOfApp: typeOfApp,
                        description: description,
                        tech: tech,
                        status: status
                    }
                },
                { new: true },
                (err, doc) => {
                    if (err) {
                        res.json({ status: 404, message: "Update not completed" })
                    }

                    res.send(doc)
                });
        } else {
            res.json({ status: 404, message: "Id not provided" })
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


router.post('/delete-projects', async (req, res, next) => {
    try {
        await Project.deleteMany();
        res.json("Projects deleted")
    } catch (error) {
        res.json({ error: error })
    }
})


module.exports = router;