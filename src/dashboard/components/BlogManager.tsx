import { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Plus, Trash2, Edit2, Save, X, BookOpen, FileText, User, Image, Clock, Tag } from 'lucide-react';
import { toast } from 'sonner';

export const BlogManager = () => {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useOrders();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Core Form State
  const [form, setForm] = useState({
    title: '',
    slug: '',
    metaDescription: '',
    readingTime: 5,
    author: 'Manav Shah',
    authorRole: 'Lead Fountain Pen Specialist',
    authorImage: '',
    category: 'Maintenance',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80',
    relatedPosts: '',
    contentBlocks: [{ heading: '', paragraphs: [''] }]
  });

  // Helpers
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  // Content Blocks Handlers
  const addBlock = () => {
    setForm(prev => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, { heading: '', paragraphs: [''] }]
    }));
  };

  const removeBlock = (idx: number) => {
    setForm(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.filter((_, i) => i !== idx)
    }));
  };

  const updateBlockHeading = (idx: number, val: string) => {
    setForm(prev => {
      const blocks = [...prev.contentBlocks];
      blocks[idx].heading = val;
      return { ...prev, contentBlocks: blocks };
    });
  };

  const addParagraph = (blockIdx: number) => {
    setForm(prev => {
      const blocks = [...prev.contentBlocks];
      blocks[blockIdx].paragraphs = [...blocks[blockIdx].paragraphs, ''];
      return { ...prev, contentBlocks: blocks };
    });
  };

  const removeParagraph = (blockIdx: number, pIdx: number) => {
    setForm(prev => {
      const blocks = [...prev.contentBlocks];
      blocks[blockIdx].paragraphs = blocks[blockIdx].paragraphs.filter((_, i) => i !== pIdx);
      return { ...prev, contentBlocks: blocks };
    });
  };

  const updateParagraph = (blockIdx: number, pIdx: number, val: string) => {
    setForm(prev => {
      const blocks = [...prev.contentBlocks];
      blocks[blockIdx].paragraphs[pIdx] = val;
      return { ...prev, contentBlocks: blocks };
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and Slug are required.');
      return;
    }

    // Format content blocks into expected format
    const content = form.contentBlocks.map(block => ({
      heading: block.heading.trim() || undefined,
      paragraphs: block.paragraphs.map(p => p.trim()).filter(Boolean)
    })).filter(b => b.paragraphs.length > 0);

    const payload = {
      title: form.title,
      slug: form.slug,
      metaDescription: form.metaDescription,
      readingTime: Number(form.readingTime) || 5,
      author: form.author,
      authorRole: form.authorRole,
      authorImage: form.authorImage || null,
      category: form.category,
      imageUrl: form.imageUrl,
      content,
      relatedPosts: form.relatedPosts
    };

    try {
      if (editingId) {
        await updateBlogPost(editingId, payload);
        toast.success('Chronicle article updated successfully');
      } else {
        await addBlogPost(payload);
        toast.success('Chronicle article published successfully');
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit article.');
    }
  };

  const handleEditInit = (post: any) => {
    setEditingId(post.id || post._id);
    
    // Parse content blocks
    let parsedBlocks = [{ heading: '', paragraphs: [''] }];
    if (Array.isArray(post.content)) {
      parsedBlocks = post.content.map((b: any) => ({
        heading: b.heading || '',
        paragraphs: Array.isArray(b.paragraphs) ? [...b.paragraphs] : ['']
      }));
    }

    setForm({
      title: post.title || '',
      slug: post.slug || '',
      metaDescription: post.metaDescription || '',
      readingTime: Number(post.readingTime) || 5,
      author: post.author || 'Manav Shah',
      authorRole: post.authorRole || 'Lead Fountain Pen Specialist',
      authorImage: post.authorImage || '',
      category: post.category || 'Maintenance',
      imageUrl: post.imageUrl || '',
      relatedPosts: post.relatedPosts || '',
      contentBlocks: parsedBlocks
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this chronicle article?')) return;
    try {
      await deleteBlogPost(id);
      toast.success('Article deleted');
    } catch (err) {
      toast.error('Failed to delete article');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      metaDescription: '',
      readingTime: 5,
      author: 'Manav Shah',
      authorRole: 'Lead Fountain Pen Specialist',
      authorImage: '',
      category: 'Maintenance',
      imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80',
      relatedPosts: '',
      contentBlocks: [{ heading: '', paragraphs: [''] }]
    });
    setEditingId(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-ink-green">Chronicle Blog Manager</h2>
        </div>
        <button 
          onClick={() => {
            if (isEditing) resetForm();
            else setIsEditing(true);
          }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-ink-green border border-ink-green/20 px-4 py-2 hover:bg-ink-green hover:text-white transition-all"
        >
          {isEditing ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {isEditing ? 'Close Editor' : 'Write New Article'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="p-6 border border-ink-green/20 bg-white/10 space-y-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-ink-green border-b border-ink-green/10 pb-3 mb-2">
            {editingId ? 'Edit Chronicle Article' : 'Draft New Chronicle Article'}
          </h3>

          {/* Grid Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Article Title</label>
                <input 
                  required
                  type="text" 
                  value={form.title} 
                  onChange={handleTitleChange}
                  placeholder="e.g. Masterclass on Visconti Nib Restoration"
                  className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors font-serif font-bold"
                />
              </div>
              
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">URL Slug (Auto-generated)</label>
                <input 
                  required
                  type="text" 
                  value={form.slug} 
                  onChange={e => setForm({...form, slug: generateSlug(e.target.value)})}
                  placeholder="visconti-nib-restoration"
                  className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Meta Description</label>
                <textarea 
                  required
                  rows={2}
                  value={form.metaDescription} 
                  onChange={e => setForm({...form, metaDescription: e.target.value})}
                  placeholder="Short engaging excerpt for Google search results..."
                  className="w-full bg-transparent border border-ink-green/20 p-2 text-xs focus:outline-none focus:border-ink-green transition-colors font-sans"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Category</label>
                  <select 
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Refilling">Refilling</option>
                    <option value="Preservation">Preservation</option>
                    <option value="Troubleshooting">Troubleshooting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Reading Time (min)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={form.readingTime} 
                    onChange={e => setForm({...form, readingTime: parseInt(e.target.value) || 5})}
                    className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Feature Header Image URL</label>
                <input 
                  type="url" 
                  value={form.imageUrl} 
                  onChange={e => setForm({...form, imageUrl: e.target.value})}
                  placeholder="Unsplash image URL..."
                  className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-xs focus:outline-none focus:border-ink-green transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Related Articles slugs (Comma-separated)</label>
                <input 
                  type="text" 
                  value={form.relatedPosts} 
                  onChange={e => setForm({...form, relatedPosts: e.target.value})}
                  placeholder="slug-one, slug-two"
                  className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-xs focus:outline-none focus:border-ink-green transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Author Details */}
          <div className="p-4 bg-white/5 border border-ink-green/10 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink-green flex items-center gap-2"><User className="w-3.5 h-3.5 text-gold" /> Author Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Author Name</label>
                <input 
                  type="text" 
                  value={form.author} 
                  onChange={e => setForm({...form, author: e.target.value})}
                  className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Author Role/Designation</label>
                <input 
                  type="text" 
                  value={form.authorRole} 
                  onChange={e => setForm({...form, authorRole: e.target.value})}
                  className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Content Block Builder */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-ink-green/10 pb-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink-green flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-gold" /> Article Content Blocks</h4>
              <button 
                type="button"
                onClick={addBlock}
                className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest border border-gold px-2.5 py-1 text-gold hover:bg-gold hover:text-black transition-all"
              >
                Add Content Block
              </button>
            </div>

            {form.contentBlocks.map((block, bIdx) => (
              <div key={bIdx} className="p-4 border border-ink-green/10 bg-white/20 space-y-4 relative">
                <button 
                  type="button" 
                  onClick={() => removeBlock(bIdx)}
                  className="absolute top-4 right-4 text-ink-green/40 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="max-w-md pr-8">
                  <label className="block text-[8px] uppercase tracking-widest text-gold mb-1 font-bold">Block Header/Subtitle</label>
                  <input 
                    type="text" 
                    value={block.heading} 
                    onChange={e => updateBlockHeading(bIdx, e.target.value)}
                    placeholder="e.g. Setting the Capillary Feed Channels (Leave blank if none)"
                    className="w-full bg-transparent border-b border-ink-green/20 pb-0.5 text-xs font-serif font-bold text-ink-green focus:outline-none focus:border-ink-green"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[8px] uppercase tracking-widest text-ink-green/55">Paragraphs</label>
                    <button 
                      type="button"
                      onClick={() => addParagraph(bIdx)}
                      className="text-[8px] uppercase tracking-widest font-bold text-ink-green hover:text-gold transition-colors"
                    >
                      + Add Paragraph
                    </button>
                  </div>

                  {block.paragraphs.map((para, pIdx) => (
                    <div key={pIdx} className="flex gap-2 items-start">
                      <span className="text-[10px] font-mono text-ink-green/30 pt-2">{pIdx + 1}.</span>
                      <textarea 
                        required
                        rows={3}
                        value={para}
                        onChange={e => updateParagraph(bIdx, pIdx, e.target.value)}
                        placeholder="Write dynamic paragraph text focusing strictly on pen cleaning, refilling, and maintenance..."
                        className="w-full bg-transparent border border-ink-green/10 p-2 text-xs focus:outline-none focus:border-ink-green transition-colors"
                      />
                      {block.paragraphs.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeParagraph(bIdx, pIdx)}
                          className="text-ink-green/30 hover:text-red-500 pt-2 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4 border-t border-ink-green/10">
            <button 
              type="submit" 
              className="flex-1 bg-ink-green text-white py-3.5 text-[10px] uppercase tracking-widest font-bold hover:bg-ink-green/95 transition-colors shadow-sm"
            >
              {editingId ? 'Save & Publish Updates' : 'Publish Article Live'}
            </button>
            <button 
              type="button"
              onClick={resetForm}
              className="px-6 border border-ink-green/20 text-ink-green py-3.5 text-[10px] uppercase tracking-widest font-bold hover:bg-black/5"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="border border-ink-green/10 bg-white/20">
          <div className="p-4 border-b border-ink-green/10 bg-white/30 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-ink-green">
            <span>Article List</span>
            <span>{blogPosts?.length || 0} Articles</span>
          </div>

          {blogPosts && blogPosts.length > 0 ? (
            <div className="divide-y divide-ink-green/5">
              {blogPosts.map((post: any) => (
                <div key={post.id || post._id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/30 transition-colors">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] uppercase tracking-widest font-bold text-gold px-2 py-0.5 bg-gold/10 border border-gold/10">{post.category}</span>
                      <span className="text-[9px] text-[#666] font-mono">{post.publishedDate}</span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-ink-green">{post.title}</h3>
                    <p className="text-xs text-ink-green/60 truncate max-w-xl">{post.metaDescription}</p>
                    <div className="flex gap-2 text-[9px] text-ink-green/40 font-mono">
                      <span>slug: {post.slug}</span>
                      <span>•</span>
                      <span>reading time: {post.readingTime} min</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button 
                      onClick={() => handleEditInit(post)}
                      className="flex items-center justify-center gap-1.5 border border-ink-green/20 hover:border-ink-green px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold text-ink-green transition-all bg-white"
                    >
                      <Edit2 className="w-3 h-3 text-gold" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id || post._id)}
                      className="flex items-center justify-center gap-1.5 border border-red-200 hover:border-red-500 px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold text-red-600 transition-all bg-white"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 p-8 space-y-3">
              <FileText className="w-12 h-12 text-ink-green/10 mx-auto" />
              <p className="text-sm text-ink-green/50">No blog posts found in the database. Write a new post to get started!</p>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-[9px] uppercase tracking-widest font-bold text-gold border border-gold/30 px-4 py-2 hover:bg-gold hover:text-black transition-all"
              >
                Write First Article
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
