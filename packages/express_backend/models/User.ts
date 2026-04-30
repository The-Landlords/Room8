import mongoose from "mongoose";
// import { match } from "node:assert";

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
			/*
			^ → start of the string
			\+? → optional + at the beginning
			[1-9] → first digit must be 1–9 (no leading 0)
			\d{1,14} → followed by 1 to 14 digits
			$ → end of the string
			EX:
			+0123456789   ❌ starts with 0
			+1            ❌ too short
			+1234567890123456 ❌ too long (>15 digits)
			123-456-7890 ❌ contains dashes
			*/
		},
		pronouns: {
			type: String,
			trim: true,
		},
		DOB: {
			type: Date,
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
				match: /^\+?[1-9]\d{1,14}$/,

				/*
				^ → start of the string
				\+? → optional + at the beginning
				[1-9] → first digit must be 1–9 (no leading 0)
				\d{1,14} → followed by 1 to 14 digits
				$ → end of the string
				EX:
				+0123456789   ❌ starts with 0
				+1            ❌ too short
				+1234567890123456 ❌ too long (>15 digits)
				123-456-7890 ❌ contains dashes
				*/
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
					unique: true,
				},
				relationship: {
					type: String,
					enum: ["RESIDENT", "GUEST"],
				},
			},
		],
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
