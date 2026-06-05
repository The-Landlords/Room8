import mongoose from "mongoose";

export const GuestAscensionSchema = new mongoose.Schema(
	{
		homeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "home",
			required: true,
		},

		guestId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		votes: [
			{
				voteId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},

				vote: {
					type: String,
					enum: ["YES", "NO"],
					required: true,
				},
			},
		],

		status: {
			type: String,
			enum: ["PENDING", "APPROVED", "REJECTED"],
			default: "PENDING",
		},
	},
	{
		timestamps: true,
	}
);

export const GuestAscension = mongoose.model(
	"GuestAscension",
	GuestAscensionSchema
);
