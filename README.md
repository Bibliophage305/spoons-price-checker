# Development Setup

## Installation

Copy the example environment file **before installing dependencies**, as Prisma requires it:

```bash
cp .env.example .env
```

Install dependencies:

```bash
yarn install
```

## Database Setup

On first run, initialise the local database:

```bash
yarn dlx prisma@7 migrate dev
```

## Running Locally

Start the development environment:

```bash
yarn dev
```

This starts the Nuxt development server and local PostgreSQL database.

The application will be available at [http://localhost:3000](http://localhost:3000).