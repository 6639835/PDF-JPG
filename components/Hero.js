import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-100 to-dark z-0"></div>
      
      {/* Cinematic Bars */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-12 bg-dark z-10"
        initial={{ height: 0 }}
        animate={{ height: '3rem' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-12 bg-dark z-10"
        initial={{ height: 0 }}
        animate={{ height: '3rem' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 20 - 10],
              x: [0, Math.random() * 20 - 10],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading */}
          <motion.div
            className="overflow-hidden mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="heading-xl mb-6"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              PDF to JPG <span className="text-primary">High Resolution</span> Converter
            </motion.h1>
          </motion.div>
          
          {/* Subheading */}
          <motion.p 
            className="text-xl md:text-2xl font-light text-white/80 mb-10 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Premium image conversion tool maintaining the highest quality and resolution for your PDF documents.
          </motion.p>
          
          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <div className="flex flex-col items-center">
              <p className="text-white/60 text-sm uppercase tracking-widest mb-4">Scroll to Begin</p>
              <motion.div 
                className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.div 
                  className="w-1.5 h-1.5 bg-primary rounded-full mt-2"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Corner Decorative Elements */}
      <motion.div 
        className="absolute top-24 left-8 w-32 h-32 md:w-40 md:h-40 border border-primary/30 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1, delay: 0.8 }}
      />
      <motion.div 
        className="absolute bottom-32 right-8 w-40 h-40 md:w-60 md:h-60 border border-primary/20 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1, delay: 1 }}
      />
      <motion.div 
        className="absolute top-1/3 right-1/4 w-4 h-4 bg-primary/20 rounded-full"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-1/3 left-1/4 w-6 h-6 bg-secondary/20 rounded-full"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />
    </div>
  );
} 