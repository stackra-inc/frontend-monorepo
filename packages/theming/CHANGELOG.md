# @stackra-inc/react-theming

## 2.0.0

### Breaking Changes — DI Refactor

- 🏗️ Refactored to `ThemeModule.forRoot()` / `forFeature()` DynamicModule
  pattern
- 💉 `ThemeRegistry` and `CustomizerRegistry` are now @Injectable services
- 🏷️ Added DI tokens: `THEME_CONFIG`, `THEME_REGISTRY`, `CUSTOMIZER_REGISTRY`
- 📁 Added `constants/` folder with `tokens.constant.ts` and
  `themes.constant.ts`
- 🌐 Global singleton exports preserved for non-DI usage

### Features

- 🌈 7 built-in themes: Default, Netflix, Ocean, Rose, Forest, Amber, Violet
- 🎨 `ThemeRegistry` for registering and querying named themes
- 🎛️ `CustomizerRegistry` for registering customizer panels
- ⚛️ `ThemeProvider` React context provider
- 🔀 `ThemeSwitcher` and `ThemeSelector` components
- 🌗 `ModeSwitcher` and `ModeSelector` for dark/light/system mode
- 🎛️ `ThemeCustomizer` panel component
- 🪝 `useTheme()` hook — `{ theme, setTheme, themes }`
- 🌙 `useColorMode()` hook —
  `{ mode, setMode, resolvedMode, isDark, isLight, toggle }`
- 📦 `ThemeModule.registerTheme()` and `ThemeModule.registerCustomizer()`
  convenience methods
- 🔄 `ThemeModule.registerCustomizers()` for batch panel registration

## 1.0.0

### Initial Release

- 🎉 Initial release of @stackra-inc/react-theming
- 🎨 Theme registry with built-in and custom theme support
- 🌗 Dark/light mode switching
- 💉 DI integration with ThemeModule.forRoot()
- 🎣 React hooks for theme access
