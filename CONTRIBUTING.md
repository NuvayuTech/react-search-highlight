# Contributing to @nuvayutech/react-search-highlight

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Development Setup

### Prerequisites
- Node.js (>= 14.x)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd react-search-highlight
```

2. Install dependencies:
```bash
npm install
```

## Project Structure

```
react-search-highlight/
├── src/
│   ├── index.ts                    # Main export file
│   ├── useSearchableContent.ts     # Core hook implementation
│   ├── SearchBox.tsx               # Search UI component
│   ├── SearchableContent.tsx       # Main wrapper component
│   ├── searchablecontent.jsx       # Original JSX (deprecated)
│   ├── SearchBox.jsx               # Original JSX (deprecated)
│   └── chatSearch.jsx              # Original JSX (deprecated)
├── dist/                           # Build output (auto-generated)
├── examples.tsx                    # Usage examples
├── package.json
├── tsconfig.json
├── rollup.config.js
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## Development Workflow

### Building the Package

Build the TypeScript to JavaScript:
```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Generate type definitions (.d.ts files)
- Create both CommonJS and ESM bundles
- Output everything to the `dist/` folder

### Testing Locally

To test your changes locally in another project:

1. Build the package:
```bash
npm run build
```

2. Link the package globally:
```bash
npm link
```

3. In your test project:
```bash
npm link @nuvayutech/react-search-highlight
```

4. Import and use:
```tsx
import { SearchableContent } from '@nuvayutech/react-search-highlight';
```

### Type Checking

Run TypeScript type checking:
```bash
npx tsc --noEmit
```

### Linting

Run ESLint (once configured):
```bash
npm run lint
```

## Making Changes

### Code Style

- Use TypeScript for all new code
- Follow existing code conventions
- Use functional components and hooks
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use meaningful variable names

### Type Safety

- All new code must be fully typed
- Avoid using `any` type
- Export all relevant types and interfaces
- Use strict TypeScript settings

### Commit Guidelines

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for regex search patterns
fix: correct highlight positioning on scroll
docs: update API reference for SearchBox
refactor: optimize text range calculation
```

## Adding Features

When adding a new feature:

1. **Create an issue** describing the feature
2. **Update types** in TypeScript files
3. **Implement the feature** with proper error handling
4. **Update documentation** in README.md
5. **Add examples** in examples.tsx
6. **Update CHANGELOG.md**
7. **Submit a pull request**

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Make your changes
4. Build and test: `npm run build`
5. Commit your changes: `git commit -am 'feat: add some feature'`
6. Push to the branch: `git push origin feature/my-new-feature`
7. Submit a pull request

### PR Checklist

Before submitting a PR, ensure:
- [ ] Code follows project style guidelines
- [ ] TypeScript compiles without errors
- [ ] All types are properly defined
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Examples are added/updated if relevant
- [ ] Build succeeds (`npm run build`)

## Publishing (Maintainers Only)

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Build the package: `npm run build`
4. Test the build locally
5. Commit changes
6. Create a git tag: `git tag v1.0.0`
7. Push with tags: `git push --tags`
8. Publish: `npm publish`

## Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new backward-compatible functionality
- **PATCH** version for backward-compatible bug fixes

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about usage
- Suggestions for improvements

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
