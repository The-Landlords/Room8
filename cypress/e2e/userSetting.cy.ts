import { TESTUSER5, visitWithMockApi } from "./testSupport";

describe("User settings", () => {
	beforeEach(() => {
		visitWithMockApi("/settings/");
	});

	it("loads the user's profile settings", () => {
		cy.contains("h1", "User Settings").should("be.visible");
		cy.contains(`Welcome ${TESTUSER5.username}`).should("be.visible");
		cy.get('input[placeholder="Barry B. Benson"]').should(
			"have.value",
			TESTUSER5.fullName
		);
		cy.get('input[placeholder="+19998887777"]').should(
			"have.value",
			TESTUSER5.phone
		);
		cy.get("select").first().should("have.value", "medium");
		cy.contains("Display").should("be.visible");
		cy.contains("Emergency").should("be.visible");
	});

	it("saves profile changes and returns to home spaces", () => {
		cy.on("window:alert", (message) => {
			expect(message).to.equal("User settings saved successfully!");
		});

		cy.get('input[placeholder="Barry B. Benson"]')
			.clear()
			.type("Updated User");
		cy.contains("button", "Save Profile").click();
		cy.wait("@updateUserSettings");

		cy.location("pathname").should("eq", "/homelist/");
		cy.contains("h1", "Home Spaces").should("be.visible");
	});

	it("signs the user out", () => {
		cy.contains("button", "Sign Out").click();
		cy.wait("@logout");

		cy.location("pathname").should("eq", "/");
		cy.contains("h1", "Sign In").should("be.visible");
	});
});
