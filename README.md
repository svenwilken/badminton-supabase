# Badminton Tournament Management System

A comprehensive badminton tournament management application built with Angular and Supabase. This system allows you to manage players, tournaments, disciplines, matches, and player charges for badminton events.

## Features

- **Player Management**: Add, edit, and manage player profiles with gender information
- **Tournament Management**: Create and organize badminton tournaments
- **Discipline Support**: Handle both singles and doubles disciplines
- **Match Tracking**: Record match results with set-by-set scoring
- **Player Charges**: Track tournament fees and payments
- **Club Management**: Organize players by clubs
- **Internationalization**: Multi-language support (English and German)
- **Modern UI**: Material Design components with Angular Material

## Tech Stack

### Frontend
- **Angular 20.3** - Modern web application framework
- **Angular Material** - UI component library
- **TypeScript 5.9** - Type-safe JavaScript
- **RxJS 7.8** - Reactive programming
- **ngx-translate** - Internationalization (i18n)

### Backend
- **Supabase** - Backend-as-a-Service (BaaS)
- **PostgreSQL** - Relational database with Row Level Security (RLS)
- **Supabase JS Client** - Real-time database interactions

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher recommended)
- **npm** (comes with Node.js)
- **Supabase CLI** (for local development)
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd badminton-tournament-supabase
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Set Up Supabase

#### Option A: Local Development with Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Start local Supabase instance
supabase start

# Apply migrations
supabase db reset
```

#### Option B: Use Supabase Cloud

1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update the environment configuration (see Configuration section)

### 4. Configure Environment

Create or update the environment configuration in `frontend/src/app/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

### 5. Run the Application

```bash
# Navigate to frontend directory
cd frontend

# Start the development server
npm start
```

The application will be available at `http://localhost:4200`

## Project Structure

```
badminton-tournament-supabase/
├── frontend/                    # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Reusable UI components
│   │   │   │   ├── create-player-dialog/
│   │   │   │   └── create-tournament-dialog/
│   │   │   ├── pages/          # Page components
│   │   │   │   ├── players-list/
│   │   │   │   └── tournament-list/
│   │   │   ├── services/       # Angular services
│   │   │   │   └── supabase.service.ts
│   │   │   ├── models/         # TypeScript interfaces and types
│   │   │   │   ├── database.types.ts
│   │   │   │   └── types.ts
│   │   │   └── environment.ts  # Environment configuration
│   │   ├── styles.scss         # Global styles
│   │   └── theme.scss          # Material theme customization
│   └── public/
│       └── assets/
│           └── i18n/           # Translation files
│               ├── en.json
│               └── de.json
├── supabase/                   # Supabase configuration
│   ├── config.toml             # Supabase project configuration
│   ├── migrations/             # Database migration files
│   │   ├── 20251101203506_base-setup.sql
│   │   └── 20251101224050_clubs.sql
│   └── types.ts                # Generated TypeScript types
└── README.md
```

## Database Schema

The application uses the following main tables:

### Core Tables

- **`player`**: Player profiles with name and gender
- **`club`**: Club/organization information
- **`tournament`**: Tournament metadata
- **`discipline`**: Tournament disciplines (singles/doubles, gender-specific)

### Match Tables

- **`base_match`**: Abstract base table for all matches
- **`singles_match`**: Singles matches with two players
- **`doubles_match`**: Doubles matches with pairs
- **`doubles_pair`**: Doubles team compositions

### Financial

- **`player_charges`**: Track tournament fees and payments

All tables include Row Level Security (RLS) policies to ensure data protection.

## Available Scripts

### Frontend

```bash
cd frontend

# Development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Watch mode for development
npm run watch
```

### Supabase

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset database (reapply all migrations)
supabase db reset

# Create a new migration
supabase migration new <migration-name>

# Generate TypeScript types from database
supabase gen types typescript --local > supabase/types.ts
```

## Development Workflow

1. **Make database changes**: Create migration files in `supabase/migrations/`
2. **Apply migrations**: Run `supabase db reset` to apply changes locally
3. **Update types**: Generate new TypeScript types with `supabase gen types`
4. **Copy types**: Update `frontend/src/app/models/database.types.ts` with generated types
5. **Implement features**: Update Angular components and services
6. **Test locally**: Use the development server to test changes
7. **Commit**: Commit both code and migration files

## Configuration

### Supabase Configuration

Edit `supabase/config.toml` to customize your Supabase instance:

- Database settings
- API configuration
- Auth settings
- Storage configuration

### Angular Configuration

- **Routing**: Configured in `frontend/src/app/app.routes.ts`
- **Material Theme**: Customized in `frontend/src/theme.scss`
- **Translations**: Add/edit translations in `frontend/public/assets/i18n/`

## Features Overview

### Player Management
- Create new players with name and gender
- Associate players with clubs
- View and search all players
- Track player participation in tournaments

### Tournament Management
- Create tournaments with custom names
- Define disciplines (singles/doubles, mixed/men/women)
- Set entry fees per discipline
- Track tournament progress

### Match Management
- Record singles and doubles matches
- Track match scores set by set
- Record match start and finish times
- Determine winners automatically

### Financial Tracking
- Set charges per discipline
- Track player payments
- Calculate outstanding balances
- Generate financial reports

## Internationalization

The application supports multiple languages. Currently available:
- English (en)
- German (de)

To add a new language:
1. Create a new JSON file in `frontend/public/assets/i18n/`
2. Copy the structure from an existing language file
3. Translate all keys
4. The language will be automatically available in the app

## Security

- **Row Level Security (RLS)**: Enabled on all tables
- **Anonymous Access**: Configured for public tournament viewing
- **Authenticated Access**: Required for data modification
- **Service Role**: Reserved for admin operations

## Future Enhancements

Potential features for future development:

- [ ] Real-time match updates with Supabase Realtime
- [ ] Tournament brackets and scheduling
- [ ] Player statistics and rankings
- [ ] Email notifications
- [ ] Mobile app (React Native or Flutter)
- [ ] Print-friendly tournament brackets
- [ ] Advanced reporting and analytics
- [ ] User authentication and roles
- [ ] Tournament registration workflow

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository.

## Acknowledgments

- Built with [Angular](https://angular.dev/)
- Backend powered by [Supabase](https://supabase.com/)
- UI components from [Angular Material](https://material.angular.io/)
