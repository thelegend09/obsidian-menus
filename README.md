# Menu Plugin for Obsidian

A flexible Obsidian plugin that allows you to create custom menus using code blocks with support for internal links, external links, and local file links.


## Todo
- [ ] Maybe change the format from using "class" to using "layout" and have them numbered? Like grid, flex, etc.


## Features

- 🔗 **Multiple Link Types**: Support for Obsidian internal links, external web links, and local file links
- 🎨 **Three Built-in Themes**: Default, minimal, and enhanced styling options
- ⚙️ **Custom Styling**: Full control over appearance with custom CSS classes
- 📁 **File System Integration**: Click to open local files and folders with system default applications
- 🔄 **Hot Reload Support**: Development-friendly with automatic reloading

## Usage

Create a menu using a `menu` code block:

````markdown
```menu
class: default
[[Home]]
[[Projects|My Projects]]
[Google](https://google.com)
[Documents](file:///C:/Users/YourName/Documents)
```
````

### Syntax

- **First line**: `class: {theme-name}` - Specifies the styling theme
- **Subsequent lines**: Links in various formats

### Link Types

#### Internal Links (Obsidian Notes)
```
[[Note Name]]           # Links to "Note Name.md"
[[Note Name|Display]]   # Links to "Note Name.md" but displays "Display"
```

#### External Links (Web URLs)
```
[Display Text](https://example.com)
```

#### File Links (Local Files/Folders)
```
[My Documents](file:///C:/Users/YourName/Documents)
[Project Folder](file:///C:/Users/YourName/Projects)
[PDF File](file:///C:/Users/YourName/document.pdf)
```

## Built-in Themes

### Default Theme
The standard theme with borders, backgrounds, and distinct styling for each link type.

````markdown
```menu
class: default
[[Home]]
[Google](https://google.com)
[Documents](file:///C:/Users/YourName/Documents)
```
````

### Minimal Theme
Clean, text-only appearance with subtle color differentiation.

````markdown
```menu
class: minimal
[[Home]]
[Google](https://google.com)
[Documents](file:///C:/Users/YourName/Documents)
```
````



## Custom Styling

Create your own themes by adding CSS to your vault's snippets:

```css
.menu-container.my-custom-theme {
    display: flex;
    gap: 2em;
    padding: 1em;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 10px;
}

.menu-container.my-custom-theme a {
    color: white;
    text-decoration: none;
    padding: 0.5em 1em;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
}

.menu-container.my-custom-theme a:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}
```

Then use it in your menu:

````markdown
```menu
class: my-custom-theme
[[Home]]
[Google](https://google.com)
```
````

## Development

### Setup
```bash
npm install
npm run dev    # Start development with auto-rebuild
npm run build  # Build for production
```

## Technical Details

### Link Processing
- **Internal links**: Use Obsidian's `data-href` attribute for proper navigation
- **External links**: Open in new tab with security attributes
- **File links**: Use Electron's shell API to open with system default applications

### CSS Architecture
- Base class: `.menu-container`
- Theme classes: `.menu-container.{theme-name}`
- Link type classes: `.menu-internal-link`, `.menu-external-link`, `.menu-file-link`

## License

MIT License - feel free to modify and distribute.
