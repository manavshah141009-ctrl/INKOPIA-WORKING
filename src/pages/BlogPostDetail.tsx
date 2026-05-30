import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { blogPosts } from "@/lib/blogData";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar, Clock, ArrowLeft, ChevronRight, User, BookOpen } from "lucide-react";
import { useOrders } from "@/context/OrderContext";

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isLoggedIn = localStorage.getItem('inkopia_auth') === 'true';
  const { blogPosts: apiPosts } = useOrders();

  const activePosts = apiPosts && apiPosts.length > 0 ? apiPosts : blogPosts;
  const post = activePosts.find(p => p.slug === slug);

  const getAuthorName = (p: any) => {
    if (p.author && typeof p.author === 'object') return p.author.name;
    return p.author || "Manav Shah";
  };

  const getAuthorRole = (p: any) => {
    if (p.author && typeof p.author === 'object') return p.author.role;
    return p.authorRole || "Lead Fountain Pen Specialist";
  };

  const formatReadingTime = (time: any) => {
    if (typeof time === 'string') return time;
    return `${time || 5} min read`;
  };

  useEffect(() => {
    if (!post) return;

    // Set page title
    document.title = `${post.title} — InKoPia`;

    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', post.metaDescription);

    // Set canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/blog/${post.slug}`);

    // Injected Article Structured Data (Schema.org)
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.metaDescription,
      "datePublished": post.publishedDate ? new Date(post.publishedDate).toISOString() : new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": getAuthorName(post),
        "jobTitle": getAuthorRole(post)
      },
      "publisher": {
        "@type": "Organization",
        "name": "InKoPia",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${window.location.origin}/blog/${post.slug}`
      }
    };

    let scriptTag = document.querySelector('#blog-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('id', 'blog-jsonld');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLd);

    // Scroll to top on load
    window.scrollTo({ top: 0, behavior: 'instant' });

    return () => {
      // Clean up script tag on unmount
      const existingScript = document.querySelector('#blog-jsonld');
      if (existingScript) existingScript.remove();
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#FDFBF7] text-ink-green p-6 text-center">
        <h2 className="font-serif text-3xl font-bold mb-4">Post Not Found</h2>
        <p className="text-sm font-sans mb-8">Sorry, the article you are looking for does not exist or has been relocated.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-sans text-gold hover:opacity-85 font-extrabold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Chronicle
        </Link>
      </div>
    );
  }

  const relatedSlugs = post.relatedPostSlugs || (post.relatedPosts ? post.relatedPosts.split(',').map((s: string) => s.trim()) : []);
  const relatedPosts = activePosts.filter(p => p.slug !== slug && relatedSlugs.includes(p.slug));

  return (
    <div className="relative min-h-screen w-full bg-[#FDFBF7] text-ink-green selection:bg-gold selection:text-black">
      {/* Decorative Page Frame */}
      <div className="page-frame opacity-35 pointer-events-none" />

      {/* Blog Top Header Nav */}
      <nav className={`relative z-20 border-b border-ink-green/10 ${isMobile ? 'px-6 py-4' : 'px-12 py-6'} flex justify-between items-center bg-[#FDFBF7]/80 backdrop-blur-md sticky top-0`}>
        <Link to="/blog" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <ArrowLeft className="w-4 h-4 text-gold" />
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-ink-green/60">The Chronicle</span>
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

      {/* Blog Detail Article */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <article className="space-y-12">
          {/* Metadata & Title */}
          <header className="space-y-6">
            <Link to="/blog" className="inline-flex items-center gap-2 text-[9px] font-sans text-gold hover:opacity-85 font-extrabold uppercase tracking-widest">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Chronicle
            </Link>
            <h1 className="font-serif font-black text-3xl md:text-5xl text-ink-green leading-tight">
              {post.title}
            </h1>

            {/* Author Card Row */}
            <div className="flex flex-wrap items-center justify-between gap-6 border-y border-ink-green/10 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ink-green/10 flex items-center justify-center border border-ink-green/5">
                  <User className="w-5 h-5 text-ink-green/60" />
                </div>
                <div>
                  <p className="text-xs font-serif font-bold text-ink-green">{getAuthorName(post)}</p>
                  <p className="text-[9px] uppercase tracking-widest text-[#666] font-bold">{getAuthorRole(post)}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-[9px] uppercase tracking-widest text-ink-green/60 font-bold font-sans">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gold" /> {post.publishedDate}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold" /> {formatReadingTime(post.readingTime)}</span>
              </div>
            </div>
          </header>

          {/* Article Main Body */}
          <section className="prose prose-stone font-sans text-ink-green leading-relaxed text-sm md:text-base space-y-8 font-medium tracking-wide">
            {post.content.map((block, idx) => (
              <div key={idx} className="space-y-4">
                {block.heading && (
                  <h2 className="font-serif font-bold text-xl md:text-2xl text-ink-green pt-4 leading-tight">
                    {block.heading}
                  </h2>
                )}
                {block.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-ink-green/80 text-justify">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* Inline Link Back to Services */}
          <div className="p-6 border border-ink-green/10 bg-white/40 mt-12 text-center space-y-4 rounded-none relative">
            <p className="text-xs text-ink-green/80 font-sans leading-relaxed">
              Proper fountain pen care keeps your inks flowing smoothly. If your luxury instrument requires detailing, cleaning, or a freshSommelier ink refill, consider scheduling our signature Concierge Ritual.
            </p>
            <Link 
              to={isLoggedIn ? "/dashboard" : "/signup"} 
              className="inline-flex items-center gap-2 text-[10px] text-gold uppercase tracking-[0.25em] font-sans font-bold hover:underline"
            >
              Request On-Site Service <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </article>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-24 border-t border-ink-green/10 pt-16 space-y-8">
            <h3 className="font-serif font-black text-xl md:text-2xl text-ink-green text-center">Related Chronicles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPosts.map(rPost => (
                <Link 
                  key={rPost.slug} 
                  to={`/blog/${rPost.slug}`} 
                  className="group block bg-white border border-ink-green/10 hover:border-gold/50 p-6 hover:-translate-y-1 transition-all duration-300 rounded-none shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[8px] uppercase tracking-widest text-ink-green/50 font-bold font-sans">
                      <span>{rPost.publishedDate}</span>
                      <span>•</span>
                      <span>{formatReadingTime(rPost.readingTime)}</span>
                    </div>
                    <h4 className="font-serif font-black text-lg text-ink-green group-hover:text-gold transition-colors leading-tight">
                      {rPost.title}
                    </h4>
                    <p className="text-xs text-ink-green/70 leading-relaxed font-sans truncate">
                      {rPost.metaDescription}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-green/10 bg-[#D3C2A3]/30 backdrop-blur-md pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
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
