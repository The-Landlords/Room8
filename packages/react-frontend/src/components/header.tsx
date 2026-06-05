import { API_BASE } from "../config";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
	homeCode?: string;
	title?: string;
}

export default function Header({ homeCode, title }: HeaderProps) {
	const [homeName, setHomeName] = useState("");
	const navigate = useNavigate();

	async function fetchHomeName() {
		if (!homeCode) return;

		fetch(`${API_BASE}/homes/code/${homeCode}`, {
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok)
					throw new Error("Home not found for code: " + homeCode);
				return res.json();
			})
			.then((data) => setHomeName(data.homeName))
			.catch((err) => {
				console.error(err);
				setHomeName("");
			});
	}
	useEffect(() => {
		fetchHomeName().catch(console.error);
	}, [homeCode]);

	return (
		<header className="header-wrapper">
			<button
				type="button"
				onClick={() => navigate(-1)}
				className="button absolute left-6 top-8"
			>
				← Back
			</button>
			<h1 className="header text-center px-20">
				{homeName}&#39;s {title}
			</h1>
		</header>
	);
}
