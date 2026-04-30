import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Bot, User, Trash2, Globe, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  role: string;
  type: 'ai' | 'human';
  status: 'active' | 'inactive';
}

export const AgentManager = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  const [newAgent, setNewAgent] = useState({ name: "", role: "" });

  const addAgent = () => {
    if (!newAgent.name || !newAgent.role) {
      toast.error("Please fill in both name and role");
      return;
    }
    const agent: Agent = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAgent.name,
      role: newAgent.role,
      type: "ai",
      status: "active",
    };
    setAgents([...agents, agent]);
    setNewAgent({ name: "", role: "" });
    toast.success(`${newAgent.name} has been implemented on the site!`);
  };

  const removeAgent = (id: string) => {
    setAgents(agents.filter(a => a.id !== id));
    toast.info("Agent decommissioned");
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Creation Tool */}
        <Card className="lg:col-span-1 border-gold/20 bg-white/50 backdrop-blur-md shadow-lg h-fit">
          <CardHeader>
            <CardTitle className="font-serif text-xl border-b border-gold/10 pb-2">Deploy New Agent</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest text-ink-green/60 pt-2">
              Add automated or human intelligence to the Inkopia experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-bold text-ink-green/70">Agent Name</label>
              <Input 
                placeholder="e.g. Sebastian" 
                value={newAgent.name}
                onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                className="bg-transparent border-b border-ink-green/20 focus:border-gold rounded-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-bold text-ink-green/70">Specialized Role</label>
              <Input 
                placeholder="e.g. Fountain Pen Sommelier" 
                value={newAgent.role}
                onChange={e => setNewAgent({...newAgent, role: e.target.value})}
                className="bg-transparent border-b border-ink-green/20 focus:border-gold rounded-none"
              />
            </div>
            <Button 
              onClick={addAgent}
              className="w-full bg-ink-green text-parchment hover:bg-ink-green/90 transition-all gap-2 mt-4"
            >
              <Plus className="w-4 h-4" /> Implement Agent
            </Button>
          </CardContent>
        </Card>

        {/* List of Implemented Agents */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="border-ink-green/10 bg-white/30 backdrop-blur-sm group hover:border-gold/30 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-ink-green/5 flex items-center justify-center text-ink-green">
                      {agent.type === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-ink-green">{agent.name}</h3>
                      <p className="text-xs text-ink-green/60 italic">{agent.role}</p>
                    </div>
                  </div>
                  <button onClick={() => removeAgent(agent.id)} className="text-destructive/40 hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-6 pt-4 border-t border-ink-green/5 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-ink-green/70">
                    <Globe className="w-3 h-3 text-green-600" />
                    Live on Site
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-ink-green/70">
                    <ShieldCheck className="w-3 h-3 text-gold" />
                    Verified Agent
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};
