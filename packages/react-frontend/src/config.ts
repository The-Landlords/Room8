export const API_BASE =
	window.location.hostname === "localhost" ||
	window.location.hostname === "127.0.0.1"
		? "http://localhost:8000"
		: "https://room8-bqgagjd0cndffae5.canadacentral-01.azurewebsites.net";
