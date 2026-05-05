import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import UserSetting from "../pages/userSetting";

function renderUserSetting() {
	return render(
		<MemoryRouter initialEntries={["/settings/testuser"]}>
			<Routes>
				<Route path="/settings/:username" element={<UserSetting />} />
				<Route
					path="/homelist/:username"
					element={<div>Home List Page</div>}
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

async function renderLoadedUserSetting() {
	renderUserSetting();

	await act(async () => {
		await flushPromises();
	});
}

function makeUser(overrides: any = {}) {
	return {
		username: "testuser",
		pronouns: "he/him",
		fullName: "Test User",
		DOB: "2000-01-15T00:00:00.000Z",
		allergens: ["pollen", "dairy"],
		likes: ["movies", "music"],
		dislikes: ["seafood"],
		phone: "+14155552671",
		emergencyContact: {
			name: "Emergency Person",
			phone: "+12224446666",
			relationship: "Sibling",
		},
		settings: {
			textSize: "medium",
			theme: "light",
			colorBlindMode: "off",
			scheduleVisibility: "roommates",
		},
		...overrides,
	};
}

function mockFetchWithUser(user: any) {
	globalThis.fetch = jest.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => user,
	});
}

function mockFetchForSave(user: any) {
	globalThis.fetch = jest
		.fn()
		.mockResolvedValueOnce({
			ok: true,
			json: async () => user,
		})
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				success: true,
			}),
		});
}

function getPatchBody() {
	const patchCall = (globalThis.fetch as jest.Mock).mock.calls.find(
		(call) => call[0] === "http://localhost:8000/users/testuser"
	);

	expect(patchCall).toBeTruthy();

	return JSON.parse(patchCall[1].body);
}

beforeEach(() => {
	mockFetchWithUser(makeUser());
});

afterEach(() => {
	jest.clearAllMocks();
});

test("renders user settings page and loads user data", async () => {
	await renderLoadedUserSetting();

	expect(screen.getByText("User Settings")).toBeInTheDocument();
	expect(screen.getByText(/Welcome\s+testuser/)).toBeInTheDocument();

	expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
	expect(screen.getByDisplayValue("he/him")).toBeInTheDocument();
	expect(screen.getByDisplayValue("2000-01-15")).toBeInTheDocument();
	expect(screen.getByDisplayValue("pollen, dairy")).toBeInTheDocument();
	expect(screen.getByDisplayValue("movies, music")).toBeInTheDocument();
	expect(screen.getByDisplayValue("seafood")).toBeInTheDocument();
	expect(screen.getByDisplayValue("+14155552671")).toBeInTheDocument();
	expect(screen.getByDisplayValue("Emergency Person")).toBeInTheDocument();
	expect(screen.getByDisplayValue("+12224446666")).toBeInTheDocument();
	expect(screen.getByDisplayValue("Sibling")).toBeInTheDocument();
});

test("clicking back navigates to home list page", async () => {
	await renderLoadedUserSetting();

	fireEvent.click(screen.getByRole("button", { name: "←" }));

	expect(screen.getByText("Home List Page")).toBeInTheDocument();
});

test("clicking sign out navigates to sign in page", async () => {
	await renderLoadedUserSetting();

	fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));

	expect(screen.getByText("Sign In Page")).toBeInTheDocument();
});

test("invalid phone shows warning and disables save profile", async () => {
	mockFetchWithUser(
		makeUser({
			phone: "",
		})
	);

	await renderLoadedUserSetting();

	const phoneInput = screen.getByPlaceholderText("+19998887777");

	fireEvent.change(phoneInput, {
		target: { value: "1" },
	});

	expect(screen.getByText(/Use E\.164 format/i)).toBeInTheDocument();

	expect(screen.getByRole("button", { name: "Save Profile" })).toBeDisabled();
});

test("valid edits save profile with PATCH request", async () => {
	const existingUser = makeUser();

	mockFetchForSave(existingUser);

	await renderLoadedUserSetting();

	const nameInput = screen.getByDisplayValue("Test User");
	const pronounsInput = screen.getByDisplayValue("he/him");
	const allergensInput = screen.getByDisplayValue("pollen, dairy");
	const likesInput = screen.getByDisplayValue("movies, music");
	const dislikesInput = screen.getByDisplayValue("seafood");

	fireEvent.change(nameInput, {
		target: { value: "Updated User" },
	});

	fireEvent.change(pronounsInput, {
		target: { value: "they/them" },
	});

	fireEvent.change(allergensInput, {
		target: { value: "peanuts, dust" },
	});

	fireEvent.change(likesInput, {
		target: { value: "coding, hiking" },
	});

	fireEvent.change(dislikesInput, {
		target: { value: "noise, chores" },
	});

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Save Profile" }));
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenCalledWith(
		"http://localhost:8000/users/testuser",
		expect.objectContaining({
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
		})
	);

	const body = getPatchBody();

	expect(body).toEqual(
		expect.objectContaining({
			fullName: "Updated User",
			pronouns: "they/them",
			allergens: ["peanuts", "dust"],
			likes: ["coding", "hiking"],
			dislikes: ["noise", "chores"],
		})
	);
});

test("changing display settings saves updated settings", async () => {
	const existingUser = makeUser();

	mockFetchForSave(existingUser);

	await renderLoadedUserSetting();

	fireEvent.change(screen.getByDisplayValue("Medium"), {
		target: { value: "large" },
	});

	fireEvent.change(screen.getByDisplayValue("Off"), {
		target: { value: "protanopia" },
	});

	fireEvent.click(screen.getByRole("button", { name: "Everyone" }));

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Save Profile" }));
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenCalledWith(
		"http://localhost:8000/users/testuser",
		expect.objectContaining({
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
		})
	);

	const body = getPatchBody();

	expect(body.settings).toEqual(
		expect.objectContaining({
			textSize: "large",
			colorBlindMode: "protanopia",
			scheduleVisibility: "everyone",
		})
	);
});

test("fetch failure still shows fallback welcome with route username", async () => {
	globalThis.fetch = jest.fn().mockResolvedValueOnce({
		ok: false,
		json: async () => ({}),
	});

	const consoleErrorSpy = jest
		.spyOn(console, "error")
		.mockImplementation(() => {});

	await renderLoadedUserSetting();

	expect(screen.getByText(/Welcome\s+testuser/)).toBeInTheDocument();

	consoleErrorSpy.mockRestore();
});
