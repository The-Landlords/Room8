// https://mongoosejs.com/docs/
import mongoose from "mongoose";

const HomeSchema = new mongoose.Schema(
	{
		homeCode: {
			type: String,
			required: true,
			trim: true,
		},
		homeName: {
			type: String,
			required: true,
			trim: true, // eliminates whitespaces
		},
		address: {
			type: String,
			required: true,
			trim: true, // eliminates whitespaces
		},
		// ADD? rent, bedrooms, square footage
	},
	{ timestamps: true }
);

export const Home = mongoose.model("home", HomeSchema); // this gets put in mongo db compass
