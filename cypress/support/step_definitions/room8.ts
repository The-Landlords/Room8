import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";
import {
	FRONTEND_URL,
	TESTUSER5,
	mockChores,
	mockEvents,
	mockGroceries,
	mockGuests,
	mockHome,
	mockResidents,
	mockRules,
	signInAsTestUser5,
	visitWithMockApi,
} from "../../e2e/testSupport";

const homeSpacesPath = "/homelist/";

const pageConfig = {
	residents: {
		path: `/residents/${mockHome.homeCode}`,
		title: `${mockHome.homeName}'s Residents`,
	},
	rules: {
		path: `/rules/${mockHome.homeCode}`,
		title: `${mockHome.homeName}'s Rules`,
	},
	calendar: {
		path: `/events/${mockHome.homeCode}`,
		title: `${mockHome.homeName}'s Calendar`,
	},
	events: {
		path: `/events/${mockHome.homeCode}`,
		title: `${mockHome.homeName}'s Calendar`,
	},
	chores: {
		path: `/${mockHome.homeCode}/chores`,
		title: `${mockHome.homeName}'s Chores`,
	},
	groceries: {
		path: `/grocery/${mockHome.homeCode}`,
		title: `${mockHome.homeName}'s Groceries`,
	},
	grocery: {
		path: `/grocery/${mockHome.homeCode}`,
		title: `${mockHome.homeName}'s Groceries`,
	},
	overview: {
		path: `/homeDisplay/me/${mockHome.homeCode}`,
		title: `${mockHome.homeName}'s Overview`,
	},
	settings: {
		path: "/settings",
		title: `Welcome ${TESTUSER5.username}`,
	},
};

type PageName = keyof typeof pageConfig;

function getPage(name: string) {
	const key = name.toLowerCase() as PageName;
	const page = pageConfig[key];

	if (!page) {
		throw new Error(`Unknown page: ${name}`);
	}

	return page;
}

function normalizePath(path: string) {
	return path === "/" ? path : path.replace(/\/$/, "");
}

function expectPath(path: string) {
	cy.location("pathname").should((pathname) => {
		expect(normalizePath(pathname)).to.equal(normalizePath(path));
	});
}

function openTestHomePage(name: string) {
	const page = getPage(name);

	if (name.toLowerCase() === "calendar" || name.toLowerCase() === "events") {
		cy.clock(new Date("2026-05-29T12:00:00").getTime(), ["Date"]);
	}

	visitWithMockApi(page.path);
}

function bodyOf(request: { body: unknown }) {
	return typeof request.body === "string"
		? JSON.parse(request.body)
		: request.body;
}

function listItemContaining(text: string) {
	return cy.contains("li", text);
}

function shouldShowHomeHeader(name: string) {
	cy.contains("h1", getPage(name).title).should("be.visible");
}

Given("I open the sign in page", () => {
	visitWithMockApi("/");
});

Given("I am signed in", () => {
	signInAsTestUser5();
	expectPath(homeSpacesPath);
});

Given("I am viewing the test home's {string} page", (name: string) => {
	openTestHomePage(name);
});

Given(
	"I opened the test home's {string} page from home spaces",
	(name: string) => {
		signInAsTestUser5();
		cy.get(`a[href="${getPage(name).path}"]`)
			.first()
			.click();
		expectPath(getPage(name).path);
	}
);

Given("I am viewing the user settings page", () => {
	visitWithMockApi("/settings/");
});

When("I sign in as the test user", () => {
	cy.get('input[placeholder="Username"]').type(TESTUSER5.username);
	cy.get('input[placeholder="Password"]').type(TESTUSER5.password);
	cy.contains("button", "Sign In").click();
	cy.wait("@loginAsTestUser5");
});

When("I open the {string} action for the test home", (destination: string) => {
	if (destination.toLowerCase() === "settings") {
		cy.get('a[href="/settings"]').click();
		return;
	}

	cy.get(`a[href="${getPage(destination).path}"]`)
		.first()
		.click();
});

