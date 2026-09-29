Test account
email : test01@gmail.com
password : Test123@


# Image

Image is a creator publishing platform built with Next.js, Convex, Clerk, ImageKit, and Gemini. It lets authenticated creators write posts, save drafts, publish content, upload images, improve text with AI, and track audience activity from a dashboard. Public readers can browse the feed, view creator profiles, read posts, like content, comment, and follow creators.

## Tech Stack

- Next.js App Router
- React 19
- Convex for database, queries, mutations, and generated API types
- Clerk for authentication and protected dashboard routes
- ImageKit for image uploads and transformations
- Google Gemini for AI blog generation and content improvement
- Tailwind CSS 4 with shadcn-style UI components
- Radix UI, lucide-react, sonner, react-hook-form, zod, React Quill, and Chart.js

## Main Features

- Landing page with creator-focused marketing content and calls to action
- Clerk sign-in and sign-up flows
- Protected creator dashboard
- Analytics cards for views, likes, comments, followers, and recent activity
- Daily views chart for content performance
- Post editor with title, rich content, category, tags, featured image, and scheduling fields
- Autosaved draft support while creating posts
- Publish and draft workflows
- Image upload modal using ImageKit
- Gemini-powered content generation and improvement helpers
- Post management with search, status filters, sorting, edit, and delete actions
- Public feed with "For You" and trending tabs
- Suggested creators and follow/unfollow actions
- Public creator profile pages at `/[username]`
- Public post pages at `/[username]/[postId]`
- Like and comment support on public posts

## Project Structure

```text
.
|-- convex/
|   |-- schema.js              # Convex database schema
|   |-- posts.js               # Post queries and mutations
|   |-- user.js                # Current user and username logic
|   |-- dashboard.js           # Analytics and dashboard data
|   |-- feed.js                # Feed, trending, and suggested users
|   |-- public.js              # Public profile/post queries
|   |-- comments.js            # Comment actions
|   |-- likes.js               # Like actions
|   |-- follows.js             # Follow actions
|   |-- auth.config.js         # Convex auth configuration
|   `-- _generated/            # Convex generated API files
|-- Hooks/
|   |-- useConvex.jsx          # Local Convex query/mutation hooks
|   `-- useStoreUserEffect.js  # User sync helper
|-- public/
|   |-- banner.png
|   |-- logo.png
|   `-- placeholder.png
|-- src/
|   |-- app/
|   |   |-- page.jsx                         # Landing page
|   |   |-- layout.js                        # Root layout/providers
|   |   |-- ConvexClientProvider.jsx         # Convex + Clerk provider
|   |   |-- actions/gemini.js                # Gemini server actions
|   |   |-- api/imageKit/upload/route.js     # ImageKit upload endpoint
|   |   |-- dashboard/                       # Protected creator dashboard
|   |   |-- (auth)/                          # Clerk auth pages
|   |   `-- (public)/                        # Feed, profiles, public posts
|   |-- components/                          # App and UI components
|   |-- lib/                                 # Utilities, data, ImageKit helpers
|   `-- proxy.js                             # Clerk middleware/protected routes
|-- components.json
|-- next.config.mjs
|-- package.json
`-- README.md
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |
| `/dashboard` | Creator analytics dashboard |
| `/dashboard/create` | Create or continue a draft post |
| `/dashboard/posts` | Manage posts |
| `/dashboard/posts/edit/[id]` | Edit a post |
| `/dashboard/settings` | Set or update public username |
| `/feed` | Public discovery feed |
| `/[username]` | Public creator profile |
| `/[username]/[postId]` | Public post detail page |
| `/api/imageKit/upload` | Authenticated ImageKit upload endpoint |

## Data Model

Convex stores the application data in these tables:

- `users`: creator profile, email, Clerk token identifier, username, avatar, and activity timestamps
- `posts`: title, HTML content, draft/published status, author, tags, category, featured image, scheduling, views, and likes
- `comments`: post comments with approval status and optional authenticated author
- `likes`: post likes by user
- `follows`: follower/following relationships
- `dailyStats`: per-post daily view counts for analytics

## Environment Variables

Create a `.env.local` file with the required service keys. Do not commit real secret values.

```env
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOY_KEY=
NEXT_PUBLIC_CONVEX_SITE_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=

GEMINI_API_KEY=
```

Notes:

- `NEXT_PUBLIC_CONVEX_URL` is used by `src/app/ConvexClientProvider.jsx`.
- `NEXT_PUBLIC_CONVEX_SITE_URL` may be needed for Convex deployment/auth setup depending on your Convex configuration.
- `VITE_CLERK_PUBLISHABLE_KEY` appears in the local environment file, but this Next.js app uses `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Image uploads require an authenticated Clerk user.

## Local Development

Install dependencies:

```bash
npm install
```

Run the Next.js app:

```bash
npm run dev
```

Start or deploy Convex in a separate terminal as needed for your Convex environment:

```bash
npx convex dev
```

Open the app at:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Start the production server
npm run lint     # Run ESLint
```

## Authentication and Access

`src/proxy.js` uses Clerk middleware to protect all `/dashboard` routes. Public routes such as `/`, `/feed`, `/[username]`, and `/[username]/[postId]` are accessible without signing in, but actions such as creating posts, following users, liking posts, commenting, and uploading images require authentication.

## Image Handling

Image uploads go through `src/app/api/imageKit/upload/route.js`. Uploaded files are sent to ImageKit under `/blog_images` with a user-specific filename prefix. `src/lib/imagekit.js` also includes helpers for client uploads and ImageKit transformation URLs.

## AI Content

`src/app/actions/gemini.js` contains server actions for:

- Generating full blog content from a title, category, and tags
- Improving existing content by enhancing, expanding, or simplifying it

The Gemini integration requires `GEMINI_API_KEY`.

## Development Notes

- The dashboard depends on a synced Convex user record and a public username.
- Creating posts is blocked until the creator sets a username in `/dashboard/settings`.
- The post editor saves drafts automatically every 30 seconds while creating a post.
- The public post page increments view count when a published post is opened.
- `next.config.mjs` allows remote images from Clerk, ImageKit, Unsplash, and a few configured external hosts.
