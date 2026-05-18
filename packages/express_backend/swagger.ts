import swaggerAutogen from "swagger-autogen";

const doc = {
	info: {
		title: "Room8 API",
		description: "API documentation",
	},
	host: "localhost:8000",
	schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./backend.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
