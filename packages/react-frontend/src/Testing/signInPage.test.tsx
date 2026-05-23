import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, test, vi } from "vitest";
import SignInPage from "../pages/signInPage";
import { API_BASE } from "../config";

function renderSignInPage() {
	return render(
		<MemoryRouter initialEntries={["/signin"]}>
			<Routes>
				<Route path="/signin" element={<SignInPage />} />
				<Route path="/homelist/" element={<div>Home List Page</div>} />
				<Route path="/signup" element={<div>Sign Up Page</div>} />
			</Routes>
		</MemoryRouter>
	);
}

function mockSuccessfulLogin() {
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		json: async () => ({
			username: "testuser",
		}),
	}) as unknown as typeof fetch;
}

function mockFailedLogin() {
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		json: async () => ({
			error: "Invalid username or password",
		}),
	}) as unknown as typeof fetch;
}

async function fillSignInForm() {
	const user = userEvent.setup();

	await user.type(screen.getByPlaceholderText("Username"), "testuser");
	await user.type(screen.getByPlaceholderText("Password"), "password123");
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

test("renders the sign in form", () => {
	renderSignInPage();

	expect(
		screen.getByRole("heading", { name: "Sign In" })
	).toBeInTheDocument();

	expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
	expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
	expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
});

test("shows an error when username and password are empty", async () => {
	globalThis.fetch = vi.fn() as unknown as typeof fetch;

	renderSignInPage();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "Sign In" }));

	expect(
		screen.getByText("Please fill in username and password")
	).toBeInTheDocument();

	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("sends login request when form is filled out", async () => {
	mockSuccessfulLogin();

	renderSignInPage();
	await fillSignInForm();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "Sign In" }));

	await waitFor(() => {
		expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE}/login`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: "testuser",
				password: "password123",
			}),
		});
	});
});

test("navigates to home list after successful login", async () => {
	mockSuccessfulLogin();

	renderSignInPage();
	await fillSignInForm();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "Sign In" }));

	expect(await screen.findByText("Home List Page")).toBeInTheDocument();
});

test("shows backend error when login fails", async () => {
	mockFailedLogin();

	renderSignInPage();
	await fillSignInForm();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "Sign In" }));

	expect(
		await screen.findByText("Invalid username or password")
	).toBeInTheDocument();
	expect(screen.queryByText("Home List Page")).not.toBeInTheDocument();
});

test("shows fallback error when fetch fails", async () => {
	globalThis.fetch = vi
		.fn()
		.mockRejectedValueOnce(
			new Error("Network error")
		) as unknown as typeof fetch;

	renderSignInPage();
	await fillSignInForm();
	const user = userEvent.setup();

	await user.click(screen.getByRole("button", { name: "Sign In" }));

	expect(
		await screen.findByText("Invalid Username or Password")
	).toBeInTheDocument();
	expect(screen.queryByText("Home List Page")).not.toBeInTheDocument();
});

test("sign up link points to signup page", () => {
	renderSignInPage();

	expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
		"href",
		"/signup"
	);
});
