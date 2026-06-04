import { mockHome, signInAsTestUser5, visitWithMockApi } from "./testSupport";

describe("Sign in", () => {
	it("shows the sign in form", () => {
		visitWithMockApi("/");

		cy.location("pathname").should("eq", "/");
		cy.contains("h1", "Sign In").should("be.visible");
		cy.get('input[placeholder="Username"]').should("have.value", "");
		cy.get('input[placeholder="Password"]').should("have.value", "");
		cy.contains("button", "Sign In").should("be.visible");
		cy.contains("a", "Sign Up").should("have.attr", "href", "/signup");
	});

	it("logs in and shows the user's home spaces", () => {
		signInAsTestUser5();

		cy.location("pathname").should("eq", "/homelist/");
		cy.contains("h1", "Home Spaces").should("be.visible");
		cy.contains("h1", "Current Home Spaces").should("be.visible");
		cy.contains(mockHome.homeName).should("be.visible");
		cy.contains(mockHome.address).should("be.visible");
		cy.get(`a[href="/residents/${mockHome.homeCode}"]`).should("exist");
		cy.get(`a[href="/rules/${mockHome.homeCode}"]`).should("exist");
		cy.get(`a[href="/events/${mockHome.homeCode}"]`).should("exist");
		cy.get(`a[href="/${mockHome.homeCode}/chores"]`).should("exist");
		cy.get(`a[href="/grocery/${mockHome.homeCode}"]`).should("exist");
		cy.get(`a[href="/homeDisplay/me/${mockHome.homeCode}"]`).should(
			"exist"
		);
	});
});
