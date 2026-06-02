import {
	mockGuests,
	mockHome,
	mockResidents,
	visitWithMockApi,
} from "./testSupport";

describe("Residents", () => {
	beforeEach(() => {
		visitWithMockApi(`/residents/${mockHome.homeCode}`);
	});

	it("shows residents and pending guests for the home", () => {
		cy.contains("h1", "Residents").should("be.visible");

		mockResidents.forEach((resident) => {
			cy.contains(resident.fullName).should("be.visible");
		});

		cy.contains(mockGuests[0].fullName).should("be.visible");
	});

	it("returns to the home spaces page", () => {
		cy.get("button.button").first().click();

		cy.location("pathname").should("eq", "/homelist/");
		cy.contains("h1", "Home Spaces").should("be.visible");
	});
});
