import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, test, vi } from "vitest";
import SignUpPage from "../pages/signUpPage";
import { API_BASE } from "../config";

function renderSignUpPage() {
	return render(
		<MemoryRouter initialEntries={["/signup"]}>
			<Routes>
				<Route path="/signup" element={<SignUpPage />} />
				<Route
					path="/settings/:username"
					element={<div>User Settings Page</div>}
				/>
				<Route path="/" element={<div>Sign In Page</div>} />
			</Routes>
		</MemoryRouter>
	);
}

function mockSuccessfulSignup() {
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		json: async () => ({
			username: "testuser",
		}),
	}) as unknown as typeof fetch;
}

function mockFailedSignup() {
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		json: async () => ({
			error: "Username already exists",
		}),
	}) as unknown as typeof fetch;
}

async function fillSignupForm() {
	const user = userEvent.setup();

	await user.type(screen.getByPlaceholderText("Username"), "testuser");
	await user.type(screen.getByPlaceholderText("Password"), "password123");
	await user.type(screen.getByPlaceholderText("Full Name"), "Test User");
}

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
	vi.unstubAllGlobals();
});

test("renders the sign up form", () => {
	renderSignUpPage();

	expect(
		screen.getByRole("heading", { name: "Sign Up" })
	).toBeInTheDocument();

	expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
	expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
	expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
	expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
});

test("shows an error when fields are empty", async () => {
	globalThis.fetch = vi.fn() as unknown as typeof fetch;

	renderSignUpPage();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "Sign Up" }));

	expect(
		screen.getByText("Please fill in username, password, and full name")
	).toBeInTheDocument();

	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("sends signup request when form is filled out", async () => {
	mockSuccessfulSignup();

	renderSignUpPage();
	await fillSignupForm();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "Sign Up" }));

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE}/users`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: "testuser",
				password: "password123",
				fullName: "Test User",
			}),
		});
	});
});

test("navigates to settings page after successful signup", async () => {
	mockSuccessfulSignup();

	renderSignUpPage();
	await fillSignupForm();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "Sign Up" }));

	expect(await screen.findByText("User Settings Page")).toBeInTheDocument();
});

test("shows backend error when signup fails", async () => {
	mockFailedSignup();

	renderSignUpPage();
	await fillSignupForm();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "Sign Up" }));

	expect(
		await screen.findByText("Username already exists")
	).toBeInTheDocument();
	expect(screen.queryByText("User Settings Page")).not.toBeInTheDocument();
});

test("shows fallback error when fetch fails", async () => {
	globalThis.fetch = vi
		.fn()
		.mockRejectedValueOnce(
			new Error("Network error")
		) as unknown as typeof fetch;

	renderSignUpPage();
	await fillSignupForm();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "Sign Up" }));

	expect(
		await screen.findByText("Signup failed. Please try again.")
	).toBeInTheDocument();

	expect(screen.queryByText("User Settings Page")).not.toBeInTheDocument();
});

test("sign in link points back to login page", () => {
	renderSignUpPage();

	expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
		"href",
		"/"
	);
});
