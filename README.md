# SSG Optimized - Payload CMS 3 + Next.js Travel Website

A modern, high-performance travel website built with Payload CMS 3, Next.js 15, and React Three Fiber. Features a shared WebGL canvas architecture, interactive 3D components, and comprehensive travel data management.

## 🚀 Features

- **Payload CMS 3**: Full-featured headless CMS with rich content management
- **React Three Fiber**: Shared canvas architecture with `@14islands/r3f-scroll-rig`
- **Interactive 3D Components**: Globe visualizations, WebGL text, animated backgrounds
- **Travel Data Management**: Countries, destinations, experiences, itineraries, and more
- **TypeScript**: Fully typed with strict mode enabled
- **GSAP Animations**: Smooth scroll-based animations
- **Glass Morphism UI**: Modern glass-effect components

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (for Payload CMS)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/thebriankays/ssg-optimized.git
cd ssg-optimized
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
```env
DATABASE_URI=postgresql://user:password@localhost:5432/ssg-optimized
PAYLOAD_SECRET=your-secret-key-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

5. Run database migrations:
```bash
pnpm run payload migrate
```

6. Seed the database (optional):
```bash
# Access the seed endpoint at http://localhost:3000/seed
```

## 🚀 Development

Run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (frontend)/        # Frontend routes
│   └── api/               # API routes
├── blocks/                # Payload CMS content blocks
├── collections/           # Payload CMS collections
├── components/            # React components
│   ├── canvas/           # React Three Fiber components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── providers/            # React context providers
└── payload.config.ts     # Payload CMS configuration
```

## 🎨 Key Components

### WebGL Components
- **GlobalCanvas**: Shared canvas provider using `@14islands/r3f-scroll-rig`
- **TravelDataGlobe**: Interactive 3D globe with travel data visualization
- **WebGLText**: 3D text with shader effects
- **Whatamesh**: Animated mesh background
- **LiquidGlassEffect**: Glass morphism shader effects

### Content Blocks
- **DestinationDetailBlock**: Rich destination information display
- **AreaExplorer**: Interactive map exploration
- **Storytelling**: Narrative-driven content sections
- **ExperienceExplorer**: Travel experience showcase

## 🗄️ Collections

- **Countries**: Country data with ISO codes, regions, and metadata
- **Destinations**: Travel destinations with location data
- **Experiences**: Curated travel experiences
- **TravelItineraries**: Multi-day travel plans
- **Airlines**: Airline information and logos
- **Airports**: Global airport database
- **TravelAdvisories**: Safety and travel warnings

## 🔧 Scripts

```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Build for production
pnpm start              # Start production server

# Database
pnpm payload migrate    # Run migrations
pnpm generate:types     # Generate TypeScript types

# Code Quality
pnpm lint              # Run ESLint
pnpm lint:fix          # Fix linting issues

# Testing
pnpm test              # Run tests
```

## 🚀 Deployment

The application is optimized for deployment on Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Payload CMS](https://payloadcms.com/)
- 3D graphics powered by [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- Scroll rig by [@14islands](https://github.com/14islands/r3f-scroll-rig)