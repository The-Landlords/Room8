export const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
	throw new Error("Missing VITE_API_URL");
}
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("API_BASE =", API_BASE);
