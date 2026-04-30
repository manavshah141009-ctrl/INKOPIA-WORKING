import React from 'react';
import { useSite } from '@/context/SiteContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export const ContentEditor = () => {
  const { content, updateContent } = useSite();
  const [localContent, setLocalContent] = React.useState(content);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (key: string, value: any) => {
    setLocalContent({ ...localContent, [key]: value });
  };

  const handleRitualItemChange = (index: number, key: 'title' | 'desc', value: string) => {
    const newItems = [...localContent.ritualItems];
    newItems[index] = { ...newItems[index], [key]: value };
    setLocalContent({ ...localContent, ritualItems: newItems });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateContent(localContent);
    setIsSaving(false);
    toast.success('Site content updated successfully');
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* Hero Section */}
        <AccordionItem value="hero" className="border border-ink-green/10 rounded-lg px-4 bg-white/5">
          <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-bold hover:no-underline">Hero Section</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4 pb-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Hero Subheading</Label>
              <Input 
                value={localContent.heroSubheading} 
                onChange={(e) => handleChange('heroSubheading', e.target.value)}
                className="bg-background/50 border-ink-green/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Global Pen Asset (URL)</Label>
              <Input 
                value={localContent.penImage} 
                onChange={(e) => handleChange('penImage', e.target.value)}
                className="bg-background/50 border-ink-green/10"
                placeholder="/uploaded1-pen.png"
              />
              <p className="text-[9px] text-ink-green/40 uppercase tracking-widest">Supports local paths or external URLs</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Concierge Section */}
        <AccordionItem value="concierge" className="border border-ink-green/10 rounded-lg px-4 bg-white/5">
          <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-bold hover:no-underline">The Concierge</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4 pb-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Section Title</Label>
              <Input 
                value={localContent.conciergeTitle} 
                onChange={(e) => handleChange('conciergeTitle', e.target.value)}
                className="bg-background/50 border-ink-green/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Main Heading</Label>
              <Input 
                value={localContent.conciergeHeading} 
                onChange={(e) => handleChange('conciergeHeading', e.target.value)}
                className="bg-background/50 border-ink-green/10 font-serif text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Description Body</Label>
              <Textarea 
                value={localContent.conciergeText} 
                onChange={(e) => handleChange('conciergeText', e.target.value)}
                className="bg-background/50 border-ink-green/10 min-h-[100px] leading-relaxed"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Ritual Section */}
        <AccordionItem value="ritual" className="border border-ink-green/10 rounded-lg px-4 bg-white/5">
          <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-bold hover:no-underline">The White-Glove Ritual</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4 pb-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Section Title</Label>
              <Input 
                value={localContent.ritualTitle} 
                onChange={(e) => handleChange('ritualTitle', e.target.value)}
                className="bg-background/50 border-ink-green/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Main Heading</Label>
              <Input 
                value={localContent.ritualHeading} 
                onChange={(e) => handleChange('ritualHeading', e.target.value)}
                className="bg-background/50 border-ink-green/10 font-serif text-lg"
              />
            </div>
            <div className="space-y-4 pt-4 border-t border-ink-green/5">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Ritual Steps</Label>
              {localContent.ritualItems.map((item, idx) => (
                <div key={idx} className="p-3 border border-ink-green/5 rounded bg-black/5 space-y-3">
                  <Input 
                    value={item.title} 
                    onChange={(e) => handleRitualItemChange(idx, 'title', e.target.value)}
                    placeholder="Step Title"
                    className="bg-transparent border-b border-ink-green/10 rounded-none h-8 px-0"
                  />
                  <Input 
                    value={item.desc} 
                    onChange={(e) => handleRitualItemChange(idx, 'desc', e.target.value)}
                    placeholder="Step Description"
                    className="bg-transparent border-b border-ink-green/10 rounded-none h-8 px-0 text-xs opacity-70"
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Commission Section */}
        <AccordionItem value="commission" className="border border-ink-green/10 rounded-lg px-4 bg-white/5">
          <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-bold hover:no-underline">Commission</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4 pb-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Section Title</Label>
              <Input 
                value={localContent.commissionTitle} 
                onChange={(e) => handleChange('commissionTitle', e.target.value)}
                className="bg-background/50 border-ink-green/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Main Heading</Label>
              <Input 
                value={localContent.commissionHeading} 
                onChange={(e) => handleChange('commissionHeading', e.target.value)}
                className="bg-background/50 border-ink-green/10 font-serif text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Description Body</Label>
              <Textarea 
                value={localContent.commissionText} 
                onChange={(e) => handleChange('commissionText', e.target.value)}
                className="bg-background/50 border-ink-green/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ink-green/5">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Featured Pen Brand</Label>
                <Input 
                  value={localContent.commissionPenBrand} 
                  onChange={(e) => handleChange('commissionPenBrand', e.target.value)}
                  className="bg-background/50 border-ink-green/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Featured Pen Model</Label>
                <Input 
                  value={localContent.commissionPenName} 
                  onChange={(e) => handleChange('commissionPenName', e.target.value)}
                  className="bg-background/50 border-ink-green/10"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-6 flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-ink-green text-parchment hover:bg-ink-green/90 px-8 h-12 text-xs uppercase tracking-widest font-bold"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Publish Changes
        </Button>
      </div>
    </div>
  );
};
