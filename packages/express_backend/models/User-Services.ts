import { User } from "./User";

function createUser(data: any) {
	return User.create(data);
}

// // this should be rewritten to get all home residents given a homeId

// function getUsersByHomeId(homeId: string) {
// 	return User.find( { "homeIds._id": homeId } );
// }

/**
 * @param userId given a userId from mongodb
 * @returns return all info about a user
 */
function getUserById(userId: string) {
	return User.findById(userId);
}
