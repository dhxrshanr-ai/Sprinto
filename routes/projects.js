const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cacheData = require('../middleware/cache');
const { clearCachePrefix } = require('../config/redis');

// @route   POST /api/projects
// @desc    Create a new project
router.post('/', auth, async (req, res) => {
    try {
        const { name, description } = req.body;

        const project = await Project.create({
            name,
            description,
            owner: req.user._id,
            members: [req.user._id],
            columns: [
                { name: 'To Do', order: 0 },
                { name: 'In Progress', order: 1 },
                { name: 'Done', order: 2 }
            ]
        });

        const populated = await Project.findById(project._id)
            .populate('owner', 'name email avatar')
            .populate('members', 'name email avatar');

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${req.user._id}`).emit('project:created', populated);
        }

        // Clear cache
        await clearCachePrefix(`projects:${req.user._id}`);

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/projects
// @desc    Get all projects for current user
router.get('/', auth, cacheData('projects', 300), async (req, res) => {
    try {
        const projects = await Project.find({ members: req.user._id })
            .populate('owner', 'name email avatar')
            .populate('members', 'name email avatar')
            .sort({ updatedAt: -1 });

        // Get task counts for each project
        const projectsWithCounts = await Promise.all(
            projects.map(async (project) => {
                const taskCount = await Task.countDocuments({ project: project._id });
                return { ...project.toObject(), taskCount };
            })
        );

        res.json(projectsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
router.get('/:id', auth, cacheData('projects', 300), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email avatar')
            .populate('members', 'name email avatar');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check membership
        if (!project.members.some(m => m._id.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to view this project' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/projects/:id
// @desc    Update project
router.put('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the project owner can update this project' });
        }

        const { name, description, columns } = req.body;
        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (columns) project.columns = columns;

        await project.save();

        const updated = await Project.findById(project._id)
            .populate('owner', 'name email avatar')
            .populate('members', 'name email avatar');

        // Emit socket event to all project members
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${project._id}`).emit('project:updated', updated);
        }

        // Clear cache for all members potentially
        project.members.forEach(async (m) => {
            await clearCachePrefix(`projects:${m.toString()}`);
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project by email
router.post('/:id/members', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the project owner can add members' });
        }

        const { email } = req.body;
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        if (project.members.includes(userToAdd._id)) {
            return res.status(400).json({ message: 'User is already a member of this project' });
        }

        project.members.push(userToAdd._id);
        await project.save();

        // Create notification for added member
        await Notification.create({
            user: userToAdd._id,
            type: 'member_added',
            message: `${req.user.name} added you to project "${project.name}"`,
            link: `/board.html?id=${project._id}`,
            relatedProject: project._id
        });

        const updated = await Project.findById(project._id)
            .populate('owner', 'name email avatar')
            .populate('members', 'name email avatar');

        // Emit socket events
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${project._id}`).emit('project:updated', updated);
            io.to(`user:${userToAdd._id}`).emit('notification:new', {
                message: `You were added to project "${project.name}"`
            });
        }

        project.members.forEach(async (m) => {
            await clearCachePrefix(`projects:${m.toString()}`);
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project (owner only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the project owner can delete this project' });
        }

        // Delete all tasks and comments associated with the project
        const tasks = await Task.find({ project: project._id });
        const taskIds = tasks.map(t => t._id);

        const Comment = require('../models/Comment');
        await Comment.deleteMany({ task: { $in: taskIds } });
        await Task.deleteMany({ project: project._id });
        await Project.findByIdAndDelete(project._id);

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${project._id}`).emit('project:deleted', { projectId: project._id });
        }

        project.members.forEach(async (m) => {
            await clearCachePrefix(`projects:${m.toString()}`);
        });

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
