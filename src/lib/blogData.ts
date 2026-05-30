export interface BlogPost {
  slug: string;
  title: string;
  metaDescription: string;
  publishedDate: string;
  readingTime: string;
  author: {
    name: string;
    role: string;
  };
  content: {
    heading?: string;
    paragraphs: string[];
  }[];
  relatedPostSlugs: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-clean-a-fountain-pen-properly",
    title: "How to Clean a Fountain Pen Properly: The Essential Guide",
    metaDescription: "Learn how to clean your luxury fountain pen step-by-step. Discover safe flushing methods and why professional maintenance is vital for ink flow.",
    publishedDate: "May 25, 2026",
    readingTime: "5 min read",
    author: {
      name: "Manav Shah",
      role: "Lead Fountain Pen Specialist"
    },
    content: [
      {
        heading: "The Importance of Regular Cleaning",
        paragraphs: [
          "A luxury fountain pen is more than a simple writing instrument—it is an engineering masterpiece. Inside its feed and nib is a delicate capillary system that relies on micro-channels to deliver ink perfectly to paper. Over time, microscopic ink particles can settle, dry, and gradually clog these channels. This leads to scratchy writing, skipped strokes, or complete ink starvation.",
          "Regular cleaning ensures that old ink residue is entirely flushed away, protecting the precious metals of your nib and guaranteeing a velvety-smooth writing experience every time you put pen to paper."
        ]
      },
      {
        heading: "Step-by-Step Flushing Guide at Home",
        paragraphs: [
          "Step 1: Carefully disassemble your pen by unscrewing the section (where you hold the pen) from the barrel. Remove the converter or empty cartridge.",
          "Step 2: Flush the section by passing room-temperature, distilled water through it. You can use a specialized bulb syringe to gently push water through the nib assembly until the water runs completely clear. Avoid hot water, as it can warp vintage materials like ebonite.",
          "Step 3: If you are using a piston-filler pen, draw distilled water into the chamber and expel it repeatedly until there is no trace of residual colour.",
          "Step 4: Dry the nib naturally. Wrap the section gently in a lint-free microfiber cloth and let it stand nib-down in a small glass overnight. Capillary action will pull any remaining moisture out of the feed safely."
        ]
      },
      {
        heading: "When to Seek Professional Concierge Care",
        paragraphs: [
          "While home flushing is excellent for routine colour changes, certain situations require expert hands. Stubborn clogs from pigmented or iron-gall inks, vintage feeds with delicate fins, or micro-adjustments to the nib should never be forced at home.",
          "At InKoPia, our Masterpiece Concierge Ritual offers a dedicated on-site specialist who will meticulously inspect, flush, and hand-restore perfect capillary flow for your prized writing instrument, using strictly zero ultrasonic machines that can crack fragile vintage resins."
        ]
      }
    ],
    relatedPostSlugs: ["common-pen-care-mistakes-to-avoid", "why-professional-pen-cleaning-extends-pen-life"]
  },
  {
    slug: "when-to-refill-your-pen-ink",
    title: "When to Refill Your Fountain Pen Ink: Avoiding Dry Feeds",
    metaDescription: "Do you know when to refill your fountain pen? Read our expert guide on ink capacity, flow indicators, and keeping your feed healthy.",
    publishedDate: "May 27, 2026",
    readingTime: "4 min read",
    author: {
      name: "Manav Shah",
      role: "Lead Fountain Pen Specialist"
    },
    content: [
      {
        heading: "Recognizing the Early Warning Signs",
        paragraphs: [
          "Waiting until your pen runs completely dry is one of the most common oversights in fountain pen ownership. A dry feed is not just inconvenient; it can cause ink to cake inside the micro-grooves, leading to hard starts next time. The first signs of low ink include a sudden thinning of the line width, a lighter shade of colour than usual, or a scratchy feel when writing.",
          "If your pen begins to feel dry, it is highly recommended to refill it immediately to maintain continuous capillary pressure within the ink chamber."
        ]
      },
      {
        heading: "The Danger of Clogged Channels",
        paragraphs: [
          "When a pen sits empty or very low on ink, air enters the chamber. This exposure to air accelerates the evaporation of the water solvent in the ink, leaving behind pure dye and resin pigments. These concentrated solids settle in the feed fins, clogging the channels.",
          "Keeping your fountain pen consistently refilled acts as a barrier, keeping the ink in its fluid state and preventing crystallization in the delicate feed system."
        ]
      },
      {
        heading: "The Sommelier Ink Selection Experience",
        paragraphs: [
          "Refilling is also an opportunity to elevate your writing ritual. Rather than buying bulky bottles that sit on a shelf, InKoPia offers a private Sommelier ink service. Our mobile specialists arrive directly at your residence or executive office with a library of premium curated inks, refilling your instrument on the spot with exquisite shades tailored to your personal aesthetic."
        ]
      }
    ],
    relatedPostSlugs: ["how-to-clean-a-fountain-pen-properly", "why-professional-pen-cleaning-extends-pen-life"]
  },
  {
    slug: "common-pen-care-mistakes-to-avoid",
    title: "4 Common Fountain Pen Care Mistakes You Must Avoid",
    metaDescription: "Avoid costly damages to your luxury writing instruments. Discover the top fountain pen mistakes, from wrong cleaning fluids to dangerous pressure.",
    publishedDate: "May 29, 2026",
    readingTime: "6 min read",
    author: {
      name: "Manav Shah",
      role: "Lead Fountain Pen Specialist"
    },
    content: [
      {
        heading: "1. Cleaning with Tap Water and Harsh Solvents",
        paragraphs: [
          "Tap water contains minerals, calcium, and chlorine that can deposit scale inside the micro-channels of your pen's feed. Over time, these mineral buildups are incredibly difficult to remove and permanently choke the ink flow. Even worse is using rubbing alcohol, acetone, or domestic soaps, which will instantly dissolve vintage resins and crack modern acrylic barrels."
        ]
      },
      {
        heading: "2. Letting Ink Dry Out Completely Inside the Pen",
        paragraphs: [
          "A fountain pen is meant to be written with. If you leave a pen inked up and unused in a drawer for weeks, the moisture evaporates, leaving behind a hard shell of pigment that blocks the feed completely. If you do not plan to use a pen for more than two weeks, always flush it clean first."
        ]
      },
      {
        heading: "3. Applying Too Much Writing Pressure",
        paragraphs: [
          "Unlike ballpoint pens which require downward force to roll a steel ball, fountain pens operate purely on capillary action. The nib should glide across the paper under its own weight. Pressing down hard bends the tines out of alignment, causing ink leakage or permanent nib splay."
        ]
      },
      {
        heading: "4. Relying on Ultrasonic Cleaning Machines",
        paragraphs: [
          "Many amateur guides suggest dropping sections into ultrasonic jewelry cleaners. For vintage pens, gold-plated accents, or hand-painted Urushi lacquers, the high-frequency micro-vibrations can cause gold plating to flake off and trigger microscopic fractures in delicate resins. Hand-flushing is always the safest, most luxurious choice."
        ]
      }
    ],
    relatedPostSlugs: ["how-to-clean-a-fountain-pen-properly", "why-professional-pen-cleaning-extends-pen-life"]
  },
  {
    slug: "why-professional-pen-cleaning-extends-pen-life",
    title: "Why Professional Pen Cleaning Extends Pen Life Permanently",
    metaDescription: "Discover why expert care, distilled hand-flushing, and professional concierge detailing can extend the lifetime of your luxury fountain pens.",
    publishedDate: "May 30, 2026",
    readingTime: "5 min read",
    author: {
      name: "Manav Shah",
      role: "Lead Fountain Pen Specialist"
    },
    content: [
      {
        heading: "The Architecture of Luxury Instruments",
        paragraphs: [
          "Luxury fountain pens from legendary houses like Montblanc, Visconti, Namiki, and Pelikan are crafted to last generations. However, their longevity depends directly on how their internal systems are preserved. A gold nib can write forever, but a clogged, scaling feed or dried inner chamber can ruin the feed capillary pressure, leading to ink leakage and damaged threads."
        ]
      },
      {
        heading: "Beyond Simple Rinsing: The Specialist's Touch",
        paragraphs: [
          "A simple rinse under water only clears loose ink. A professional deep clean involves careful, non-destructive flushing using pure pH-balanced solutions that gently break down stubborn dye particles without reacting with the barrel’s celluloid or ebonite materials.",
          "Our specialists also carefully inspect alignment under loupes and ensure that internal converters and pistons are lubricated with premium, pure silicone grease to keep mechanisms operating with buttery smoothness."
        ]
      },
      {
        heading: "The InKoPia Standard of Care",
        paragraphs: [
          "With our on-site Concierge Ritual, your pen collection is treated with museum-grade care. We set up a private, pristine cleaning space at your office or home and restore your instruments to absolute peak condition, refilling them with fresh sommelier-curated ink so you can immediately return to the joy of signing and sketching."
        ]
      }
    ],
    relatedPostSlugs: ["how-to-clean-a-fountain-pen-properly", "common-pen-care-mistakes-to-avoid"]
  }
];
