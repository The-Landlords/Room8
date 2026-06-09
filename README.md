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

#### Other project artifacts

Links to project artifacts can be found [here](https://drive.google.com/drive/u/0/folders/1Y94Pnr4FHKwKu4UesIl0lzSkJXwovnW1), including past slides, tech spec, working agreement, and sheets for estimates.

Our project board can be found [here](https://github.com/orgs/The-Landlords/projects/1).

UML Diagrams can be found here:

[Room8 Tech Spec](https://docs.google.com/document/d/1QrysaAUJk3lrZG5peBCVGyf7awerFQEnX9qCmPqJOE0/edit?tab=t.0) (updated 11 March 2026)

[Room8 Figma Development](https://www.figma.com/design/MaH0PCv7Bb1NWshXdRuGUx/Room8-Prototype-V1?node-id=0-1&p=f&t=HCwzF1qebVIPRdJe-0)

[Room8 Final Presentation & Retrospective](https://docs.google.com/presentation/d/1mRnEUt_903Lb3wg_i7ejsHYtVlK3obC2/edit?slide=id.p1#slide=id.p1)

- [Login Sequence Diagram](https://app.diagrams.net/?libs=general;uml#G1IO0Z067K5lZUWQO86LF4x5FJ2QWUOf_z%23%7B%22pageId%22%3A%2213e1069c-82ec-6db2-03f1-153e76fe0fe0%22%7D)
- [Standard UML Diagram](https://app.diagrams.net/#G1iUXWNrmekFVPFRKkXIQ6NUoDRErm5pb4#%7B%22pageId%22%3A%22CYbapvT21Snnj9w-jAMA%22%7D)
- [Use Case Diagram](https://app.diagrams.net/#G1kN6sUKFojofFbvJqVfi-DkvuanEyP3zy%23%7B%22pageId%22%3A%22aO7viMubsWdG2gBV-KE4%22%7D)

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

- expand functionality of chores, events, grocery pages.
- text message feature: ability to send reminders, statuses, and other items to users based on household updates
- phone sizing adjustments