When("I use the page back button", () => {
	cy.contains("button", "Back").click();
});

When("I open guest voting", () => {
	cy.contains("button", "Vote").click();
});

When("I open the add rule dialog", () => {
	cy.contains("button", "+").click();
});

When("I submit a rule named {string}", (description: string) => {
	cy.get('textarea[placeholder="e.g. Quiet hours after 10pm"]').type(
		description
	);
	cy.contains("button", "Add").click();
	cy.wait("@addRule").then(({ request }) => {
		const body = bodyOf(request);

		expect(body).to.include({
			homeCode: mockHome.homeCode,
			description,
		});
	});
});

When("I cancel the add rule dialog", () => {
	cy.contains("button", "Cancel").click();
});

When("I open rule voting controls", () => {
	cy.contains("button", "Vote").click();
});

When("I save rule voting controls", () => {
	cy.contains("button", "Save").click();
});

When("I open rule delete mode", () => {
	cy.contains("button", "-").click();
});

When("I choose to delete the rule {string}", (description: string) => {
	listItemContaining(description).find("button").click();
});

When("I cancel rule deletion", () => {
	cy.contains("h2", "Vote to delete this rule")
		.closest(".overlay-content")
		.within(() => {
			cy.contains("button", "Cancel").click();
		});
});

When("I collapse upcoming events", () => {
	cy.contains("button", "Upcoming Events").click();
});

When("I expand upcoming events", () => {
	cy.contains("button", "Upcoming Events").click();
});

When("I open the add event dialog", () => {
	cy.contains("button", "+").click();
});

When("I submit a new event", () => {
	cy.get('input[placeholder="Title"]').type("New event");
	cy.get('input[placeholder="Description"]').type("New event description");
	cy.get('input[type="datetime-local"]').eq(0).type("2026-09-30T08:00");
	cy.get('input[type="datetime-local"]').eq(1).type("2026-09-30T09:00");
	cy.get('input[placeholder="Location"]').type("Kitchen");
	cy.contains("button", "Add Event").click();
	cy.wait("@addEvent").then(({ request }) => {
		const body = bodyOf(request);

		expect(body).to.include({
			title: "New event",
			description: "New event description",
			location: "Kitchen",
		});
	});
});

When("I open the edit event dialog for {string}", (title: string) => {
	listItemContaining(title).find("button").click();
});

When("I update the event title to {string}", (title: string) => {
	cy.get('input[placeholder="Title"]').clear().type(title);
	cy.contains("button", "Update Event").click();
	cy.wait("@updateEvent").then(({ request }) => {
		expect(bodyOf(request)).to.include({ title });
	});
});

When("I open event delete mode", () => {
	cy.contains("button", "-").click();
});

When("I choose to remove the event {string}", (title: string) => {
	listItemContaining(title).find("button").click();
});

When("I confirm event removal", () => {
	cy.contains("button", "Remove").click();
	cy.wait("@deleteEvent");
});

When("I open the add grocery dialog", () => {
	cy.contains("button", "+").click();
});

When("I submit a grocery item named {string}", (title: string) => {
	cy.get('input[placeholder="enter grocery item"]').type(title);
	cy.get('input[placeholder="Quantity"]').clear().type("2");
	cy.get('input[placeholder="Price, optional"]').clear().type("3.25");
	cy.contains("button", "Submit").click();
	cy.wait("@addGrocery").then(({ request }) => {
		expect(bodyOf(request)).to.include({
			title,
			quantity: 2,
			price: 3.25,
		});
	});
});

When("I open grocery remove mode", () => {
	cy.contains("button", "-").click();
});

When("I delete the grocery item {string}", (title: string) => {
	listItemContaining(title).find("button").click();
	cy.wait("@deleteGrocery");
});

When("I open the add chore dialog", () => {
	cy.contains("button", "+").click();
});

When("I submit a chore named {string}", (title: string) => {
	cy.get('input[placeholder="enter text"]').type(title);
	cy.contains("button", "Submit").click();
	cy.wait("@addChore").then(({ request }) => {
		expect(bodyOf(request)).to.include({ title });
	});
});

