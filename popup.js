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
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.results = document.getElementById('results');
        this.resultsList = document.getElementById('resultsList');
    }

    setupEventListeners() {
        // Mode toggle buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active from all buttons
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                // Add active to clicked button
                e.target.classList.add('active');
                
                this.conversionMode = e.target.dataset.mode;
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
            this.showNotification('Please select valid files for conversion.', 'error');
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
        this.convertBtn.textContent = 'Convert Files';
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
        this.convertBtn.textContent = 'Converting...';
        
        const results = [];
        
        try {
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                this.updateProgress((i / this.files.length) * 100);
                
                let result;
                if (this.conversionMode === 'md-to-docx') {
                    result = await this.convertMdToDocx(file);
                } else {
                    result = await this.convertDocxToMd(file);
                }
                
                results.push(result);
            }
            
            this.updateProgress(100);
            this.showResults(results);
            this.showNotification(`Successfully converted ${results.length} file${results.length > 1 ? 's' : ''}!`, 'success');
            
        } catch (error) {
            console.error('Conversion error:', error);
            this.showNotification('Conversion failed. Please try again.', 'error');
        } finally {
            this.hideProgress();
            this.convertBtn.disabled = false;
            this.convertBtn.textContent = '✅ Conversion Complete!';
        }
    }

    async convertMdToDocx(file) {
        const text = await this.readFileAsText(file);
        const docxBlob = await generateDocx(text);
        
        const originalName = file.name.replace(/\.(md|markdown)$/i, '');
        const fileName = `${originalName}.docx`;
        
        return {
            originalFile: file,
            fileName: fileName,
            blob: docxBlob,
            size: docxBlob.size
        };
    }

    async convertDocxToMd(file) {
        // Placeholder for DOCX to MD conversion
        // This would require a DOCX parser library
        throw new Error('DOCX to MD conversion not yet implemented');
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    showProgress() {
        this.progressBar.style.display = 'block';
        this.hideResults();
    }

    hideProgress() {
        this.progressBar.style.display = 'none';
    }

    updateProgress(percent) {
        this.progressFill.style.width = `${percent}%`;
    }

    showResults(results) {
        this.resultsList.innerHTML = '';
        
        results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            const icon = this.getFileIcon(result.fileName);
            const size = this.formatFileSize(result.size);
            
            resultItem.innerHTML = `
                <div class="result-info">
                    <span class="result-icon">${icon}</span>
                    <span class="result-name">${result.fileName}</span>
                    <span class="result-size">${size}</span>
                </div>
                <button class="download-btn" data-index="${index}">Download</button>
            `;
            
            // Add download button event listener
            const downloadBtn = resultItem.querySelector('.download-btn');
            downloadBtn.addEventListener('click', () => {
                this.downloadFile(result);
            });
            
            this.resultsList.appendChild(resultItem);
        });
        
        this.results.style.display = 'block';
        this.resultFiles = results;
        
        // Scroll to results
        setTimeout(() => {
            this.results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    hideResults() {
        this.results.style.display = 'none';
        this.resultFiles = [];
    }

    downloadFile(result) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`Downloaded ${result.fileName}`, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize the converter when the popup loads
document.addEventListener('DOMContentLoaded', () => {
    new MDDocxConverter();
}); 