import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import SignUpPage from "../pages/signUpPage";

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

async function flushPromises() {
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
}

function mockSuccessfulSignup() {
	globalThis.fetch = jest.fn().mockResolvedValueOnce({
		json: async () => ({
			username: "testuser",
		}),
	}) as jest.Mock;
}

function mockFailedSignup() {
	globalThis.fetch = jest.fn().mockResolvedValueOnce({
		json: async () => ({
			error: "Username already exists",
		}),
	}) as jest.Mock;
}

function fillSignupForm() {
	fireEvent.change(screen.getByPlaceholderText("Username"), {
		target: { value: "testuser" },
	});

	fireEvent.change(screen.getByPlaceholderText("Password"), {
		target: { value: "password123" },
	});

	fireEvent.change(screen.getByPlaceholderText("Full Name"), {
		target: { value: "Test User" },
	});
}

afterEach(() => {
	jest.clearAllMocks();
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

test("shows an error when fields are empty", () => {
	renderSignUpPage();

	fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

	expect(
		screen.getByText("Please fill in username, password, and full name")
	).toBeInTheDocument();

	expect(globalThis.fetch).toBeUndefined();
});

test("sends signup request when form is filled out", async () => {
	mockSuccessfulSignup();

	renderSignUpPage();

	fillSignupForm();

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenCalledWith(
		"http://localhost:8000/users",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: "testuser",
				password: "password123",
				fullName: "Test User",
			}),
		}
	);
});

test("navigates to settings page after successful signup", async () => {
	mockSuccessfulSignup();

	renderSignUpPage();

	fillSignupForm();

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
		await flushPromises();
	});

	expect(screen.getByText("User Settings Page")).toBeInTheDocument();
});

test("shows backend error when signup fails", async () => {
	mockFailedSignup();

	renderSignUpPage();

	fillSignupForm();

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
		await flushPromises();
	});

	expect(screen.getByText("Username already exists")).toBeInTheDocument();

	expect(screen.queryByText("User Settings Page")).not.toBeInTheDocument();
});

test("shows fallback error when fetch fails", async () => {
	globalThis.fetch = jest
		.fn()
		.mockRejectedValueOnce(new Error("Network error")) as jest.Mock;

	renderSignUpPage();

	fillSignupForm();

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
		await flushPromises();
	});

	expect(
		screen.getByText("Signup failed. Please try again.")
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
