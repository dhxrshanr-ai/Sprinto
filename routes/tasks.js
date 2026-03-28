const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const cacheData = require('../middleware/cache');
const { clearCachePrefix } = require('../config/redis');

// @route   POST /api/tasks
// @desc    Create a new task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, project, column, assignee, priority, dueDate, labels } = req.body;

        // Verify project exists and user is a member
        const proj = await Project.findById(project);
        if (!proj) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (!proj.members.some(m => m.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not a member of this project' });
        }

        // Get order (append to end of column)
        const maxOrder = await Task.findOne({ project, column: column || 'To Do' })
            .sort({ order: -1 })
            .select('order');

        const task = await Task.create({
            title,
            description,
            project,
            column: column || 'To Do',
            assignee,
            priority: priority || 'medium',
            dueDate,
            labels: labels || [],
            order: maxOrder ? maxOrder.order + 1 : 0,
            createdBy: req.user._id
        });

        const populated = await Task.findById(task._id)
            .populate('assignee', 'name email avatar')
            .populate('createdBy', 'name email avatar');

        // Notify assignee if assigned
        if (assignee && assignee.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: assignee,
                type: 'task_assigned',
                message: `${req.user.name} assigned you to task "${title}" in "${proj.name}"`,
                link: `/board.html?id=${project}`,
                relatedProject: project,
                relatedTask: task._id
            });

            const io = req.app.get('io');
            if (io) {
                io.to(`user:${assignee}`).emit('notification:new', {
                    message: `You were assigned to task "${title}"`
                });
            }
        }

        // Emit socket event to project room
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${project}`).emit('task:created', populated);
        }

        await clearCachePrefix(`tasks:*`);

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/tasks/me
// @desc    Get all tasks assigned to the current user
router.get('/me', auth, async (req, res) => {
    try {
        const { status = 'active' } = req.query;
        const tasks = await Task.find({ assignee: req.user._id, status })
            .populate('assignee', 'name email avatar')
            .populate('createdBy', 'name email avatar')
            .populate('project', 'name')
            .sort({ dueDate: 1, priority: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/tasks?project=:projectId
// @desc    Get tasks for a project
router.get('/', auth, cacheData('tasks', 300), async (req, res) => {
    try {
        const { project, status = 'active' } = req.query;
        if (!project) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const tasks = await Task.find({ project, status })
            .populate('assignee', 'name email avatar')
            .populate('createdBy', 'name email avatar')
            .sort({ order: 1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/tasks/:id
// @desc    Get a single task
router.get('/:id', auth, cacheData('tasks', 300), async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignee', 'name email avatar')
            .populate('createdBy', 'name email avatar')
            .populate('project', 'name members');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
router.put('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const { title, description, column, assignee, priority, dueDate, labels } = req.body;

        const oldAssignee = task.assignee ? task.assignee.toString() : null;

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (column !== undefined) task.column = column;
        if (assignee !== undefined) task.assignee = assignee;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (labels !== undefined) task.labels = labels;

        await task.save();

        const populated = await Task.findById(task._id)
            .populate('assignee', 'name email avatar')
            .populate('createdBy', 'name email avatar');

        // Notify new assignee
        if (assignee && assignee !== oldAssignee && assignee !== req.user._id.toString()) {
            const proj = await Project.findById(task.project);
            await Notification.create({
                user: assignee,
                type: 'task_assigned',
                message: `${req.user.name} assigned you to task "${task.title}" in "${proj.name}"`,
                link: `/board.html?id=${task.project}`,
                relatedProject: task.project,
                relatedTask: task._id
            });

            const io = req.app.get('io');
            if (io) {
                io.to(`user:${assignee}`).emit('notification:new', {
                    message: `You were assigned to task "${task.title}"`
                });
            }
        }

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${task.project}`).emit('task:updated', populated);
        }

        await clearCachePrefix(`tasks:*`);

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/tasks/:id/move
// @desc    Move task between columns
router.put('/:id/move', auth, async (req, res) => {
    try {
        const { column, order } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.column = column;
        if (order !== undefined) task.order = order;
        await task.save();

        const populated = await Task.findById(task._id)
            .populate('assignee', 'name email avatar')
            .populate('createdBy', 'name email avatar');

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${task.project}`).emit('task:moved', populated);
        }

        await clearCachePrefix(`tasks:*`);

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.assignee?.toString() !== req.user._id.toString() && task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        task.status = 'deleted';
        await task.save();

        const io = req.app.get('io');
        if (io) {
            io.to(`project:${task.project}`).emit('task:deleted', { taskId: task._id, project: task.project });
        }

        await clearCachePrefix(`tasks:*`);

        res.json({ message: 'Task moved to trash', task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/tasks/:id/restore
// @desc    Restore a task from trash
router.post('/:id/restore', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.status = 'active';
        await task.save();

        const io = req.app.get('io');
        if (io) {
            io.to(`project:${task.project}`).emit('task:created', task);
        }

        await clearCachePrefix(`tasks:*`);

        res.json({ message: 'Task restored', task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/tasks/:id/permanent
// @desc    Delete a task PERMANENTLY
router.delete('/:id/permanent', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const Comment = require('../models/Comment');
        await Comment.deleteMany({ task: task._id });
        await Task.findByIdAndDelete(task._id);

        await clearCachePrefix(`tasks:*`);

        res.json({ message: 'Task permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
