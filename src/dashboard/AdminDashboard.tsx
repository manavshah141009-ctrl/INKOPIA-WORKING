import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar'
import { OrderTable } from './components/orderTable'
import { ClientGrid } from './components/clientGrid'
import { AgentManager } from './components/agentManager'
import { UpgradePanel } from './components/upgradePanel'
import { ContentEditor } from './components/ContentEditor'
import { ThemeController } from './components/ThemeController'
import { SiteSettings } from './components/SiteSettings'
import { BackendEditor } from './components/BackendEditor'
import { InkManager } from './components/InkManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard, Users, Bot, Settings, LogOut, ChevronRight, Palette, FileText, Settings2, Sparkles, Database, Droplets } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { MapPin as MapPinIcon } from 'lucide-react'
import { PincodeManager } from './components/PincodeManager'



export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('orders');

  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-full bg-background text-ink-green font-sans">
        
        {/* Decorative page frame */}
        <div className="page-frame opacity-30 pointer-events-none" />

        <Sidebar className="border-r border-ink-green/10 bg-background/90 backdrop-blur-xl">
          <SidebarHeader className="p-6 border-b border-ink-green/5">
            <Link to="/" className="flex flex-col items-center">
              <img
                src="/logo.png"
                alt="Inkopia"
                className="h-[68px] w-auto mb-1"
              />
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-ink-green/60">Admin HQ</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveView('orders')}
                  className={`h-10 transition-all ${activeView === 'orders' ? 'bg-ink-green/10 text-ink-green font-bold' : 'text-ink-green/70 hover:bg-ink-green/5 hover:text-ink-green'}`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase tracking-widest">Control Room</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveView('clients')}
                  className={`h-10 transition-all ${activeView === 'clients' ? 'bg-ink-green/10 text-ink-green font-bold' : 'text-ink-green/70 hover:bg-ink-green/5 hover:text-ink-green'}`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase tracking-widest">Client Portal</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveView('tuning')}
                  className={`h-10 transition-all ${activeView === 'tuning' ? 'bg-ink-green/10 text-ink-green font-bold' : 'text-ink-green/70 hover:bg-ink-green/5 hover:text-ink-green'}`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase tracking-widest">Content Engine</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveView('theme')}
                  className={`h-10 transition-all ${activeView === 'theme' ? 'bg-ink-green/10 text-ink-green font-bold' : 'text-ink-green/70 hover:bg-ink-green/5 hover:text-ink-green'}`}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase tracking-widest">Visual Identity</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveView('settings')}
                  className={`h-10 transition-all ${activeView === 'settings' ? 'bg-ink-green/10 text-ink-green font-bold' : 'text-ink-green/70 hover:bg-ink-green/5 hover:text-ink-green'}`}
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase tracking-widest">Site Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveView('agents')}
                  className={`h-10 transition-all ${activeView === 'agents' ? 'bg-ink-green/10 text-ink-green font-bold' : 'text-ink-green/70 hover:bg-ink-green/5 hover:text-ink-green'}`}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase tracking-widest">Agent Logic</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveView('upgrades')}
                  className={`h-10 transition-all ${activeView === 'upgrades' ? 'bg-ink-green/10 text-ink-green font-bold' : 'text-ink-green/70 hover:bg-ink-green/5 hover:text-ink-green'}`}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase tracking-widest">Upgrades</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveView('backend')}
                  className={`h-10 transition-all ${activeView === 'backend' ? 'bg-ink-green/10 text-ink-green font-bold' : 'text-ink-green/70 hover:bg-ink-green/5 hover:text-ink-green'}`}
                >
                  <Database className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase tracking-widest">Architecture</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveView('inks')}
                  className={`h-10 transition-all ${activeView === 'inks' ? 'bg-ink-green/10 text-ink-green font-bold' : 'text-ink-green/70 hover:bg-ink-green/5 hover:text-ink-green'}`}
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase tracking-widest">Ink Vault</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveView('pincodes')}
                  className={`h-10 transition-all ${activeView === 'pincodes' ? 'bg-ink-green/10 text-ink-green font-bold' : 'text-ink-green/70 hover:bg-ink-green/5 hover:text-ink-green'}`}
                >
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase tracking-widest">Service Zones</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="absolute bottom-8 left-4 right-4">
              <button 
                onClick={() => navigate('/')}
                className="w-full h-10 flex items-center justify-center gap-2 border border-ink-green/20 text-ink-green/60 hover:text-ink-green hover:border-ink-green transition-all bg-white/10"
              >
                <LogOut className="w-3 h-3" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Exit HQ</span>
              </button>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <SidebarTrigger className="fixed top-4 left-4 z-[100] md:hidden bg-white/80 border border-ink-green/20" />

        <main className="flex-1 relative z-10 overflow-y-auto p-6 md:p-12 lg:p-16">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <p className="text-[10px] tracking-[0.5em] uppercase text-ink-green/50 mb-3">System Intelligence</p>
              <h1 className="text-4xl md:text-5xl font-serif text-ink-green leading-tight font-bold">
                The Architect's<br />Dashboard.
              </h1>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-green-700 bg-green-100/50 px-2 py-1 rounded tracking-widest uppercase">System Online</span>
              <span className="text-[9px] text-ink-green/40 mt-1 uppercase tracking-widest">V 2.1.0 Premium</span>
            </div>
          </header>

          <div className="w-full space-y-10">
            {activeView === 'orders' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <OrderTable />
              </div>
            )}
            {activeView === 'tuning' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gold" />
                  <h2 className="text-xl font-serif font-bold text-ink-green">Content Management</h2>
                </div>
                <ContentEditor />
              </div>
            )}
            {activeView === 'theme' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-gold" />
                  <h2 className="text-xl font-serif font-bold text-ink-green">Visual Identity</h2>
                </div>
                <ThemeController />
              </div>
            )}
            {activeView === 'settings' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 className="w-5 h-5 text-gold" />
                  <h2 className="text-xl font-serif font-bold text-ink-green">Advanced Settings</h2>
                </div>
                <SiteSettings />
              </div>
            )}
            {activeView === 'clients' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <ClientGrid />
              </div>
            )}
            {activeView === 'agents' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <AgentManager />
              </div>
            )}
            {activeView === 'upgrades' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <UpgradePanel />
              </div>
            )}
            {activeView === 'backend' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-gold" />
                  <h2 className="text-xl font-serif font-bold text-ink-green">Backend Architecture</h2>
                </div>
                <BackendEditor />
              </div>
            )}
            {activeView === 'inks' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-4">
                <InkManager />
              </div>
            )}
            {activeView === 'pincodes' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPinIcon className="w-5 h-5 text-gold" />
                  <h2 className="text-xl font-serif font-bold text-ink-green">Service Coverage Zones</h2>
                </div>
                <PincodeManager />
              </div>
            )}
          </div>

          <footer className="mt-20 pt-10 border-t border-ink-green/5 flex justify-between items-center opacity-40">
            <p className="text-[9px] uppercase tracking-widest">© 2024 Inkopia Experience • Command Center</p>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-ink-green" />
            </div>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  )
}