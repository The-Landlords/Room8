import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { API_BASE } from "../config";
import List from "../components/list";
import { set } from "ol/transform";

export default function HomeDisplayPage() {
	const { homeCode } = useParams();
	const { username } = useParams();
	const navigate = useNavigate();
	const [home, setHome] = useState("");
	const [groceries, setGroceries] = useState<any[]>([]);
	const [rules, setRules] = useState<any[]>([]);
	const [events, setEvents] = useState<any[]>([]);
	const [chores, setChores] = useState<any[]>([]);
	const [residents, setResidents] = useState<any[]>([]);

	useEffect(() => {
		async function fetchHomeName() {
			try {
				const res = await fetch(
					`${API_BASE}/auth/homeDisplay/${username}/${homeCode}`
				);
				const data = await res.json();
				if (res.ok) {
					setHome(data.name);

					setGroceries(data.groceries || []);
					setRules(data.rules || []);
					setEvents(data.events || []);
					setChores(data.chores || []);
					setResidents(data.residents || []);
				} else {
					throw new Error(data.error || "Failed to fetch home name");
				}
			} catch (error) {
				console.error("Error fetching home name:", error);
			}
		}
		fetchHomeName().catch(console.error);
	}, []);

	return (
		<div className="flex flex-col items-center">
			<div>
				<h1 className="header">Rules</h1>
				<List
					item="current rules"
					items={rules}
					handleAddClick={() => {}}
					handleRemoveClick={() => {}}
					username={username}
					getKey={(rule) => rule._id}
					renderItem={(rule) => (
						<div>
							<p>{rule.name}</p>
							<p>{rule.address}</p>
							<p>{rule.rules}</p>
							<p>{rule.events}</p>
						</div>
					)}
				></List>
				<h1 className="header">Events</h1>
				<List
					item="current events"
					items={events}
					handleAddClick={() => {}}
					handleRemoveClick={() => {}}
					username={username}
					getKey={(event) => event._id}
					renderItem={(event) => (
						<div>
							<p>{event.name}</p>
							<p>{event.description}</p>
							<p>{event.start}</p>
						</div>
					)}
				></List>
			</div>

			<button
				type="button"
				onClick={() => navigate(`/residents/${username}/${homeCode}`)}
				className="button h-14 w-48 flex items-center justify-center rounded-xl mt-4"
			>
				View Residents
			</button>
		</div>
	);
}
