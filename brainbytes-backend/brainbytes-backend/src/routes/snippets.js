const router = require('express').Router();
const Snippet = require('../models/Snippet');
const { auth } = require('../middleware/auth');

// GET /api/snippets
router.get('/', async (req, res) => {
  try {
    const { language, page = 1, limit = 20 } = req.query;
    const filter = language ? { language } : {};
    const snippets = await Snippet.find(filter)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(snippets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/snippets/:id
router.get('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('comments.user', 'username avatar');
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    res.json(snippet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/snippets
router.post('/', auth, async (req, res) => {
  try {
    const { title, code, language, description } = req.body;
    const snippet = await Snippet.create({ title, code, language, description, author: req.user._id });
    res.status(201).json(snippet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/snippets/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Not found' });
    if (snippet.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    Object.assign(snippet, req.body);
    await snippet.save();
    res.json(snippet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/snippets/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Not found' });
    if (snippet.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await snippet.deleteOne();
    res.json({ message: 'Snippet deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/snippets/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Not found' });
    const idx = snippet.likes.indexOf(req.user._id);
    if (idx === -1) snippet.likes.push(req.user._id);
    else snippet.likes.splice(idx, 1);
    await snippet.save();
    res.json({ likes: snippet.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/snippets/:id/bookmark
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Not found' });
    const idx = snippet.bookmarks.indexOf(req.user._id);
    if (idx === -1) snippet.bookmarks.push(req.user._id);
    else snippet.bookmarks.splice(idx, 1);
    await snippet.save();
    res.json({ bookmarked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/snippets/:id/comments
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Not found' });
    snippet.comments.push({ user: req.user._id, text: req.body.text });
    await snippet.save();
    res.status(201).json(snippet.comments[snippet.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
