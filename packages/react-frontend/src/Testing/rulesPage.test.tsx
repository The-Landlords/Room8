import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import RulesPage from "../pages/rulesPage";

jest.mock("../components/list", () => {
	return function MockList(props: any) {
		return (
			<div>
				<button onClick={props.handleAddClick}>+</button>

				{props.items.map((item: any, index: number) => {
					const key = props.getKey
						? props.getKey(item)
						: (item._id ?? index);

					return (
						<div key={key}>
							<div>{props.renderItem(item)}</div>

							<button
								onClick={() => props.handleRemoveClick(item)}
							>
								remove {item.description}
							</button>
						</div>
					);
				})}
			</div>
		);
	};
});

jest.mock("../components/RuleCard", () => {
	return function MockRuleCard(props: any) {
		return (
			<div>
				<div>{props.rule.description}</div>
				<div>Status: {props.rule.status}</div>

				<button onClick={() => props.onVote(props.rule._id, "YES")}>
					vote yes {props.rule.description}
				</button>

				<button onClick={() => props.onVote(props.rule._id, "NO")}>
					vote no {props.rule.description}
				</button>
			</div>
		);
	};
});

jest.mock("../components/DeleteVotePanel", () => {
	return function MockDeleteVotePanel(props: any) {
		return (
			<div>
				<div>Delete Vote Panel</div>

				<button onClick={() => props.onVote(props.ruleId, "YES")}>
					confirm delete vote yes
				</button>

				<button onClick={() => props.onVote(props.ruleId, "NO")}>
					confirm delete vote no
				</button>

				<button onClick={props.onCancel}>cancel delete vote</button>
			</div>
		);
	};
});

function renderRulesPage() {
	return render(
		<MemoryRouter initialEntries={["/rules/testhomecode"]}>
			<Routes>
				<Route path="/rules/:homeCode" element={<RulesPage />} />
			</Routes>
		</MemoryRouter>
	);
}

async function flushPromises() {
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
}

async function renderLoadedRulesPage() {
	renderRulesPage();

	await act(async () => {
		await flushPromises();
	});
}

function makeRule(overrides: any = {}) {
	return {
		_id: "rule-1",
		description: "Quiet hours after 10pm",
		status: "PENDING",
		createdAt: "2099-01-01T00:00:00.000Z",
		votes: [],
		deleteVotes: [],
		deleteStatus: "NONE",
		...overrides,
	};
}

function mockHomeResponse() {
	return {
		ok: true,
		json: async () => ({
			_id: "home-1",
			homeName: "Test Home",
		}),
	};
}

function mockRulesResponse(rules: any[]) {
	return {
		ok: true,
		json: async () => rules,
	};
}

function mockFetchWithRules(rules: any[]) {
	globalThis.fetch = jest
		.fn()
		.mockResolvedValueOnce(mockHomeResponse())
		.mockResolvedValueOnce(mockRulesResponse(rules));
}

function mockFetchForAddingRule() {
	globalThis.fetch = jest
		.fn()
		// Initial page load: fetch home
		.mockResolvedValueOnce(mockHomeResponse())
		// Initial page load: fetch rules
		.mockResolvedValueOnce(mockRulesResponse([]))
		// Add rule POST
		.mockResolvedValueOnce({
			ok: true,
			json: async () => makeRule(),
		})
		// Refresh after add: fetch home
		.mockResolvedValueOnce(mockHomeResponse())
		// Refresh after add: fetch rules
		.mockResolvedValueOnce(mockRulesResponse([makeRule()]));
}

function mockFetchForVotingRule() {
	globalThis.fetch = jest
		.fn()
		// Initial page load: fetch home
		.mockResolvedValueOnce(mockHomeResponse())
		// Initial page load: fetch rules
		.mockResolvedValueOnce(mockRulesResponse([makeRule()]))
		// Vote POST
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({}),
		})
		// Refresh after vote: fetch home
		.mockResolvedValueOnce(mockHomeResponse())
		// Refresh after vote: fetch rules
		.mockResolvedValueOnce(
			mockRulesResponse([
				makeRule({
					status: "CONFIRMED",
					votes: [{ voteId: "test-vote-id", vote: "YES" }],
				}),
			])
		);
}

function mockFetchForDeletedRule() {
	globalThis.fetch = jest
		.fn()
		// Initial page load: fetch home
		.mockResolvedValueOnce(mockHomeResponse())
		// Initial page load: fetch rules
		.mockResolvedValueOnce(mockRulesResponse([makeRule()]))
		// Delete vote POST
		.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				deleted: true,
			}),
		});
}

