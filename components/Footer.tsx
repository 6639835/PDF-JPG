import { motion } from 'framer-motion';
import { FC } from 'react';

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-100 border-t border-dark-300 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-2xl font-light tracking-wider text-primary">
                PDF<span className="text-white/90">2</span>JPG
              </span>
              <p className="mt-4 text-white/60 text-sm leading-relaxed">
                Professional PDF to JPG converter with server-side processing, ultra-high resolution output up to 1200 DPI, and flexible download options.
              </p>
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-white/80 text-sm uppercase tracking-wider mb-4 font-light">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/60 hover:text-primary transition-colors duration-300">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="text-white/60 hover:text-primary transition-colors duration-300">
                  Features
                </a>
              </li>
              <li>
                <a href="#converter" className="text-white/60 hover:text-primary transition-colors duration-300">
                  Converter
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Technology Stack */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white/80 text-sm uppercase tracking-wider mb-4 font-light">Technology</h3>
            <ul className="space-y-3 text-white/60 text-sm">
              <li>Ghostscript Engine</li>
              <li>PDF.js Library</li>
              <li>Sharp Image Processing</li>
              <li>Server-Side Rendering</li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="pt-8 border-t border-dark-300 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-white/50 text-sm mb-4 md:mb-0">
            &copy; {currentYear} PDF2JPG High Resolution Converter. Built with Next.js and powered by Ghostscript.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

