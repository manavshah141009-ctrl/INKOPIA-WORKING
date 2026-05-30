import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { blogPosts, BlogPost } from "@/lib/blogData";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search, Calendar, Clock, BookOpen, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogListing() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const isLoggedIn = localStorage.getItem('inkopia_auth') === 'true';

  useEffect(() => {
    document.title = "The InKoPia Chronicle — Fountain Pen Care, Cleaning & Ink Insights";
    
    // Set meta description dynamically
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Explore expert fountain pen care guides, deep cleaning tutorials, and luxury refilling ritual insights from InKoPia's lead specialists.");

    // Set canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.metaDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full bg-[#FDFBF7] text-ink-green selection:bg-gold selection:text-black">
      {/* Decorative Page Frame */}
      <div className="page-frame opacity-35 pointer-events-none" />

      {/* Luxury Blog Top Header Nav */}
      <nav className={`relative z-20 border-b border-ink-green/10 ${isMobile ? 'px-6 py-4' : 'px-12 py-6'} flex justify-between items-center bg-[#FDFBF7]/80 backdrop-blur-md sticky top-0`}>
        <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <img src="/logo.png" alt="InKoPia" className="h-[38px] w-auto mix-blend-multiply" />
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-ink-green/60">Chronicle</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-[10px] tracking-[0.25em] uppercase font-bold text-ink-green/80 hover:text-gold transition-colors">Home</Link>
          <Link 
            to={isLoggedIn ? "/dashboard" : "/signup"} 
            className="text-[10px] tracking-[0.25em] uppercase font-bold bg-ink-green text-[#D5C8AD] px-5 py-2 rounded-none hover:bg-ink-green/90 transition-colors shadow-sm"
          >
            {isLoggedIn ? "Dashboard" : "Sign In"}
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <header className="text-center mb-16 space-y-4">
          <p className="text-[9px] tracking-[0.5em] uppercase text-gold font-sans font-bold">InKoPia Rituals & Care</p>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-ink-green leading-none">
            The Chronicle.
          </h1>
          <p className="max-w-lg mx-auto text-xs md:text-sm text-ink-green/75 leading-relaxed font-sans font-medium tracking-wide">
            Impeccable insights, hand-flushing rituals, and absolute preservation guidelines for luxury fountain pen collectors.
          </p>
          
          {/* Elegant Search Bar */}
          <div className="pt-8 max-w-md mx-auto">
            <div className="relative border-b-2 border-ink-green/20 focus-within:border-ink-green transition-colors pb-2 flex items-center">
              <Search className="w-4 h-4 text-ink-green/40 mr-3" />
              <input 
                type="text" 
                placeholder="Search maintenance articles..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-ink-green font-sans font-medium placeholder:text-ink-green/30"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="text-xs text-ink-green/40 hover:text-ink-green tracking-widest font-sans uppercase font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Featured Post (If first element is present and search is empty) */}
        {filteredPosts.length > 0 && searchQuery === "" && (
          <section className="mb-16">
            <p className="text-[8px] tracking-[0.4em] font-extrabold uppercase text-gold mb-3 font-sans">Featured Care Guide</p>
            <Link to={`/blog/${filteredPosts[0].slug}`} className="group block bg-white border border-ink-green/10 hover:border-gold/50 transition-all duration-500 rounded-none shadow-sm hover:shadow-md relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-ink-green/60 font-bold font-sans">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gold" /> {filteredPosts[0].publishedDate}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gold" /> {filteredPosts[0].readingTime}</span>
                    </div>
                    <h2 className="font-serif font-black text-2xl md:text-3xl lg:text-4xl text-ink-green group-hover:text-gold transition-colors leading-tight">
                      {filteredPosts[0].title}
                    </h2>
                    <p className="text-xs md:text-sm text-ink-green/75 leading-relaxed font-sans font-medium tracking-wide">
                      {filteredPosts[0].metaDescription}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-ink-green/10">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest text-[#666] font-bold">Author</span>
                      <span className="text-xs font-serif font-bold text-ink-green">{filteredPosts[0].author.name}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-ink-green font-extrabold group-hover:gap-2 transition-all">
                      Read Article <ChevronRight className="w-4 h-4 text-gold" />
                    </span>
                  </div>
                </div>
                <div className="bg-ink-green/5 p-12 flex items-center justify-center border-t md:border-t-0 md:border-l border-ink-green/10 relative overflow-hidden min-h-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent z-10" />
                  <BookOpen className="w-24 h-24 text-ink-green/10 absolute -bottom-4 -right-4 rotate-12" />
                  <div className="text-center space-y-2 relative z-20">
                    <span className="text-[7px] uppercase tracking-[0.4em] font-extrabold text-gold block">Official InKoPia Guild</span>
                    <span className="font-serif italic text-3xl font-black text-ink-green/30 select-none">Preservation Rituals</span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Blog Post Grid */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-ink-green/10 pb-4 mb-8">
            <h3 className="font-serif font-black text-xl md:text-2xl text-ink-green">
              {searchQuery ? `Search Results (${filteredPosts.length})` : "All Preservation Guides"}
            </h3>
            <span className="text-[9px] tracking-widest text-ink-green/50 font-bold uppercase">{filteredPosts.length} Articles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full text-center py-16 border border-dashed border-ink-green/20 p-8 bg-white/30">
                <p className="text-sm font-sans text-ink-green/60">No articles matched your search query. Please try searching for 'cleaning' or 'ink'.</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-xs font-sans text-gold underline font-bold uppercase tracking-widest"
                >
                  Show All Posts
                </button>
              </div>
            ) : (
              // If featured is displayed, skip the first one in the loop unless searching
              filteredPosts.slice(searchQuery === "" ? 1 : 0).map((post) => (
                <Link 
                  key={post.slug} 
                  to={`/blog/${post.slug}`} 
                  className="group flex flex-col justify-between bg-white border border-ink-green/10 hover:border-gold/50 p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 rounded-none shadow-sm hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-ink-green/50 font-bold font-sans">
                      <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5 text-gold" /> {post.publishedDate}</span>
                      <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-gold" /> {post.readingTime}</span>
                    </div>
                    <h3 className="font-serif font-black text-xl text-ink-green group-hover:text-gold transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs text-ink-green/75 leading-relaxed font-sans font-medium tracking-wide">
                      {post.metaDescription}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-ink-green/5 mt-8">
                    <span className="text-[9px] text-[#666] font-extrabold uppercase font-sans">By {post.author.name}</span>
                    <span className="text-[9px] uppercase tracking-widest text-ink-green font-extrabold flex items-center gap-1 group-hover:gap-1.5 transition-all">
                      Read <ChevronRight className="w-3.5 h-3.5 text-gold" />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 p-8 md:p-12 border border-gold/25 bg-[hsl(var(--gold)/0.03)] text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--gold)/0.01)] to-transparent pointer-events-none" />
          <p className="text-[9px] tracking-[0.4em] font-extrabold uppercase text-gold font-sans">IMPECCABLE INSTRUMENT CARE</p>
          <h2 className="font-serif font-black text-2xl md:text-3xl text-ink-green leading-snug">
            Restore the Glory of Your Fountain Pen Collection
          </h2>
          <p className="max-w-md mx-auto text-xs text-ink-green/80 leading-relaxed font-sans font-medium">
            Don't risk cleaning your fine writing instruments with harsh domestic methods. Let our senior concierge specialists meticulously flush, lubricate, and hand-refill them with exquisite sommelier inks.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => navigate(isLoggedIn ? "/dashboard" : "/signup")}
              className="bg-ink-green text-[#D5C8AD] font-sans text-[10px] uppercase font-bold tracking-[0.3em] px-8 py-4 hover:bg-gold hover:text-black transition-colors"
            >
              Book Concierge Ritual
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-green/10 bg-[#D3C2A3]/30 backdrop-blur-md pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-6">
          <Link to="/" className="inline-block hover:opacity-85">
            <img src="/logo.png" alt="InKoPia" className="h-10 w-auto mix-blend-multiply mx-auto" />
          </Link>
          <p className="text-[10px] text-ink-green/50 uppercase tracking-[0.2em] font-sans font-medium">
            © 2026 InKoPia. The Art of Fountain Pen Restoration & Care.
          </p>
        </div>
      </footer>
    </div>
  );
}
