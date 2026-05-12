const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examples: [{
    input:  String,
    output: String,
  }],
  submissions: [{
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    code:        String,
    language:    String,
    explanation: String,
    feedback:    { type: String, default: '' },
    createdAt:   { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
