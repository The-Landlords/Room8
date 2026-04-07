// https://mongoosejs.com/docs/
import mongoose from "mongoose";

export const HomeSchema = new mongoose.Schema(
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

		// Many users can belong to one apartment
		userIds: [
			{
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
					unique: true,
				},
				relationship: {
					type: String,
					enum: ["RESIDENT", "GUEST"],
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

export const Home = mongoose.model("home", HomeSchema); // this gets put in mongo db compass
