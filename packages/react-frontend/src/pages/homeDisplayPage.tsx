import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { API_BASE } from "../config";
import List from "../components/list";

export default function HomeDisplayPage() {
	const { homeCode } = useParams();
	const navigate = useNavigate();
	const [home, setHome] = useState("");
	const [groceries, setGroceries] = useState<any[]>([]);
	const [rules, setRules] = useState<any[]>([]);
	const [events, setEvents] = useState<any[]>([]);
	const [chores, setChores] = useState<any[]>([]);
	const [residents, setResidents] = useState<any[]>([]);

	useEffect(() => {
		async function fetchResidents() {
			if (!homeCode) return;

			fetch(`${API_BASE}/auth/residents/${homeCode}`, {
				credentials: "include",
			})
				.then((res) => {
					if (!res.ok) throw new Error("Residents not found ");
					return res.json();
				})
				.then((data) => setResidents(data))
				.catch((err) => {
					console.error(err);
					setResidents([]);
				});
		}
		async function fetchHomeName() {
			if (!homeCode) return;

			try {
				const res = await fetch(
					`${API_BASE}/auth/homeDisplay/me/${homeCode}`,
					{
						credentials: "include",
					}
				);
				const data = await res.json();
				if (res.ok) {
					setHome(data.name);

					setGroceries(data.groceries || []);
					setRules(data.rules || []);
					setEvents(data.events || []);
					setChores(data.chores || []);
				} else {
					throw new Error(data.error || "Failed to fetch home name");
				}
			} catch (error) {
				console.error("Error fetching home name:", error);
			}
		}
		fetchHomeName().catch(console.error);
		fetchResidents().catch(console.error);
	}, [homeCode]);

	return (
		<div>
			<div className="flex justify-start">
				<button
					type="button"
					onClick={() => navigate(`/homelist/`)}
					className="button h-14 w-14 flex items-center justify-center rounded-xl"
				>
					←
				</button>
			</div>
			<div className="flex flex-col items-center">
				<h1 className="header">{home}</h1>
				<h2 className="header-secondary"> homeCode : {homeCode}</h2>
				<div className="flex flex-row gap-3 w-50%">
					<div>
						<List
							item="current rules"
							items={rules}
							handleAddClick={() => {}}
							handleRemoveClick={() => {}}
							getKey={(rule) => rule._id}
							renderItem={(rule) => (
								<div>
									<p>{rule.description}</p>
								</div>
							)}
						></List>
					</div>
					<div>
						<List
							item="current events"
							items={events}
							handleAddClick={() => {}}
							handleRemoveClick={() => {}}
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
					{groceries ? (
						<div>
							<List
								item="current groceries"
								items={groceries}
								handleAddClick={() => {}}
								handleRemoveClick={() => {}}
								getKey={(grocery) => grocery._id}
								renderItem={(grocery) => (
									<div className="flex flex-row gap-4">
										<p>{grocery.title}</p>
										<p>{grocery.quantity}</p>
										<p>${grocery.price}</p>
									</div>
								)}
							></List>
						</div>
					) : (
						<p></p>
					)}
					{chores ? (
						<div>
							<List
								item="current chores"
								items={chores}
								handleAddClick={() => {}}
								handleRemoveClick={() => {}}
								getKey={(chore) => chore._id}
								renderItem={(chore) => (
									<div>
										<p>{chore.title}</p>
									</div>
								)}
							></List>
						</div>
					) : (
						<p></p>
					)}
				</div>
				<List
					item="current residents"
					items={residents}
					handleAddClick={() => {}}
					handleRemoveClick={() => {}}
					getKey={(resident) => resident._id}
					renderItem={(resident) => (
						<div className="flex flex-row gap-4">
							<p>{resident.fullName}</p>
							<p>{resident.allergens}</p>
						</div>
					)}
				></List>
			</div>
		</div>
	);
}
