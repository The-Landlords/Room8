# Room8

Hello! This is the project for our CSC 308 & 309 classes with Chris Zielke for Software Engineering I & II.

This project is planned to encompass a roommate housing and agreement app with the following features:

- A
- B
- C
- D
- E

# Installation

Clone the repo, ensure node is installed, and run the following:

```bash
npm ci
npm install prettier
npm install lint
pre-commit install
npm i -g concurrently
```

## How to Run

`npm` has the ability to run the frontend and backend indvidually via the following commands

```
npm run backend
npm run frontend
```

However, we can run backend AND frontend via

```
npm run dev
```

### Formatting With ESLint and Prettier

upon every commit we run `prettier` and `eslint` via a _github automated workflow_

For this to work, make sure you have run

```bash
pre-commit install
```

as well as installed eslint and prettier

We have the following formatting syntax applied via prettier in addition to defaults: - `"tabWidth": 4,` - `"useTabs": true`

# Backend Formatting

Our backend uses mongoose and mongoDB, and is tested with POSTMAN.
In the backend, we use the following format:

in `express_backend/models`, each schema or "item" in the backend needs two files:

- a _schema file_, ie `Chore.ts`
- a services file, ie `Chore-Services.ts` with exportable functions

additionally, each schema item has a respective route in `express_backend/routes` (ie: `chores-route.ts`) for all CRUD interactions. This is in effort to keep everything organized, and not making `backend.ts` an extremely long file...

# Future Plans

# Features

# Requirements as user
