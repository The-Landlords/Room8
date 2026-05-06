export const API_BASE = (
	import.meta.env.VITE_API_URL ||
	"https://room8-bqgagjd0cndffae5.canadacentral-01.azurewebsites.net"
).replace(/\/$/, "");

if (!API_BASE) {
	throw new Error("Missing API base URL");
}
