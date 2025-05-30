document.addEventListener('DOMContentLoaded', function() {
    // 确保PDF.js库可用
    if (typeof pdfjsLib === 'undefined') {
        if (typeof window['pdfjs-dist/build/pdf'] !== 'undefined') {
            window.pdfjsLib = window['pdfjs-dist/build/pdf'];
        } else if (typeof window.pdfjsLib === 'undefined') {
            alert('PDF.js库加载失败。请检查您的网络连接并刷新页面。');
            return;
        }
    }
    
    // 确保PDF.js worker正确设置
    if (typeof pdfjsLib.GlobalWorkerOptions !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.2.133/build/pdf.worker.min.mjs';
    }

    // Language translation system
    const translations = {
        'zh-CN': {
            'title': 'PDF 转 JPG 高质量转换器',
            'header-title': 'PDF 转 JPG 高分辨率转换器',
            'header-desc': '保持最高图像质量的文件转换工具',
            'lang-toggle': 'English',
            'drop-text': '拖放 PDF 文件到这里或',
            'browse-btn': '浏览文件',
            'upload-tip': '支持多个PDF文件同时上传',
            'uploaded-files': '已上传的文件',
            'add-more': '添加更多文件',
            'clear-all': '清除全部',
            'settings-title': '转换设置',
            'dpi-label': 'DPI (分辨率):',
            'dpi-300': '300 DPI (良好)',
            'dpi-600': '600 DPI (高质量)',
            'dpi-1200': '1200 DPI (超高质量)',
            'jpg-quality': 'JPG 质量:',
            'quality-95': '超高质量 (95%)',
            'quality-85': '高质量 (85%)',
            'quality-75': '标准质量 (75%)',
            'export-method': '导出方式:',
            'export-single-zip': '所有PDF合并为一个ZIP (按文件分目录)',
            'export-multiple-zip': '每个PDF单独打包为一个ZIP',
            'export-no-zip': '不打包，直接下载所有JPG文件',
            'parallel-processing': '并行处理:',
            'parallel-1': '单个处理 (内存占用低)',
            'parallel-2': '2个并行 (中等内存)',
            'parallel-4': '4个并行 (高性能，大内存)',
            'convert-btn': '转换',
            'processing': '正在处理:',
            'progress': '处理中:',
            'overall-progress': '总体进度',
            'files-completed': '文件已完成',
            'cancel-btn': '取消转换',
            'cancelling': '正在取消...',
            'results-title': '转换结果',
            'download-all': '按设置下载全部',
            'download-current': '仅下载当前PDF',
            'pdf-only': '只支持上传PDF文件，其他格式已被忽略',
            'remove-file': '移除文件',
            'footer': '© 2023 PDF转JPG高质量转换器 | 保持最高分辨率的PDF转图片工具',
            'theme-toggle-light': '切换到深色模式',
            'theme-toggle-dark': '切换到浅色模式',
            'estimated-size': '估计输出大小:',
            'time-remaining': '预计剩余时间:',
            'pages-processed': '已处理页数:',
            'processing-speed': '处理速度:',
            'pages-per-second': '页/秒',
            'less-than-minute': '少于一分钟',
            'minute': '分钟',
            'minutes': '分钟',
            'second': '秒',
            'seconds': '秒'
        },
        'en-US': {
            'title': 'PDF to JPG High Quality Converter',
            'header-title': 'PDF to JPG High Resolution Converter',
            'header-desc': 'File conversion tool maintaining the highest image quality',
            'lang-toggle': '中文',
            'drop-text': 'Drop PDF files here or',
            'browse-btn': 'Browse files',
            'upload-tip': 'Multiple PDF files supported',
            'uploaded-files': 'Uploaded Files',
            'add-more': 'Add More Files',
            'clear-all': 'Clear All',
            'settings-title': 'Conversion Settings',
            'dpi-label': 'DPI (Resolution):',
            'dpi-300': '300 DPI (Good)',
            'dpi-600': '600 DPI (High Quality)',
            'dpi-1200': '1200 DPI (Ultra High Quality)',
            'jpg-quality': 'JPG Quality:',
            'quality-95': 'Ultra High Quality (95%)',
            'quality-85': 'High Quality (85%)',
            'quality-75': 'Standard Quality (75%)',
            'export-method': 'Export Method:',
            'export-single-zip': 'All PDFs in one ZIP (separated by folder)',
            'export-multiple-zip': 'Each PDF in separate ZIP',
            'export-no-zip': 'No ZIP, download all JPG files directly',
            'parallel-processing': 'Parallel Processing:',
            'parallel-1': 'Single processing (low memory)',
            'parallel-2': '2 parallel (medium memory)',
            'parallel-4': '4 parallel (high performance, large memory)',
            'convert-btn': 'Convert',
            'processing': 'Processing:',
            'progress': 'Progress:',
            'overall-progress': 'Overall Progress',
            'files-completed': 'files completed',
            'cancel-btn': 'Cancel Conversion',
            'cancelling': 'Cancelling...',
            'results-title': 'Conversion Results',
            'download-all': 'Download All as Settings',
            'download-current': 'Download Current PDF Only',
            'pdf-only': 'Only PDF files are supported, other formats have been ignored',
            'remove-file': 'Remove file',
            'footer': '© 2023 PDF to JPG High Quality Converter | PDF to Image tool maintaining highest resolution',
            'theme-toggle-light': 'Switch to Dark Mode',
            'theme-toggle-dark': 'Switch to Light Mode',
            'estimated-size': 'Estimated output size:',
            'time-remaining': 'Estimated time remaining:',
            'pages-processed': 'Pages processed:',
            'processing-speed': 'Processing speed:',
            'pages-per-second': 'pages/sec',
            'less-than-minute': 'less than a minute',
            'minute': 'minute',
            'minutes': 'minutes',
            'second': 'second',
            'seconds': 'seconds'
        }
    };

    // DOM elements
    const langToggle = document.getElementById('langToggle');
    const themeToggle = document.getElementById('themeToggle');
    const lightIcon = themeToggle.querySelector('.light-icon');
    const darkIcon = themeToggle.querySelector('.dark-icon');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const fileItems = document.getElementById('fileItems');
    const addMoreBtn = document.getElementById('addMoreBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const convertBtn = document.getElementById('convertBtn');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const overallProgressBar = document.getElementById('overallProgressBar');
    const overallProgressText = document.getElementById('overallProgressText');
    const currentFileText = document.getElementById('currentFileText');
    const progressContainer = document.querySelector('.progress-container');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultTabButtons = document.getElementById('resultTabButtons');
    const resultTabContent = document.getElementById('resultTabContent');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const downloadCurrentBtn = document.getElementById('downloadCurrentBtn');
    const uploadIcon = document.getElementById('uploadIcon');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Variables to store data
    let pdfFiles = []; // Array to store multiple PDF files
    let pdfResults = []; // Array to store conversion results for all files
    let currentTabIndex = 0; // Current tab index in results view
    let convertingIndex = 0; // Current file being converted
    let isConverting = false; // Flag to track if conversion is in progress
    let shouldCancel = false; // Flag to track if conversion should be cancelled
    let currentLang = getSavedLanguage() || 'zh-CN'; // Get saved language or default to Chinese
    let currentTheme = getSavedTheme() || 'light'; // Get saved theme or default to light
    
    // Conversion statistics
    let conversionStartTime = 0;
    let pagesProcessed = 0;
    let processingSpeed = 0;
    let estimatedTimeRemaining = 0;
    let updateStatsInterval = null;
    
    // Set initial language based on saved preference
    document.documentElement.setAttribute('lang', currentLang);
    document.documentElement.setAttribute('data-lang', currentLang);
    
    // Set initial theme based on saved preference
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggleUI();
    
    // Language toggle event listener
    langToggle.addEventListener('click', function() {
        toggleLanguage();
    });
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', function() {
        toggleTheme();
    });
    
    // Function to get saved language preference
    function getSavedLanguage() {
        return localStorage.getItem('pdfToJpgLanguage');
    }
    
    // Function to save language preference
    function saveLanguage(lang) {
        localStorage.setItem('pdfToJpgLanguage', lang);
    }

    // Function to get saved theme preference
    function getSavedTheme() {
        return localStorage.getItem('pdfToJpgTheme');
    }
    
    // Function to save theme preference
    function saveTheme(theme) {
        localStorage.setItem('pdfToJpgTheme', theme);
    }
    
    // Function to toggle theme
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        saveTheme(currentTheme);
        updateThemeToggleUI();
    }
    
    // Function to update theme toggle UI
    function updateThemeToggleUI() {
        if (currentTheme === 'light') {
            lightIcon.style.display = 'inline';
            darkIcon.style.display = 'none';
            themeToggle.setAttribute('aria-label', translations[currentLang]['theme-toggle-light']);
        } else {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'inline';
            themeToggle.setAttribute('aria-label', translations[currentLang]['theme-toggle-dark']);
        }
    }
    
    // Function to toggle language
    function toggleLanguage() {
        currentLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
        document.documentElement.setAttribute('lang', currentLang);
        document.documentElement.setAttribute('data-lang', currentLang);
        saveLanguage(currentLang);
        updatePageLanguage();
        updateThemeToggleUI();
    }
    
    // Function to update all text on the page based on selected language
    function updatePageLanguage() {
        // Update title
        document.title = translations[currentLang]['title'];
        
        // Update header
        document.querySelector('header h1').textContent = translations[currentLang]['header-title'];
        document.querySelector('header p').textContent = translations[currentLang]['header-desc'];
        langToggle.textContent = translations[currentLang]['lang-toggle'];
        
        // Update theme toggle
        themeToggle.setAttribute('aria-label', translations[currentLang][currentTheme === 'light' ? 'theme-toggle-light' : 'theme-toggle-dark']);
        
        // Update dropzone
        const browseBtn = dropZone.querySelector('.browse-btn');
        const dropText = dropZone.querySelector('p:first-of-type');
        dropText.innerHTML = translations[currentLang]['drop-text'] + ' <span class="browse-btn">' + translations[currentLang]['browse-btn'] + '</span>';
        dropZone.querySelector('.upload-tip').textContent = translations[currentLang]['upload-tip'];
        uploadIcon.alt = translations[currentLang]['browse-btn'];
        
        // Update file list
        fileList.querySelector('h3').textContent = translations[currentLang]['uploaded-files'];
        addMoreBtn.textContent = translations[currentLang]['add-more'];
        clearAllBtn.textContent = translations[currentLang]['clear-all'];
        
        // Update settings panel
        document.querySelector('.settings-panel h3').textContent = translations[currentLang]['settings-title'];
        
        // Update DPI settings
        const dpiLabel = document.querySelector('label[for="dpiSetting"]');
        dpiLabel.textContent = translations[currentLang]['dpi-label'];
        const dpiOptions = document.querySelectorAll('#dpiSetting option');
        dpiOptions[0].textContent = translations[currentLang]['dpi-300'];
        dpiOptions[1].textContent = translations[currentLang]['dpi-600'];
        dpiOptions[2].textContent = translations[currentLang]['dpi-1200'];
        
        // Update JPG quality settings
        const qualityLabel = document.querySelector('label[for="formatSetting"]');
        qualityLabel.textContent = translations[currentLang]['jpg-quality'];
        const qualityOptions = document.querySelectorAll('#formatSetting option');
        qualityOptions[0].textContent = translations[currentLang]['quality-95'];
        qualityOptions[1].textContent = translations[currentLang]['quality-85'];
        qualityOptions[2].textContent = translations[currentLang]['quality-75'];
        
        // Update export settings
        const exportLabel = document.querySelector('label[for="exportSetting"]');
        exportLabel.textContent = translations[currentLang]['export-method'];
        const exportOptions = document.querySelectorAll('#exportSetting option');
        exportOptions[0].textContent = translations[currentLang]['export-single-zip'];
        exportOptions[1].textContent = translations[currentLang]['export-multiple-zip'];
        exportOptions[2].textContent = translations[currentLang]['export-no-zip'];
        
        // Update parallel processing settings
        const parallelLabel = document.querySelector('label[for="parallelSetting"]');
        parallelLabel.textContent = translations[currentLang]['parallel-processing'];
        const parallelOptions = document.querySelectorAll('#parallelSetting option');
        parallelOptions[0].textContent = translations[currentLang]['parallel-1'];
        parallelOptions[1].textContent = translations[currentLang]['parallel-2'];
        parallelOptions[2].textContent = translations[currentLang]['parallel-4'];
        
        // Update convert button
        convertBtn.textContent = translations[currentLang]['convert-btn'];
        
        // Update progress container
        currentFileText.textContent = translations[currentLang]['processing'] + ' ';
        progressText.textContent = translations[currentLang]['progress'] + ' 0%';
        document.querySelector('.overall-progress p:first-child').textContent = translations[currentLang]['overall-progress'];
        updateOverallProgressText();
        cancelBtn.textContent = translations[currentLang]['cancel-btn'];
        
        // Update results container
        resultsContainer.querySelector('h3').textContent = translations[currentLang]['results-title'];
        downloadAllBtn.textContent = translations[currentLang]['download-all'];
        downloadCurrentBtn.textContent = translations[currentLang]['download-current'];
        
        // Update estimated size labels in file list
        document.querySelectorAll('.estimate-label').forEach(el => {
            el.textContent = translations[currentLang]['estimated-size'];
        });
        
        // Update footer
        document.querySelector('footer p').textContent = translations[currentLang]['footer'];
        
        // Update file items remove buttons
        document.querySelectorAll('.file-remove').forEach(btn => {
            btn.title = translations[currentLang]['remove-file'];
        });
    }
    
    // Initialize language on load
    updatePageLanguage();
    
    // Set up the upload icon
    uploadIcon.src = createUploadIconSVG();

    // Set up event listeners for file upload
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length) {
            handleFilesUpload(e.target.files);
        }
    });
    
    // Drag and drop events
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            handleFilesUpload(e.dataTransfer.files);
        }
    });
    
    // Other button events
    addMoreBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    clearAllBtn.addEventListener('click', function() {
        resetAllFiles();
    });
    
    // Convert button event
    convertBtn.addEventListener('click', function() {
        if (pdfFiles.length > 0) {
            startConversion();
        }
    });
    
    // Download all button event
    downloadAllBtn.addEventListener('click', function() {
        downloadAllImages();
    });
    
    // Download current button event
    downloadCurrentBtn.addEventListener('click', function() {
        downloadCurrentPDF();
    });
    
    // Cancel button event
    cancelBtn.addEventListener('click', function() {
        if (isConverting) {
            shouldCancel = true;
            cancelBtn.textContent = translations[currentLang]['cancelling'];
            cancelBtn.disabled = true;
        }
    });
    
    // Function to handle file uploads
    function handleFilesUpload(fileList) {
        let hasInvalidFiles = false;
        
        // Convert FileList to Array and filter only PDF files
        const newFiles = Array.from(fileList).filter(file => {
            if (file.type === 'application/pdf') {
                return true;
            } else {
                alert(translations[currentLang]['pdf-only']);
                return false;
            }
        });
        
        // Add files to our array
        newFiles.forEach(file => {
            // Check if file already exists in our array
            const exists = pdfFiles.some(existingFile => 
                existingFile.name === file.name && 
                existingFile.size === file.size &&
                existingFile.lastModified === file.lastModified
            );
            
            if (!exists) {
                pdfFiles.push(file);
                addFileToList(file);
            }
        });
        
        updateUploadUI();
    }
    
    // Add file to the visual list
    function addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.filename = file.name;
        
        // Format file size
        const fileSize = formatFileSize(file.size);
        
        // Calculate estimated output sizes based on settings
        const dpiSetting = parseInt(document.getElementById('dpiSetting').value);
        const qualitySetting = parseInt(document.getElementById('formatSetting').value);
        
        const estimatedSizeMB = estimateOutputSize(file.size, dpiSetting, qualitySetting);
        
        fileItem.innerHTML = `
            <div class="file-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#4a6df0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2V8H20" stroke="#4a6df0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 18V12" stroke="#4a6df0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 15H15" stroke="#4a6df0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSize}</div>
                <div class="file-estimate">
                    <span class="estimate-label">${translations[currentLang]['estimated-size']}</span>
                    <span>${estimatedSizeMB} MB</span>
                </div>
            </div>
            <button class="file-remove" data-filename="${file.name}" title="${translations[currentLang]['remove-file']}">×</button>
        `;
        
        fileItems.appendChild(fileItem);
        
        // Add event listener to the remove button
        fileItem.querySelector('.file-remove').addEventListener('click', function() {
            removeFile(this.dataset.filename);
        });
    }
    
    // Remove file from list
    function removeFile(filename) {
        pdfFiles = pdfFiles.filter(file => file.name !== filename);
        
        // Remove from visual list
        const fileItem = fileItems.querySelector(`.file-item[data-filename="${filename}"]`);
        if (fileItem) {
            fileItem.remove();
        }
        
        updateUploadUI();
    }
    
    // Update UI based on uploaded files
    function updateUploadUI() {
        if (pdfFiles.length > 0) {
            fileList.hidden = false;
            dropZone.style.display = 'none';
            convertBtn.disabled = false;
        } else {
            fileList.hidden = true;
            dropZone.style.display = 'block';
            convertBtn.disabled = true;
        }
    }
    
    // Reset all files
    function resetAllFiles() {
        pdfFiles = [];
        fileItems.innerHTML = '';
        fileInput.value = '';
        updateUploadUI();
    }
    
    // Start conversion process
    async function startConversion() {
        if (pdfFiles.length === 0 || isConverting) return;
        
        // Reset conversion variables
        isConverting = true;
        shouldCancel = false;
        convertingIndex = 0;
        pdfResults = [];
        pagesProcessed = 0;
        conversionStartTime = Date.now();
        
        // Reset UI
        progressContainer.hidden = false;
        resultsContainer.hidden = true;
        convertBtn.disabled = true;
        progressBar.style.width = '0%';
        progressText.textContent = translations[currentLang]['progress'] + ' 0%';
        overallProgressBar.style.width = '0%';
        overallProgressText.textContent = '0/' + pdfFiles.length + ' ' + translations[currentLang]['files-completed'];
        
        // Start stats update interval
        updateStatsInterval = setInterval(updateConversionStats, 1000);
        
        // Get parallel processing count
        const parallelCount = parseInt(document.getElementById('parallelSetting').value);
        
        try {
            if (parallelCount > 1) {
                await processFilesInParallel(parallelCount);
            } else {
                await processNextFile();
            }
        } catch (error) {
            console.error('Conversion error:', error);
            alert('转换过程中出现错误: ' + error.message);
        }
        
        // Cleanup and show results
        clearInterval(updateStatsInterval);
        isConverting = false;
        convertBtn.disabled = false;
        
        if (!shouldCancel && pdfResults.length > 0) {
            showResults();
        } else {
            progressContainer.hidden = true;
        }
    }
    
    // Process files in parallel using a worker pool
    async function processFilesInParallel(workerCount) {
        // Limit worker count to the number of files or max 4
        workerCount = Math.min(workerCount, pdfFiles.length, 4);
        
        // Track active workers and completed files
        const activeWorkers = new Set();
        let completedFiles = 0;
        
        // Create a function to update overall progress
        const updateOverallProgress = () => {
            const overallProgress = (completedFiles / pdfFiles.length) * 100;
            overallProgressBar.style.width = `${overallProgress}%`;
            overallProgressText.textContent = `${completedFiles}/${pdfFiles.length} ${translations[currentLang]['files-completed']}`;
        };
        
        // Function to process a single file
        const processFile = async (fileIndex) => {
            if (fileIndex >= pdfFiles.length || shouldCancel) return;
            
            currentFileText.textContent = translations[currentLang]['processing'] + ' ' + pdfFiles[fileIndex].name;
            
            try {
                const result = await convertPdfToJpg(pdfFiles[fileIndex]);
                pdfResults[fileIndex] = result;
                updateOverallProgress();
                return result;
            } catch (error) {
                console.error('Error processing file:', error);
                pdfResults[fileIndex] = createErrorPlaceholder(error.message);
                updateOverallProgress();
                throw error;
            }
        };
        
        // Start initial batch of workers
        for (let i = 0; i < workerCount; i++) {
            if (convertingIndex < pdfFiles.length && !shouldCancel) {
                activeWorkers.add(processFile(convertingIndex++));
            }
        }
        
        // Wait for all workers to complete
        await Promise.all(activeWorkers);
        
        // Show results if not cancelled
        if (!shouldCancel) {
            showResults();
        }
    }
    
    // Process files one by one
    async function processNextFile() {
        if (convertingIndex >= pdfFiles.length || shouldCancel) {
            // All files processed or cancelled
            if (!shouldCancel) {
                showResults();
            }
            return;
        }
        
        const file = pdfFiles[convertingIndex];
        currentFileText.textContent = translations[currentLang]['processing'] + ' ' + file.name;
        
        try {
            await convertPdfToJpg(file);
            
            // Update overall progress
            convertingIndex++;
            const overallProgress = (convertingIndex / pdfFiles.length) * 100;
            overallProgressBar.style.width = `${overallProgress}%`;
            overallProgressText.textContent = `${convertingIndex}/${pdfFiles.length} ${translations[currentLang]['files-completed']}`;
            
            // Process next file
            await processNextFile();
            
        } catch (error) {
            console.error(`转换 ${file.name} 时出错:`, error);
            if (!shouldCancel) {
                alert(`转换 ${file.name} 时出错: ${error.message}`);
            }
            
            // Continue with next file despite error
            convertingIndex++;
            await processNextFile();
        }
    }
    
    // Function to convert PDF to JPG
    async function convertPdfToJpg(file) {
        const result = {
            filename: file.name,
            pages: [],
            totalPages: 0,
            errors: []
        };
        
        try {
            // Read the PDF file
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
            
            result.totalPages = pdf.numPages;
            
            // Get DPI and quality settings
            const dpi = parseInt(document.getElementById('dpiSetting').value);
            const quality = parseInt(document.getElementById('formatSetting').value) / 100;
            
            // Calculate scale factor based on DPI (PDF default is 72 DPI)
            const scaleFactor = dpi / 72;
            
            // Increment total processed pages tracker for progress stats
            const totalProcessedPages = pagesProcessed;
            
            // Update the conversion progress
            const updateProgress = (current, total) => {
                const percent = Math.round((current / total) * 100);
                progressBar.style.width = percent + '%';
                
                // Update pages processed counter for stats
                pagesProcessed = totalProcessedPages + current;
            };
            
            // Process each page
            for (let i = 1; i <= pdf.numPages; i++) {
                if (shouldCancel) break;
                
                try {
                    // Get the page
                    const page = await pdf.getPage(i);
                    
                    // Get viewport at the desired scale
                    const viewport = page.getViewport({scale: scaleFactor});
                    
                    // Create canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    const context = canvas.getContext('2d');
                    
                    // Render PDF page to canvas
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    
                    // Convert canvas to JPG
                    const jpgDataUrl = await optimizeImage(canvas, quality);
                    
                    // Add to result
                    result.pages.push({
                        pageNumber: i,
                        dataUrl: jpgDataUrl,
                        width: viewport.width,
                        height: viewport.height
                    });
                    
                    // Update progress
                    updateProgress(i, pdf.numPages);
                } catch (err) {
                    console.error(`Error processing page ${i}:`, err);
                    result.errors.push(`Page ${i}: ${err.message}`);
                }
            }
            
            // Add result to array
            pdfResults[convertingIndex] = result;
            
            return result;
        } catch (error) {
            console.error('Error processing PDF:', error);
            throw error;
        }
    }
    
    // Create an error placeholder image
    function createErrorPlaceholder(message) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        
        // Fill with light gray
        ctx.fillStyle = '#f2f2f2';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add error text
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('转换错误', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.fillStyle = '#666';
        ctx.font = '18px Arial';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 20);
        
        return canvas.toDataURL('image/jpeg', 0.8);
    }
    
    // Show results after all conversions
    function showResults() {
        // Hide progress
        progressContainer.hidden = true;
        
        // Show results if we have any
        if (pdfResults.length > 0) {
            createResultTabs();
            resultsContainer.hidden = false;
        }
        
        // Re-enable convert button
        convertBtn.disabled = false;
    }
    
    // Create result tabs
    function createResultTabs() {
        // Clear previous tabs
        resultTabButtons.innerHTML = '';
        resultTabContent.innerHTML = '';
        
        // Create tabs for each PDF
        pdfResults.forEach((result, index) => {
            // Create tab button
            const tabButton = document.createElement('button');
            tabButton.className = 'tab-button';
            tabButton.textContent = result.filename;
            tabButton.dataset.index = index;
            tabButton.addEventListener('click', () => switchTab(index));
            resultTabButtons.appendChild(tabButton);
            
            // Create tab content
            const tabPane = document.createElement('div');
            tabPane.className = 'tab-pane';
            tabPane.id = `tab-${index}`;
            
            // Create preview grid for this tab
            const previewGrid = document.createElement('div');
            previewGrid.className = 'preview-grid';
            
            // Add each preview image
            result.pages.forEach((page) => {
                const previewItem = createPreviewItem(page, result.filename);
                previewGrid.appendChild(previewItem);
            });
            
            tabPane.appendChild(previewGrid);
            resultTabContent.appendChild(tabPane);
        });
        
        // Activate first tab
        switchTab(0);
    }
    
    // Switch between result tabs
    function switchTab(index) {
        // Update current tab index
        currentTabIndex = index;
        
        // Update tab buttons
        const tabButtons = resultTabButtons.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            if (parseInt(button.dataset.index) === index) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update tab panes
        const tabPanes = resultTabContent.querySelectorAll('.tab-pane');
        tabPanes.forEach((pane, i) => {
            if (i === index) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
    }
    
    // Create preview item
    function createPreviewItem(page, filename) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        
        // Create the preview image
        const img = document.createElement('img');
        img.src = page.dataUrl;
        img.alt = `${filename} - 第 ${page.pageNum} 页`;
        previewItem.appendChild(img);
        
        // Add page number indicator
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = `第 ${page.pageNum} 页`;
        previewItem.appendChild(pageNumber);
        
        // Add download button for individual image
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'individual-download';
        downloadBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#4a6df0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 10L12 15L17 10" stroke="#4a6df0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15V3" stroke="#4a6df0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        downloadBtn.title = '下载此图片';
        downloadBtn.addEventListener('click', function() {
            // Generate filename using PDF name and page number
            const cleanFilename = filename.replace(/\.pdf$/i, '');
            downloadImage(page.dataUrl, `${cleanFilename}_第${page.pageNum}页.jpg`);
        });
        previewItem.appendChild(downloadBtn);
        
        return previewItem;
    }
    
    // Download current PDF results
    function downloadCurrentPDF() {
        if (pdfResults.length === 0 || currentTabIndex >= pdfResults.length) return;
        
        const result = pdfResults[currentTabIndex];
        const cleanFilename = result.filename.replace(/\.pdf$/i, '');
        
        // Create ZIP for this PDF only
        downloadPdfAsZip(result, `${cleanFilename}_转换结果.zip`);
    }
    
    // Download all images as ZIP(s)
    async function downloadAllImages() {
        if (pdfResults.length === 0) return;
        
        const exportMode = document.getElementById('exportSetting').value;
        
        // Set download button to loading state
        downloadAllBtn.textContent = '准备下载...';
        downloadAllBtn.disabled = true;
        
        try {
            switch (exportMode) {
                case 'single-zip':
                    await downloadAllAsSingleZip();
                    break;
                case 'multiple-zip':
                    await downloadAllAsMultipleZips();
                    break;
                case 'no-zip':
                    downloadAllAsIndividualFiles();
                    break;
            }
            
            // Reset download button
            downloadAllBtn.textContent = '按设置下载全部';
            downloadAllBtn.disabled = false;
        } catch (error) {
            console.error('打包下载过程中出错:', error);
            alert('打包下载过程中出错: ' + error.message);
            
            // Reset download button
            downloadAllBtn.textContent = '按设置下载全部';
            downloadAllBtn.disabled = false;
        }
    }
    
    // Download all PDFs as a single ZIP with folders
    async function downloadAllAsSingleZip() {
        // Create a new JSZip instance
        const zip = new JSZip();
        
        // Add each PDF's pages to the zip in separate folders
        for (const result of pdfResults) {
            const folderName = result.filename.replace(/\.pdf$/i, '');
            const folder = zip.folder(folderName);
            
            // Add each page to the folder
            result.pages.forEach((page) => {
                const imageData = dataURLtoBlob(page.dataUrl);
                folder.file(`第${page.pageNum}页.jpg`, imageData);
            });
        }
        
        // Generate the zip file
        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
        
        // Download the zip file
        saveAs(zipBlob, `PDF转JPG_所有文件_${new Date().toISOString().slice(0, 10)}.zip`);
    }
    
    // Download each PDF as a separate ZIP
    async function downloadAllAsMultipleZips() {
        for (const result of pdfResults) {
            const cleanFilename = result.filename.replace(/\.pdf$/i, '');
            await downloadPdfAsZip(result, `${cleanFilename}_转换结果.zip`);
        }
    }
    
    // Download a single PDF as a ZIP
    async function downloadPdfAsZip(pdfResult, zipFilename) {
        // Create a new JSZip instance
        const zip = new JSZip();
        
        // Add each page to the zip
        pdfResult.pages.forEach((page) => {
            const imageData = dataURLtoBlob(page.dataUrl);
            zip.file(`第${page.pageNum}页.jpg`, imageData);
        });
        
        // Generate the zip file
        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
        
        // Download the zip file
        saveAs(zipBlob, zipFilename);
    }
    
    // Download all pages as individual files
    function downloadAllAsIndividualFiles() {
        pdfResults.forEach(result => {
            const cleanFilename = result.filename.replace(/\.pdf$/i, '');
            
            result.pages.forEach(page => {
                downloadImage(page.dataUrl, `${cleanFilename}_第${page.pageNum}页.jpg`);
            });
        });
    }
    
    // Function to download a single image
    function downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Helper function to read file as ArrayBuffer
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Helper function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Helper function to convert dataURL to Blob
    function dataURLtoBlob(dataURL) {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        
        return new Blob([uInt8Array], { type: contentType });
    }
    
    // Function to create SVG for upload icon
    function createUploadIconSVG() {
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#4a6df0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="#4a6df0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 3V15" stroke="#4a6df0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `);
    }
    
    // Function to optimize images when memory usage is a concern
    function optimizeImage(canvas, quality, maxWidth = 5000, maxHeight = 5000) {
        // Check if image is too large
        if (canvas.width <= maxWidth && canvas.height <= maxHeight) {
            // Just convert to JPG with the specified quality
            return canvas.toDataURL('image/jpeg', quality);
        }
        
        // Create a new scaled-down canvas
        const scaleFactor = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
        const newWidth = Math.floor(canvas.width * scaleFactor);
        const newHeight = Math.floor(canvas.height * scaleFactor);
        
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = newWidth;
        scaledCanvas.height = newHeight;
        
        // Draw the original canvas onto the scaled canvas
        const ctx = scaledCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
        
        // Convert to JPG with the specified quality
        const result = scaledCanvas.toDataURL('image/jpeg', quality);
        
        // Clean up
        ctx.clearRect(0, 0, newWidth, newHeight);
        scaledCanvas.width = 0;
        scaledCanvas.height = 0;
        
        return result;
    }
    
    function updateOverallProgressText() {
        const text = `${convertingIndex}/${pdfFiles.length} ${translations[currentLang]['files-completed']}`;
        overallProgressText.textContent = text;
    }
    
    // Function to estimate output file size
    function estimateOutputSize(pdfSize, dpi, quality) {
        // Base estimation factor (empirical)
        const baseFactor = 2.5;
        
        // DPI factor: higher DPI = larger files
        const dpiFactor = (dpi / 300) * (dpi / 300); // Squared relation
        
        // Quality factor: higher quality = larger files
        const qualityFactor = quality / 85;
        
        // Calculate estimated size in MB with one decimal place
        const estimatedSizeMB = ((pdfSize / 1024 / 1024) * baseFactor * dpiFactor * qualityFactor).toFixed(1);
        
        return estimatedSizeMB;
    }
    
    // Function to update conversion statistics
    function updateConversionStats() {
        // Calculate processing speed (pages per second)
        const elapsedSeconds = (Date.now() - conversionStartTime) / 1000;
        if (elapsedSeconds > 0) {
            processingSpeed = (pagesProcessed / elapsedSeconds).toFixed(1);
            
            // Estimate remaining pages
            let remainingPages = 0;
            
            // Count remaining pages in current and future PDFs
            if (convertingIndex < pdfFiles.length) {
                // For files not yet processed at all
                for (let i = convertingIndex + 1; i < pdfFiles.length; i++) {
                    // Estimate page count based on file size (rough estimate)
                    remainingPages += Math.ceil(pdfFiles[i].size / 100000); // Assume ~100KB per page
                }
                
                // Add remaining pages from current file if available
                if (pdfResults[convertingIndex] && pdfResults[convertingIndex].totalPages) {
                    const current = pdfResults[convertingIndex];
                    remainingPages += (current.totalPages - current.pages.length);
                }
            }
            
            // Calculate estimated time remaining
            if (processingSpeed > 0) {
                estimatedTimeRemaining = remainingPages / processingSpeed;
                
                // Update UI with time estimate
                document.getElementById('progressText').innerHTML = 
                    `${translations[currentLang]['progress']} ${progressBar.style.width}<br>` + 
                    `${translations[currentLang]['time-remaining']} ${formatTimeRemaining(estimatedTimeRemaining)}<br>` + 
                    `${translations[currentLang]['pages-processed']} ${pagesProcessed}<br>` + 
                    `${translations[currentLang]['processing-speed']} ${processingSpeed} ${translations[currentLang]['pages-per-second']}`;
            }
        }
    }
    
    // Format time remaining in a human-readable format
    function formatTimeRemaining(seconds) {
        if (seconds < 60) {
            return `${Math.ceil(seconds)} ${translations[currentLang][seconds === 1 ? 'second' : 'seconds']}`;
        } else if (seconds < 120) {
            return translations[currentLang]['less-than-minute'];
        } else {
            const minutes = Math.ceil(seconds / 60);
            return `${minutes} ${translations[currentLang][minutes === 1 ? 'minute' : 'minutes']}`;
        }
    }
}); 