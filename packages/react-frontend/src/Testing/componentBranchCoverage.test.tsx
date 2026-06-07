import * as React from "react";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, test, vi } from "vitest";
import AddOverlay from "../components/addOverlay";
import DeleteVotePanel from "../components/DeleteVotePanel";
import Header from "../components/header";
import HomeSpaceList from "../components/homeList";
import { InputField } from "../components/input";
import RemoveHomeOverlay from "../components/removeHomeOverlay";
import RuleCard from "../components/RuleCard";
import VotePanel from "../components/VotePanel";
import { API_BASE } from "../config";

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

test("AddOverlay ignores blank submit and renders error message", async () => {
	const onSubmit = vi.fn();
	const onClose = vi.fn();
	const user = userEvent.setup();

	render(
		<AddOverlay
			isOpen={true}
			title="Add Thing"
			placeholder="Thing"
			onSubmit={onSubmit}
			onClose={onClose}
			errorMsg="Thing failed"
		/>
	);

	const form = screen.getByPlaceholderText("Thing").closest("form");
	expect(form).not.toBeNull();

	fireEvent.submit(form as HTMLFormElement);

	expect(onSubmit).not.toHaveBeenCalled();
	expect(screen.getByText("Thing failed")).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "←" }));

	expect(onClose).toHaveBeenCalledTimes(1);
});

test("Header skips fetch without homeCode and navigates back", async () => {
	globalThis.fetch = vi.fn() as unknown as typeof fetch;
	const user = userEvent.setup();

	render(
		<MemoryRouter
			initialEntries={["/previous", "/current"]}
			initialIndex={1}
		>
			<Routes>
				<Route path="/previous" element={<div>Previous Page</div>} />
				<Route path="/current" element={<Header title="Things" />} />
			</Routes>
		</MemoryRouter>
	);

	expect(screen.getByText(/'s Things/)).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: /back/i }));

	expect(screen.getByText("Previous Page")).toBeInTheDocument();
	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("Header clears home name when home lookup fails", async () => {
	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});

	globalThis.fetch = vi.fn().mockResolvedValue({
		ok: false,
		json: async () => ({}),
	}) as unknown as typeof fetch;

	render(
		<MemoryRouter>
			<Header homeCode="bad-home" title="Things" />
		</MemoryRouter>
	);

	expect(await screen.findByText(/'s Things/)).toBeInTheDocument();
	expect(globalThis.fetch).toHaveBeenCalledWith(
		`${API_BASE}/homes/code/bad-home`,
		{
			credentials: "include",
		}
	);

	consoleErrorSpy.mockRestore();
});

type HomeItem = {
	_id: string;
	homeCode: string;
	homeName: string;
	relationship: string;
};

function renderHomeSpaceList(items: HomeItem[]) {
	return render(
		<MemoryRouter>
			<HomeSpaceList
				items={items}
				getKey={(home) => home._id}
				renderItem={(home) => <span>{home.homeName}</span>}
				homeCode={(home) => home.homeCode}
				getRelationship={(home) => home.relationship}
				handleAddClick={vi.fn()}
				handleRemoveClick={vi.fn()}
			/>
		</MemoryRouter>
	);
}

test("HomeSpaceList renders guest, resident, and unknown relationship actions", () => {
	renderHomeSpaceList([
		{
			_id: "home-guest",
			homeCode: "GUEST1",
			homeName: "Guest Home",
			relationship: "GUEST",
		},
		{
			_id: "home-resident",
			homeCode: "RES1",
			homeName: "Resident Home",
			relationship: "RESIDENT",
		},
		{
			_id: "home-unknown",
			homeCode: "UNK1",
			homeName: "Unknown Home",
			relationship: "",
		},
	]);

	expect(screen.getByText("Guest Home")).toBeInTheDocument();
	expect(screen.getByText("Resident Home")).toBeInTheDocument();
	expect(screen.getByText("Unknown Home")).toBeInTheDocument();
	expect(screen.getAllByRole("link")).toHaveLength(8);
});

test("VotePanel highlights a no vote and sends both vote choices", async () => {
	const onVote = vi.fn();
	const user = userEvent.setup();

	render(
		<VotePanel
			ruleId="rule-1"
			yesCount={1}
			noCount={2}
			myVote="NO"
			onVote={onVote}
		/>
	);

	expect(screen.getByText("YES 1 | NO 2")).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "YES" }));
	await user.click(screen.getByRole("button", { name: "NO" }));

	expect(onVote).toHaveBeenCalledWith("rule-1", "YES");
	expect(onVote).toHaveBeenCalledWith("rule-1", "NO");
});

test("RuleCard handles missing votes and hidden voting controls", () => {
	render(
		<RuleCard
			rule={{
				_id: "rule-1",
				description: "Clean the kitchen",
				status: "CONFIRMED",
			}}
			voteId="vote-1"
			totalResidents={3}
			onVote={vi.fn()}
			showVoting={false}
		/>
	);

	expect(screen.getByText("Clean the kitchen")).toBeInTheDocument();
	expect(screen.getByText("0/3 Approve")).toBeInTheDocument();
	expect(screen.getByText(/Status : Approved/i)).toBeInTheDocument();
	expect(
		screen.queryByRole("button", { name: "YES" })
	).not.toBeInTheDocument();
});

test("DeleteVotePanel shows rejected and selected no states", async () => {
	const onVote = vi.fn();
	const user = userEvent.setup();

	render(
		<DeleteVotePanel
			ruleId="rule-1"
			voteId="vote-1"
			deleteVotes={[{ voteId: "vote-1", vote: "NO" }]}
			totalResidents={2}
			deleteStatus="PENDING"
			onVote={onVote}
			onCancel={vi.fn()}
		/>
	);

	expect(screen.getByText("Delete request rejected")).toBeInTheDocument();
	expect(
		screen.queryByText("Waiting for unanimous approval")
	).not.toBeInTheDocument();
	expect(
		screen.getByText("YES 0 | NO 1 | Total Roommates 2")
	).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "NO" }));

	expect(onVote).toHaveBeenCalledWith("rule-1", "NO");
});

