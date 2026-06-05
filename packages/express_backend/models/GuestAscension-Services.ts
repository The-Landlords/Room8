import mongoose from "mongoose";
import { GuestAscension } from "./GuestAscension.js";

export function createGuestAscension(data: any) {
	return GuestAscension.create(data);
}

export function getGuestAscensionById(id: mongoose.Types.ObjectId) {
	return GuestAscension.findById(id);
}

export function getGuestAscensionByGuest(
	guestId: mongoose.Types.ObjectId,
	homeId: mongoose.Types.ObjectId
) {
	return GuestAscension.findOne({
		guestId,
		homeId,
		status: "PENDING",
	});
}

export function getGuestAscensionsByHome(homeId: mongoose.Types.ObjectId) {
	return GuestAscension.find({
		homeId,
	});
}

export function updateGuestAscension(id: mongoose.Types.ObjectId, data: any) {
	return GuestAscension.findByIdAndUpdate(id, data, {
		returnDocument: "after",
		runValidators: true,
	});
}

export function removeGuestAscension(id: mongoose.Types.ObjectId) {
	return GuestAscension.findByIdAndDelete(id);
}
