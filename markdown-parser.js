/*
 * MD2DOCX - Markdown to Word Converter Chrome Extension
 * Copyright (c) 2025 nkittleson
 * Licensed under the MIT License - see LICENSE file for details
 * 
 * Comprehensive Markdown Parser for DOCX conversion
 * Parses Markdown syntax into structured elements for Word document generation
 */
class MarkdownParser {
    constructor() {
        this.elements = [];
    }

    parse(markdown) {
        this.elements = [];
        const lines = markdown.split('\n');
        let i = 0;

        while (i < lines.length) {
            const line = lines[i].trim();

            if (line === '') {
                i++;
                continue;
            }

            // Headers
            if (line.startsWith('#')) {
                i = this.parseHeader(lines, i);
            }
            // Tables
            else if (this.isTableHeader(line, lines[i + 1])) {
                i = this.parseTable(lines, i);
            }
            // Code blocks
            else if (line.startsWith('```')) {
                i = this.parseCodeBlock(lines, i);
            }
            // Lists
            else if (this.isListItem(line)) {
                i = this.parseList(lines, i);
            }
            // Regular paragraphs
            else {
                i = this.parseParagraph(lines, i);
            }
        }

        return this.elements;
    }

    parseHeader(lines, index) {
        const line = lines[index].trim();
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        
        if (match) {
            this.elements.push({
                type: 'heading',
                level: match[1].length,
                text: match[2]
            });
        }
        
        return index + 1;
    }

    parseParagraph(lines, index) {
        let text = '';
        let currentIndex = index;

        // Collect consecutive non-empty lines for the paragraph
        while (currentIndex < lines.length && 
               lines[currentIndex].trim() !== '' && 
               !this.isSpecialLine(lines[currentIndex])) {
            text += (text ? ' ' : '') + lines[currentIndex].trim();
            currentIndex++;
        }

        if (text) {
            this.elements.push({
                type: 'paragraph',
                runs: this.parseInlineFormatting(text)
            });
        }

        return currentIndex;
    }

    parseInlineFormatting(text) {
        const runs = [];
        let currentText = '';
        let bold = false;
        let italic = false;
        let code = false;
        let i = 0;

        while (i < text.length) {
            // Handle bold **text**
            if (text.substring(i, i + 2) === '**') {
                if (currentText) {
                    runs.push({ text: currentText, bold, italic, code });
                    currentText = '';
                }
                bold = !bold;
                i += 2;
            }
            // Handle italic *text*
            else if (text[i] === '*' && text.substring(i, i + 2) !== '**') {
                if (currentText) {
                    runs.push({ text: currentText, bold, italic, code });
                    currentText = '';
                }
                italic = !italic;
                i += 1;
            }
            // Handle code `text`
            else if (text[i] === '`') {
                if (currentText) {
                    runs.push({ text: currentText, bold, italic, code });
                    currentText = '';
                }
                code = !code;
                i += 1;
            }
            // Handle links [text](url)
            else if (text[i] === '[') {
                const linkMatch = text.substring(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
                if (linkMatch) {
                    if (currentText) {
                        runs.push({ text: currentText, bold, italic, code });
                        currentText = '';
                    }
                    
                    // Handle images vs links
                    if (i > 0 && text[i - 1] === '!') {
                        // Image - remove the ! and add placeholder
                        runs.pop(); // Remove the ! if it was added as text
                        runs.push({ 
                            text: `[Image: ${linkMatch[1]}]`,
                            bold: false, 
                            italic: true, 
                            code: false 
                        });
                    } else {
                        // Regular link
                        runs.push({ 
                            text: linkMatch[1], 
                            bold, 
                            italic, 
                            code,
                            link: linkMatch[2] 
                        });
                    }
                    
                    i += linkMatch[0].length;
                } else {
                    currentText += text[i];
                    i++;
                }
            }
            // Handle images ![alt](src)
            else if (text[i] === '!' && text[i + 1] === '[') {
                const imageMatch = text.substring(i).match(/^!\[([^\]]*)\]\(([^)]+)\)/);
                if (imageMatch) {
                    if (currentText) {
                        runs.push({ text: currentText, bold, italic, code });
                        currentText = '';
                    }
                    
                    // Check if it's a data URI (base64 image)
                    if (imageMatch[2].startsWith('data:image/')) {
                        runs.push({ 
                            text: `[Embedded Image: ${imageMatch[1] || 'Image'}]`,
                            bold: false, 
                            italic: true, 
                            code: false,
                            image: imageMatch[2] 
                        });
                    } else {
                        runs.push({ 
                            text: `[Image: ${imageMatch[1] || imageMatch[2]}]`,
                            bold: false, 
                            italic: true, 
                            code: false 
                        });
                    }
                    
                    i += imageMatch[0].length;
                } else {
                    currentText += text[i];
                    i++;
                }
            }
            else {
                currentText += text[i];
                i++;
            }
        }

