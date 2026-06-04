import { mockEvents, mockHome, visitWithMockApi } from "./testSupport";

describe("Events", () => {
	beforeEach(() => {
		cy.clock(new Date("2026-05-29T12:00:00").getTime(), ["Date"]);
		visitWithMockApi(`/events/${mockHome.homeCode}`);
	});

	it("shows upcoming events for the home", () => {
		cy.contains("h1", `Events for ${mockHome.homeName}`).should(
			"be.visible"
		);
		cy.contains("button", "Upcoming Events").should("be.visible");

		cy.contains(mockEvents[0].title).should("be.visible");
		cy.contains(mockEvents[0].description).should("be.visible");
		cy.contains("Sunday, Sep 27").should("be.visible");
		cy.contains("8:00 AM").should("be.visible");
		cy.contains(mockEvents[1].title).should("be.visible");
		cy.contains(mockEvents[2].title).should("be.visible");
	});

	it("opens the add event dialog", () => {
		cy.contains("button", "+").click();

		cy.contains("h2", "Add Event").should("be.visible");
		cy.get('input[placeholder="Title"]').should("be.visible");
		cy.get('input[placeholder="Description"]').should("be.visible");
		cy.get('input[placeholder="Location"]').should("be.visible");
		cy.contains("button", "Add Event").should("be.visible");
	});

	it("toggles remove mode", () => {
		cy.contains("button", "-").click();

		cy.contains("button", "Cancel").should("be.visible");
		cy.contains("button", "Cancel").click();
		cy.contains("button", "+").should("be.visible");
		cy.contains("button", "-").should("be.visible");
	});
});
