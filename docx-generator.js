/*
 * MD2DOCX - Markdown to Word Converter Chrome Extension
 * Copyright (c) 2025 nkittleson
 * Licensed under the MIT License - see LICENSE file for details
 * 
 * Custom DOCX Generator - Creates proper DOCX files with correct ZIP structure and XML content
 * Generates OpenXML-compliant Word documents from parsed Markdown elements
 */

class DocxGenerator {
    constructor() {
        this.relationships = [];
        this.relationshipId = 1;
    }

    async createDocx(content) {
        const zip = new JSZip();
        
        // Create the main document XML
        const documentXml = this.createDocumentXml(content);
        
        // Create required files
        zip.file('word/document.xml', documentXml);
        zip.file('[Content_Types].xml', this.createContentTypes());
        zip.file('_rels/.rels', this.createMainRels());
        zip.file('word/_rels/document.xml.rels', this.createDocumentRels());
        zip.file('word/styles.xml', this.createStyles());
        
        // Generate the blob
        const blob = await zip.generateAsync({type: 'blob'});
        return blob;
    }

    createDocumentXml(content) {
        let bodyContent = '';
        
        for (const element of content) {
            if (element.type === 'paragraph') {
                bodyContent += this.createParagraph(element);
            } else if (element.type === 'heading') {
                bodyContent += this.createHeading(element);
            } else if (element.type === 'list') {
                bodyContent += this.createList(element);
            } else if (element.type === 'table') {
                bodyContent += this.createTable(element);
            }
        }

        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:body>
        ${bodyContent}
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
        </w:sectPr>
    </w:body>
</w:document>`;
    }

    createParagraph(element) {
        let runs = '';
        
        for (const run of element.runs) {
            let properties = '';
            if (run.bold) properties += '<w:b/>';
            if (run.italic) properties += '<w:i/>';
            if (run.code) properties += '<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/>';
            
            const propertiesXml = properties ? `<w:rPr>${properties}</w:rPr>` : '';
            
            runs += `<w:r>${propertiesXml}<w:t xml:space="preserve">${this.escapeXml(run.text)}</w:t></w:r>`;
        }

        return `<w:p>${runs}</w:p>`;
    }

    createHeading(element) {
        const level = Math.min(element.level, 6);
        return `<w:p>
            <w:pPr>
                <w:pStyle w:val="Heading${level}"/>
            </w:pPr>
            <w:r>
                <w:t>${this.escapeXml(element.text)}</w:t>
            </w:r>
        </w:p>`;
    }

    createList(element) {
        let listItems = '';
        
        for (let i = 0; i < element.items.length; i++) {
            const item = element.items[i];
            const numId = element.ordered ? '1' : '2';
            
            listItems += `<w:p>
                <w:pPr>
                    <w:numPr>
                        <w:ilvl w:val="0"/>
                        <w:numId w:val="${numId}"/>
                    </w:numPr>
                </w:pPr>
                <w:r>
                    <w:t>${this.escapeXml(item)}</w:t>
                </w:r>
            </w:p>`;
        }
        
        return listItems;
    }

    createTable(element) {
        let rows = '';
        
        for (const row of element.rows) {
            let cells = '';
            for (const cell of row) {
                cells += `<w:tc>
                    <w:tcPr>
                        <w:tcW w:w="2000" w:type="dxa"/>
                    </w:tcPr>
                    <w:p>
                        <w:r>
                            <w:t>${this.escapeXml(cell)}</w:t>
                        </w:r>
                    </w:p>
                </w:tc>`;
            }
            rows += `<w:tr>${cells}</w:tr>`;
        }

        return `<w:tbl>
            <w:tblPr>
                <w:tblW w:w="0" w:type="auto"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                </w:tblBorders>
            </w:tblPr>
            ${rows}
        </w:tbl>`;
    }

    createContentTypes() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
    }

    createMainRels() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
    }

    createDocumentRels() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
    }

    createStyles() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:style w:type="paragraph" w:styleId="Normal">
        <w:name w:val="Normal"/>
        <w:qFormat/>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading1">
        <w:name w:val="heading 1"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr>
            <w:keepNext/>
            <w:spacing w:before="480" w:after="0"/>
        </w:pPr>
        <w:rPr>
            <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
            <w:sz w:val="32"/>
            <w:color w:val="2F5496"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading2">
        <w:name w:val="heading 2"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr>
            <w:keepNext/>
            <w:spacing w:before="200" w:after="0"/>
        </w:pPr>
        <w:rPr>
            <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
            <w:sz w:val="26"/>
            <w:color w:val="2F5496"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading3">
        <w:name w:val="heading 3"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr>
            <w:keepNext/>
            <w:spacing w:before="200" w:after="0"/>
        </w:pPr>
        <w:rPr>
            <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
            <w:sz w:val="24"/>
            <w:color w:val="1F3763"/>
        </w:rPr>
    </w:style>
</w:styles>`;
    }

    escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

// Export for use in the extension
window.DocxGenerator = DocxGenerator;

// Global wrapper function for easy access
async function generateDocx(markdownContent) {
    const parser = new MarkdownParser();
    const elements = parser.parse(markdownContent);
    
    const generator = new DocxGenerator();
    return await generator.createDocx(elements);
} 