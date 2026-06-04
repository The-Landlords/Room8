import { mockGroceries, mockHome, visitWithMockApi } from "./testSupport";

describe("Grocery", () => {
	beforeEach(() => {
		visitWithMockApi(`/grocery/${mockHome.homeCode}`);
	});

	it("shows grocery items for the home", () => {
		cy.contains("Grocery").should("be.visible");
		cy.contains("Milk - Qty: 1 - $4.50").should("be.visible");
	});

	it("adds a grocery item through the add dialog", () => {
		cy.contains("button", "+").click();

		cy.contains("h1", "Add Grocery").should("be.visible");
		cy.get('input[placeholder="enter grocery item"]').type(
			mockGroceries[0].title
		);
		cy.get('input[placeholder="Quantity"]').clear().type("1");
		cy.get('input[placeholder="Price, optional"]').clear().type("0");
		cy.contains("button", "Submit").click();
		cy.wait("@addGrocery");

		cy.contains("New grocery - Qty: 1 - $0.00").should("be.visible");
	});

	it("toggles remove mode", () => {
		cy.contains("button", "-").click();

		cy.contains("button", "Cancel").should("be.visible");
		cy.contains("button", "Cancel").click();
		cy.contains("button", "+").should("be.visible");
		cy.contains("button", "-").should("be.visible");
	});
});
