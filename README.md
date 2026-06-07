# Room8

Hello! This is the project for our CSC 308 & 309 classes with Professor Chris Zielke for Software Engineering I & II.

Room8 is a housing app designed to help roommates organize chores, events, groceries, settings, and rules.

### CI/CD Status

[![Frontend Deploy](https://img.shields.io/github/actions/workflow/status/The-Landlords/Room8/azure-static-web-apps-white-pond-00a466e1e.yml?style=for-the-badge&label=Frontend+Deploy&logo=microsoft-azure)](https://github.com/The-Landlords/Room8/actions/workflows/azure-static-web-apps-white-pond-00a466e1e.yml)

[![Backend Deploy](https://img.shields.io/github/actions/workflow/status/The-Landlords/Room8/ci-cd_room8.yml?style=for-the-badge&label=Backend+Deploy&logo=microsoft-azure)](https://github.com/The-Landlords/Room8/actions/workflows/ci-cd_room8.yml)

[![CI Testing](https://img.shields.io/github/actions/workflow/status/The-Landlords/Room8/CI.yml?style=for-the-badge&label=CI+Testing&logo=github)](https://github.com/The-Landlords/Room8/actions/workflows/CI.yml)

[![Cypress e2e Testing](https://img.shields.io/github/actions/workflow/status/The-Landlords/Room8/CI.yml?style=for-the-badge&label=Cypress-e2e-Testing&logo=github)](https://github.com/The-Landlords/Room8/actions/workflows/cypress.yml)

[![Coverage Reports](https://img.shields.io/github/actions/workflow/status/The-Landlords/Room8/CI.yml?style=for-the-badge&label=Coverage+Reports&logo=vitest)](https://the-landlords.github.io/Room8/)

You may see a live demo here:

**https://white-pond-00a466e1e.7.azurestaticapps.net/**

### Installation

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

### How to Run

`npm` has the ability to run the frontend and backend indvidually via the following commands

```
npm run backend
npm run frontend
```

However, run both in union by

```
npm run dev
```

Tests and additional scripts can be run as follows

```
npm run test # all tests
npm run tb # backend tests with mock
npm run tf # frontend tests with v8
npm run cy:e2e # e2e tests using cucumber and cypress
npm run coverage # entire coverage graph
npm run coverage:backend # backend coverage graph
npm run coverage:frontend # frontend coverage graph
npm run swagger # generates swagger file and opens the swagger api tab

```

CI publishes the latest coverage reports from `main` through GitHub Pages:

- [Combined coverage landing page](https://the-landlords.github.io/Room8/)
- [Frontend coverage report](https://the-landlords.github.io/Room8/frontend/)
- [Backend coverage report](https://the-landlords.github.io/Room8/backend/)

#### Formatting With ESLint and Prettier

upon every commit we run `prettier` and `eslint` via a _github automated workflow_

For this to work, make sure you have run

```bash
pre-commit install
```

as well as installed eslint and prettier

We have the following formatting syntax applied via prettier in addition to defaults: - `"tabWidth": 4,` - `"useTabs": true`

```
npm run lint:check # alert of any possible issues from linter.
npm run lint:fix # fix any possible issues from lint. not all are found by lint, see CI/CD logs
npm run format # apply format fixes using prettier
npm run format:check # alert but do not write format issues
```

### Backend Formatting

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

### Unit Testing For Schemas

As of `12 May 2026`, all services have been tested _locally_ with mongodb local posting and passed with 100% coverage with updated with Mockinggoose. The front end pages have less coverage, but all pass with 70% or higher!
| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
|---|---:|---:|---:|---:|---|
| All files | 100 | 100 | 100 | 100 | |
| models | 100 | 100 | 100 | 100 | |
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
| utils | 100 | 100 | 100 | 100 | |
| encryption.ts | 100 | 100 | 100 | 100 | |
**Test Summary**

| Metric      |                   Result |
| ----------- | -----------------------: |
| Test Suites |      13 passed, 13 total |
| Tests       |    176 passed, 176 total |
| Snapshots   |                  0 total |
| Time        | 11.975 s, estimated 12 s |

Frontend report from `v8`
| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
|---|---:|---:|---:|---:|---|
| All files | 86.59 | 90.46 | 81.43 | 88.21 | |
| src | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;config.ts | 100 | 100 | 100 | 100 | |
| src/components | 91.94 | 91.89 | 89.65 | 92.38 | |
| &nbsp;&nbsp;&nbsp;&nbsp;DeleteVotePanel.tsx | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;EditEventOverlay.tsx | 100 | 95 | 100 | 100 | 31 |
| &nbsp;&nbsp;&nbsp;&nbsp;RuleCard.tsx | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;VotePanel.tsx | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;addEventOverlay.tsx | 96.15 | 80 | 100 | 96.15 | 55 |
| &nbsp;&nbsp;&nbsp;&nbsp;addHomeOverlay.tsx | 76.19 | 80 | 75 | 76.19 | 30-31,37,43,50 |
| &nbsp;&nbsp;&nbsp;&nbsp;addOverlay.tsx | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;baseList.tsx | 83.33 | 100 | 80 | 83.33 | 97 |
| &nbsp;&nbsp;&nbsp;&nbsp;createHomeOverlay.tsx | 86.48 | 84.21 | 83.33 | 87.85 | 84-85,99,106,112-116,139-140,144-146,172,246 |
| &nbsp;&nbsp;&nbsp;&nbsp;eventList.tsx | 75 | 100 | 66.66 | 75 | 54 |
| &nbsp;&nbsp;&nbsp;&nbsp;header.tsx | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;homeAddOverlay.tsx | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;homeList.tsx | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;input.tsx | 92.3 | 91.66 | 86.66 | 95.23 | 118 |
| &nbsp;&nbsp;&nbsp;&nbsp;overlay.tsx | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;removeEventOverlay.tsx | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;removeHomeOverlay.tsx | 93.33 | 100 | 75 | 93.33 | 60 |
| &nbsp;&nbsp;&nbsp;&nbsp;rulesList.tsx | 88.88 | 85.71 | 83.33 | 87.5 | 52 |
| src/pages | 82.02 | 88.94 | 75 | 84.57 | |
| &nbsp;&nbsp;&nbsp;&nbsp;calendarPage.tsx | 59.25 | 80.76 | 46.66 | 63.01 | 38-50,61-70,97-98,111,117,154-172,213,245-248,263-265 |
| &nbsp;&nbsp;&nbsp;&nbsp;chorePage.tsx | 92.85 | 80 | 100 | 100 | 27,52,75 |
| &nbsp;&nbsp;&nbsp;&nbsp;groceryPage.tsx | 91.37 | 82.75 | 100 | 96.22 | 43,50 |
| &nbsp;&nbsp;&nbsp;&nbsp;homelistPage.tsx | 64.7 | 87.5 | 55.55 | 66.66 | 30-46,96,107-132 |
| &nbsp;&nbsp;&nbsp;&nbsp;rulesPage.tsx | 86.9 | 81.08 | 95 | 86.25 | 51-63,72,157,178-179,241 |
| &nbsp;&nbsp;&nbsp;&nbsp;signInPage.tsx | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;signUpPage.tsx | 100 | 100 | 100 | 100 | |
| &nbsp;&nbsp;&nbsp;&nbsp;userSetting.tsx | 97.29 | 100 | 100 | 97.22 | 413 |

### API TESTING

API testing via **[swagger](https://swagger.io/)** is available at [http://localhost:8000/api-docs](http://localhost:8000/api-docs)

### Features

#### User Requirements

To be a user, you may need the following:

- A registered account (username and password)

- Internet access

- A supported browser (latest Chrome or Firefox or Safari)

- A device capable of running a responsive web app (phone or laptop)

#### App Features

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

### Future Plans

Future plans may include

- globalization to all public spaces, rather than a specific niche of a household or apartment
- text message feature: ability to send reminders, statuses, and other items to users based on household updates
- colorblindness modes, light vs dark modes, text size alerations
