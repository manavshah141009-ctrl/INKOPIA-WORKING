import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useSite } from '@/context/SiteContext';

export default function FountainPen3D() {
  const { content } = useSite();
  const [isAtTop, setIsAtTop] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  
  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Opacity: Invisible in hero (0 to 0.1), fades in afterwards
  const opacity = useTransform(
    smoothProgress,
    [0, 0.1, 0.15],
    [0, 0, 1]
  );

  // Mapping scroll progress to transforms
  // s=0 (Top): Invisible, below logo
  // s>0: Weaving path using vw/vh units so it never goes off screen
  
  const translateX = useTransform(
    smoothProgress,
    [0, 0.1, 0.3, 0.5, 0.7, 1],
    ["0vw", "15vw", "-25vw", "25vw", "-25vw", "0vw"]
  );

  const translateY = useTransform(
    smoothProgress,
    [0, 0.1, 0.3, 0.5, 0.7, 1],
    ["30vh", "10vh", "-5vh", "10vh", "-5vh", "0vh"]
  );

  const rotate = useTransform(
    smoothProgress,
    [0, 0.1, 0.3, 0.5, 0.7, 1],
    [-45, 0, 90, 180, 270, 405] // -45 is Horizontal (Cap Left), 405 (45) is Vertical (Nib Down)
  );

  const scale = useTransform(
    smoothProgress,
    [0, 1],
    [0.85, 0.85] // Keeps the size completely neutral and consistent everywhere
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden perspective-[1200px]"
    >
      {/* Subtle radial glow behind the pen */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[40px]"
        style={{
          background: 'radial-gradient(circle, hsla(43, 72%, 52%, 0.08) 0%, transparent 70%)',
          x: translateX,
          y: translateY,
          opacity: opacity,
          willChange: 'transform, opacity'
        }}
      />

      {/* Main pen image */}
      <motion.img
        src={content.penImage}
        alt="INKOPIA Fountain Pen"
        draggable={false}
        className="max-w-[65%] max-h-[70%] object-contain select-none mix-blend-multiply"
        style={{
          x: translateX,
          y: translateY,
          rotate: rotate,
          scale: scale,
          opacity: opacity,
          filter: 'drop-shadow(0 20px 40px rgba(27, 61, 47, 0.15))',
          willChange: 'transform, opacity'
        }}
      />
    </div>
  );
}
