// crud operations
import mongoose from "mongoose";

let dbConnection: mongoose.Connection | undefined;

function setConnection(newConn: mongoose.Connection): mongoose.Connection {
	dbConnection = newConn;
	return dbConnection;
}

function getDbConnection(): mongoose.Connection {
	if (!dbConnection) {
		const mongoUri = process.env.MONGODB_URI;
		if (!mongoUri) {
			throw new Error("MONGODB_URI environment variable is not set");
		}
		dbConnection = mongoose.createConnection(mongoUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
	}
	return dbConnection;
}

async function getEvents() {
	const eventModel = getDbConnection().model("");
}
