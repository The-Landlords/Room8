import * as React from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import UserSetting from "../pages/userSetting";
import { API_BASE } from "../config";

function renderUserSetting() {
	return render(
		<MemoryRouter initialEntries={["/settings/"]}>
			<Routes>
				<Route path="/settings/" element={<UserSetting />} />
				<Route path="/homelist" element={<div>Home List Page</div>} />
				<Route path="/homelist/" element={<div>Home List Page</div>} />
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

type User = {
	username: string;
	pronouns: string;
	fullName: string;
	DOB: string;
	allergens: string[];
	likes: string[];
	dislikes: string[];
	phone: string;
	emergencyContact: {
		name: string;
		phone: string;
		relationship: string;
	};
	settings: {
		textSize: string;
		theme: string;
		colorBlindMode: string;
		scheduleVisibility: string;
	};
	visibility: {
		nameVisible: string;
		phoneVisible: string;
		dobVisible: string;
		likesVisible: string;
		dislikesVisible: string;
		emergencyContactVisible: string;
		allergensVisible: string;
		pronounsVisible: string;
	};
};

function makeUser(overrides: Partial<User> = {}): User {
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
		visibility: {
			nameVisible: "PUBLIC",
			phoneVisible: "PRIVATE",
			dobVisible: "PRIVATE",
			likesVisible: "PRIVATE",
			dislikesVisible: "PRIVATE",
			emergencyContactVisible: "PRIVATE",
			allergensVisible: "PUBLIC",
			pronounsVisible: "PRIVATE",
		},
		...overrides,
	};
}

function mockFetchWithUser(user: User) {
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => user,
	}) as unknown as typeof fetch;
}

function mockFetchForSave(user: User) {
	globalThis.fetch = vi
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
		}) as unknown as typeof fetch;
}

function getFetchCalls() {
	return (globalThis.fetch as unknown as { mock: { calls: unknown[][] } })
		.mock.calls;
}

function getPatchBody() {
	const patchCall = getFetchCalls().find(
		(call) =>
			call[0] === `${API_BASE}/users/me` &&
			(call[1] as { method?: string } | undefined)?.method === "PATCH"
	);

	expect(patchCall).toBeTruthy();

	const requestOptions = patchCall?.[1] as { body: string };
	return JSON.parse(requestOptions.body);
}

beforeEach(() => {
	mockFetchWithUser(makeUser());
	vi.stubGlobal("alert", vi.fn());
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
	vi.unstubAllGlobals();
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

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
		await flushPromises();
	});

	expect(screen.getByText("Sign In Page")).toBeInTheDocument();
	expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE}/logout`, {
		method: "POST",
		credentials: "include",
	});
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
		`${API_BASE}/users/me`,
		expect.objectContaining({
			method: "PATCH",
			credentials: "include",
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
		`${API_BASE}/users/me`,
		expect.objectContaining({
			method: "PATCH",
			credentials: "include",
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

test("fetch failure still shows generic fallback welcome", async () => {
	globalThis.fetch = vi.fn().mockResolvedValueOnce({
		ok: false,
		json: async () => ({}),
	}) as unknown as typeof fetch;

	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});

	await renderLoadedUserSetting();

	expect(screen.getByText(/Welcome\s+User/)).toBeInTheDocument();

	consoleErrorSpy.mockRestore();
});
