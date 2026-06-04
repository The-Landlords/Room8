import RuleList from "./rulesList";

type Guest = {
	_id: string;
	fullName: string;
};

type GuestVoteOverlayProps = {
	guests: Guest[];
	username: string;
};

export default function GuestVoteOverlay({ guests }: GuestVoteOverlayProps) {
	return (
		<div className="overlay">
			<h2>Vote on Guest Ascencion</h2>
			<div>
				<RuleList
					items={guests}
					handleAddClick={() => {}}
					handleRemoveClick={(guest) => guest._id}
					handleVoteClick={() => {}}
					getKey={(guest) => guest._id}
					className="panel pb-6"
					renderItem={(guest) => (
						<div className="flex items-center text-primary justify-between w-full">
							<span>{guest.fullName}</span>
							<div>
								<button className="button mr-2">Approve</button>
								<button className="button">Reject</button>
							</div>
						</div>
					)}
				/>
			</div>
		</div>
	);
}
