import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
		},
		phone: {
			type: String,
		},
		allergens: [
			{
				type: String,
				trim: true,
			},
		],

		settings: {
			textSize: {
				type: String,
				default: "medium",
			},
			theme: {
				type: String,
				default: "light",
			},
			colorBlindMode: {
				type: Boolean,
				default: false,
			},
			scheduleVisibility: {
				type: String,
				default: "roommates",
			},
		},

		emergencyContact: {
			name: {
				type: String,
				trim: true,
			},

			phone: {
				type: String,
				trim: true,
				required: true,
			},

			relationship: {
				type: String,
				trim: true,
			},
		},

		apartmentIds: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "Apartment" },
		],
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
