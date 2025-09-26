import { Plugin, MarkdownPostProcessorContext, TFile, Vault } from 'obsidian';

// Node.js shell module for opening files/folders
const { shell } = require('electron');

export default class MenuPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor('menu', this.menuProcessor.bind(this));
  }

  async menuProcessor(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    // Parse optional class from first line
    let lines = source.split('\n').map(l => l.trim()).filter(Boolean);
    let menuClass = 'menu-container';
    if (lines[0]?.startsWith('class:')) {
      menuClass += ' ' + lines[0].replace('class:', '').trim();
      lines = lines.slice(1);
    }
    const container = el.createDiv({ cls: menuClass });

    for (const line of lines) {
      let match;
      // Internal Obsidian link: [[file|alias]]
      if ((match = line.match(/^\[\[(.+?)(\|(.+?))?]]$/))) {
        const fileName = match[1];
        const alias = match[3] || match[1];
        const a = container.createEl('a', { text: alias, cls: 'internal-link' });
        a.setAttr('data-href', fileName);
        a.addEventListener('click', (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(fileName, ctx.sourcePath);
        });
        continue;
      }
      // Markdown link: [text](url)
      if ((match = line.match(/^\[(.+?)]\((.+?)\)$/))) {
        const text = match[1];
        const url = match[2];
        // Local file/folder (file:/// or absolute path)
        if (url.startsWith('file:///') || url.match(/^([a-zA-Z]:\\|\\\\)/)) {
          const a = container.createEl('a', { text });
          a.style.cursor = 'pointer';
          a.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove file:/// if present
            let path = url.replace('file:///', '');
            // Decode URI
            path = decodeURIComponent(path);
            shell.openPath(path);
          });
        } else if (url.startsWith('http')) {
          // Web link
          const a = container.createEl('a', { text });
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.style.cursor = 'pointer';
        } else {
          // Try to open as vault file
          const a = container.createEl('a', { text });
          a.style.cursor = 'pointer';
          a.addEventListener('click', (e) => {
            e.preventDefault();
            this.app.workspace.openLinkText(url, ctx.sourcePath);
          });
        }
        continue;
      }
      // Plain text fallback
      container.createEl('span', { text: line });
    }
  }
}
