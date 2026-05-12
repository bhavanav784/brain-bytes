const router = require('express').Router();
const Problem = require('../models/Problem');
const { auth, isMentor } = require('../middleware/auth');

// GET /api/problems
router.get('/', async (req, res) => {
  try {
    const { difficulty, page = 1, limit = 20 } = req.query;
    const filter = difficulty ? { difficulty } : {};
    const problems = await Problem.find(filter)
      .populate('author', 'username avatar')
      .select('-submissions')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/problems/:id
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('submissions.user', 'username avatar');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/problems  (mentor only)
router.post('/', auth, isMentor, async (req, res) => {
  try {
    const { title, description, difficulty, examples } = req.body;
    const problem = await Problem.create({ title, description, difficulty, examples, author: req.user._id });
    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/problems/:id/submit
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    const { code, language, explanation } = req.body;
    problem.submissions.push({ user: req.user._id, code, language, explanation });
    await problem.save();
    res.status(201).json({ message: 'Solution submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/problems/:id/submissions/:subId/feedback  (mentor only)
router.put('/:id/submissions/:subId/feedback', auth, isMentor, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    const sub = problem.submissions.id(req.params.subId);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    sub.feedback = req.body.feedback;
    await problem.save();
    res.json({ message: 'Feedback added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/problems/user/:userId/solved  (track solved problems)
router.get('/user/:userId/solved', auth, async (req, res) => {
  try {
    const problems = await Problem.find({ 'submissions.user': req.params.userId }).select('title difficulty');
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
