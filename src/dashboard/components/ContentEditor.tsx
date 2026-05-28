import React from 'react';
import { useSite } from '@/context/SiteContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Global Pen Ratio (Scale)</Label>
                <span className="text-[10px] font-mono font-bold bg-ink-green/5 px-2 py-0.5 rounded">{localContent.penScale?.toFixed(2) || '1.00'}x</span>
              </div>
              <Slider 
                value={[localContent.penScale || 1]} 
                min={0.1} 
                max={2.5} 
                step={0.05}
                onValueChange={(val) => handleChange('penScale', val[0])}
                className="py-4"
              />
              <p className="text-[9px] text-ink-green/40 uppercase tracking-widest">Adjust the relative size of the 3D background pen</p>
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

        {/* Dynamic Website Copy Upgrades */}
        <AccordionItem value="website_copy" className="border border-ink-green/10 rounded-lg px-4 bg-white/5">
          <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-bold hover:no-underline">Extended Copy & Buttons</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4 pb-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Discover Section Subtitle</Label>
              <Textarea 
                value={localContent.discoverSubtitle || ''} 
                onChange={(e) => handleChange('discoverSubtitle', e.target.value)}
                className="bg-background/50 border-ink-green/10 min-h-[80px]"
              />
            </div>
            
            <div className="border-t border-ink-green/5 pt-4 space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-gold">Concierge Sommelier Pillars</h4>
              
              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest font-bold opacity-50">Pillar 1 Title</Label>
                <Input value={localContent.conciergeSommelierPillar1Title || ''} onChange={(e) => handleChange('conciergeSommelierPillar1Title', e.target.value)} className="bg-background/50 border-ink-green/10" />
                <Label className="text-[9px] uppercase tracking-widest font-bold opacity-50">Pillar 1 Text</Label>
                <Textarea value={localContent.conciergeSommelierPillar1Text || ''} onChange={(e) => handleChange('conciergeSommelierPillar1Text', e.target.value)} className="bg-background/50 border-ink-green/10" />
              </div>

              <div className="space-y-2 pt-2 border-t border-ink-green/5">
                <Label className="text-[9px] uppercase tracking-widest font-bold opacity-50">Pillar 2 Title</Label>
                <Input value={localContent.conciergeSommelierPillar2Title || ''} onChange={(e) => handleChange('conciergeSommelierPillar2Title', e.target.value)} className="bg-background/50 border-ink-green/10" />
                <Label className="text-[9px] uppercase tracking-widest font-bold opacity-50">Pillar 2 Text</Label>
                <Textarea value={localContent.conciergeSommelierPillar2Text || ''} onChange={(e) => handleChange('conciergeSommelierPillar2Text', e.target.value)} className="bg-background/50 border-ink-green/10" />
              </div>

              <div className="space-y-2 pt-2 border-t border-ink-green/5">
                <Label className="text-[9px] uppercase tracking-widest font-bold opacity-50">Pillar 3 Title</Label>
                <Input value={localContent.conciergeSommelierPillar3Title || ''} onChange={(e) => handleChange('conciergeSommelierPillar3Title', e.target.value)} className="bg-background/50 border-ink-green/10" />
                <Label className="text-[9px] uppercase tracking-widest font-bold opacity-50">Pillar 3 Text</Label>
                <Textarea value={localContent.conciergeSommelierPillar3Text || ''} onChange={(e) => handleChange('conciergeSommelierPillar3Text', e.target.value)} className="bg-background/50 border-ink-green/10" />
              </div>
            </div>

            <div className="border-t border-ink-green/5 pt-4 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">CTA Button (Unauthenticated)</Label>
                <Input value={localContent.bookServiceButtonText || ''} onChange={(e) => handleChange('bookServiceButtonText', e.target.value)} className="bg-background/50 border-ink-green/10" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">CTA Button (Authenticated)</Label>
                <Input value={localContent.vaultEntranceButtonText || ''} onChange={(e) => handleChange('vaultEntranceButtonText', e.target.value)} className="bg-background/50 border-ink-green/10" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Mumbai Service Coverage Area Displays */}
        <AccordionItem value="mumbai_regions" className="border border-ink-green/10 rounded-lg px-4 bg-white/5">
          <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-bold hover:no-underline">Mumbai Coverage Areas</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 p-3 bg-black/5 border border-ink-green/10 rounded-none">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-gold">Western Corridor</h4>
                <Label className="text-[9px] uppercase tracking-widest opacity-50">Title</Label>
                <Input value={localContent.regionWesternTitle || ''} onChange={(e) => handleChange('regionWesternTitle', e.target.value)} className="bg-background/50 border-ink-green/10" />
                <Label className="text-[9px] uppercase tracking-widest opacity-50">Subtitle Coverage</Label>
                <Input value={localContent.regionWesternText || ''} onChange={(e) => handleChange('regionWesternText', e.target.value)} className="bg-background/50 border-ink-green/10" />
              </div>

              <div className="space-y-2 p-3 bg-black/5 border border-ink-green/10 rounded-none">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-gold">Central corridor</h4>
                <Label className="text-[9px] uppercase tracking-widest opacity-50">Title</Label>
                <Input value={localContent.regionCentralTitle || ''} onChange={(e) => handleChange('regionCentralTitle', e.target.value)} className="bg-background/50 border-ink-green/10" />
                <Label className="text-[9px] uppercase tracking-widest opacity-50">Subtitle Coverage</Label>
                <Input value={localContent.regionCentralText || ''} onChange={(e) => handleChange('regionCentralText', e.target.value)} className="bg-background/50 border-ink-green/10" />
              </div>

              <div className="space-y-2 p-3 bg-black/5 border border-ink-green/10 rounded-none">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-gold">Town Zone</h4>
                <Label className="text-[9px] uppercase tracking-widest opacity-50">Title</Label>
                <Input value={localContent.regionTownTitle || ''} onChange={(e) => handleChange('regionTownTitle', e.target.value)} className="bg-background/50 border-ink-green/10" />
                <Label className="text-[9px] uppercase tracking-widest opacity-50">Subtitle Coverage</Label>
                <Input value={localContent.regionTownText || ''} onChange={(e) => handleChange('regionTownText', e.target.value)} className="bg-background/50 border-ink-green/10" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section Visibilities (On/Off switches) */}
        <AccordionItem value="section_visibilities" className="border border-ink-green/10 rounded-lg px-4 bg-white/5">
          <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-bold hover:no-underline">Page Section Toggles (On / Off)</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4 pb-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 bg-black/5 border border-ink-green/5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Concierge Section</span>
                  <span className="text-[9px] text-ink-green/50 uppercase tracking-widest">Main service statement introduction</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={localContent.showConciergeSection !== false}
                  onChange={(e) => handleChange('showConciergeSection', e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-gold"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-black/5 border border-ink-green/5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">White-Glove Ceremony Pillars</span>
                  <span className="text-[9px] text-ink-green/50 uppercase tracking-widest">01, 02, and 03 text-only statements</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={localContent.showWhiteGloveSection !== false}
                  onChange={(e) => handleChange('showWhiteGloveSection', e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-gold"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-black/5 border border-ink-green/5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Mumbai Coverage Zones Grid</span>
                  <span className="text-[9px] text-ink-green/50 uppercase tracking-widest">Western, Central, and Town limits</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={localContent.showCoverageSection !== false}
                  onChange={(e) => handleChange('showCoverageSection', e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-gold"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-black/5 border border-ink-green/5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Commission / Booking Section</span>
                  <span className="text-[9px] text-ink-green/50 uppercase tracking-widest">Selected highlights & Call-to-action button</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={localContent.showCommissionSection !== false}
                  onChange={(e) => handleChange('showCommissionSection', e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-gold"
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