        if (currentText) {
            runs.push({ text: currentText, bold, italic, code });
        }

        return runs.length > 0 ? runs : [{ text: text, bold: false, italic: false, code: false }];
    }

    parseList(lines, index) {
        const items = [];
        let currentIndex = index;
        const firstLine = lines[index].trim();
        const isOrdered = /^\d+\./.test(firstLine);

        while (currentIndex < lines.length) {
            const line = lines[currentIndex].trim();
            
            if (line === '') {
                currentIndex++;
                continue;
            }

            if (this.isListItem(line)) {
                let itemText = '';
                
                // Extract the list item text
                if (isOrdered) {
                    itemText = line.replace(/^\d+\.\s*/, '');
                } else {
                    itemText = line.replace(/^[-*+]\s*/, '');
                }
                
                items.push(itemText);
                currentIndex++;
            } else {
                break;
            }
        }

        if (items.length > 0) {
            this.elements.push({
                type: 'list',
                ordered: isOrdered,
                items: items
            });
        }

        return currentIndex;
    }

    parseTable(lines, index) {
        const rows = [];
        let currentIndex = index;

        // Parse header row
        const headerLine = lines[currentIndex].trim();
        const headers = this.parseTableRow(headerLine);
        rows.push(headers);
        currentIndex++; // Skip separator line
        currentIndex++; // Move to first data row

        // Parse data rows
        while (currentIndex < lines.length) {
            const line = lines[currentIndex].trim();
            
            if (line === '' || !line.includes('|')) {
                break;
            }

            const cells = this.parseTableRow(line);
            rows.push(cells);
            currentIndex++;
        }

        if (rows.length > 0) {
            this.elements.push({
                type: 'table',
                rows: rows
            });
        }

        return currentIndex;
    }

    parseTableRow(line) {
        return line.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell !== '');
    }

    parseCodeBlock(lines, index) {
        const startLine = lines[index].trim();
        const language = startLine.substring(3).trim();
        let code = '';
        let currentIndex = index + 1;

        while (currentIndex < lines.length) {
            const line = lines[currentIndex];
            
            if (line.trim() === '```') {
                break;
            }
            
            code += (code ? '\n' : '') + line;
            currentIndex++;
        }

        this.elements.push({
            type: 'paragraph',
            runs: [{
                text: code || 'Code block',
                bold: false,
                italic: false,
                code: true
            }]
        });

        return currentIndex + 1; // Skip the closing ```
    }

    isListItem(line) {
        return /^[-*+]\s/.test(line) || /^\d+\.\s/.test(line);
    }

    isTableHeader(line, nextLine) {
        return line && nextLine && 
               line.includes('|') && 
               nextLine.includes('|') && 
               /^[\s|:-]+$/.test(nextLine.replace(/[^|:-\s]/g, ''));
    }

    isSpecialLine(line) {
        const trimmed = line.trim();
        return trimmed.startsWith('#') || 
               trimmed.startsWith('```') ||
               this.isListItem(trimmed) ||
               trimmed.includes('|');
    }
}

// Export for use in the extension
window.MarkdownParser = MarkdownParser; 