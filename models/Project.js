const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a project name'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        default: '',
        maxlength: 500
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    columns: [{
        name: { type: String, required: true },
        order: { type: Number, required: true }
    }],
    status: {
        type: String,
        enum: ['active', 'completed', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema);
