# Room8

Hello! This is the project for our CSC 308 & 309 classes with Chris Zielke for Software Engineering I & II.

Room8 is a housing app designed to help roommates organize chores, events, groceries, settings, and rules.

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

## Unit Testing For Schemas

As of `10 March 2026`, all services have been tested _locally_ with mongodb local posting and passed with 100% coverage.
---------------------|---------|----------|---------|---------|-------------------
File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------|---------|----------|---------|---------|-------------------
All files | 100 | 100 | 100 | 100 |  
 Chore-Services.ts | 100 | 100 | 100 | 100 |  
 Chore.ts | 100 | 100 | 100 | 100 |  
 Event-Services.ts | 100 | 100 | 100 | 100 |  
 Event.ts | 100 | 100 | 100 | 100 |  
 Grocery-Services.ts | 100 | 100 | 100 | 100 |  
 Grocery.ts | 100 | 100 | 100 | 100 |  
 Home-Services.ts | 100 | 100 | 100 | 100 |  
 Home.ts | 100 | 100 | 100 | 100 |  
 Rule.ts | 100 | 100 | 100 | 100 |  
 Rules-Services.ts | 100 | 100 | 100 | 100 |  
 User-Services.ts | 100 | 100 | 100 | 100 |  
 User.ts | 100 | 100 | 100 | 100 |  
---------------------|---------|----------|---------|---------|-------------------

Test Suites: 6 passed, 6 total
Tests: 40 passed, 40 total
Snapshots: 0 total
Time: 5.171 s

# Features

This project is planned to encompass a roommate housing and agreement app with the following features:

**User Accounts**

- Sign up and log in
- Access personal data securely
- Join a shared home

**Accessibility**

- Customize appearance (text, colors, mode)
- Colorblind support
- Theme selection / customization
- Works on mobile and desktop (planned, not implemented)

**Profile**

- Edit personal info
- Add preferences and allergens
- Control profile and schedule visibility
- View roommate emergency contacts

**Homes**

- Create and join homes
- View home overview
- Track residents and relationships

**Chores**

- Create and manage chores
- Assign responsibilities
- View assigned tasks

**Groceries**

- Add personal and shared items
- View shared grocery list

**Calendar**

- Create events
- Request guest time slots
- Set quiet hours
- View schedules and space availability
- Export calendar

**Rules**

- Create, view, and request household rules

# Future Plans

Future plans may include

- globalization to all public spaces, rather than a specific niche of a household or apartment
- text message feature: ability to send reminders, statuses, and other items to users based on household updates
- ability to export calendar events as `.ics`

# User Requirements

To be a user, you may need the following:

- A registered account (username and password)

- Membership in at least one shared “home”

- Internet access

- A supported browser (latest Chrome or Firefox)

- A device capable of running a responsive web app (phone or laptop)
