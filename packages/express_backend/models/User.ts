import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		pronouns: {
			type: String,
			trim: true,
		},
		DOB: {
			type: String,
			trim: true,
		},
		likes: [
			{
				type: String,
				trim: true,
			},
		],
		dislikes: [
			{
				type: String,
				trim: true,
			},
		],
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
			},

			relationship: {
				type: String,
				trim: true,
			},
		},

		homeIds: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "Relationship" },
		],
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
