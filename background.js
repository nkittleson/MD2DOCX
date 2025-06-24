// MD2DOCX - Markdown to Word Converter
// Minimal background service worker

// Just log when extension is installed
chrome.runtime.onInstalled.addListener(function() {
    console.log('MD2DOCX extension ready');
}); 