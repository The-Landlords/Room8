// https://mongoosejs.com/docs/
import mongoose from "mongoose";

const ApartmentSchema = new mongoose.Schema(
	{
		apartment_name: {
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
		memberIds: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
	},
	{ timestamps: true }
);

export const Apartment = mongoose.model("apartment", ApartmentSchema); // this gets put in mongo db compass
