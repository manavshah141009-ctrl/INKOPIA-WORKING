import { useParams, Navigate, Link } from 'react-router-dom';
import { useSite } from '@/context/SiteContext';

function CornerStar({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <polygon points="16,0 18,12 32,16 18,20 16,32 14,20 0,16 14,12" />
      <polygon points="16,4 17.5,14 28,16 17.5,18 16,28 14.5,18 4,16 14.5,14" opacity="0.6" />
    </svg>
  );
}

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
      <CornerStar className="corner-star corner-star--tl" />
      <CornerStar className="corner-star corner-star--tr" />
      <CornerStar className="corner-star corner-star--bl" />
      <CornerStar className="corner-star corner-star--br" />

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
