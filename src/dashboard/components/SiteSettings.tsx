import React, { useState } from 'react';
import { useSite, DynamicPageData } from '@/context/SiteContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Globe, Box, Type, Settings2, Key, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { dataApi } from '@/lib/api';

export const SiteSettings = () => {
  const { theme, content, updateTheme, updateContent, addPage, removePage, updateServicePrice } = useSite();
  const [isSaving, setIsSaving] = useState(false);
  const [localTheme, setLocalTheme] = useState(theme);
  const [localContent, setLocalContent] = useState(content);
  
  // Page creation state
  const [newPage, setNewPage] = useState({ title: '', slug: '' });

  // Sync local state when context updates (e.g. from polling)
  React.useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleThemeChange = (key: keyof typeof theme, value: string) => {
    setLocalTheme({ ...localTheme, [key]: value });
  };

  const saveTheme = async () => {
    setIsSaving(true);
    await updateTheme(localTheme);
    setIsSaving(false);
    toast.success('Site settings updated globally');
  };

  const handleAssetChange = (key: keyof typeof content, value: string) => {
    setLocalContent({ ...localContent, [key]: value });
  };

  const saveAsset = async (key: keyof typeof content) => {
    setIsSaving(true);
    await updateContent({ [key]: localContent[key] });
    setIsSaving(false);
    toast.success('Asset updated globally');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const { data } = await dataApi.upload(file);
      const imageUrl = data.url;
      setLocalContent({ ...localContent, penImage: imageUrl });
      await updateContent({ penImage: imageUrl });
      toast.success('Image uploaded and applied');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPage = () => {
    if (!newPage.title || !newPage.slug) {
      toast.error('Title and Slug are required');
      return;
    }
    
    const slugExists = content.pages.some(p => p.slug === newPage.slug);
    if (slugExists) {
      toast.error('A page with this slug already exists');
      return;
    }

    // Convert slug to lowercase and replace spaces with hyphens
    const formattedSlug = newPage.slug.toLowerCase().replace(/\s+/g, '-');

    addPage({
      title: newPage.title,
      slug: formattedSlug,
      content: '<h2>Welcome to the ' + newPage.title + ' page</h2><p>This content can be updated later.</p>'
    });
    setNewPage({ title: '', slug: '' });
    toast.success(`Page /p/${formattedSlug} created and live!`);
  };

  return (
    <div className="space-y-12 max-w-4xl pb-12">
      
      {/* Structural Tuning */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-ink-green/10 pb-2">
          <Settings2 className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-ink-green">Structural Tuning</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Border Radius</Label>
            <Input 
              value={localTheme.borderRadius} 
              onChange={(e) => handleThemeChange('borderRadius', e.target.value)}
              placeholder="e.g. 8px, 0px, 1rem"
              className="bg-white/5 border-ink-green/20 focus:border-gold font-mono text-sm"
            />
            <p className="text-[9px] text-ink-green/40 mt-1">Controls the curvature of all frames and buttons.</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Border Width</Label>
            <Input 
              value={localTheme.borderWidth} 
              onChange={(e) => handleThemeChange('borderWidth', e.target.value)}
              placeholder="e.g. 1px, 2px"
              className="bg-white/5 border-ink-green/20 focus:border-gold font-mono text-sm"
            />
            <p className="text-[9px] text-ink-green/40 mt-1">Thickness of the decorative page frame.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Border Style</Label>
            <Input 
              value={localTheme.borderStyle} 
              onChange={(e) => handleThemeChange('borderStyle', e.target.value)}
              placeholder="e.g. solid, dashed, dotted"
              className="bg-white/5 border-ink-green/20 focus:border-gold font-mono text-sm"
            />
          </div>
        </div>
        <Button 
          onClick={saveTheme} 
          disabled={isSaving}
          className="text-xs bg-ink-green text-parchment hover:bg-ink-green/90 uppercase tracking-widest"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Apply Structure
        </Button>
      </section>

      {/* Typography Engine */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-ink-green/10 pb-2">
          <Type className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-ink-green">Typography Engine</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Primary Font (Serif)</Label>
            <Input 
              value={localTheme.fontFamilyPrimary} 
              onChange={(e) => handleThemeChange('fontFamilyPrimary', e.target.value)}
              className="bg-white/5 border-ink-green/20 focus:border-gold font-mono text-sm"
            />
            <p className="text-[9px] text-ink-green/40 mt-1">Used for large headings. Ensure font is imported.</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Secondary Font (Sans-Serif)</Label>
            <Input 
              value={localTheme.fontFamilySecondary} 
              onChange={(e) => handleThemeChange('fontFamilySecondary', e.target.value)}
              className="bg-white/5 border-ink-green/20 focus:border-gold font-mono text-sm"
            />
            <p className="text-[9px] text-ink-green/40 mt-1">Used for body copy and UI elements.</p>
          </div>
        </div>
        <Button 
          onClick={saveTheme} 
          disabled={isSaving}
          className="text-xs bg-ink-green text-parchment hover:bg-ink-green/90 uppercase tracking-widest"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Apply Typography
        </Button>
      </section>

      {/* Asset Management */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-ink-green/10 pb-2">
          <Box className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-ink-green">Hero Asset Management</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2 max-w-md">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">3D/Hero Pen Image</Label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input 
                  value={localContent.penImage} 
                  onChange={(e) => handleAssetChange('penImage', e.target.value)}
                  className="bg-white/5 border-ink-green/20 focus:border-gold font-mono text-sm"
                  placeholder="URL or Upload below"
                />
                <Button 
                  onClick={() => saveAsset('penImage')} 
                  disabled={isSaving}
                  className="bg-gold text-ink-green hover:bg-gold/80"
                >
                  Save
                </Button>
              </div>
              
              <div className="relative group">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden" 
                  id="pen-upload"
                />
                <label 
                  htmlFor="pen-upload"
                  className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-ink-green/20 rounded-md cursor-pointer hover:border-gold hover:bg-gold/5 transition-all text-ink-green/60 hover:text-gold"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span className="text-[10px] uppercase tracking-widest font-bold">Upload to Firebase</span>
                </label>
              </div>
            </div>
            <p className="text-[9px] text-ink-green/40 mt-1">Provide a URL or upload a transparent PNG for the floating hero effect.</p>
          </div>

          <div className="space-y-2 max-w-md pt-4">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Commission Pen Brand Name</Label>
            <div className="flex gap-2">
              <Input 
                value={localContent.commissionPenBrand} 
                onChange={(e) => handleAssetChange('commissionPenBrand', e.target.value)}
                className="bg-white/5 border-ink-green/20 focus:border-gold font-serif text-sm"
              />
              <Button 
                onClick={() => saveAsset('commissionPenBrand')} 
                disabled={isSaving}
                className="bg-gold text-ink-green hover:bg-gold/80"
              >
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Commission Pen Name / Model</Label>
            <div className="flex gap-2">
              <Input 
                value={localContent.commissionPenName} 
                onChange={(e) => handleAssetChange('commissionPenName', e.target.value)}
                className="bg-white/5 border-ink-green/20 focus:border-gold font-serif text-sm"
              />
              <Button 
                onClick={() => saveAsset('commissionPenName')} 
                disabled={isSaving}
                className="bg-gold text-ink-green hover:bg-gold/80"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations & API Keys */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-ink-green/10 pb-2">
          <Key className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-ink-green">Integrations & API Keys</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2 max-w-md">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Stripe Public Key</Label>
            <div className="flex gap-2">
              <Input 
                value={localContent.stripePublicKey} 
                onChange={(e) => handleAssetChange('stripePublicKey', e.target.value)}
                placeholder="pk_test_..."
                className="bg-white/5 border-ink-green/20 focus:border-gold font-mono text-sm"
              />
              <Button 
                onClick={() => saveAsset('stripePublicKey')} 
                disabled={isSaving}
                className="bg-gold text-ink-green hover:bg-gold/80"
              >
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-w-md pt-4">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Firebase API Key</Label>
            <div className="flex gap-2">
              <Input 
                value={localContent.firebaseApiKey} 
                onChange={(e) => handleAssetChange('firebaseApiKey', e.target.value)}
                placeholder="AIzaSy..."
                className="bg-white/5 border-ink-green/20 focus:border-gold font-mono text-sm"
              />
              <Button 
                onClick={() => saveAsset('firebaseApiKey')} 
                disabled={isSaving}
                className="bg-gold text-ink-green hover:bg-gold/80"
              >
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Firebase Project ID</Label>
            <div className="flex gap-2">
              <Input 
                value={localContent.firebaseProjectId} 
                onChange={(e) => handleAssetChange('firebaseProjectId', e.target.value)}
                placeholder="inkopia-xxx"
                className="bg-white/5 border-ink-green/20 focus:border-gold font-mono text-sm"
              />
              <Button 
                onClick={() => saveAsset('firebaseProjectId')} 
                disabled={isSaving}
                className="bg-gold text-ink-green hover:bg-gold/80"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Page Manager */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-ink-green/10 pb-2">
          <Globe className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-ink-green">Dynamic Pages</h2>
        </div>

        {/* Create Page Form */}
        <div className="p-6 border border-ink-green/10 bg-white/30 backdrop-blur-sm rounded-md space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold uppercase tracking-widest text-ink-green/70 mb-4">Create New Route</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[9px] uppercase tracking-widest">Page Title</Label>
              <Input 
                placeholder="e.g. The Heritage Vault"
                value={newPage.title}
                onChange={e => setNewPage({...newPage, title: e.target.value})}
                className="bg-white/50 border-ink-green/20"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] uppercase tracking-widest">URL Slug</Label>
              <Input 
                placeholder="e.g. heritage-vault"
                value={newPage.slug}
                onChange={e => setNewPage({...newPage, slug: e.target.value})}
                className="bg-white/50 border-ink-green/20"
              />
            </div>
          </div>
          <Button onClick={handleAddPage} className="w-full bg-ink-green text-parchment hover:bg-ink-green/90 mt-2">
            <Plus className="w-4 h-4 mr-2" /> Deploy Page
          </Button>
        </div>

        {/* Existing Pages List */}
        <div className="space-y-3 max-w-2xl">
          <h3 className="text-sm font-bold uppercase tracking-widest text-ink-green/70 mb-4">Active Routes</h3>
          {content.pages.length === 0 ? (
            <p className="text-xs text-ink-green/50 italic">No dynamic pages deployed yet.</p>
          ) : (
            content.pages.map((page) => (
              <div key={page.slug} className="flex justify-between items-center p-4 border border-ink-green/10 bg-white/50 rounded-md">
                <div>
                  <h4 className="font-serif font-bold text-ink-green text-lg">{page.title}</h4>
                  <p className="text-[10px] font-mono text-ink-green/60 bg-ink-green/5 px-2 py-1 rounded inline-block mt-1">
                    /p/{page.slug}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a 
                    href={`/p/${page.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-widest text-gold hover:text-gold/80 font-bold"
                  >
                    View
                  </a>
                  <button 
                    onClick={() => removePage(page.slug)}
                    className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Financial Parameters */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-ink-green/10 pb-2">
          <Box className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-ink-green">Financial Parameters</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2 max-w-md">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Concierge Service Fee (₹)</Label>
            <div className="flex gap-2">
              <Input 
                type="number"
                value={content.servicePrice} 
                onChange={(e) => updateServicePrice(Number(e.target.value))}
                className="bg-white/5 border-ink-green/20 focus:border-gold font-mono text-sm"
                placeholder="e.g. 2500"
              />
              <p className="text-[10px] text-ink-green/60 self-center">Price per visit</p>
            </div>
            <p className="text-[9px] text-ink-green/40 mt-1">This price will be displayed to users during the commission process.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
