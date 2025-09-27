# Obsidian Menus

Create simple, stylable menus from code blocks. You write links inside a `menu` code block, and the plugin renders:
- a single div with class `menu-container`
- a set of anchor tags inside it

You can:
- Pick a built-in template (default, minimal, slate, horizon, aether)
- Use your own CSS class (no plugin CSS applied)
- Override styles using a small, safe set of YAML-like variables
- Mix template + extra classes (e.g., `layout: horizon wide`)

CSS stays clean and predictable.

## Basic Usage

Create a menu using a `menu` code block with one of the built-in templates:

````markdown
```menu
layout: default
[[Home]]
[[Projects|My Projects]]
[Google](https://google.com)
[Documents](file:///C:/Users/YourName/Documents)
```
````

- `[[Note]]` or `[[Note|Alias]]` creates internal links.
- `[Text](https://example.com)` creates web links.
- `[Text](file:///C:/path/to/file)` opens local files/folders.

## Built-in Templates

Available out of the box:
- default
- minimal
- slate
- horizon
- aether

Example:

````markdown
```menu
layout: slate
[[Home]]
[Links](https://obsidian.md)
```
````

You can also add extra classes like `wide` next to the layout:

````markdown
```menu
layout: horizon wide
[[Dashboard]]
[Resources](https://example.com)
```
````

Note: Built-in template CSS only applies when a built-in layout is selected. Internally, the container gets a `data-layout="..."` attribute which gates the plugin CSS. If you don’t select a built-in layout, none of the plugin CSS will affect your menu.

## Custom CSS Class Mode (No Plugin CSS)

Use your own CSS by providing a custom class via `class:` or `layout:` with a non-built-in value. In this mode, the plugin does not apply any of its CSS. It only renders the HTML and exposes inline CSS variables from the YAML-like overrides.

````markdown
```menu
class: my-menu wide
bg: #111
text: #eee
hover-text: #0af
internal-hover-text: orange

[[Home]]
[Web](https://example.com)
[Folder](file:///C:/Projects)
```
````

Then, in a CSS snippet:

```css
/* Example custom styling */
.menu-container.my-menu {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.menu-container.my-menu a {
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  color: var(--text, var(--text-normal));
  background: var(--bg, transparent);
  border: 1px solid var(--border, var(--background-modifier-border));
}

.menu-container.my-menu a:hover {
  color: var(--hover-text, var(--text-accent));
  background: var(--hover-bg, transparent);
  border-color: var(--hover-border, var(--text-accent));
}
```

## YAML-like Overrides (Safe Whitelist)

The code block supports a small set of variables. No raw CSS properties are accepted in the code block. If you need full CSS power, use a CSS snippet in your IDE.

Global variables:
- bg
- text
- border
- font
- hover-text
- hover-bg
- hover-border
- hover-font

Per link type variants (prefix with internal-, external-, file-):
- internal-bg, internal-text, internal-border, internal-font
- internal-hover-text, internal-hover-bg, internal-hover-border, internal-hover-font
- external-... (same set)
- file-... (same set)

Naming aliases supported:
- text-hover -> hover-text
- bg-hover -> hover-bg
- border-hover -> hover-border
- font-hover -> hover-font
- accent -> hover-text (and internal-accent/external-accent/file-accent -> corresponding -hover-text)

Behavior of keys:
- bg applies to the buttons (anchors), not the container
- hover-* applies to the hover state of the buttons
- type-specific keys (e.g., internal-text) override the global ones for that link type

Examples (template mode):
````markdown
```menu
layout: default
bg: #1a1a1a
text: #ffffff
hover-text: #ff6b6b
border: #333333

[[Home]]
[GitHub](https://github.com)
```
````

Per-link-type overrides:
````markdown
```menu
layout: minimal
internal-text: #00ff00
external-text: #ff6600
file-text: #0066ff
internal-font: "Fira Code"
external-font: "Georgia"
file-font: "Arial"

[[Internal Link]]
[External Link](https://example.com)
[File Link](file:///C:/Documents)
```
````

## Link Types

- Internal: `[[Note Name]]` or `[[Note Name|Display Text]]`
- External: `[Display Text](https://example.com)`
- Files: `[Display Text](file:///C:/path/to/file)`

Behavior:
- Internal links open within Obsidian.
- External links open in your browser.
- File links open via the OS.

## Notes

- Use either `layout:` or `class:`. If the value contains a built-in template, the template is applied. Otherwise, it’s treated as a pure CSS class (no plugin CSS).
- If no `layout:` or `class:` is provided, `layout: default` is assumed.
- Colors support hex, rgb, hsl, CSS variables, and gradients.
- Font names with spaces need quotes: `font: "Work Sans"`.
- You can append additional classes after the layout or class: `layout: horizon wide my-extra`.

## Examples

Built-in template with overrides:
````markdown
```menu
layout: horizon
bg: linear-gradient(45deg, #667eea, #764ba2)
text: white
hover-text: #ffd700
[[Dashboard]]
[Projects](https://github.com)
```
````

Custom class with overrides:
````markdown
```menu
class: my-toolbar
text: var(--text-normal)
hover-text: var(--text-accent)
[[Inbox]]
[Wiki](https://example.com)
```
````

Minimal template focusing on text colors:
````markdown
```menu
layout: minimal
internal-text: var(--text-accent)
external-text: var(--text-faint)
file-text: var(--text-muted)
[[Notes]]
[Web](https://example.com)
[Folder](file:///C:/Projects)
```
