import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema(
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
			match: /^\+?[1-9]\d{1,14}$/,
		},
		pronouns: {
			type: String,
			trim: true,
		},
		DOB: {
			type: Date, // This should be changed to a date
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
				type: String,
				enum: ["off", "protanopia", "deuteranopia", "tritanopia"],
				default: "off",
			},

			scheduleVisibility: {
				type: String,
				enum: ["everyone", "roommates", "private"],
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
			{
				homeId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Home",
					required: true,
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

export const User = mongoose.model("User", UserSchema);
