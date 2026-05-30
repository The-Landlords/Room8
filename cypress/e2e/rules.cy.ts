import { mockHome, mockRules, visitWithMockApi } from "./testSupport";

describe("Rules", () => {
	beforeEach(() => {
		visitWithMockApi(`/rules/${mockHome.homeCode}`);
	});

	it("shows the home's rules and statuses", () => {
		cy.contains("h1", `Rules for ${mockHome.homeName}`).should(
			"be.visible"
		);
		cy.contains("h1", "Rules").should("be.visible");

		cy.contains(mockRules[0].description).should("be.visible");
		cy.contains("Status : Pending").should("be.visible");
		cy.contains(mockRules[1].description).should("be.visible");
		cy.contains("Status : Rejected").should("be.visible");
		cy.contains(mockRules[2].description).should("be.visible");
	});

	it("opens and closes the add rule dialog", () => {
		cy.contains("button", "+").click();

		cy.contains("h2", "Add Rule").should("be.visible");
		cy.get('textarea[placeholder="e.g. Quiet hours after 10pm"]').should(
			"be.visible"
		);
		cy.contains("button", "Cancel").click();
		cy.contains("h2", "Add Rule").should("not.exist");
	});

	it("toggles remove mode", () => {
		cy.contains("button", "-").click();

		cy.contains("button", "Cancel").should("be.visible");
		cy.contains("button", "Cancel").click();
		cy.contains("button", "+").should("be.visible");
		cy.contains("button", "-").should("be.visible");
	});

	it("toggles voting controls", () => {
		cy.contains("button", "Vote").click();

		cy.get('button[aria-label="YES"]').should("have.length", 3);
		cy.get('button[aria-label="NO"]').should("have.length", 3);
		cy.contains("YES 1 | NO 0").should("be.visible");

		cy.contains("button", "Vote").click();
		cy.contains("YES 1 | NO 0").should("not.exist");
	});
});
