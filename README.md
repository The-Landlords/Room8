# Room8

Hello! This is the project for our CSC 308 & 309 classes with Chris Zielke for Software Engineering I & II.

Room8 is a housing app designed to help roommates organize chores, events, groceries, settings, and rules.

# Installation

Clone the repo, ensure node is installed, and run the following:

```bash
npm ci
npm install prettier
npm install lint
npm install jest
pre-commit install
npm i -g concurrently
npm install -w packages/express_backend ics
npm install -w packages/react-frontend @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core
```

additionally, a `.env` file in the root should look like:

```ts
MONGO_URI = YOUR SECRET HERE
MONGO_URI_LOCAL=mongodb://localhost:27017/room8
MONGO_URI_TEST=mongodb://localhost:27017/room8_test
```

where `MONGO_URI` is a secret for a shared mongodb account.

## How to Run

`npm` has the ability to run the frontend and backend indvidually via the following commands

```
npm run backend
npm run frontend
```

However, run both in union by

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

The backend routes are defined by the following:
| Method | Route | Description |
| ------ | ----------- | ------------ |
| POST | /user | Create user |
| GET | /user | Fetch chores |

_This table is unfinished as of 10 Mar_

## Unit Testing For Schemas

As of `6 May 2026`, all services have been tested _locally_ with mongodb local posting and passed with 100% coverage with updated with Mockinggoose. The front end pages have less coverage, but all pass with 70% or higher!
| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
|--------------------------------|---------|----------|---------|---------|-----------------------------------------------|
| **All files** | 86.62 | 73.46 | 80.66 | 89.96 | |
| express_backend/models | 100 | 100 | 100 | 100 | |
| Chore-Services.ts | 100 | 100 | 100 | 100 | |
| Chore.ts | 100 | 100 | 100 | 100 | |
| Event-Services.ts | 100 | 100 | 100 | 100 | |
| Event.ts | 100 | 100 | 100 | 100 | |
| Grocery-Services.ts | 100 | 100 | 100 | 100 | |
| Grocery.ts | 100 | 100 | 100 | 100 | |
| Home-Services.ts | 100 | 100 | 100 | 100 | |
| Home.ts | 100 | 100 | 100 | 100 | |
| Rule.ts | 100 | 100 | 100 | 100 | |
| Rules-Services.ts | 100 | 100 | 100 | 100 | |
| User-Services.ts | 100 | 100 | 100 | 100 | |
| User.ts | 100 | 100 | 100 | 100 | |
| react-frontend/src | 100 | 100 | 100 | 100 | |
| config.jest.ts | 100 | 100 | 100 | 100 | |
| react-frontend/src/components | 80.95 | 66.66 | 66.66 | 84.21 | |
| addOverlay.tsx | 80 | 50 | 75 | 85.71 | 37-38 |
| overlay.tsx | 83.33 | 100 | 50 | 80 | 20 |
| react-frontend/src/pages | 81.63 | 69.51 | 75.47 | 86.15 | |
| calendarPage.tsx | 80.43 | 84.61 | 68.29 | 82.14 | 92-93,106,112,150,159-160,172-207,236,249-251 |
| chorePage.tsx | 73.46 | 50 | 78.57 | 82.92 | 20,47,68,85-86,121-122 |
| homelistPage.tsx | 81.53 | 87.5 | 72.41 | 83.05 | 56-57,78,90,101,116-117,130,150-153 |
| rulesPage.tsx | 87.67 | 65.51 | 94.11 | 93.84 | 73,94,153,164 |
| signInPage.tsx | 100 | 100 | 100 | 100 | |
| signUpPage.tsx | 100 | 100 | 100 | 100 | |
| userSetting.tsx | 70.27 | 57.14 | 67.44 | 76.36 | 109,115-116,233-234,341,447-499,551-573 |

**Test Summary**

- Test Suites: 19 passed, 19 total
- Tests: 176 passed, 176 total
- Snapshots: 0 total
- Time: 5.778 s

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

- Internet access

- A supported browser (latest Chrome or Firefox)

- A device capable of running a responsive web app (phone or laptop)
