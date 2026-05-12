const router = require('express').Router();
const Project = require('../models/Project');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const projects = await Project.find(filter)
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar')
      .populate('discussion.user', 'username avatar');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, techStack, githubLink } = req.body;
    const project = await Project.create({
      title, description, techStack, githubLink, owner: req.user._id, members: [req.user._id],
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    Object.assign(project, req.body);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/invite
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only owner can invite' });
    const invitee = await User.findOne({ username: req.body.username });
    if (!invitee) return res.status(404).json({ message: 'User not found' });
    if (!project.members.includes(invitee._id)) project.members.push(invitee._id);
    await project.save();
    res.json({ message: `${invitee.username} added to project` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/discussion
router.post('/:id/discussion', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    project.discussion.push({ user: req.user._id, text: req.body.text });
    await project.save();
    res.status(201).json(project.discussion[project.discussion.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
