import React, { useState, useEffect } from 'react';
import { schemaApi } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Plus, 
  Trash2, 
  Save, 
  Settings, 
  Layers,
  ChevronRight,
  Code
} from 'lucide-react';
import { toast } from 'sonner';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'image' | 'date' | 'boolean' | 'rich-text';
  required: boolean;
}

interface Schema {
  _id: string;
  collectionName: string;
  displayName: string;
  fields: Field[];
}

export const BackendEditor = () => {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    try {
      const { data } = await schemaApi.getAll();
      setSchemas(data);
    } catch (err) {
      toast.error('Failed to load backend structures');
    }
  };

  const handleAddField = () => {
    if (!selectedSchema) return;
    const newField: Field = {
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false
    };
    setSelectedSchema({
      ...selectedSchema,
      fields: [...selectedSchema.fields, newField]
    });
  };

  const handleUpdateField = (index: number, updates: Partial<Field>) => {
    if (!selectedSchema) return;
    const updatedFields = [...selectedSchema.fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setSelectedSchema({ ...selectedSchema, fields: updatedFields });
  };

  const handleRemoveField = (index: number) => {
    if (!selectedSchema) return;
    const updatedFields = selectedSchema.fields.filter((_, i) => i !== index);
    setSelectedSchema({ ...selectedSchema, fields: updatedFields });
  };

  const saveSchema = async () => {
    if (!selectedSchema) return;
    setIsSaving(true);
    try {
      await schemaApi.update(selectedSchema._id, selectedSchema);
      toast.success('Backend structure updated successfully');
      fetchSchemas();
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Sidebar: Collections List */}
      <div className="space-y-4 border-r border-ink-green/10 pr-6">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-ink-green">Collections</h2>
        </div>
        
        {schemas.map(schema => (
          <button
            key={schema._id}
            onClick={() => setSelectedSchema(schema)}
            className={`w-full flex items-center justify-between p-3 rounded-md transition-all ${
              selectedSchema?._id === schema._id 
                ? 'bg-ink-green text-parchment shadow-lg translate-x-1' 
                : 'hover:bg-ink-green/5 text-ink-green/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">{schema.displayName}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
        ))}

        <Button variant="outline" className="w-full mt-4 border-dashed border-ink-green/30 text-ink-green/50">
          <Plus className="w-4 h-4 mr-2" /> New Collection
        </Button>
      </div>

      {/* Main Area: Schema Editor */}
      <div className="md:col-span-2 space-y-8">
        {selectedSchema ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center border-b border-ink-green/10 pb-4 mb-6">
              <div>
                <h3 className="text-2xl font-serif font-bold text-ink-green">{selectedSchema.displayName}</h3>
                <code className="text-[10px] text-gold uppercase tracking-widest">{selectedSchema.collectionName}</code>
              </div>
              <Button onClick={saveSchema} disabled={isSaving} className="bg-gold text-ink-green hover:bg-gold/80">
                {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Structure</>}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-ink-green/60">Fields Configuration</h4>
                <Button variant="ghost" size="sm" onClick={handleAddField} className="text-gold hover:text-gold/80 hover:bg-gold/5">
                  <Plus className="w-3 h-3 mr-1" /> Add Field
                </Button>
              </div>

              <div className="space-y-3">
                {selectedSchema.fields.map((field, index) => (
                  <div key={index} className="p-4 border border-ink-green/10 bg-white/30 backdrop-blur-sm rounded-lg flex items-end gap-4 group">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[9px] uppercase tracking-widest opacity-60">Field Label</Label>
                      <Input 
                        value={field.label}
                        onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                        className="bg-transparent border-ink-green/20"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-[9px] uppercase tracking-widest opacity-60">Database ID (Key)</Label>
                      <Input 
                        value={field.name}
                        onChange={(e) => handleUpdateField(index, { name: e.target.value })}
                        className="bg-transparent border-ink-green/20 font-mono text-xs"
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label className="text-[9px] uppercase tracking-widest opacity-60">Type</Label>
                      <select 
                        value={field.type}
                        onChange={(e) => handleUpdateField(index, { type: e.target.value as any })}
                        className="w-full bg-white/50 border-ink-green/20 rounded-md p-2 text-xs focus:ring-1 focus:ring-gold outline-none"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="image">Image</option>
                        <option value="date">Date</option>
                        <option value="boolean">Boolean</option>
                        <option value="rich-text">Rich Text</option>
                      </select>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveField(index)}
                      className="text-destructive/40 hover:text-destructive hover:bg-destructive/10 mb-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-ink-green/10 rounded-xl bg-ink-green/5">
            <Settings className="w-12 h-12 text-ink-green/20 mb-4 animate-pulse" />
            <h3 className="text-lg font-serif font-bold text-ink-green/40">Select a collection to tune its architecture</h3>
            <p className="text-xs text-ink-green/30 mt-2 max-w-xs">You can dynamically add fields to your backend without writing a single line of code.</p>
          </div>
        )}
      </div>
    </div>
  );
};