beforeEach(() => {
	localStorage.clear();

	Object.defineProperty(globalThis, "crypto", {
		value: {
			randomUUID: jest.fn(() => "test-vote-id"),
		},
		writable: true,
	});

	mockFetchWithRules([]);
});

afterEach(() => {
	jest.clearAllMocks();
});

test("renders rules page with home name", async () => {
	await renderLoadedRulesPage();

	expect(screen.getByText("Rules for Test Home")).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
});

test("renders rules fetched from backend", async () => {
	mockFetchWithRules([makeRule()]);

	await renderLoadedRulesPage();

	expect(screen.getByText("Quiet hours after 10pm")).toBeInTheDocument();
	expect(screen.getByText("Status: PENDING")).toBeInTheDocument();
});

test("clicking add opens the add rule overlay", async () => {
	await renderLoadedRulesPage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	expect(screen.getByText("Add Rule")).toBeInTheDocument();

	expect(
		screen.getByPlaceholderText("e.g. Quiet hours after 10pm")
	).toBeInTheDocument();
});

test("cancel closes the add rule overlay", async () => {
	await renderLoadedRulesPage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	expect(screen.getByText("Add Rule")).toBeInTheDocument();

	fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

	expect(screen.queryByText("Add Rule")).not.toBeInTheDocument();
});

test("adding a rule posts the rule and refreshes rules", async () => {
	mockFetchForAddingRule();

	await renderLoadedRulesPage();

	fireEvent.click(screen.getByRole("button", { name: "+" }));

	fireEvent.change(
		screen.getByPlaceholderText("e.g. Quiet hours after 10pm"),
		{
			target: { value: "Quiet hours after 10pm" },
		}
	);

	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "Add" }));
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenCalledWith(
		"http://localhost:8000/testhomecode/rules",
		expect.objectContaining({
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				description: "Quiet hours after 10pm",
			}),
		})
	);

	expect(screen.getByText("Quiet hours after 10pm")).toBeInTheDocument();
	expect(screen.queryByText("Add Rule")).not.toBeInTheDocument();
});

test("clicking yes vote posts vote and refreshes rules", async () => {
	mockFetchForVotingRule();

	await renderLoadedRulesPage();

	expect(screen.getByText("Quiet hours after 10pm")).toBeInTheDocument();

	await act(async () => {
		fireEvent.click(
			screen.getByRole("button", {
				name: "vote yes Quiet hours after 10pm",
			})
		);
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenCalledWith(
		"http://localhost:8000/rules/rule-1/vote",
		expect.objectContaining({
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				voteId: "test-vote-id",
				vote: "YES",
			}),
		})
	);

	expect(screen.getByText("Status: CONFIRMED")).toBeInTheDocument();
});

test("clicking remove opens delete vote panel", async () => {
	mockFetchWithRules([makeRule()]);

	await renderLoadedRulesPage();

	expect(screen.getByText("Quiet hours after 10pm")).toBeInTheDocument();

	fireEvent.click(
		screen.getByRole("button", {
			name: "remove Quiet hours after 10pm",
		})
	);

	expect(screen.getByText("Delete Vote Panel")).toBeInTheDocument();
});

test("cancel closes delete vote panel", async () => {
	mockFetchWithRules([makeRule()]);

	await renderLoadedRulesPage();

	expect(screen.getByText("Quiet hours after 10pm")).toBeInTheDocument();

	fireEvent.click(
		screen.getByRole("button", {
			name: "remove Quiet hours after 10pm",
		})
	);

	expect(screen.getByText("Delete Vote Panel")).toBeInTheDocument();

	fireEvent.click(
		screen.getByRole("button", {
			name: "cancel delete vote",
		})
	);

	expect(screen.queryByText("Delete Vote Panel")).not.toBeInTheDocument();
});

test("delete vote removes rule when backend says deleted", async () => {
	mockFetchForDeletedRule();

	await renderLoadedRulesPage();

	expect(screen.getByText("Quiet hours after 10pm")).toBeInTheDocument();

	fireEvent.click(
		screen.getByRole("button", {
			name: "remove Quiet hours after 10pm",
		})
	);

	await act(async () => {
		fireEvent.click(
			screen.getByRole("button", {
				name: "confirm delete vote yes",
			})
		);
		await flushPromises();
	});

	expect(globalThis.fetch).toHaveBeenCalledWith(
		"http://localhost:8000/rules/rule-1/delete-vote",
		expect.objectContaining({
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				voteId: "test-vote-id",
				vote: "YES",
			}),
		})
	);

	expect(
		screen.queryByText("Quiet hours after 10pm")
	).not.toBeInTheDocument();

	expect(screen.queryByText("Delete Vote Panel")).not.toBeInTheDocument();
});
