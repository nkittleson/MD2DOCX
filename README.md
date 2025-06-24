# MD2DOCX - Markdown to Word Converter

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green?logo=googlechrome)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

A powerful and intuitive Chrome extension that converts Markdown files to Microsoft Word (.docx) documents with professional formatting. Features a beautiful drag-and-drop interface and supports rich formatting including tables, lists, headers, and more.

## ✨ Key Features

- 🎯 **Drag & Drop Interface** - Simply drag your files into the extension
- 📄 **Real DOCX Output** - Creates genuine Microsoft Word documents that open perfectly
- 🎨 **Rich Formatting** - Supports headers, bold, italic, tables, lists, code blocks, and links
- 📁 **Batch Processing** - Convert multiple files at once
- 🔒 **Privacy First** - All processing happens locally on your device
- ⚡ **Fast & Lightweight** - No external servers or internet required
- 🆓 **Completely Free** - Open source and free to use

## 🚀 Quick Start

### Installation

1. **Clone or Download**
   ```bash
   git clone https://github.com/nkittleson/MD2DOCX.git
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the extension folder

3. **Start Converting!**
   - Click the extension icon in your toolbar
   - Drag in your Markdown files or click "Select Files"
   - Download your professional Word documents

## 📝 Supported Markdown Features

| Feature | Markdown Syntax | Word Output |
|---------|----------------|-------------|
| **Headers** | `# ## ###` | Word heading styles with colors |
| **Bold Text** | `**bold**` | **Bold formatting** |
| **Italic Text** | `*italic*` | *Italic formatting* |
| **Code Inline** | `` `code` `` | `Monospace font` |
| **Code Blocks** | ` ```code``` ` | Formatted code blocks |
| **Unordered Lists** | `- item` | • Bulleted lists |
| **Ordered Lists** | `1. item` | 1. Numbered lists |
| **Tables** | ` | col1 | col2 | ` | Full tables with borders |
| **Links** | `[text](url)` | Clickable hyperlinks |
| **Images** | `![alt](src)` | Image placeholders* |

*Images are converted to descriptive text placeholders

## 🎬 Demo

Create a test file `sample.md`:
```markdown
# My Document
## Introduction

This is **bold** and *italic* text.

### Features
- Easy to use
- Professional output  
- Completely free

| Feature | Status |
|---------|--------|
| Headers | ✅ |
| Tables  | ✅ |

Check out [GitHub](https://github.com)!
```

Convert it to get a beautifully formatted Word document!

## 🛠️ Technical Architecture

- **Frontend**: HTML5, CSS3, Modern JavaScript (ES6+)
- **Document Generation**: Custom DOCX generator with proper OpenXML structure
- **Compression**: JSZip for creating valid Word document archives
- **Parsing**: Comprehensive Markdown parser supporting all major elements
- **Chrome APIs**: Manifest V3 compliance for modern Chrome extensions

## 🔒 Privacy & Security

- ✅ **100% Local Processing** - Files never leave your computer
- ✅ **No Data Collection** - Zero tracking or analytics
- ✅ **No External Requests** - Works completely offline
- ✅ **Open Source** - Full transparency, audit the code yourself

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Development Setup
```bash
git clone https://github.com/nkittleson/MD2DOCX.git
cd MD2DOCX
# Load in Chrome as unpacked extension for testing
```

## 📋 Project Structure

```
MD2DOCX/
├── manifest.json           # Extension configuration
├── popup.html             # Main interface
├── popup.js              # Core functionality
├── styles.css            # Beautiful UI styling
├── background.js         # Background service worker
├── docx-generator.js     # DOCX file creation
├── markdown-parser.js    # Markdown parsing logic
├── jszip.min.js         # ZIP compression library
├── icons/               # Extension icons
└── README.md           # This file
```

## 🐛 Troubleshooting

**Extension won't load?**
- Ensure Developer Mode is enabled in Chrome
- Check that all files are present in the extension directory

**Files not converting?**
- Verify your files have `.md` or `.markdown` extensions
- Check the browser console for error messages

**Word won't open the file?**
- The extension creates proper DOCX files - if there are issues, please report them!

## 📈 Roadmap

- [ ] **Enhanced DOCX Support** - Better image embedding
- [ ] **Reverse Conversion** - DOCX to Markdown (using mammoth.js)
- [ ] **Export Options** - PDF and HTML output
- [ ] **Custom Styling** - User-defined Word document themes
- [ ] **Chrome Web Store** - Official store publication

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Free to use, modify, and distribute!**

## 👤 Author

**nkittleson**
- GitHub: [@nkittleson](https://github.com/nkittleson)

## ⭐ Support

If this extension helps you, please:
- ⭐ **Star this repository**
- 🐛 **Report issues** in the [Issues](https://github.com/nkittleson/MD2DOCX/issues) section
- 💡 **Suggest features** via GitHub Issues
- 🤝 **Contribute** by submitting pull requests

---

**Made with ❤️ by nkittleson | Convert your Markdown to beautiful Word documents instantly!** 