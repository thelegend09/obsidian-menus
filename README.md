# Obsidian Menus
Create simple, stylable menus from code blocks. Write links inside a menu code block, and the plugin renders a clean set of clickable items.

## Quick Start
Create a menu using the menu code block:

```markdown
```menu
layout: default
[[Home]]
[[Projects|My Projects]]
[Google](https://google.com)
[Documents](file:///C:/Users/YourName/Documents)
```
```

The plugin supports three link types:
- Internal: `[[Note]]` or `[[Note|Alias]]` opens notes in Obsidian
- Web: `[Text](https://example.com)` opens in your browser
- File: `[Text](file:///C:/path/to/file)` opens local files or folders

## Built-in Templates

Choose from five pre-styled layouts:

- `default` — balanced, general-purpose design
- `minimal` — clean and understated
- `slate` — darker theme with subtle borders
- `horizon` — horizontal emphasis with gradients
- `aether` — light and airy aesthetic

Add extra classes after the layout name:

````markdown
```menu
layout: horizon wide
[[Dashboard]]
[Resources](https://example.com)
```
```

## Custom Styling

Use your own CSS class to bypass the built-in templates entirely. The plugin only renders the HTML structure and inline CSS variables—no default styles apply.

````markdown
```menu
class: my-menu
bg: #111
text: #eee
hover-text: #0af

[[Home]]
[Web](https://example.com)
```
```

Then create your own CSS snippet:

```css
.menu-container.my-menu {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.menu-container.my-menu a {
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  color: var(--text, var(--text-normal));
  background: var(--bg, transparent);
}

.menu-container.my-menu a:hover {
  color: var(--hover-text, var(--text-accent));
  background: var(--hover-bg, transparent);
}
```

## Style Variables

Override colors and fonts using YAML-like variables inside the code block. Only these whitelisted properties are supported:

**Global variables:**
- `bg` — background color for buttons
- `text` — text color
- `border` — border color
- `font` — font family
- `hover-text`, `hover-bg`, `hover-border`, `hover-font` — hover state styles

**Per-link-type variables:**

Prefix any global variable with `internal-`, `external-`, or `file-` to target specific link types:

````markdown
```menu
layout: minimal
internal-text: #00ff00
external-text: #ff6600
file-text: #0066ff

[[Internal Link]]
[External Link](https://example.com)
[File Link](file:///C:/Documents)
```
```

**Accepted formats:**
- Colors: hex (`#1a1a1a`), rgb, hsl, CSS variables (`var(--text-accent)`), gradients
- Fonts: plain names or quoted for spaces (`font: "Work Sans"`)

## Dataview Integration

Generate links dynamically from Dataview queries. Prefix your query with `dataview:` or `dv:`:

````markdown
```menu
layout: default
[[Home]]
dataview: LIST FROM "Projects"
```
```

The plugin unwraps Dataview results so links blend seamlessly into your menu layout.

## Examples

Template with gradient background:

````markdown
```menu
layout: horizon
bg: linear-gradient(45deg, #667eea, #764ba2)
text: white
hover-text: #ffd700

[[Dashboard]]
[Projects](https://github.com)
```
```

Custom class with theme variables:

````markdown
```menu
class: my-toolbar
text: var(--text-normal)
hover-text: var(--text-accent)

[[Inbox]]
[Wiki](https://example.com)
```
```
