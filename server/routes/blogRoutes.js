const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const posts = await db.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
    // Parse content and relatedPosts if they are stored as JSON string
    const parsedPosts = (posts || []).map(post => ({
      ...post,
      content: typeof post.content === 'string' ? JSON.parse(post.content) : post.content,
      relatedPostSlugs: post.relatedPosts ? post.relatedPosts.split(',').map(s => s.trim()) : []
    }));
    res.json(parsedPosts);
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get a single blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const posts = await db.query('SELECT * FROM blog_posts WHERE slug = ?', [req.params.slug]);
    if (posts && posts.length > 0) {
      const post = posts[0];
      res.json({
        ...post,
        content: typeof post.content === 'string' ? JSON.parse(post.content) : post.content,
        relatedPostSlugs: post.relatedPosts ? post.relatedPosts.split(',').map(s => s.trim()) : []
      });
    } else {
      res.status(404).json({ message: 'Blog post not found' });
    }
  } catch (err) {
    console.error('Error fetching blog post by slug:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new blog post
router.post('/', async (req, res) => {
  try {
    const { title, slug, metaDescription, readingTime, author, authorRole, authorImage, category, imageUrl, content, relatedPosts } = req.body;
    
    // Check if slug already exists
    const existing = await db.query('SELECT id FROM blog_posts WHERE slug = ?', [slug]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'A blog post with this slug already exists.' });
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    await db.query(`
      INSERT INTO blog_posts (title, slug, metaDescription, publishedDate, readingTime, author, authorRole, authorImage, category, imageUrl, content, relatedPosts)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      slug,
      metaDescription,
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      parseInt(readingTime) || 5,
      author || 'Manav Shah',
      authorRole || 'Lead Fountain Pen Specialist',
      authorImage || null,
      category || 'Maintenance',
      imageUrl || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80',
      contentStr,
      relatedPosts || ''
    ]);

    const [newPost] = await db.query('SELECT * FROM blog_posts WHERE slug = ?', [slug]);
    res.status(201).json({
      ...newPost,
      content: JSON.parse(newPost.content),
      relatedPostSlugs: newPost.relatedPosts ? newPost.relatedPosts.split(',').map(s => s.trim()) : []
    });
  } catch (err) {
    console.error('Error creating blog post:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update a blog post
router.put('/:id', async (req, res) => {
  try {
    const { title, slug, metaDescription, readingTime, author, authorRole, authorImage, category, imageUrl, content, relatedPosts } = req.body;
    
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    await db.query(`
      UPDATE blog_posts 
      SET title = ?, slug = ?, metaDescription = ?, readingTime = ?, author = ?, authorRole = ?, authorImage = ?, category = ?, imageUrl = ?, content = ?, relatedPosts = ?
      WHERE id = ?
    `, [
      title,
      slug,
      metaDescription,
      parseInt(readingTime) || 5,
      author,
      authorRole,
      authorImage || null,
      category,
      imageUrl,
      contentStr,
      relatedPosts || '',
      req.params.id
    ]);

    const [updatedPost] = await db.query('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
    res.json({
      ...updatedPost,
      content: JSON.parse(updatedPost.content),
      relatedPostSlugs: updatedPost.relatedPosts ? updatedPost.relatedPosts.split(',').map(s => s.trim()) : []
    });
  } catch (err) {
    console.error('Error updating blog post:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a blog post
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
