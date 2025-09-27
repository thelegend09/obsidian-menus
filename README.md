# Menu Plugin for Obsidian

Create custom navigation menus in Obsidian using simple code blocks. Supports internal links, external URLs, and local file links with built-in themes and full customization.

## Basic Usage

Create a menu using a `menu` code block with one of the built-in layouts:

````markdown
```menu
layout: default
[[Home]]
[[Projects|My Projects]]
[Google](https://google.com)
[Documents](file:///C:/Users/YourName/Documents)
```
````

## Built-in Layouts

### `default`
Standard buttons with borders and backgrounds
````markdown
```menu
layout: default
[[Dashboard]]
[GitHub](https://github.com)
[Files](file:///C:/Users/Documents)
```
````

### `minimal`
Clean text links with subtle colors
````markdown
```menu
layout: minimal
[[Notes]]
[Web](https://example.com)
[Folder](file:///C:/Projects)
```
````

### `slate`
Solid background buttons
````markdown
```menu
layout: slate
[[Home]]
[Links](https://obsidian.md)
```
````

### `horizon`
Modern outlined style
````markdown
```menu
layout: horizon
[[Dashboard]]
[Resources](https://example.com)
```
````

### `aether`
Grid layout with equal-width items
````markdown
```menu
layout: aether
[[Projects]]
[GitHub](https://github.com)
[Documents](file:///C:/Users/Documents)
```
````

## Link Types

- **Internal**: `[[Note Name]]` or `[[Note Name|Display Text]]`
- **External**: `[Display Text](https://example.com)`
- **Files**: `[Display Text](file:///C:/path/to/file)`

## Color Customization

Add color properties using YAML syntax:

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

### Global Color Variables
- `bg`: Background color
- `text`: Text color
- `border`: Border color
- `hover-text`: Hover text color
- `hover-bg`: Hover background
- `hover-border`: Hover border color
- `font`: Font family

### Link-Type Specific Colors
Customize each link type individually:

````markdown
```menu
layout: minimal
internal-text: #00ff00
external-text: #ff6600
file-text: #0066ff
internal-font: "Arial"
external-font: "Georgia"
[[Internal Link]]
[External Link](https://example.com)
[File Link](file:///C:/Documents)
```
````

**Available for each type** (`internal`, `external`, `file`):
- `{type}-text`: Text color
- `{type}-bg`: Background color
- `{type}-border`: Border color
- `{type}-font`: Font family
- `{type}-hover-text`: Hover text color
- `{type}-hover-bg`: Hover background
- `{type}-hover-border`: Hover border color

## Advanced Examples

### Gradient Background
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

### Different Fonts Per Link Type
````markdown
```menu
layout: default
font: "Inter"
internal-font: "Fira Code"
external-font: "Georgia"
file-font: "Arial"
[[Code Notes]]
[Articles](https://medium.com)
[Local Files](file:///C:/Documents)
```
````

## Notes

- Use either `layout:` or `class:` (both work the same)
- File paths use `file://` protocol
- Colors support hex, rgb, hsl, CSS variables, and gradients
- Font names with spaces need quotes: `font: "Work Sans"`