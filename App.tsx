import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { DitherBackground } from './components/DitherShader';
import { FloatingObject } from './components/FloatingObject';
import { GeminiChat } from './components/GeminiChat';
import { Project } from './types';

// Mock Data
const projects: Project[] = [
  {
    id: '01',
    title: 'Exo-Frame',
    category: 'Industrial Design',
    year: '2024',
    description: 'Generative titanium structure for next-gen prosthetics. Optimized using biological growth algorithms.',
    image: 'https://picsum.photos/600/400?grayscale&blur=2'
  },
  {
    id: '02',
    title: 'Neural Link V2',
    category: 'Interface',
    year: '2025',
    description: 'Brain-Computer Interface conceptual hardware. Minimal latency, maximum bandwidth.',
    image: 'https://picsum.photos/600/401?grayscale&blur=2'
  },
  {
    id: '03',
    title: 'Void Lamp',
    category: 'Lighting',
    year: '2023',
    description: 'A lighting fixture that absorbs 99% of ambient light when inactive. Vantablack coating.',
    image: 'https://picsum.photos/600/402?grayscale&blur=2'
  },
  {
    id: '04',
    title: 'Aerospike Drone',
    category: 'Industrial Design',
    year: '2025',
    description: 'Autonomous surveillance unit with silent propulsion systems and adaptive camouflage plating.',
    image: 'https://picsum.photos/600/403?grayscale&blur=2'
  },
  {
    id: '05',
    title: 'Haptic Glove',
    category: 'Interface',
    year: '2024',
    description: 'Full-immersion feedback device for VR environments. Simulates texture, weight, and temperature.',
    image: 'https://picsum.photos/600/404?grayscale&blur=2'
  },
  {
    id: '06',
    title: 'Monolith Server',
    category: 'Industrial Design',
    year: '2023',
    description: 'Decentralized data storage unit. Passive cooling tower design for minimal energy footprint.',
    image: 'https://picsum.photos/600/405?grayscale&blur=2'
  }
];

