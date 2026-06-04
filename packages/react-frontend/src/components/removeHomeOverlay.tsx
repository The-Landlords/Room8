import { useState } from "react";

/*component is to add a new home based off a given code*/
import { API_BASE } from "../config";

type RemoveHomeProps = {
	onRemove: any;
	homeRemove: any | undefined;
	onCancel: (data: boolean) => void;
};

export default function RemoveHomeOverlay({
	onRemove,
	onCancel,
	homeRemove,
}: RemoveHomeProps) {
	const [willDeleteHome, setWillDeleteHome] = useState(false);

	async function removeHome() {
		console.log("connecting home to user!");

		const promise = await fetch(
			`${API_BASE}/relate/me/${homeRemove.homeCode}`,
			{
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ confirmDeleteHome: willDeleteHome }),
			}
		);
		return promise;
	}
	async function handleRemoveHome() {
		const res = await removeHome();

		if (res.status === 409) {
			const json = await res.json();
			if (json.willDeleteHome) {
				setWillDeleteHome(true);
				return;
			}
		}

		if (res.ok) {
			const json = await res.json();
			onRemove(json);
		}
	}

	return (
		<div className="flex flex-col gap-2 animate-floatUp">
			<h1 className="header-secondary self-center">
				{willDeleteHome
					? `You are the last member of ${homeRemove.homeName}. Leaving will delete this home. Are you sure you would like to continue?`
					: `Are you sure you want to remove ${homeRemove.homeName}?`}
			</h1>
			<div className="flex flex-row gap-4 self-center">
				<button
					className="button self-center"
					onClick={() => onCancel(false)}
				>
					Cancel
				</button>
				<button
					className="button self-center"
					onClick={handleRemoveHome}
				>
					Remove
				</button>
			</div>
		</div>
	);
}
