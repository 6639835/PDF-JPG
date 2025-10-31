import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SettingsPanel({ onChange, estimatedSize = null, estimatedTime = null }) {
  const [settings, setSettings] = useState({
    dpi: '1200',
    quality: '95',
    exportMethod: 'single-zip',
    parallelProcessing: '4'
  });

  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    const updatedSettings = { ...settings, [name]: value };
    setSettings(updatedSettings);
    
    if (onChange) {
      onChange(updatedSettings);
    }
  };

  return (
    <motion.div 
      className="card-glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="heading-sm mb-6">Conversion Settings</h3>
      
      <div className="space-y-6">
        {/* DPI Setting */}
        <div className="space-y-2">
          <label htmlFor="dpi" className="form-label">
            DPI (Resolution)
          </label>
          <select 
            id="dpi" 
            name="dpi"
            value={settings.dpi}
            onChange={handleSettingChange}
            className="form-select"
          >
            <option value="300">300 DPI (Good)</option>
            <option value="600">600 DPI (High Quality)</option>
            <option value="1200">1200 DPI (Ultra High Quality)</option>
          </select>
          <p className="text-white/40 text-xs mt-1">Higher DPI results in larger file sizes but better quality</p>
        </div>
        
        {/* JPG Quality Setting */}
        <div className="space-y-2">
          <label htmlFor="quality" className="form-label">
            JPG Quality
          </label>
          <select 
            id="quality" 
            name="quality"
            value={settings.quality}
            onChange={handleSettingChange}
            className="form-select"
          >
            <option value="95">Ultra High Quality (95%)</option>
            <option value="85">High Quality (85%)</option>
            <option value="75">Standard Quality (75%)</option>
          </select>
          <p className="text-white/40 text-xs mt-1">Controls compression level of output JPG images</p>
        </div>
        
        {/* Export Method Setting */}
        <div className="space-y-2">
          <label htmlFor="exportMethod" className="form-label">
            Export Method
          </label>
          <select 
            id="exportMethod" 
            name="exportMethod"
            value={settings.exportMethod}
            onChange={handleSettingChange}
            className="form-select"
          >
            <option value="single-zip">All PDFs in one ZIP (separated by folder)</option>
            <option value="multiple-zip">Each PDF in separate ZIP</option>
            <option value="no-zip">No ZIP, download all JPG files directly</option>
          </select>
          <p className="text-white/40 text-xs mt-1">How you want to receive the converted files</p>
        </div>
        
        {/* Parallel Processing Setting */}
        <div className="space-y-2">
          <label htmlFor="parallelProcessing" className="form-label">
            Parallel Processing
          </label>
          <select 
            id="parallelProcessing" 
            name="parallelProcessing"
            value={settings.parallelProcessing}
            onChange={handleSettingChange}
            className="form-select"
          >
            <option value="1">Single processing (low memory)</option>
            <option value="2">2 parallel (medium memory)</option>
            <option value="4">4 parallel (high performance, large memory)</option>
          </select>
          <p className="text-white/40 text-xs mt-1">Higher values use more memory but convert faster</p>
        </div>
      </div>
      
      {/* Estimated Output Info */}
      <motion.div 
        className="mt-8 p-4 bg-dark-300/50 rounded-md border border-dark-400/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-sm uppercase tracking-wider text-white/70 mb-3 font-light">Estimated Information</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white/50 text-sm">Output Size:</span>
            <span className="text-primary-400 text-sm">
              {estimatedSize || "Upload files to calculate"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50 text-sm">Processing Time:</span>
            <span className="text-primary-400 text-sm">
              {estimatedTime || "Upload files to calculate"}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 