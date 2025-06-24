/*
 * MD2DOCX - Markdown to Word Converter Chrome Extension
 * Copyright (c) 2025 nkittleson
 * Licensed under the MIT License - see LICENSE file for details
 * 
 * Main conversion logic and user interface controller
 */

class MDDocxConverter {
    constructor() {
        this.files = [];
        this.conversionMode = 'md-to-docx';
        this.results = [];
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.selectBtn = document.getElementById('selectBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.fileList = document.getElementById('fileList');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultsSection = document.getElementById('resultsSection');
        this.downloadLinks = document.getElementById('downloadLinks');
    }

    setupEventListeners() {
        // Conversion mode toggle
        document.querySelectorAll('input[name="conversion"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.conversionMode = e.target.value;
                this.updateFileAccept();
                this.clearFiles();
            });
        });

        // File selection
        this.selectBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(Array.from(e.target.files));
        });

        // Drag and drop
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });

        // Convert button
        this.convertBtn.addEventListener('click', () => {
            this.convertFiles();
        });
    }

    updateFileAccept() {
        const accept = this.conversionMode === 'md-to-docx' ? '.md,.markdown' : '.docx';
        this.fileInput.setAttribute('accept', accept);
    }

    handleFiles(files) {
        const validFiles = files.filter(file => this.isValidFile(file));
        
        if (validFiles.length === 0) {
            this.showMessage('Please select valid files for conversion.', 'error');
            return;
        }

        validFiles.forEach(file => {
            if (!this.files.some(f => f.name === file.name)) {
                this.files.push(file);
            }
        });

        this.renderFileList();
        this.updateConvertButton();
    }

    isValidFile(file) {
        if (this.conversionMode === 'md-to-docx') {
            return file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.markdown');
        } else {
            return file.name.toLowerCase().endsWith('.docx');
        }
    }

    renderFileList() {
        this.fileList.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const icon = this.getFileIcon(file.name);
            const size = this.formatFileSize(file.size);
            
            fileItem.innerHTML = `
                <div class="file-info">
                    <span class="file-icon">${icon}</span>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${size}</div>
                    </div>
                </div>
                <button class="remove-btn" data-index="${index}">✕</button>
            `;
            
            // Add remove button event listener
            const removeBtn = fileItem.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => {
                this.removeFile(index);
            });
            
            this.fileList.appendChild(fileItem);
        });
    }

    getFileIcon(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        const icons = {
            'md': '📝',
            'markdown': '📝',
            'docx': '📄'
        };
        return icons[ext] || '📄';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.renderFileList();
        this.updateConvertButton();
        
        if (this.files.length === 0) {
            this.hideResults();
        }
    }

    updateConvertButton() {
        this.convertBtn.disabled = this.files.length === 0;
        
        // Reset button appearance when files change
        this.convertBtn.style.background = '';
        this.convertBtn.querySelector('.btn-text').textContent = 'Convert Files';
    }

    clearFiles() {
        this.files = [];
        this.renderFileList();
        this.updateConvertButton();
        this.hideResults();
    }

    async convertFiles() {
        if (this.files.length === 0) return;

        this.showProgress();
        this.convertBtn.disabled = true;
        
        const results = [];
        
        try {
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                this.updateProgress((i / this.files.length) * 100, `Converting ${file.name}...`);
                
                let result;
                if (this.conversionMode === 'md-to-docx') {
                    result = await this.convertMdToDocx(file);
                } else {
                    result = await this.convertDocxToMd(file);
                }
                
                results.push(result);
            }
            
            this.updateProgress(100, '🎉 Conversion complete!');
            this.showResults(results);
            
            // Add a small celebration effect
            this.convertBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            this.convertBtn.querySelector('.btn-text').textContent = '✅ Conversion Complete!';
            
        } catch (error) {
            console.error('Conversion error:', error);
            this.showMessage(`Conversion failed: ${error.message}`, 'error');
        } finally {
            this.hideProgress();
            this.convertBtn.disabled = false;
        }
    }

    async convertMdToDocx(file) {
        return new Promise(async (resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const markdown = e.target.result;
                    
                    // Parse markdown into structured elements
                    const parser = new MarkdownParser();
                    const elements = parser.parse(markdown);
                    
                    // Generate DOCX using our custom generator
                    const generator = new DocxGenerator();
                    const blob = await generator.createDocx(elements);
                    
                    const filename = file.name.replace(/\.(md|markdown)$/i, '.docx');
                    
                    resolve({
                        filename,
                        blob,
                        originalName: file.name
                    });
                    
                } catch (error) {
                    console.error('MD to DOCX conversion error:', error);
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }



    async convertDocxToMd(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const filename = file.name.replace(/\.docx$/i, '.md');
                    
                    // For DOCX files, create a placeholder for now
                    // In a future version, this could use a library like mammoth.js for proper extraction
                    const markdown = `# Converted from ${file.name}

This is a placeholder conversion from a DOCX file.

**Note:** For full DOCX support, you would need to:
1. Install mammoth.js library for DOCX text extraction
2. Implement proper formatting preservation
3. Handle complex document structures

Current features in MD → DOCX conversion:
- ✅ Headers (H1-H6)
- ✅ Bold and italic text
- ✅ Lists (ordered and unordered)
- ✅ Code blocks
- ✅ Tables
- ✅ Links and images
- ✅ Proper Word formatting

For now, you can:
1. Open your DOCX file in Word
2. Copy the content
3. Paste it into a Markdown editor
4. Use this extension to convert the MD back to DOCX`;
                    
                    const blob = new Blob([markdown], { type: 'text/markdown' });
                    
                    resolve({
                        filename,
                        blob,
                        originalName: file.name
                    });
                    
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    showProgress() {
        this.progressSection.style.display = 'block';
        this.resultsSection.style.display = 'none';
    }

    hideProgress() {
        this.progressSection.style.display = 'none';
    }

    updateProgress(percent, text) {
        this.progressFill.style.width = percent + '%';
        this.progressText.textContent = text;
    }

    showResults(results) {
        this.downloadLinks.innerHTML = '';
        
        results.forEach((result, index) => {
            const linkDiv = document.createElement('div');
            linkDiv.className = 'download-link';
            
            linkDiv.innerHTML = `
                <div class="download-info">
                    <span class="file-icon">${this.getFileIcon(result.filename)}</span>
                    <div class="file-details">
                        <div class="file-name">${result.filename}</div>
                        <div class="file-size">${this.formatFileSize(result.blob.size)}</div>
                    </div>
                </div>
                <button class="download-btn" data-index="${index}">Download</button>
            `;
            
            // Add download button event listener
            const downloadBtn = linkDiv.querySelector('.download-btn');
            downloadBtn.addEventListener('click', () => {
                this.downloadFile(result.filename, index);
            });
            
            this.downloadLinks.appendChild(linkDiv);
        });
        
        this.results = results;
        this.resultsSection.style.display = 'block';
        
        // Show success message
        this.showMessage(`✅ Successfully converted ${results.length} file${results.length > 1 ? 's' : ''}! Download your files below.`, 'success');
        
        // Auto-scroll to results with a small delay to ensure the section is visible
        setTimeout(() => {
            this.resultsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }

    hideResults() {
        this.resultsSection.style.display = 'none';
    }

    downloadFile(filename, index) {
        const result = this.results[index];
        if (result) {
            // Create download link
            const url = URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        messageDiv.textContent = message;
        
        const container = document.querySelector('.converter-section');
        container.insertBefore(messageDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize the converter when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.converter = new MDDocxConverter();
}); 