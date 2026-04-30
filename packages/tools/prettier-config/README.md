# @stackra/prettier-config

Shared Prettier configuration for Stackra packages.

## Installation

```bash
pnpm add -D @stackra/prettier-config prettier
```

## Usage

### Option 1: package.json (Recommended)

```json
{
  "prettier": "@stackra/prettier-config"
}
```

### Option 2: .prettierrc.json

```json
"@stackra/prettier-config"
```

### Option 3: prettier.config.mjs

```js
import config from '@stackra/prettier-config';

export default config;
```

## Configuration Details

| Option                       | Value    |
| ---------------------------- | -------- |
| Semi                         | `true`   |
| Single Quote                 | `true`   |
| Trailing Comma               | `es5`    |
| Print Width                  | `100`    |
| Tab Width                    | `2`      |
| Arrow Parens                 | `always` |
| End of Line                  | `lf`     |
| Bracket Spacing              | `true`   |
| HTML Whitespace Sensitivity  | `css`    |
| Embedded Language Formatting | `auto`   |

## Overrides

- **JSON files** — Print width of 80, no trailing commas
- **Markdown files** — Print width of 80, always wrap prose
- **YAML files** — Tab width of 2, double quotes

## License

MIT
