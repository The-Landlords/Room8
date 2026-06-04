export const FRONTEND_URL = "http://localhost:5173";
export const API_URL = "http://localhost:8000";

export const TESTUSER5 = {
	_id: "665000000000000000000005",
	username: "TESTUSER5",
	password: "TESTUSER5",
	fullName: "Test User",
	pronouns: "",
	DOB: "2000-01-01",
	allergens: [],
	likes: [],
	dislikes: [],
	phone: "+15555555555",
	phoneNumber: "+15555555555",
	emergencyContact: {
		name: "Emergency Contact",
		phone: "+15555555556",
		relationship: "Friend",
	},
	settings: {
		textSize: "medium",
		theme: "light",
		colorBlindMode: "off",
		scheduleVisibility: "roommates",
	},
};

export const mockHome = {
	_id: "775000000000000000000123",
	homeCode: "ABC123",
	homeName: "Test House",
	address: "123 Main St",
	relationship: "RESIDENT",
};

export const mockResidents = [
	{
		_id: "resident-1",
		fullName: "bob joe",
		allergens: ["peanuts"],
		likes: ["board games"],
		dislikes: ["late dishes"],
		phoneNumber: "+15555550001",
		pronouns: "he/him",
		DOB: "1999-04-03",
		emergencyContact: {
			name: "Bobby Contact",
			phone: "+15555551001",
			relationship: "Sibling",
		},
	},
	{
		_id: "resident-2",
		fullName: "Bar B Ben",
		allergens: ["dairy"],
		likes: ["gardening"],
		dislikes: ["loud music"],
		phoneNumber: "+15555550002",
		pronouns: "they/them",
		DOB: "2001-07-12",
		emergencyContact: {
			name: "Ben Contact",
			phone: "+15555551002",
			relationship: "Friend",
		},
	},
	{
		_id: "resident-3",
		fullName: "mike ty",
		allergens: [],
		likes: ["movies"],
		dislikes: ["trash duty"],
		phoneNumber: "+15555550003",
		pronouns: "he/him",
		DOB: "2000-01-20",
		emergencyContact: {
			name: "Mike Contact",
			phone: "+15555551003",
			relationship: "Parent",
		},
	},
	{
		_id: "resident-4",
		fullName: "michael",
		allergens: ["shellfish"],
		likes: ["running"],
		dislikes: ["cold coffee"],
		phoneNumber: "+15555550004",
		pronouns: "he/they",
		DOB: "1998-10-08",
		emergencyContact: {
			name: "Michael Contact",
			phone: "+15555551004",
			relationship: "Partner",
		},
	},
	{
		_id: "resident-5",
		fullName: "rule",
		allergens: [],
		likes: ["quiet hours"],
		dislikes: ["missed rent"],
		phoneNumber: "+15555550005",
		pronouns: "she/her",
		DOB: "2002-02-14",
		emergencyContact: {
			name: "Rule Contact",
			phone: "+15555551005",
			relationship: "Friend",
		},
	},
	{
		_id: "resident-6",
		fullName: "subway sandwitch",
		allergens: ["gluten"],
		likes: ["meal prep"],
		dislikes: ["empty fridge"],
		phoneNumber: "+15555550006",
		pronouns: "they/them",
		DOB: "1997-12-02",
		emergencyContact: {
			name: "Subway Contact",
			phone: "+15555551006",
			relationship: "Sibling",
		},
	},
];

export const mockGuests = [TESTUSER5];

export const mockRules = [
	{
		_id: "rule-1",
		description: "Quiet hours after 10PM",
		status: "PENDING",
		votes: [{ voteId: TESTUSER5._id, vote: "YES" }],
		deleteVotes: [],
		deleteStatus: "NONE",
	},
	{
		_id: "rule-2",
		description: "TEST",
		status: "REJECTED",
		votes: [],
		deleteVotes: [],
		deleteStatus: "NONE",
	},
	{
		_id: "rule-3",
		description: "Wash dishes on tuesdays",
		status: "PENDING",
		votes: [],
		deleteVotes: [],
		deleteStatus: "NONE",
	},
];

export const mockEvents = [
	{
		_id: "event-1",
		title: "testing",
		name: "testing",
		description: "ugh",
		start: "2026-09-27T08:00:00",
		end: "2026-09-27T09:00:00",
		location: "Kitchen",
	},
	{
		_id: "event-2",
		title: "Robert birthday",
		name: "Robert birthday",
		description: "birthday",
		start: "2026-09-28T08:00:00",
		end: "2026-09-28T09:00:00",
		location: "Living Room",
	},
	{
		_id: "event-3",
		title: "TEST",
		name: "TEST",
		description: "test event",
		start: "2026-09-29T08:00:00",
		end: "2026-09-29T09:00:00",
		location: "Room 8",
	},
];

export const mockChores = [
	{ _id: "chore-1", title: "Dishes" },
	{ _id: "chore-2", title: "Trash" },
];

export const mockGroceries = [
	{
		_id: "grocery-1",
		title: "Milk",
		quantity: 1,
		price: 4.5,
		homeId: mockHome._id,
		status: "PENDING",
	},
];

export const mockHomeDisplay = {
	name: mockHome.homeName,
	groceries: mockGroceries,
	rules: mockRules,
	events: mockEvents,
	chores: mockChores,
};

function api(path: string) {
	return `${API_URL}${path}`;
}

