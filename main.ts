import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

const { shell } = require('electron');

interface MenuPluginSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: MenuPluginSettings = {
    mySetting: 'default'
}

export default class MenuPlugin extends Plugin {
    settings: MenuPluginSettings;

    async onload() {
        await this.loadSettings();

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new MenuPluginSettingTab(this.app, this));

        this.registerMarkdownCodeBlockProcessor('menu', (source, el, ctx) => {
            const lines = source.trim().split('\n');
            let layoutOrClass = '';
            let colors: Record<string, string> = {};
            const links: string[] = [];

            // Parse YAML-like properties and links
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('layout:') || trimmed.startsWith('class:')) {
                    const colonIndex = trimmed.indexOf(':');
                    layoutOrClass = trimmed.substring(colonIndex + 1).trim();
                } else if (trimmed.includes(':') && !trimmed.startsWith('[') && !trimmed.startsWith('[[')) {
                    // Parse color properties
                    const [key, ...valueParts] = trimmed.split(':');
                    const value = valueParts.join(':').trim();
                    if (key && value && !key.includes('//') && !key.includes('http')) {
                        colors[key.trim()] = value;
                    }
                } else if (trimmed && !trimmed.includes(':')) {
                    links.push(trimmed);
                } else if (trimmed.startsWith('[')) {
                    links.push(trimmed);
                }
            }

            // Determine layout and classes
            const builtInLayouts = new Set(['default', 'minimal', 'slate', 'horizon', 'aether']);
            const container = el.createEl('div', { cls: 'menu-container' });

            let selectedLayout = '';
            let extraClasses: string[] = [];

            if (layoutOrClass) {
                const tokens = layoutOrClass.split(/\s+/).filter(Boolean);
                if (tokens.length) {
                    // Allow built-in layout to appear anywhere in the list (e.g., "class: my-class horizon wide")
                    const builtInIndex = tokens.findIndex(t => builtInLayouts.has(t));
                    if (builtInIndex !== -1) {
                        selectedLayout = tokens[builtInIndex];
                        extraClasses = tokens.filter((_, i) => i !== builtInIndex);
                    } else {
                        // Custom class mode: do not apply plugin CSS (no data-layout)
                        extraClasses = tokens;
                    }
                }
            } else {
                // No layout/class provided: use default built-in template
                selectedLayout = 'default';
            }

            // Apply selected built-in template via data attribute (gates plugin CSS)
            if (selectedLayout) {
                container.setAttr('data-layout', selectedLayout);
            }

            // Apply any extra classes (e.g., "wide" or user-provided classes)
            for (const cls of extraClasses) {
                container.addClass(cls);
            }

            // Apply custom properties (whitelist only: bg, text, border, font and their -hover variants,
            // plus internal-, external-, file- prefixed versions). No raw CSS props allowed.
            if (Object.keys(colors).length > 0) {
                const baseKeys = new Set([
                    'bg', 'text', 'border', 'font',
                    'hover-text', 'hover-bg', 'hover-border', 'hover-font',
                ]);
                const normalizeKey = (raw: string) => {
                    let s = raw.trim().toLowerCase();
                    // Normalize synonyms/order for hover variants
                    s = s
                        // Prefer "hover-*" (matches CSS)
                        .replace(/\btext-hover\b/g, 'hover-text')
                        .replace(/\bbg-hover\b/g, 'hover-bg')
                        .replace(/\bborder-hover\b/g, 'hover-border')
                        // Old naming from earlier versions -> new "hover-*" order
                        .replace(/\binternal-text-hover\b/g, 'internal-hover-text')
                        .replace(/\binternal-bg-hover\b/g, 'internal-hover-bg')
                        .replace(/\binternal-border-hover\b/g, 'internal-hover-border')
                        .replace(/\bexternal-text-hover\b/g, 'external-hover-text')
                        .replace(/\bexternal-bg-hover\b/g, 'external-hover-bg')
                        .replace(/\bexternal-border-hover\b/g, 'external-hover-border')
                        .replace(/\bfile-text-hover\b/g, 'file-hover-text')
                        .replace(/\bfile-bg-hover\b/g, 'file-hover-bg')
                        .replace(/\bfile-border-hover\b/g, 'file-hover-border')
                        // Back-compat for "accent" -> "hover-text"
                        .replace(/\baccent\b/g, 'hover-text')
                        .replace(/\binternal-accent\b/g, 'internal-hover-text')
                        .replace(/\bexternal-accent\b/g, 'external-hover-text')
                        .replace(/\bfile-accent\b/g, 'file-hover-text')
                        .replace(/\bbackground\b/g, 'bg');
                    return s;
                };
                const isAllowed = (key: string) => {
                    if (baseKeys.has(key)) return true;
                    const m = key.match(/^(internal|external|file)-(.*)$/);
                    return !!(m && baseKeys.has(m[2]));
                };
                for (const [rawKey, value] of Object.entries(colors)) {
                    const key = normalizeKey(rawKey);
                    if (!isAllowed(key)) continue;
                    container.style.setProperty(`--${key}`, value);
                }
            }

