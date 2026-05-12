const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  techStack:   [String],
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:      { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
  githubLink:  { type: String, default: '' },
  discussion: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:      String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
