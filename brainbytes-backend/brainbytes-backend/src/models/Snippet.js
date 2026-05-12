const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  code:        { type: String, required: true },
  language:    { type: String, required: true },
  description: { type: String, default: '' },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    date: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Snippet', snippetSchema);