            // In custom class mode (no built-in layout), apply base inline styles to anchors so whitelist vars work without CSS.
            const applyInlineBaseStyles = (a: HTMLElement, variant: 'internal' | 'external' | 'file' | 'generic') => {
                const prefix = variant === 'generic' ? '' : `${variant}-`;
                const get = (k: string) => (colors[`${prefix}${k}`] ?? colors[k]);
                const bgVal = get('bg'); if (bgVal) a.style.background = bgVal as string;
                const textVal = get('text'); if (textVal) a.style.color = textVal as string;
                const borderVal = get('border'); if (borderVal) a.style.borderColor = borderVal as string;
                const fontVal = get('font'); if (fontVal) a.style.fontFamily = fontVal as string;
                // Expose hover values as CSS variables on the anchor for user CSS to consume if desired
                const hoverKeys = ['hover-bg', 'hover-text', 'hover-border', 'hover-font'];
                for (const hk of hoverKeys) {
                    const v = get(hk);
                    if (v) a.style.setProperty(`--${hk}`, v as string);
                }
            };

            // Process each link
            for (const link of links) {
                if (link.startsWith('[[') && link.endsWith(']]')) {
                    // Internal link
                    const linkContent = link.slice(2, -2);
                    let href = linkContent;
                    let text = linkContent;
                    if (linkContent.includes('|')) {
                        [href, text] = linkContent.split('|');
                    }
                    const a = container.createEl('a', {
                        text: text,
                        attr: { 'data-href': href }
                    });
                    a.addClass('menu-internal-link');
                    if (!selectedLayout) applyInlineBaseStyles(a, 'internal');
                    a.style.cursor = 'pointer';
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.app.workspace.openLinkText(href, ctx.sourcePath, false);
                    });
                } else if (link.match(/^\[.*\]\(.*\)$/)) {
                    // External link
                    const match = link.match(/^\[(.*)\]\((.*)\)$/);
                    if (match) {
                        const text = match[1];
                        const url = match[2];
                        const a = container.createEl('a', {
                            text: text,
                            attr: url.startsWith('file://') ? {} : { href: url, target: '_blank', rel: 'noopener noreferrer' }
                        });
                        a.style.cursor = 'pointer';

                        // Add appropriate class based on link type
                        if (url.startsWith('file://')) {
                            a.addClass('menu-file-link');
                            if (!selectedLayout) applyInlineBaseStyles(a, 'file');
                        } else {
                            a.addClass('menu-external-link');
                            if (!selectedLayout) applyInlineBaseStyles(a, 'external');
                        }
                        a.addEventListener('click', (e) => {
                            e.preventDefault();
                            if (url.startsWith('file://')) {
                                try {
                                    // Convert file URL to path and handle Windows paths
                                    let filePath = decodeURIComponent(url.substring(7)); // Remove 'file://'
                                    // Handle Windows paths that start with /C:
                                    if (filePath.startsWith('/') && filePath.charAt(2) === ':') {
                                        filePath = filePath.substring(1);
                                    }
                                    console.log('Opening file path:', filePath);
                                    shell.openPath(filePath);
                                } catch (error) {
                                    console.error('Failed to open file:', error);
                                }
                            } else {
                                window.open(url, '_blank', 'noopener,noreferrer');
                            }
                        });
                    }
                }
            }
        });
    }

    onunload() {
        // Cleanup if needed
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class MenuPluginSettingTab extends PluginSettingTab {
    plugin: MenuPlugin;

    constructor(app: App, plugin: MenuPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Menu Plugin Settings' });

        new Setting(containerEl)
            .setName('Setting #1')
            .setDesc('It\'s a secret')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue(this.plugin.settings.mySetting)
                .onChange(async (value) => {
                    this.plugin.settings.mySetting = value;
                    await this.plugin.saveSettings();
                }));

        // --- Documentation Section ---
        containerEl.createEl('hr');
        containerEl.createEl('h3', { text: 'Usage Guide' });

        const doc = containerEl.createEl('div');

        doc.createEl('p', { text: 'Create a custom menu using the `menu` code block.' });

        doc.createEl('h4', { text: 'Example' });
        const pre = doc.createEl('pre');
        pre.createEl('code', {
            text: `\`\`\`menu
layout: slate
bg: #333
text: white
[[Internal Link]]
[External Link](https://example.com)
\`\`\``});

        doc.createEl('h4', { text: 'Supported Properties' });
        const ul = doc.createEl('ul');
        ul.createEl('li', { text: 'layout: default, minimal, slate, horizon, aether' });
        ul.createEl('li', { text: 'class: custom CSS classes' });
        ul.createEl('li', { text: 'colors: bg, text, border, font (supports hover- prefix)' });

        doc.createEl('h4', { text: 'Link Types' });
        const ul2 = doc.createEl('ul');
        ul2.createEl('li', { text: '[[Internal Link]] - Opens Obsidian note' });
        ul2.createEl('li', { text: '[External Link](https://...) - Opens in browser' });
        ul2.createEl('li', { text: '[File Link](file://...) - Opens local file/folder' });
    }
}
