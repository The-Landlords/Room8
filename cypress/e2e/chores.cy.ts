import { mockChores, mockHome, visitWithMockApi } from "./testSupport";

describe("Chores", () => {
	beforeEach(() => {
		visitWithMockApi(`/${mockHome.homeCode}/chores`);
	});

	it("shows chores for the home", () => {
		cy.contains("Chores").should("be.visible");

		mockChores.forEach((chore) => {
			cy.contains(chore.title).should("be.visible");
		});
	});

	it("adds a chore through the add dialog", () => {
		cy.contains("button", "+").click();

		cy.contains("h1", "Add Chore").should("be.visible");
		cy.get('input[placeholder="enter text"]').type("New chore");
		cy.contains("button", "Submit").click();
		cy.wait("@addChore");

		cy.contains("New chore").should("be.visible");
	});

	it("toggles remove mode", () => {
		cy.contains("button", "-").click();

		cy.contains("button", "Cancel").should("be.visible");
		cy.contains("button", "Cancel").click();
		cy.contains("button", "+").should("be.visible");
		cy.contains("button", "-").should("be.visible");
	});
});
