// https://mongoosejs.com/docs/
import mongoose from "mongoose";

const EncryptedFieldSchema = new mongoose.Schema(
	{
		encryptedData: {
			type: String,
			required: true,
		},
		iv: {
			type: String,
			required: true,
		},
		authTag: {
			type: String,
			required: true,
		},
	},
	{ _id: false }
);

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
			type: EncryptedFieldSchema,
			required: true,
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
