import { motion } from 'framer-motion';
import { FC } from 'react';

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
      </svg>
    ),
    title: 'Server-Side Conversion',
    description: 'Powerful server-side processing using Ghostscript, PDF.js, and other professional tools for reliable high-quality results.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Ultra-High Resolution',
    description: 'Support for up to 1200 DPI high-resolution output, perfect for professional printing and detailed images.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Adjustable Quality',
    description: 'Fine-tune your output with adjustable JPEG compression quality up to 95% for perfect balance between size and quality.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
        <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    ),
    title: 'Multi-Page Support',
    description: 'Convert all pages from multi-page PDFs with a single click, saving time on batch conversions.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Flexible Downloads',
    description: 'Choose from individual image downloads, per-PDF packages, or one comprehensive ZIP file with organized folders.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Parallel Processing',
    description: 'Optimize conversion speed with adjustable parallel processing options based on your system capabilities.'
  }
];

const Features: FC = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-dark">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="heading-lg mb-6">Premium Features</h2>
          <p className="text-body max-w-2xl mx-auto">
            Our converter offers professional-grade capabilities with an elegant user experience, giving you complete control over your PDF to JPG conversions.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="card-glass p-6 flex flex-col h-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                transition: { duration: 0.3 }
              }}
            >
              <div className="text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-light mb-3 text-white/90">{feature.title}</h3>
              <p className="text-white/70 text-sm flex-grow">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Technical Specs */}
        <motion.div 
          className="mt-20 bg-dark-100 rounded-lg p-8 border border-dark-300/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="heading-sm mb-6 text-center">Technical Specifications</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4">
              <h4 className="text-primary text-sm uppercase tracking-wider mb-3 font-light">Resolution Options</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  300 DPI - Standard quality
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  600 DPI - High quality
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  1200 DPI - Ultra high quality
                </li>
              </ul>
            </div>
            
            <div className="p-4">
              <h4 className="text-primary text-sm uppercase tracking-wider mb-3 font-light">Format Options</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  JPG compression (75%, 85%, 95%)
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  ZIP packaging options
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Individual file downloads
                </li>
              </ul>
            </div>
            
            <div className="p-4">
              <h4 className="text-primary text-sm uppercase tracking-wider mb-3 font-light">Technology</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Ghostscript conversion engine
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  PDF.js rendering fallback
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Server-side processing with Sharp
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;