test("DeleteVotePanel shows pending and selected yes states", async () => {
	const onVote = vi.fn();
	const onCancel = vi.fn();
	const user = userEvent.setup();

	render(
		<DeleteVotePanel
			ruleId="rule-1"
			voteId="vote-1"
			deleteVotes={[{ voteId: "vote-1", vote: "YES" }]}
			totalResidents={2}
			deleteStatus="PENDING"
			onVote={onVote}
			onCancel={onCancel}
		/>
	);

	expect(
		screen.getByText("Waiting for unanimous approval")
	).toBeInTheDocument();
	expect(
		screen.getByText("YES 1 | NO 0 | Total Roommates 2")
	).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "YES" }));
	await user.click(screen.getByRole("button", { name: /cancel/i }));

	expect(onVote).toHaveBeenCalledWith("rule-1", "YES");
	expect(onCancel).toHaveBeenCalledTimes(1);
});

type Draft = {
	name: string;
	settings: Record<string, string>;
};

function InputHarness() {
	const [draft, setDraft] = React.useState<Draft>({
		name: "Tester",
		settings: {
			mode: "off",
			choice: "blank",
			toggle: "off",
		},
	});

	return (
		<>
			<InputField
				fieldName={{
					label: "",
					layout: "vertical",
					fields: [
						{
							type: "select",
							field: "choice",
							layout: "horizontal",
							options: [
								{ value: "blank", label: "" },
								{ value: "named", label: "Named" },
							],
						},
						{
							type: "toggle",
							field: "toggle",
							onName: "on",
							offName: "off",
						},
					],
				}}
				state={{ draft, setDraft }}
			/>
			<div data-testid="toggle-value">{draft.settings.toggle}</div>
		</>
	);
}

test("InputField supports blank labels and toggles from off to on", async () => {
	const user = userEvent.setup();

	render(<InputHarness />);

	const buttons = screen.getAllByRole("button");
	expect(within(buttons[0]).queryByText(/./)).not.toBeInTheDocument();
	expect(screen.getByTestId("toggle-value")).toHaveTextContent("off");

	await user.click(buttons[2]);

	expect(screen.getByTestId("toggle-value")).toHaveTextContent("on");
});

test("RemoveHomeOverlay ignores non-confirming conflict response", async () => {
	const home = { _id: "home-1", homeCode: "HOME123", homeName: "Apartment" };
	const fetchMock = vi.fn().mockResolvedValue({
		ok: false,
		status: 409,
		json: async () => ({ willDeleteHome: false }),
	});
	const onRemove = vi.fn();
	const user = userEvent.setup();

	globalThis.fetch = fetchMock as unknown as typeof fetch;

	render(
		<RemoveHomeOverlay
			homeRemove={home}
			onRemove={onRemove}
			onCancel={vi.fn()}
		/>
	);

	await user.click(screen.getByRole("button", { name: /remove/i }));

	await waitFor(() => expect(fetchMock).toHaveBeenCalled());

	expect(onRemove).not.toHaveBeenCalled();
});
