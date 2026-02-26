import { useState } from "react";

//const [homes, setHomes] = useState<string[]>([]);
//setHomes(["Home 1", "Home 2", "Home 3"]);
const homes = ["Home 1", "Home 2", "Home 3"];

export default function HomeList() {
	return (
		<div>
			<h1>Homes</h1>
			<ul>
				{homes.map((home, index) => (
					<li key={index}>{home}</li>
				))}
			</ul>
		</div>
	);
}