When("I open chore remove mode", () => {
	cy.contains("button", "-").click();
});

When("I delete the chore {string}", (title: string) => {
	listItemContaining(title).find("button").click();
	cy.wait("@deleteChore");
});

When("I cancel remove mode", () => {
	cy.contains("button", "Cancel").click();
});

When("I change profile details and display preferences", () => {
	cy.get('input[placeholder="Barry B. Benson"]').clear().type("Updated User");
	cy.get('input[placeholder="pollen, dairy, etc."]')
		.clear()
		.type("pollen, dairy");
	cy.contains(".settings-input-field", "Theme").find("button").click();
	cy.contains(".settings-input-field", "Who can see my personal details")
		.contains("button", "No One (Private)")
		.click();
	cy.contains(".settings-input-field", "Who can see my emergency contact")
		.contains("button", "No One (Private)")
		.click();
	cy.contains(".settings-input-field", "Who can see my interests")
		.contains("button", "No One (Private)")
		.click();
});

When("I save the profile", () => {
	cy.contains("button", "Save Profile").click();
});

When("I sign out", () => {
	cy.contains("button", "Sign Out").click();
	cy.wait("@logout");
});

Then("I should see an empty sign in form", () => {
	cy.location("pathname").should("eq", "/");
	cy.contains("h1", "Sign In").should("be.visible");
	cy.get('input[placeholder="Username"]').should("have.value", "");
	cy.get('input[placeholder="Password"]').should("have.value", "");
	cy.contains("button", "Sign In").should("be.visible");
});

Then("I can navigate to sign up from sign in", () => {
	cy.contains("a", "Sign Up").should("have.attr", "href", "/signup");
	cy.contains("a", "Sign Up").click();
	expectPath("/signup");
});

Then("I should see the sign in page", () => {
	expectPath("/");
	cy.contains("h1", "Sign In").should("be.visible");
});

Then("I should see the home spaces list", () => {
	expectPath(homeSpacesPath);
	cy.contains("h1", "Home Spaces").should("be.visible");
	cy.contains("h1", "Current Home Spaces").should("be.visible");
	cy.contains(mockHome.homeName).should("be.visible");
	cy.contains(mockHome.address).should("be.visible");
	cy.get(`a[href="${pageConfig.residents.path}"]`).should("exist");
	cy.get(`a[href="${pageConfig.rules.path}"]`).should("exist");
	cy.get(`a[href="${pageConfig.calendar.path}"]`).should("exist");
	cy.get(`a[href="${pageConfig.chores.path}"]`).should("exist");
	cy.get(`a[href="${pageConfig.groceries.path}"]`).should("exist");
	cy.get(`a[href="${pageConfig.overview.path}"]`).should("exist");
	cy.get('a[href="/settings"]').should("exist");
	cy.contains("button", "+").should("be.visible");
	cy.contains("button", "-").should("be.visible");
});

Then("I should be on the {string} page", (destination: string) => {
	const page = getPage(destination);

	expectPath(page.path);
	cy.contains("h1", page.title).should("be.visible");
});

Then("I should see the test home's overview summary", () => {
	shouldShowHomeHeader("overview");
	cy.contains(`homeCode: ${mockHome.homeCode}`).should("be.visible");
	cy.contains("Current Rules").should("be.visible");
	cy.contains(mockRules[0].description).should("be.visible");
	cy.contains("Current Events").should("be.visible");
	cy.contains(mockEvents[0].name).should("be.visible");
	cy.contains(mockEvents[0].description).should("be.visible");
	cy.contains("Current Groceries").should("be.visible");
	cy.contains(mockGroceries[0].title).should("be.visible");
	cy.contains("Current Chores").should("be.visible");
	cy.contains(mockChores[0].title).should("be.visible");
	cy.contains(`${mockHome.homeName}'s Residents`).should("be.visible");
	cy.contains(mockResidents[0].fullName).should("be.visible");
});

