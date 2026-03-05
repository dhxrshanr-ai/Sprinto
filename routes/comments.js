const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @route   POST /api/comments
// @desc    Add comment to a task
router.post('/', auth, async (req, res) => {
    try {
        const { text, task } = req.body;

        const taskDoc = await Task.findById(task).populate('project', 'name members');
        if (!taskDoc) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comment = await Comment.create({
            text,
            task,
            author: req.user._id
        });

        const populated = await Comment.findById(comment._id)
            .populate('author', 'name email avatar');

        // Notify task assignee and creator about new comment (if different from commenter)
        const notifyUsers = new Set();
        if (taskDoc.assignee && taskDoc.assignee.toString() !== req.user._id.toString()) {
            notifyUsers.add(taskDoc.assignee.toString());
        }
        if (taskDoc.createdBy && taskDoc.createdBy.toString() !== req.user._id.toString()) {
            notifyUsers.add(taskDoc.createdBy.toString());
        }

        for (const userId of notifyUsers) {
            await Notification.create({
                user: userId,
                type: 'comment_added',
                message: `${req.user.name} commented on task "${taskDoc.title}"`,
                link: `/board.html?id=${taskDoc.project._id}`,
                relatedProject: taskDoc.project._id,
                relatedTask: task
            });

            const io = req.app.get('io');
            if (io) {
                io.to(`user:${userId}`).emit('notification:new', {
                    message: `${req.user.name} commented on "${taskDoc.title}"`
                });
            }
        }

        // Emit to project room
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${taskDoc.project._id}`).emit('comment:added', {
                ...populated.toObject(),
                taskId: task
            });
        }

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/comments?task=:taskId
// @desc    Get comments for a task
router.get('/', auth, async (req, res) => {
    try {
        const { task } = req.query;
        if (!task) {
            return res.status(400).json({ message: 'Task ID is required' });
        }

        const comments = await Comment.find({ task })
            .populate('author', 'name email avatar')
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/comments/:id
// @desc    Delete own comment
router.delete('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own comments' });
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
