// user-services.ts
import { User } from "./User";
import mongoose from "mongoose";

// CREATE
export function createUser(data: any) {
	return User.create(data);
}

// READ
export function getUserById(userId: mongoose.Types.ObjectId | string) {
	return User.findById(userId);
}

export function getUserByUsername(username: string) {
	return User.findOne({ username });
}
// this should be rewritten to get all home residents given a homeId
export function getUsersByHomeId(homeId: mongoose.Types.ObjectId | string) {
	return User.find({ homeIds: homeId });
}
// UPDATE
// commented out because redundant as we want all methods to use username
// export function updateUserById(
// 	userId: mongoose.Types.ObjectId | string,
// 	data: any
// ) {
// 	// { new: true } returns the updated doc
// 	return User.findByIdAndUpdate(userId, data, {
// 		returnDocument: "after",
// 		runValidators: true,
// 	});
// }

export function updateUserByUsername(username: string, data: any) {
	// { new: true } returns the updated doc
	return User.findOneAndUpdate({ username }, data, {
		returnDocument: "after",
		runValidators: true,
	});
}

// DELETE
export function removeUserById(userId: mongoose.Types.ObjectId | string) {
	return User.findByIdAndDelete(userId);
}