Then("I should see residents and guests for the test home", () => {
	shouldShowHomeHeader("residents");
	mockResidents.forEach((resident) => {
		cy.contains(resident.fullName).should("be.visible");
	});
	cy.contains(mockResidents[0].allergens[0]).should("be.visible");
	cy.contains(mockResidents[0].phoneNumber).should("be.visible");
	cy.contains(mockGuests[0].fullName).should("be.visible");
});

Then("I should see guest voting controls", () => {
	cy.contains("h2", "Vote on Guest Ascencion").should("be.visible");
	cy.contains(mockGuests[0].fullName).should("be.visible");
	cy.contains("button", "Approve").should("be.visible");
	cy.contains("button", "Reject").should("be.visible");
});

Then("I should see the home's rules and statuses", () => {
	shouldShowHomeHeader("rules");
	cy.contains("h1", "Rules").should("be.visible");
	cy.contains(mockRules[0].description).should("be.visible");
	cy.contains("Status : Pending").should("be.visible");
	cy.contains("1/6 Approve").should("be.visible");
	cy.contains(mockRules[1].description).should("be.visible");
	cy.contains("Status : Rejected").should("be.visible");
	cy.contains(mockRules[2].description).should("be.visible");
});

Then("I should see the add rule dialog", () => {
	cy.contains("h2", "Add Rule").should("be.visible");
	cy.get('textarea[placeholder="e.g. Quiet hours after 10pm"]').should(
		"be.visible"
	);
});

Then("the add rule dialog should close", () => {
	cy.contains("h2", "Add Rule").should("not.exist");
});

Then("I should see rule voting controls", () => {
	cy.get('button[aria-label="YES"]').should("have.length", mockRules.length);
	cy.get('button[aria-label="NO"]').should("have.length", mockRules.length);
	cy.contains("YES 1 | NO 0").should("be.visible");
});

Then("I should not see rule voting controls", () => {
	cy.contains("YES 1 | NO 0").should("not.exist");
	cy.get('button[aria-label="YES"]').should("not.exist");
	cy.get('button[aria-label="NO"]').should("not.exist");
});

Then("I should see the delete-rule voting panel", () => {
	cy.contains("h2", "Vote to delete this rule").should("be.visible");
	cy.contains(`Total Roommates ${mockResidents.length}`).should("be.visible");
	cy.get('button[aria-label="YES"]').should("be.visible");
	cy.get('button[aria-label="NO"]').should("be.visible");
});

Then("I should not see the delete-rule voting panel", () => {
	cy.contains("h2", "Vote to delete this rule").should("not.exist");
	cy.contains("button", "Cancel").should("be.visible");
});

Then("I should see the upcoming events for the test home", () => {
	shouldShowHomeHeader("calendar");
	cy.contains("button", "Upcoming Events").should("be.visible");
	cy.contains(mockEvents[0].title).should("be.visible");
	cy.contains(mockEvents[0].description).should("be.visible");
	cy.contains("Sunday, Sep 27").should("be.visible");
	cy.contains("8:00 AM").should("be.visible");
	cy.contains(mockEvents[0].location).should("be.visible");
	cy.contains(mockEvents[1].title).should("be.visible");
	cy.contains(mockEvents[2].title).should("be.visible");
});

Then("I should not see the first event", () => {
	cy.contains(mockEvents[0].title).should("not.exist");
});

Then("I should see the first event", () => {
	cy.contains(mockEvents[0].title).should("be.visible");
});

Then("I should see the add event dialog", () => {
	cy.contains("h2", "Add Event").should("be.visible");
	cy.get('input[placeholder="Title"]').should("be.visible");
	cy.get('input[placeholder="Description"]').should("be.visible");
	cy.get('input[type="datetime-local"]').should("have.length", 2);
	cy.get('input[placeholder="Location"]').should("be.visible");
	cy.contains("button", "Add Event").should("be.visible");
});

Then("I should see the new event", () => {
	cy.contains("New event").should("be.visible");
	cy.contains("New event description").should("be.visible");
});

