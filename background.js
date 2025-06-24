/*
 * MD2DOCX - Markdown to Word Converter Chrome Extension
 * Copyright (c) 2025 nkittleson
 * Licensed under the MIT License - see LICENSE file for details
 * 
 * Background service worker for MD2DOCX Extension
 */

chrome.runtime.onInstalled.addListener(() => {
    console.log('MD/DOCX Converter extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup, no additional action needed
    console.log('Extension popup opened');
});

// Optional: Add context menu for right-click conversion
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'convertFile') {
        // Open the extension popup
        chrome.action.openPopup();
    }
});

// Create context menu when extension starts
chrome.runtime.onStartup.addListener(() => {
    createContextMenu();
});

chrome.runtime.onInstalled.addListener(() => {
    createContextMenu();
});

function createContextMenu() {
    chrome.contextMenus.create({
        id: 'convertFile',
        title: 'Convert with MD/DOCX Converter',
        contexts: ['page', 'selection']
    });
} 