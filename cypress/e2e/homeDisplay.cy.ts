import {
	mockChores,
	mockEvents,
	mockGroceries,
	mockHome,
	mockResidents,
	mockRules,
	visitWithMockApi,
} from "./testSupport";

describe("Home display", () => {
	beforeEach(() => {
		visitWithMockApi(`/homeDisplay/me/${mockHome.homeCode}`);
	});

	it("shows the home summary", () => {
		cy.contains("h1", mockHome.homeName).should("be.visible");
		cy.contains(`homeCode : ${mockHome.homeCode}`).should("be.visible");

		cy.contains("current rules").should("be.visible");
		cy.contains(mockRules[0].description).should("be.visible");
		cy.contains("current events").should("be.visible");
		cy.contains(mockEvents[0].title).should("be.visible");
		cy.contains(mockEvents[0].description).should("be.visible");
		cy.contains("current groceries").should("be.visible");
		cy.contains(mockGroceries[0].title).should("be.visible");
		cy.contains("current chores").should("be.visible");
		cy.contains(mockChores[0].title).should("be.visible");
		cy.contains("current residents").should("be.visible");
		cy.contains(mockResidents[0].fullName).should("be.visible");
	});

	it("returns to the home spaces page", () => {
		cy.get("button.button").first().click();

		cy.location("pathname").should("eq", "/homelist/");
		cy.contains("h1", "Home Spaces").should("be.visible");
	});
});
