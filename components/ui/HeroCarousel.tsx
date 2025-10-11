import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Li1 from '@/public/Li1.jpg';
import Li2 from '@/public/Li2.jpg';
import Li3 from '@/public/Li3.jpg';

const slides = [
  {
    title: "Welcome to the Tutorverse",
    smallpara: `Tutorverse is a place where learning meets innovation.
                We connect students, mentors, and knowledge across the world.
                Join a community built to inspire growth and lifelong curiosity.`,
    image: Li1,
    gradient: "from-amber-900/20 via-transparent to-transparent"
  },
  {
    title: "Kick Start Your Learning Journey",
    smallpara: `Step into a smarter way of learning with Tutorverse.
                Our platform empowers you to explore, practice, and achieve your goals.
                Together, we make education more connected and inspiring.`,
    image: Li2,
    gradient: "from-yellow-900/20 via-transparent to-transparent"
  },
  {
    title: "Best Platform to Connect Global Knowledge Base",
    smallpara: `At Tutorverse, we believe education has no boundaries.
                With expert mentors and intelligent tools, learning becomes effortless.
                Start your journey today and unlock your full potential.`,
    image: Li3,
    gradient: "from-blue-900/20 via-transparent to-transparent"
  }
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slides.length;
        console.log('Slide changing from', prev, 'to', next);
        return next;
      });
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex items-center justify-center">
      {/* Left Side - Background Images */}
      <div className="absolute inset-y-0 left-0 w-1/2 flex items-center justify-center overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-95 z-0'
            }`}
            style={{
              transformOrigin: 'center center',
            }}
          >
            {/* Background Image with Next.js Image component */}
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover"
                quality={100}
              />
              
              {/* Overlay gradient for depth and color enhancement */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
            </div>
            
            {/* Animated light rays overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/40 rounded-full blur-3xl animate-pulse" 
                   style={{ animationDuration: '4s' }} />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse" 
                   style={{ animationDuration: '5s', animationDelay: '1s' }} />
            </div>

            {/* Faded edges with gradient transparency */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top edge */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/50 to-transparent" />
              {/* Bottom edge */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent" />
              {/* Left edge */}
              <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-white via-white/50 to-transparent" />
              {/* Right edge */}
              <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white via-white/50 to-transparent" />
              
              {/* Corner gradients for dreamy effect */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-white via-white/70 to-transparent" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white via-white/70 to-transparent" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white via-white/70 to-transparent" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-white via-white/70 to-transparent" />
            </div>
          </div>
        ))}
      </div>

      {/* Right Side - Typography */}
      <div className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-center p-16">
        <div className="relative w-full max-w-2xl">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex items-center transition-all duration-1000 ease-out ${
                index === currentSlide
                  ? 'opacity-100 translate-y-0 z-10'
                  : 'opacity-0 translate-y-8 z-0'
              }`}
            >
              <div className="w-full">
                <h1 className="text-6xl font-bold leading-tight">
                  {slide.title.split(' ').map((word, i) => (
                    <span
                      key={i}
                      className={`inline-block mr-4 transition-all duration-700 ease-out ${
                        index === currentSlide
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4'
                      }`}
                      style={{
                        transitionDelay: `${i * 100}ms`,
                        color: i % 3 === 0 ? '#FBBF24' : '#000000',
                        textShadow: i % 3 === 0 ? '0 2px 20px rgba(255, 215, 0, 0.3)' : 'none'
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </h1>
                
                {/* Animated underline */}
                <div 
                  className={`mt-8 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-1000 ease-out ${
                    index === currentSlide ? 'w-32 opacity-100' : 'w-0 opacity-0'
                  }`}
                  style={{ transitionDelay: '500ms' }}
                />

                {/* Small paragraph */}
                <p 
                  className={`mt-6 text-lg leading-relaxed text-gray-700 transition-all duration-1000 ease-out ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '600ms' }}
                >
                  {slide.smallpara}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
            }}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide
                ? 'w-12 h-3 bg-yellow-400'
                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;


