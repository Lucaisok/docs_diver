# Docs Diver

> **Status: Work in Progress** — Core architecture is in place; semantic search and chat features are under active development.

A modern document indexing and retrieval system that lets users upload technical PDFs, search them semantically, and get citation-based AI answers.

## Overview

Docs Diver is built to solve the problem of searching through large technical documentation efficiently. Instead of keyword search, it uses semantic chunking and vector embeddings to understand document content and provide grounded, sourced answers.

### Key Features

- **Workspace Organization**: Separate document collections for different projects or domains
- **PDF Upload & Parsing**: Extract text from PDFs with automatic status tracking (PROCESSING → INDEXED/FAILED)
- **Semantic Chunking**: Smart document segmentation with configurable chunk size and overlap for better retrieval
- **Grounded Answers**: Get AI-powered responses with citations linking back to source documents
- **Real-time Status**: Track document indexing progress and failures
- **Type-Safe Architecture**: Full TypeScript with derived types from Prisma query configs

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 with CSS Modules
- **Backend**: Next.js Server Actions + Server Components
- **Database**: PostgreSQL + Prisma ORM
- **PDF Processing**: pdf-parse with pdfjs-dist (server-side worker configuration)
- **AI**: OpenAI API for embeddings and completions
- **Bundler**: Turbopack (default in Next.js 16)

## Project Structure

```
/app                          # Next.js App Router pages
  /dashboard                  # Workspace overview
  /workspaces/[workspaceId]   # Document management and chat
/components
  /layout                     # Shell, sections, UI containers
  /ui                        # Base UI components (shadcn-style)
/src
  /lib                       # Utilities (routes, Prisma, dev-user)
  /server
    /actions                 # Server actions (createWorkspace, uploadDocument)
    /queries                 # Server queries (getWorkspacesByUserId, getWorkspaceById)
    /documents               # PDF parsing and chunking helpers
  /types                     # Shared types (workspace, results, Prisma payloads)
/prisma
  /migrations                # Database schema migrations
  schema.prisma              # Data models (User, Workspace, Document, DocumentChunk, Chat, Message)
```

## Core Concepts

### Workspaces

A workspace is a collection of documents scoped to a user. Users can create multiple workspaces to organize documents by project or domain.

**Status**: Fully functional. Unique constraint enforced (one name per user).

### Documents

Documents are uploaded PDFs associated with a workspace. Each document goes through a status lifecycle:

- **PROCESSING**: Text extraction and chunking in progress
- **INDEXED**: Ready for semantic search
- **FAILED**: Extraction or chunking failed; error message stored

**Status**: Upload, parsing, and status tracking working. Chunk count depends on document size (default: max 3000 chars per chunk).

### Document Chunks

Semantic chunks are segments of text extracted from documents with configurable overlap. Chunks are indexed for vector embeddings and retrieval.

**Chunking Config** (tunable in `src/server/actions/uploadDocument.ts`):

- `maxChars`: 3000 (characters per chunk)
- `overlapChars`: 300 (overlap between chunks for context)

A typical CV (< 3000 chars) results in 1 chunk; larger documents split automatically.

**Status**: Chunking logic complete. Ready for embedding generation.

### Chats

Users can ask questions across indexed documents in a workspace. Answers include citations linking to source chunks.

**Status**: Schema defined, UI in progress.

## Current Development Priorities

### In Progress

1. **Semantic Search**
   - Generate embeddings for document chunks (OpenAI API)
   - Vector similarity search to find relevant chunks
   - Fallback keyword search during development

2. **Chat Interface**
   - Question input and response streaming
   - Citation display and source navigation
   - Conversation history

3. **UI Polish**
   - CSS Modules migration (from Tailwind)
   - Loading states with skeleton UI
   - Error boundaries and user feedback

### Known Limitations

- **Single User (Dev Mode)**: Currently uses `DEV_USER_ID`; multi-user auth TBD
- **No Embedding Storage**: Chunks are stored; embedding generation pipeline not yet integrated
- **Limited Error Recovery**: Some edge cases in PDF parsing not yet hardened

## Architecture Decisions

### Type Safety

Workspace and document types are **derived from shared Prisma args** (`workspaceListItemArgs`, `workspaceDetailsArgs`), not manually rewritten. This ensures query shape and types stay in sync automatically.

```ts
// Single source of truth for query shape
export const workspaceDetailsArgs = Prisma.validator<Prisma.WorkspaceDefaultArgs>()({
  include: { documents: { ... }, _count: { ... } }
});

// Types derived from args
export type WorkspaceDetails = Prisma.WorkspaceGetPayload<typeof workspaceDetailsArgs>;

// Queries reuse args
const workspace = await prisma.workspace.findFirst({
  ...workspaceDetailsArgs,  // No duplication
});
```

### Error Handling

Server actions and queries return **structured result objects** instead of throwing:

```ts
type Result<T> = {
  success: boolean;
  data: T;
  error: string | null;
};
```

This provides clearer error handling in client components and consistent error messages.

### PDF Processing

PDF parsing runs server-side with a hardened worker configuration:

- Stable worker path from `node_modules` (avoids Turbopack SSR chunk issues)
- Fallback to library default if path is missing
- Automatic parser resource cleanup

## Getting Started

### Prerequisites

- Node.js 20+ (see `package.json` engines)
- PostgreSQL database
- OpenAI API key (for future embeddings/chat)

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment**

   ```bash
   cp .env.example .env.local
   # Update DATABASE_URL and OPENAI_API_KEY
   ```

3. **Initialize database**

   ```bash
   npx prisma migrate dev
   ```

4. **Start dev server**

   ```bash
   npm run dev
   ```

5. **Explore in Prisma Studio**
   ```bash
   npx prisma studio
   ```

### Building

```bash
npm run build      # Turbopack production build
npm start          # Serve production build
npm run lint       # ESLint check
```

## Recent Changes

- **Type Derivation**: Refactored workspace types to derive from shared Prisma args (no manual duplication)
- **Upload Hardening**: Added explicit FAILED status on chunking failure; ensure file cleanup on error
- **PDF Worker Fix**: Stable worker path configuration for SSR compatibility
- **Document Chunking**: Configurable text segmentation with overlap support

## Contributing Notes

### Before Editing Query Files

If you change a Prisma query's `include`/`select` in `src/server/queries/workspaces.ts`:

1. Update the corresponding shared args in `src/types/workspace.ts`
2. TypeScript will automatically sync derived types
3. No manual type rewrites needed

### Testing Changes

- Run `npm run build` to catch type and bundler issues early
- Check `npx prisma studio` to verify document/chunk structure
- Use dev server (`npm run dev`) for interactive testing

## Future Work

- [ ] Embedding generation and vector storage
- [ ] Semantic search implementation
- [ ] Chat streaming with citations
- [ ] Multi-user authentication (Clerk/Auth0)
- [ ] Document versioning
- [ ] Search analytics
- [ ] Admin dashboard

---

**Last Updated**: May 15, 2026
