const Blog = require('../models/Blog');

// ── @route   GET /api/blogs ───────────────────────────────────────────────────
// ── @access  Public
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username email');
    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── @route   GET /api/blogs/:id ──────────────────────────────────────────────
// ── @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      'createdBy',
      'username email'
    );
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json(blog);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── @route   POST /api/blogs ─────────────────────────────────────────────────
// ── @access  Private
const createBlog = async (req, res) => {
  try {
    const { title, body, author } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const blog = await Blog.create({
      title,
      body,
      author: author || req.user.username,
      createdBy: req.user._id,
    });

    res.status(201).json(blog);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── @route   DELETE /api/blogs/:id ───────────────────────────────────────────
// ── @access  Private (only the creator can delete)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Ensure the logged-in user owns this blog
    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this blog' });
    }

    await blog.deleteOne();
    res.status(200).json({ message: 'Blog deleted successfully', id: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getBlogs, getBlogById, createBlog, deleteBlog };
