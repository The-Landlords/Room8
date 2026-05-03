import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import SignInPage from "../pages/signInPage";

function renderSignInPage() {
	return render(
		<MemoryRouter initialEntries={["/signin"]}>
			<Routes>
				<Route path="/signin" element={<SignInPage />} />
				<Route
					path="/homelist/:username"
					element={<div>Home List Page</div>}
				/>
				<Route path="/signup" element={<div>Sign Up Page</div>} />
			</Routes>
		</MemoryRouter>
	);
}

async function flushPromises() {
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
}

function mockSuccessfulLogin() {
	globalThis.fetch = jest.fn().mockResolvedValueOnce({
		json: async () => ({
			username: "testuser",
		}),
	}) as jest.Mock;
}

function mockFailedLogin() {
	globalThis.fetch = jest.fn().mockResolvedValueOnce({
		json: async () => ({
			error: "Invalid username or password",
		}),
	}) as jest.Mock;
}

function fillSignInForm() {
	fireEvent.change(screen.getByPlaceholderText("Username"), {
		target: { value: "testuser" },
	});

	fireEvent.change(screen.getByPlaceholderText("Password"), {
		target: { value: "password123" },
	});
}

afterEach(() => {
	jest.clearAllMocks();
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

test("shows an error when username and password are empty", () => {
	renderSignInPage();

	fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

	expect(
		screen.getByText("Please fill in username and password")
	).toBeInTheDocument();

	expect(globalThis.fetch).toBeUndefined();
});

test("sends login request when form is filled out", async () => {
	mockSuccessfulLogin();

	renderSignInPage();

	fillSignInForm();

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenCalledWith(
		"http://localhost:8000/login",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: "testuser",
				password: "password123",
			}),
		}
	);
});

test("navigates to home list after successful login", async () => {
	mockSuccessfulLogin();

	renderSignInPage();

	fillSignInForm();

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
		await flushPromises();
	});

	expect(screen.getByText("Home List Page")).toBeInTheDocument();
});

test("shows backend error when login fails", async () => {
	mockFailedLogin();

	renderSignInPage();

	fillSignInForm();

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
		await flushPromises();
	});

	expect(
		screen.getByText("Invalid username or password")
	).toBeInTheDocument();

	expect(screen.queryByText("Home List Page")).not.toBeInTheDocument();
});

test("shows fallback error when fetch fails", async () => {
	globalThis.fetch = jest
		.fn()
		.mockRejectedValueOnce(new Error("Network error")) as jest.Mock;

	renderSignInPage();

	fillSignInForm();

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
		await flushPromises();
	});

	expect(
		screen.getByText("Invalid Username or Password")
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
