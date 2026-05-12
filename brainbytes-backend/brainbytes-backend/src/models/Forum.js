const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  title:  { type: String, required: true },
  body:   { type: String, required: true },
  tags:   [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views:  { type: Number, default: 0 },
  solved: { type: Boolean, default: false },
  answers: [{
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    body:       String,
    votes:      { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
    createdAt:  { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Forum', forumSchema);