const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight === 0) return;
      const scroll = totalScroll / windowHeight;
      setScrollProgress(scroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter Logic
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];
  const years = ['All', ...Array.from(new Set(projects.map(p => p.year))).sort().reverse()];

  const filteredProjects = projects.filter(project => {
    const categoryMatch = categoryFilter === 'All' || project.category === categoryFilter;
    const yearMatch = yearFilter === 'All' || project.year === yearFilter;
    return categoryMatch && yearMatch;
  });

  return (
    <div className="relative w-full min-h-screen overflow-hidden selection:bg-white selection:text-black">
      
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-[100] mix-blend-difference pointer-events-none">
        <div 
          className="h-full bg-white transition-all duration-100 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
          style={{ width: `${scrollProgress * 100}%` }} 
        />
      </div>

      {/* 3D Background Layer */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <DitherBackground />
            <FloatingObject />
          </Suspense>
        </Canvas>
      </div>

      {/* Noise Overlay (Texture to enhance the dither feel) */}
      <div className="fixed inset-0 z-10 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-150 contrast-150 mix-blend-overlay"></div>

      {/* Main UI Layer */}
      <main className="relative z-20 w-full min-h-screen flex flex-col pointer-events-none">
        
        {/* Navigation */}
        <nav className="w-full p-8 md:p-12 flex justify-between items-start pointer-events-auto mix-blend-difference text-white">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-4xl font-light tracking-tighter">AETHER</h1>
            <span className="text-[10px] md:text-xs font-mono uppercase opacity-60 mt-1">
              Design Laboratories<br/>Est. 2024
            </span>
          </div>
          <div className="flex gap-8 text-xs font-mono uppercase tracking-widest">
            <a href="#work" className="hover:opacity-50 transition-opacity">Work</a>
            <a href="#about" className="hover:opacity-50 transition-opacity">Philosophy</a>
            <a href="#contact" className="hover:opacity-50 transition-opacity">Contact</a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col justify-center px-8 md:px-12 pointer-events-auto">
          <div className="max-w-4xl space-y-6 mix-blend-difference text-white">
            <h2 className="text-4xl md:text-7xl lg:text-8xl font-thin leading-[0.9] tracking-tight">
              FORM FOLLOWS<br/>
              <span className="font-mono italic">ALGORITHM</span>
            </h2>
            <p className="max-w-md text-sm md:text-base opacity-70 leading-relaxed font-mono">
              Exploring the intersection of generative design, neural aesthetics, and functional minimalism. 
              We build the artifacts of tomorrow, today.
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section id="work" className="w-full px-8 md:px-12 py-24 pointer-events-auto">
          <div className="border-t border-white/20 mb-12"></div>
          
          {/* Filter System */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 mix-blend-difference text-white">
            <div className="space-y-4">
               <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                 <span className="w-2 h-2 bg-white/40 rounded-full"></span>
                 Category_Select
               </div>
               <div className="flex flex-wrap gap-4">
                 {categories.map(cat => (
                   <button
                     key={cat}
                     onClick={() => setCategoryFilter(cat)}
                     className={`text-xs font-mono uppercase tracking-wider transition-all duration-300 ${categoryFilter === cat ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                   >
                     {categoryFilter === cat ? `[ ${cat} ]` : cat}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-4">
               <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                 <span className="w-2 h-2 bg-white/40 rounded-full"></span>
                 Temporal_Index
               </div>
               <div className="flex flex-wrap gap-4">
                 {years.map(year => (
                   <button
                     key={year}
                     onClick={() => setYearFilter(year)}
                     className={`text-xs font-mono uppercase tracking-wider transition-all duration-300 ${yearFilter === year ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                   >
                     {yearFilter === year ? `[ ${year} ]` : year}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[50vh]">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div 
                  key={project.id}
                  className="group relative cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-700"
                  onMouseEnter={() => setActiveProject(project.id)}
                  onMouseLeave={() => setActiveProject(null)}
                >
                  {/* Image Container with Expand Details Logic */}
                  <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm transition-all duration-500 group-hover:border-white/40 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] grayscale group-hover:grayscale-0 mix-blend-screen group-hover:mix-blend-normal"
                    />
                    
                    {/* Sliding Details Panel */}
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col justify-end min-h-[40%]">
                       <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                          <div className="w-8 h-px bg-white/50 mb-3" />
                          <p className="text-sm font-mono text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                            {project.description}
                          </p>
                       </div>
                    </div>
                  </div>
                  
                  {/* Project Metadata */}
                  <div className="mt-4 flex justify-between items-start mix-blend-difference text-white">
                    <div>
                      <span className="text-[10px] font-mono opacity-50 block mb-1 group-hover:text-white transition-colors">{project.id} // {project.category}</span>
                      <h3 className="text-xl tracking-tight group-hover:tracking-wide transition-all duration-500">{project.title}</h3>
                    </div>
                    <span className="text-xs font-mono border border-white/30 px-2 py-1 rounded-full group-hover:bg-white group-hover:text-black transition-all duration-300">{project.year}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center mix-blend-difference text-white">
                <p className="font-mono text-sm opacity-50">No artifacts found matching query parameters.</p>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full p-8 md:p-12 border-t border-white/10 pointer-events-auto mix-blend-difference text-white">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-8xl font-light leading-none opacity-20 select-none">END</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono uppercase opacity-50">
                Based in Neo-Tokyo<br/>
                Available for remote contracts
              </p>
            </div>
          </div>
        </footer>

      </main>

      {/* Floating Gemini AI Interface */}
      <GeminiChat />

      {/* Screen Dithering Overlay (CSS based to ensure UI is also affected if desired, but here we keep it subtle) */}
      <div className="fixed inset-0 z-50 pointer-events-none mix-blend-overlay opacity-10" style={{
        backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
        backgroundSize: '4px 4px'
      }}></div>

    </div>
  );
};

export default App;