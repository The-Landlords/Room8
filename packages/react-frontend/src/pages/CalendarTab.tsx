import { useEffect } from "react";

export default function CalendarTab() {
	useEffect(() => {
		fetch("http://localhost:4000/cal")
			.then((r) => r.text())
			.then((data) => console.log(data))
			.catch((err) => console.error(err));
	}, []);

	return (
		<div>
			<h1>Calendar</h1>
		</div>
	);
}
