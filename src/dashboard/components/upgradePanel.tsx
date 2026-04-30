import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Box, Droplets, Zap } from "lucide-react";
import { toast } from "sonner";

export const UpgradePanel = () => {
  const toggleFeature = (name: string) => {
    toast.success(`${name} feature status updated`, {
      description: "Site performance will be re-evaluated in the next build."
    });
  };

  const features = [
    { id: '3d', name: "Interactive 3D Pen Rendering", description: "Enables Three.js visualizer on all landing pages.", icon: <Box className="w-5 h-5" />, default: true },
    { id: 'ink', name: "Dynamic Ink Physics", description: "Real-time ink flow simulations in the Aficionado ritual.", icon: <Droplets className="w-5 h-5" />, default: true },
    { id: 'shimmer', name: "Luxe Gold Shimmer Effects", description: "Adds metallic shine to headings and dividers.", icon: <Sparkles className="w-5 h-5" />, default: false },
    { id: 'ai', name: "Predictive Maintenance AI", description: "Predicts when a nib needs pointing based on user usage.", icon: <Zap className="w-5 h-5" />, default: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {features.map((feature) => (
        <Card key={feature.id} className="bg-white/50 backdrop-blur-sm border-ink-green/10 hover:border-ink-green/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ink-green/5 text-ink-green rounded-lg">
                {feature.icon}
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-base font-serif text-ink-green">{feature.name}</CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-widest text-ink-green/50">System Module</CardDescription>
              </div>
            </div>
            <Switch 
              defaultChecked={feature.default} 
              onCheckedChange={() => toggleFeature(feature.name)}
              className="data-[state=checked]:bg-gold"
            />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-ink-green/70 leading-relaxed font-sans mt-2">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
