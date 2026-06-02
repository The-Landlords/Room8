import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { API_BASE } from "../config";
import BasicList from "../components/basicList";
import Cards from "../components/userCards";
import Header from "../components/header";

function formatDate(dateString: string) {
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return dateString;

	const options: Intl.DateTimeFormatOptions = {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	};

	return date.toLocaleDateString(undefined, options);
}
export default function HomeDisplayPage() {
	const { homeCode } = useParams();

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
					if (!res.ok) throw new Error("Residents not found");
					return res.json();
				})
				.then((data) => {
					setResidents(Array.isArray(data) ? data : []);
				})
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

					setGroceries(
						Array.isArray(data.groceries) ? data.groceries : []
					);
					setRules(Array.isArray(data.rules) ? data.rules : []);
					setEvents(Array.isArray(data.events) ? data.events : []);
					setChores(Array.isArray(data.chores) ? data.chores : []);
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
		<div className="min-h-screen flex flex-col  items-center-safe">
			<Header title="Overview" homeCode={homeCode} />

			<h2 className="header-secondary self-center-safe">
				homeCode: {homeCode}
			</h2>
			<div className="flex flex-row flex-wrap justify-center gap-4 w-full max-w-7xl mx-auto">
				<BasicList
					title="Current Rules: "
					items={rules}
					getKey={(rule) => rule._id}
					emptyMessage="No rules"
					className="dashboard-card"
					renderItem={(rule) => (
						<div>
							<p>{rule.description}</p>
						</div>
					)}
				/>
				<BasicList
					title="Current Events: "
					items={events}
					getKey={(event) => event._id}
					emptyMessage="No events"
					className="dashboard-card"
					renderItem={(event) => (
						<div>
							<p>{event.name}</p>
							<p>{event.description}</p>
							<p>{formatDate(event.start)}</p>
						</div>
					)}
				/>
				{groceries.length > 0 && (
					<BasicList
						title="Current Groceries: "
						items={groceries}
						getKey={(grocery) => grocery._id}
						emptyMessage="No groceries"
						className="dashboard-card"
						renderItem={(grocery) => (
							<div className="flex flex-row gap-4">
								<p>{grocery.title}</p>
								<p>{grocery.quantity}</p>
								<p>${grocery.price}</p>
							</div>
						)}
					/>
				)}
				{chores.length > 0 && (
					<BasicList
						title="Current Chores: "
						items={chores}
						getKey={(chore) => chore._id}
						emptyMessage="No chores"
						className="dashboard-card"
						renderItem={(chore) => (
							<div>
								<p>{chore.title}</p>
							</div>
						)}
					/>
				)}
			</div>

			<div className="w-full max-w-7xl mt-8 pb-10 justify-self-center">
				<h2 className="header-secondary font-semibold p-5 text-center">
					{home}&#39;s Residents
				</h2>

				<Cards
					items={residents}
					getKey={(resident) => resident._id}
					getTitle={(resident) => resident.fullName}
					getDetails={(resident) => [
						{
							label: "Allergens",
							value: resident.allergens?.join
								? resident.allergens.join(", ")
								: resident.allergens || "",
						},
						{
							label: "Phone",
							value: resident.phoneNumber || "",
						},
						{
							label: "Pronouns",
							value: resident.pronouns || "",
						},
						{
							label: "Likes",
							value: resident.likes?.join(", ") || "",
						},
						{
							label: "Dislikes",
							value: resident.dislikes?.join(", ") || "",
						},
					]}
					emptyMessage="No residents found."
				/>
			</div>
		</div>
	);
}
