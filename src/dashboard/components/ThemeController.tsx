import React from 'react';
import { useSite } from '@/context/SiteContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export const ThemeController = () => {
  const { theme, updateTheme, resetToDefault } = useSite();
  const [isSaving, setIsSaving] = React.useState(false);
  const [localTheme, setLocalTheme] = React.useState(theme);

  React.useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleColorChange = async (key: string, value: string) => {
    setLocalTheme({ ...localTheme, [key]: value });
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setIsSaving(true);
      await updateTheme({ [key]: value });
      setIsSaving(false);
    }
  };

  const handleBlur = async (key: string, value: string) => {
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setIsSaving(true);
      await updateTheme({ [key]: value });
      setIsSaving(false);
      toast.success('Theme updated');
    } else {
      toast.error('Invalid hex color');
      setLocalTheme(theme); // Revert
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="backgroundColor" className="text-[10px] uppercase tracking-widest font-bold opacity-60">Background Color</Label>
          <div className="flex gap-4 items-center">
            <Input 
              id="backgroundColor" 
              type="color" 
              value={localTheme.backgroundColor} 
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              className="w-12 h-12 p-1 bg-transparent border-none cursor-pointer"
            />
            <Input 
              type="text" 
              value={localTheme.backgroundColor} 
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              onBlur={(e) => handleBlur('backgroundColor', e.target.value)}
              className="bg-white/5 border-ink-green/10 text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="textColor" className="text-[10px] uppercase tracking-widest font-bold opacity-60">Primary Text & Logo Color</Label>
          <div className="flex gap-4 items-center">
            <Input 
              id="textColor" 
              type="color" 
              value={localTheme.textColor} 
              onChange={(e) => handleColorChange('textColor', e.target.value)}
              className="w-12 h-12 p-1 bg-transparent border-none cursor-pointer"
            />
            <Input 
              type="text" 
              value={localTheme.textColor} 
              onChange={(e) => handleColorChange('textColor', e.target.value)}
              onBlur={(e) => handleBlur('textColor', e.target.value)}
              className="bg-white/5 border-ink-green/10 text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accentColor" className="text-[10px] uppercase tracking-widest font-bold opacity-60">Accent (Gold) Color</Label>
          <div className="flex gap-4 items-center">
            <Input 
              id="accentColor" 
              type="color" 
              value={localTheme.accentColor} 
              onChange={(e) => handleColorChange('accentColor', e.target.value)}
              className="w-12 h-12 p-1 bg-transparent border-none cursor-pointer"
            />
            <Input 
              type="text" 
              value={localTheme.accentColor} 
              onChange={(e) => handleColorChange('accentColor', e.target.value)}
              onBlur={(e) => handleBlur('accentColor', e.target.value)}
              className="bg-white/5 border-ink-green/10 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-ink-green/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin text-gold" />}
          <span className="text-[9px] uppercase tracking-widest text-ink-green/40">
            {isSaving ? 'Synchronizing CSS Variables...' : 'All changes saved locally'}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => resetToDefault()}
          className="text-[9px] uppercase tracking-widest font-bold border-ink-green/20 hover:bg-ink-green/5"
        >
          <RotateCcw className="w-3 h-3 mr-2" />
          Reset to Default
        </Button>
      </div>
    </div>
  );
};
