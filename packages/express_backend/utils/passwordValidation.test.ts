import {
	isValidPassword,
	PASSWORD_REQUIREMENTS_MESSAGE,
} from "./passwordValidation.js";

describe("passwordValidation", () => {
	describe("isValidPassword", () => {
		test("returns true for a valid non-common password", () => {
			expect(isValidPassword("BlueRoom8!Sky")).toBe(true);
		});

		test("returns false when password is shorter than 8 characters", () => {
			expect(isValidPassword("Aa1!")).toBe(false);
		});

		test("returns false when password is missing an uppercase letter", () => {
			expect(isValidPassword("blueroom8!")).toBe(false);
		});

		test("returns false when password is missing a lowercase letter", () => {
			expect(isValidPassword("BLUEROOM8!")).toBe(false);
		});

		test("returns false when password is missing a number", () => {
			expect(isValidPassword("BlueRoom!")).toBe(false);
		});

		test("returns false when password is missing a symbol", () => {
			expect(isValidPassword("BlueRoom8")).toBe(false);
		});

		test("returns false for an exact common password", () => {
			expect(isValidPassword("password1!")).toBe(false);
		});

		test("returns false for a common password with different casing", () => {
			expect(isValidPassword("Password1!")).toBe(false);
		});

		test("returns false for a common password with leading and trailing spaces", () => {
			expect(isValidPassword("  Password1!  ")).toBe(false);
		});
	});

	describe("PASSWORD_REQUIREMENTS_MESSAGE", () => {
		test("explains all password requirements", () => {
			expect(PASSWORD_REQUIREMENTS_MESSAGE).toBe(
				"Password must be at least 8 characters, include uppercase, lowercase, number, and symbol characters, and not be a common password."
			);
		});
	});
});