export function mockApiForTestUser5() {
	cy.intercept("POST", api("/login"), (req) => {
		const body =
			typeof req.body === "string" ? JSON.parse(req.body) : req.body;

		expect(body).to.deep.equal({
			username: TESTUSER5.username,
			password: TESTUSER5.password,
		});

		req.reply({
			statusCode: 200,
			body: {
				message: "Login successful",
				userId: TESTUSER5._id,
				username: TESTUSER5.username,
			},
		});
	}).as("loginAsTestUser5");

	cy.intercept("POST", api("/logout"), {
		statusCode: 200,
		body: { message: "Logged out" },
	}).as("logout");
	cy.intercept("GET", api("/auth/me"), {
		statusCode: 200,
		body: TESTUSER5,
	});
	cy.intercept("GET", api("/users/me"), {
		statusCode: 200,
		body: TESTUSER5,
	});
	cy.intercept("PATCH", api("/users/me"), {
		statusCode: 200,
		body: TESTUSER5,
	}).as("updateUserSettings");
	cy.intercept("GET", api("/relate/me"), {
		statusCode: 200,
		body: [mockHome],
	}).as("getHomesForTestUser5");
	cy.intercept("PATCH", api(`/relate/me/${mockHome.homeName}`), {
		statusCode: 200,
		body: mockHome,
	});
	cy.intercept("GET", api(`/auth/residents/${mockHome.homeCode}`), {
		statusCode: 200,
		body: mockResidents,
	});
	cy.intercept("GET", api(`/auth/guests/me/${mockHome.homeCode}`), {
		statusCode: 200,
		body: mockGuests,
	});
	cy.intercept("GET", api(`/auth/relationship/me/${mockHome.homeCode}`), {
		statusCode: 200,
		body: { relationship: "RESIDENT" },
	});
	cy.intercept("GET", api(`/homes/code/${mockHome.homeCode}`), {
		statusCode: 200,
		body: mockHome,
	});
	cy.intercept("GET", api(`/relate/home/${mockHome._id}/residents`), {
		statusCode: 200,
		body: { count: mockResidents.length },
	});
	cy.intercept("GET", api(`/homes/rules/${mockHome.homeCode}`), {
		statusCode: 200,
		body: mockRules,
	}).as("getRules");
	cy.intercept("POST", api("/homes/rules"), {
		statusCode: 201,
		body: mockRules[0],
	}).as("addRule");
	cy.intercept("POST", api("/rules/*/vote"), {
		statusCode: 200,
		body: { message: "Vote recorded" },
	});
	cy.intercept("POST", api("/rules/*/delete-vote"), {
		statusCode: 200,
		body: { deleted: false },
	});
	cy.intercept("GET", api(`/homeId/${mockHome._id}/events/`), {
		statusCode: 200,
		body: mockEvents,
	}).as("getEvents");
	cy.intercept("POST", api(`/${mockHome.homeCode}/events`), {
		statusCode: 201,
		body: {
			_id: "event-4",
			title: "New event",
			description: "New event description",
			start: "2026-09-30T08:00:00",
			end: "2026-09-30T09:00:00",
			location: "Kitchen",
		},
	}).as("addEvent");
	cy.intercept("PATCH", api("/events/*"), (req) => {
		const body =
			typeof req.body === "string" ? JSON.parse(req.body) : req.body;

		req.reply({
			statusCode: 200,
			body: {
				_id: "event-1",
				...body,
			},
		});
	}).as("updateEvent");
	cy.intercept("DELETE", api("/events/*"), {
		statusCode: 200,
		body: { message: "Event removed" },
	}).as("deleteEvent");
	cy.intercept("GET", api(`/${mockHome.homeCode}/chores`), {
		statusCode: 200,
		body: mockChores,
	}).as("getChores");
	cy.intercept("POST", api(`/${mockHome.homeCode}/chores`), {
		statusCode: 201,
		body: { _id: "chore-3", title: "New chore" },
	}).as("addChore");
	cy.intercept("DELETE", api(`/${mockHome.homeCode}/chores/*`), {
		statusCode: 200,
		body: { message: "Chore removed" },
	}).as("deleteChore");
	cy.intercept("GET", api(`/${mockHome.homeCode}/grocery`), {
		statusCode: 200,
		body: mockGroceries,
	}).as("getGroceries");
	cy.intercept("POST", api(`/${mockHome.homeCode}/grocery`), {
		statusCode: 201,
		body: {
			_id: "grocery-2",
			title: "New grocery",
			quantity: 1,
			price: 0,
			homeId: mockHome._id,
			status: "PENDING",
		},
	}).as("addGrocery");
	cy.intercept("DELETE", api(`/${mockHome.homeCode}/grocery/*`), {
		statusCode: 200,
		body: { message: "Grocery removed" },
	}).as("deleteGrocery");
	cy.intercept("GET", api(`/auth/homeDisplay/me/${mockHome.homeCode}`), {
		statusCode: 200,
		body: mockHomeDisplay,
	}).as("getHomeDisplay");
}

export function visitWithMockApi(path = "/") {
	mockApiForTestUser5();
	cy.visit(`${FRONTEND_URL}${path}`);
}

export function signInAsTestUser5() {
	visitWithMockApi("/");
	cy.get('input[placeholder="Username"]').type(TESTUSER5.username);
	cy.get('input[placeholder="Password"]').type(TESTUSER5.password);
	cy.contains("button", "Sign In").click();
	cy.wait("@loginAsTestUser5");
}
