const router = require('express').Router();
const Forum = require('../models/Forum');
const { auth } = require('../middleware/auth');

// GET /api/forum
router.get('/', async (req, res) => {
  try {
    const { tag, q, page = 1, limit = 20 } = req.query;
    let filter = {};
    if (tag) filter.tags = tag;
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { body: { $regex: q, $options: 'i' } },
    ];
    const posts = await Forum.find(filter)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/forum/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Forum.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username avatar').populate('answers.user', 'username avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/forum
router.post('/', auth, async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    const post = await Forum.create({ title, body, tags, author: req.user._id });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/forum/:id/answers
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.answers.push({ user: req.user._id, body: req.body.body });
    await post.save();
    res.status(201).json(post.answers[post.answers.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/forum/:id/answers/:answerId/vote
router.post('/:id/answers/:answerId/vote', auth, async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const answer = post.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    const { direction } = req.body; // 'up' or 'down'
    answer.votes += direction === 'up' ? 1 : -1;
    await post.save();
    res.json({ votes: answer.votes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/forum/:id/answers/:answerId/accept
router.post('/:id/answers/:answerId/accept', auth, async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only post author can accept answers' });
    post.answers.forEach((a) => (a.isAccepted = false));
    const answer = post.answers.id(req.params.answerId);
    answer.isAccepted = true;
    post.solved = true;
    await post.save();
    res.json({ message: 'Answer accepted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
