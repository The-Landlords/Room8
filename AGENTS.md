# Room8 Agent Guidance

## Project Context

Room8 is a roommate management app with a React frontend, REST API, Express backend, and MongoDB/Mongoose backend. Homes contain groceries, chores, roommates, calendar entries, and rules. Multiple users can belong to a home, so home membership and home-scoped data isolation are core correctness concerns.

## Review Guidelines

- Prioritize correctness, security, data isolation, and user-visible behavior over style.
- Check that every home-scoped backend query or mutation verifies the active user's access to that home.
- Treat changes to models, services, routes, and page workflows as requiring focused test coverage.
- Watch for broken REST contracts between the React frontend and Express backend, including status codes, response shapes, and error handling.
- Review Mongoose schemas and services for ObjectId handling, validation gaps, async error paths, and accidental cross-home reads or writes.
- Review React changes for stale state, missing loading/error states, route mismatches, and form submission bugs.
- Prefer existing npm scripts: `npm run lint:check`, `npm run test:frontend`, and `MONGO_URI_TEST=mongodb://localhost:27017/test npm run test:backend`.
- Avoid raising style-only findings unless they hide a concrete bug or maintenance risk.
