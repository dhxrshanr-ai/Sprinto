const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a task title'],
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        default: '',
        maxlength: 2000
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    column: {
        type: String,
        required: true,
        default: 'To Do'
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        default: null
    },
    labels: [{
        type: String,
        trim: true
    }],
    order: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
