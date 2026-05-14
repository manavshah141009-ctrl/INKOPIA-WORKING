import { useParams, Navigate, Link } from 'react-router-dom';
import { useSite } from '@/context/SiteContext';



export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { content } = useSite();

  const page = content.pages?.find(p => p.slug === slug);

  if (!page) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground flex flex-col items-center py-20 px-6">
      {/* Decorative borders — matching logo theme */}
      <div className="page-frame" />

      {/* Navigation */}
      <div className="fixed top-6 left-6 md:top-10 md:left-10 z-50">
        <Link to="/" className="text-[10px] tracking-[0.3em] font-sans uppercase text-ink-green hover:opacity-70 transition-opacity bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-ink-green/10 shadow-sm md:bg-transparent md:backdrop-blur-none md:p-0 md:border-none md:shadow-none">
          &larr; Return
        </Link>
      </div>

      <div className="max-w-3xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="gold-divider mb-8 w-12" />
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-[1.1] mb-12">
          {page.title}
        </h1>
        <div 
          className="prose prose-sm md:prose-base prose-p:font-sans prose-p:font-light prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-foreground text-muted-foreground whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
