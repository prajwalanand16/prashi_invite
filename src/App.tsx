import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Heart, Music, Music2, MapPin, Calendar, Clock, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { cn } from './lib/utils';

gsap.registerPlugin(ScrollTrigger);

// --- Components ---

const CountdownItem = ({ value, label }: { value: string; label: string }) => (
  <div className="bg-white/40 backdrop-blur-md border border-[#d4af37]/30 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[80px] shadow-sm">
    <span className="text-3xl md:text-4xl font-serif font-bold text-[#b8860b] mb-1">{value}</span>
    <span className="text-[10px] md:text-xs text-gray-600 uppercase tracking-widest font-medium">{label}</span>
  </div>
);

const EventCard = ({ icon: Icon, title, time, date, description, index = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
    whileHover={{ y: -10 }}
    className="bg-white/60 backdrop-blur-lg border border-[#d4af37]/20 rounded-3xl p-8 text-center transition-all duration-500 shadow-lg hover:shadow-2xl royal-border"
  >
    <div className="text-4xl mb-6 flex justify-center">
      <div className="p-5 bg-[#fdf5e6] rounded-full bounce-icon border border-[#d4af37]/30">
        <Icon className="w-8 h-8 text-[#d4af37]" />
      </div>
    </div>
    <h3 className="font-serif text-2xl mb-3 text-[#2d2d2d]">{title}</h3>
    <p className="text-[#d4af37] font-semibold mb-1 text-sm tracking-wide">{date}</p>
    <p className="text-gray-500 font-medium mb-4 text-sm">{time}</p>
    <p className="text-gray-600 text-sm leading-relaxed font-light">{description}</p>
  </motion.div>
);

const Gallery = ({ title, images }: { title: string; images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="w-full max-w-lg mx-auto overflow-hidden rounded-3xl shadow-2xl relative group border-4 border-white">
      <div className="relative h-[400px] md:h-[500px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-10">
          <p className="font-serif text-2xl text-white italic tracking-widest">Forever & Always</p>
        </div>
      </div>
      
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md p-3 rounded-full text-gray-800 transition-all opacity-0 group-hover:opacity-100 shadow-md">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md p-3 rounded-full text-gray-800 transition-all opacity-0 group-hover:opacity-100 shadow-md">
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: '000', hours: '00', minutes: '00', seconds: '00' });
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 1000], [0, 300]);

  // --- Initialization ---

  useEffect(() => {
    // Smooth Scroll
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Preloader
    const timer = setTimeout(() => setLoading(false), 3000);

    // Countdown
    const weddingDate = new Date('2026-06-19T18:00:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(3, '0'),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'),
          seconds: Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0'),
        });
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      lenis.destroy();
    };
  }, []);

  // --- Music Logic ---

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              if (error.name === "AbortError") {
                // Ignore interruption errors
              } else {
                console.error("Audio playback error:", error);
                setIsPlaying(false);
              }
            });
        }
      }
    }
  };

  // --- Floating Elements ---

  const FloatingHearts = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute text-[#d4af37]/30"
          style={{
            left: `${Math.random() * 100}%`,
            animation: `floatUp ${10 + Math.random() * 12}s infinite linear`,
            animationDelay: `${Math.random() * 5}s`,
            fontSize: `${12 + Math.random() * 18}px`,
          }}
        >
          {i % 3 === 0 ? '✨' : i % 3 === 1 ? '💖' : '🌸'}
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative font-sans bg-[#fdfcf0] text-[#2d2d2d] overflow-x-hidden">
      <AnimatePresence>
        {loading && (
          <motion.div
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-gradient-to-br from-[#fdf5e6] to-[#fff] flex flex-col items-center justify-center"
          >
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 bg-[#d4af37] rotate-45 heart-animation before:content-[''] before:absolute before:w-full before:h-full before:bg-[#d4af37] before:rounded-full before:-top-1/2 after:content-[''] after:absolute after:w-full after:h-full after:bg-[#d4af37] after:rounded-full after:-left-1/2 shadow-lg" />
            </div>
            <p className="font-serif text-2xl text-[#b8860b] animate-pulse tracking-widest">Prajwal & Shiwangi</p>
            <div className="mt-4 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="h-full bg-[#d4af37]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingHearts />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: yHero }}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="assets/video/background_vid.mp4" type="video/mp4" />
          </video>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdfcf0]/40 via-transparent to-[#fdfcf0]/80" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2, duration: 1.2, ease: "easeOut" }}
            className="mb-6"
          >
            <span className="text-xs md:text-sm tracking-[0.6em] uppercase font-medium text-[#b8860b] bg-white/40 px-4 py-2 rounded-full backdrop-blur-sm border border-[#d4af37]/20">
              Save the Date
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3.5, duration: 1.8, ease: "easeOut" }}
            className="font-serif text-6xl md:text-9xl lg:text-[10rem] mb-6 tracking-tight text-[#2d2d2d] drop-shadow-sm"
          >
            Prajwal <span className="text-[#d4af37] font-cursive italic text-5xl md:text-8xl">&</span> Shiwangi
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.2, duration: 1.2 }}
            className="flex flex-col items-center"
          >
            <p className="font-serif text-xl md:text-3xl text-[#b8860b] italic mb-8 tracking-wide">
              Are getting married
            </p>
            <div className="w-px h-24 bg-gradient-to-b from-[#d4af37] to-transparent mb-6" />
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-[10px] uppercase tracking-[0.6em] text-gray-400 font-bold"
            >
              Scroll to explore
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Corners */}
        <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-[#d4af37]/40 hidden md:block" />
        <div className="absolute top-10 right-10 w-24 h-24 border-t-2 border-r-2 border-[#d4af37]/40 hidden md:block" />
        <div className="absolute bottom-10 left-10 w-24 h-24 border-b-2 border-l-2 border-[#d4af37]/40 hidden md:block" />
        <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-[#d4af37]/40 hidden md:block" />
      </section>

      {/* Countdown Section */}
      <section className="py-32 px-4 bg-[#fdf5e6]/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="font-serif text-4xl md:text-6xl mb-4 text-[#2d2d2d]">Friday</h2>
            <p className="text-2xl md:text-3xl text-[#b8860b] font-serif italic mb-16 tracking-widest">
              19th June 2026
            </p>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-10">
            <CountdownItem value={timeLeft.days} label="Days" />
            <CountdownItem value={timeLeft.hours} label="Hours" />
            <CountdownItem value={timeLeft.minutes} label="Minutes" />
            <CountdownItem value={timeLeft.seconds} label="Seconds" />
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-32 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-serif text-5xl md:text-7xl text-[#2d2d2d] mb-4">Wedding Events</h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <EventCard 
            icon={Music2}
            title="Sangeet"
            date="18th June 2026"
            time="Thursday | 6:00 PM"
            description="A night of music, dance, and celebration to kick off the festivities."
            index={0}
          />
          <EventCard 
            icon={Heart}
            title="Haldi"
            date="19th June 2026"
            time="Friday | 10:00 AM"
            description="The auspicious Haldi ceremony filled with love and laughter."
            index={1}
          />
          <EventCard 
            icon={MapPin}
            title="Wedding"
            date="19th June 2026"
            time="Friday | 6:00 PM"
            description="The Celebration: Baraat at 6 PM"
            index={2}
          />
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-32 px-4 bg-white/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-5xl md:text-7xl text-[#2d2d2d] mb-4">Our Journey</h2>
            <p className="font-serif italic text-xl text-[#b8860b]">Capturing our most precious moments</p>
          </div>
          <Gallery 
            title="Our Moments"
            images={[
              'assets/images/2X1A5224.JPG',
              'assets/images/2X1A5261.JPG',
              'assets/images/2X1A5273.JPG',
              'assets/images/2X1A5288.JPG',
              'assets/images/2X1A5295.JPG'
            ]}
          />
          
          <div className="mt-32">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-6xl text-[#2d2d2d] mb-4">Family</h2>
              <div className="w-16 h-1 bg-[#d4af37] mx-auto rounded-full" />
            </div>
            <Gallery 
              title="Family"
              images={[
                'assets/images/2X1A4878.JPG',
                'assets/images/2X1A5064.JPG',
                'assets/images/2X1A5279.JPG'
              ]}
            />
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section className="py-32 px-4 max-w-5xl mx-auto text-center">
        <h2 className="font-serif text-5xl md:text-7xl mb-6 text-[#2d2d2d]">City Club, Lucknow</h2>
        <p className="text-[#b8860b] mb-12 font-serif italic text-2xl tracking-wide">The Wedding Venue</p>
        
        <div className="bg-white p-6 rounded-[2.5rem] mb-12 overflow-hidden shadow-2xl border-2 border-[#d4af37]/20 relative">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[12px] border-white z-10 rounded-[2.5rem]" />
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.348684744415!2d80.9672989761596!3d26.92421755931326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399957786de29425%3A0x73ae2ec765787710!2sCity%20Club%2C%20Lucknow!5e0!3m2!1sen!2sin!4v1712328262000!5m2!1sen!2sin"
            width="100%" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
            className="opacity-90 hover:opacity-100 transition-all duration-700"
          />
        </div>
        
        <div className="space-y-6 mb-16">
          <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto text-lg font-light">
            City Club, Kursi Rd, opposite Srishti Apartment, Bajrang Vihar Colony, Kalyanpur (West), Lucknow, Uttar Pradesh 226021
          </p>
          <div className="flex items-center justify-center gap-2 text-[#b8860b] font-mono text-sm bg-[#fdf5e6] w-fit mx-auto px-6 py-2 rounded-full border border-[#d4af37]/30">
            <MapPin className="w-4 h-4" />
            City Club, Lucknow
          </div>
        </div>

        <motion.a 
          whileHover={{ scale: 1.05, backgroundColor: "#b8860b" }}
          whileTap={{ scale: 0.95 }}
          href="https://maps.app.goo.gl/Hjoqiu23Lt1B1AyS6" 
          target="_blank"
          className="inline-flex items-center gap-3 px-10 py-5 bg-[#d4af37] text-white rounded-full font-medium transition-all shadow-xl hover:shadow-2xl tracking-widest uppercase text-sm"
        >
          <MapPin className="w-5 h-5" />
          Get Directions
        </motion.a>
      </section>

      {/* Closing Section */}
      <section className="py-40 px-4 text-center bg-[#fdf5e6] relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <p className="font-serif italic text-2xl md:text-3xl text-gray-500 mb-8">We can't wait to see you there!</p>
          <h2 className="font-serif text-6xl md:text-9xl tracking-tighter text-[#2d2d2d] mb-12">Save the Date</h2>
          <div className="flex justify-center items-center gap-6">
            <div className="w-20 h-px bg-[#d4af37]" />
            <Heart className="w-10 h-10 text-[#d4af37] fill-[#d4af37] animate-pulse" />
            <div className="w-20 h-px bg-[#d4af37]" />
          </div>
        </motion.div>
      </section>

      {/* Audio Element */}
      <audio ref={audioRef} loop>
        <source src="assets/music/song.mp3" type="audio/mpeg" />
      </audio>

      {/* Music Toggle Button */}
      <button 
        onClick={toggleMusic}
        className={cn(
          "fixed bottom-8 right-8 z-[5000] w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl border-2 border-white/40 backdrop-blur-md",
          isPlaying ? "bg-[#d4af37] text-white" : "bg-white/60 text-[#b8860b]"
        )}
      >
        {isPlaying && <div className="absolute inset-0 rounded-full border-2 border-[#d4af37] ripple-animation" />}
        {isPlaying ? <Volume2 className="w-7 h-7 relative z-10" /> : <VolumeX className="w-7 h-7 relative z-10" />}
      </button>
    </div>
  );
}
