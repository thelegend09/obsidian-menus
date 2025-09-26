import { Plugin } from 'obsidian';
import { fileURLToPath } from 'url';

const { shell } = require('electron');

export default class MenuPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor('menu', (source, el, ctx) => {
			// Parse the source
			const lines = source.trim().split('\n');
			let cssClass = '';
			const links: string[] = [];

			for (const line of lines) {
				const trimmed = line.trim();
				if (trimmed.startsWith('class:')) {
					cssClass = trimmed.substring(6).trim().replace(/[{}]/g, '');
				} else if (trimmed) {
					links.push(trimmed);
				}
			}

			// Create the container - if no class specified, use 'default'
			const finalClass = cssClass || 'default';
			const container = el.createEl('div', { cls: `menu-container ${finalClass}` });

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