Then("I should see the edit event dialog", () => {
	cy.contains("h2", "Edit Event").should("be.visible");
	cy.get('input[placeholder="Title"]').should(
		"have.value",
		mockEvents[0].title
	);
	cy.get('input[placeholder="Description"]').should(
		"have.value",
		mockEvents[0].description
	);
	cy.contains("button", "Update Event").should("be.visible");
});

Then("I should see the updated event", () => {
	cy.contains("Updated testing event").should("be.visible");
});

Then("I should see the remove event confirmation", () => {
	cy.contains("Are you sure you want to remove testing?").should(
		"be.visible"
	);
	cy.contains("button", "Cancel").should("be.visible");
	cy.contains("button", "Remove").should("be.visible");
});

Then("I should not see the removed event", () => {
	cy.contains(mockEvents[0].title).should("not.exist");
});

Then("I should see grocery items for the test home", () => {
	shouldShowHomeHeader("groceries");
	cy.contains("h1", "Current Groceries").should("be.visible");
	cy.contains(mockGroceries[0].title).should("be.visible");
	cy.contains("Qty: 1").should("be.visible");
	cy.contains("$4.50").should("be.visible");
});

Then("I should see the add grocery dialog", () => {
	cy.contains("h1", "Add Grocery").should("be.visible");
	cy.get('input[placeholder="enter grocery item"]').should("be.visible");
	cy.get('input[placeholder="Quantity"]').should("be.visible");
	cy.get('input[placeholder="Price, optional"]').should("be.visible");
});

Then("I should see the grocery item {string}", (title: string) => {
	cy.contains(title).should("be.visible");
});

Then("I should not see the grocery item {string}", (title: string) => {
	cy.contains(title).should("not.exist");
});

Then("I should see chores for the test home", () => {
	shouldShowHomeHeader("chores");
	cy.contains("h1", "Current Chores").should("be.visible");
	mockChores.forEach((chore) => {
		cy.contains(chore.title).should("be.visible");
	});
});

Then("I should see the add chore dialog", () => {
	cy.contains("h1", "Add Chore").should("be.visible");
	cy.get('input[placeholder="enter text"]').should("be.visible");
});

Then("I should see the chore {string}", (title: string) => {
	cy.contains(title).should("be.visible");
});

Then("I should not see the chore {string}", (title: string) => {
	cy.contains(title).should("not.exist");
});

Then("I should see add and remove controls", () => {
	cy.contains("button", "+").should("be.visible");
	cy.contains("button", "-").should("be.visible");
});

Then("I should see the current user's profile settings", () => {
	cy.contains("h1", `Welcome ${TESTUSER5.username}`).should("be.visible");
	cy.get('input[placeholder="Barry B. Benson"]').should(
		"have.value",
		TESTUSER5.fullName
	);
	cy.get('input[placeholder="+19998887777"]').should(
		"have.value",
		TESTUSER5.phone
	);
	cy.get("select").first().should("have.value", "medium");
	cy.contains("h2", "General").should("be.visible");
	cy.contains("h2", "Personal").should("be.visible");
	cy.contains("h2", "Emergency").should("be.visible");
	cy.contains("h2", "Interests").should("be.visible");
	cy.contains("h2", "Display").should("be.visible");
});

Then("the profile changes should be submitted", () => {
	cy.wait("@updateUserSettings").then(({ request }) => {
		const body = bodyOf(request);

		expect(body.fullName).to.equal("Updated User");
		expect(body.allergens).to.deep.equal(["pollen", "dairy"]);
		expect(body.settings.theme).to.equal("dark");
		expect(body.settings.personalVisibility).to.equal("private");
		expect(body.settings.emergencyVisibility).to.equal("private");
		expect(body.settings.interestsVisibility).to.equal("private");
		expect(body.visibility.dobVisible).to.equal("PRIVATE");
		expect(body.visibility.emergencyContactVisible).to.equal("PRIVATE");
		expect(body.visibility.likesVisible).to.equal("PRIVATE");
	});
});
