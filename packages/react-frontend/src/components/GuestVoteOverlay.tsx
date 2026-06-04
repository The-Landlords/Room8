import List from "./list";

type Guest = {
	_id: string;
	fullName: string;
};

type GuestVoteOverlayProps = {
	guests: Guest[];
	homeCode: string;
	username: string;
};

export default function GuestVoteOverlay({
	guests,
	homeCode,
}: GuestVoteOverlayProps) {
	return (
		<div className="overlay">
			<h2>Vote on Guest Ascencion</h2>
			<div>
				<List
					item=""
					items={guests}
					handleAddClick={() => {}}
					handleRemoveClick={() => {}}
					getKey={(guests: Guest) => guests._id}
					renderItem={(guest: Guest) => (
						<div>
							<p>{guest.fullName}</p>
							<button className="button">Yes</button>
						</div>
					)}
					homeCode={homeCode ? [homeCode] : undefined}
				></List>
			</div>
		</div>
	);
}
