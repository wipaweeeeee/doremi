<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Conventions
## Structure
- Components live in src/components/
- Shared utilities in src/lib/
- Hooks in src/hooks/

## Stack
- Next.js 15, SCSS style modules
- Camelcase style, no BEM
- Aliases: @components → src/components, @lib → src/lib

## Rules
- Never use inline styles
- Always co-locate component SCSS with component file
- Always use aliases
