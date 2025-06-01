const Project = require('../models/projectModel');
// TODO: Add proper error handling and input validation

exports.createProject = async (req, res) => {
    try {
        // const newProject = await Project.create(req.body);
        // res.status(201).json(newProject);
        res.status(201).json({ message: 'Project.create called', data: req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        // const projects = await Project.findAll(req.query); // req.query for filters like ?active=true
        // res.status(200).json(projects);
         res.status(200).json({ message: 'Project.findAll called', query: req.query });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        // const project = await Project.findById(req.params.projectId);
        // if (!project) return res.status(404).json({ message: 'Project not found' });
        // res.status(200).json(project);
        res.status(200).json({ message: 'Project.findById called', id: req.params.projectId });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project', error: error.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        // const updatedProject = await Project.update(req.params.projectId, req.body);
        // if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
        // res.status(200).json(updatedProject);
        res.status(200).json({ message: 'Project.update called', id: req.params.projectId, data: req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error updating project', error: error.message });
    }
};