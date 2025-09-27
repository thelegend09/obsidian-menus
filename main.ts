import { Plugin } from 'obsidian';
import { fileURLToPath } from 'url';

const { shell } = require('electron');

// Simple YAML parser for color properties
function parseYAML(text: string) {
	const result: Record<string, string> = {};
	const lines = text.split('\n');
	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed && trimmed.includes(':')) {
			const [key, ...valueParts] = trimmed.split(':');
			const value = valueParts.join(':').trim();
			if (key && value) {
				result[key.trim()] = value;
			}
		}
	}
	return result;
}

export default class MenuPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor('menu', (source, el, ctx) => {
			const lines = source.trim().split('\n');
			let layout = '';
			let colors: Record<string, string> = {};
			const links: string[] = [];
			
			// Parse YAML-like properties and links
			for (const line of lines) {
				const trimmed = line.trim();
				if (trimmed.startsWith('layout:') || trimmed.startsWith('class:')) {
					const colonIndex = trimmed.indexOf(':');
					layout = trimmed.substring(colonIndex + 1).trim();
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
			
			const finalLayout = layout || 'default';
			const container = el.createEl('div', { cls: `menu-container ${finalLayout}` });
			
			// Apply custom colors as CSS variables
			if (Object.keys(colors).length > 0) {
				for (const [key, value] of Object.entries(colors)) {
					// Replace 'accent' with 'hover-text' for consistency
					let cssKey = key.replace(/accent/g, 'hover-text');
					container.style.setProperty(`--${cssKey}`, value);
				}
				// Example: ensure hover-text is set and add a comment for usage
				if (colors['hover-text']) {
					container.style.setProperty('--hover-text', colors['hover-text']);
					// To use in CSS: a:hover { color: var(--hover-text); }
				}
			}
 
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
					a.style.cursor = 'pointer';
					a.addEventListener('click', (e) => {
						e.preventDefault();
						const vaultName = this.app.vault.getName();
						const encodedFile = encodeURIComponent(href);
						const uri = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodedFile}`;
						window.open(uri);
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
						} else {
							a.addClass('menu-external-link');
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
}
