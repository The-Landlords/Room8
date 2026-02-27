import { Home } from "./Home";

export function createHome(data: any) {
	return Home.create(data);
}
export function getHomeById(homeId: string) {
	return Home.findById(homeId);
}
export function updateHome(homeId: string, data: any) {
	return Home.findByIdAndUpdate(homeId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}
export function deleteHome(homeId: string) {
	return Home.findByIdAndDelete({ _id: homeId });
}

export function addMember(user: string) {
	//FIXME this will be changed to user Schema, users should store Home id's
}
export function removeMember(user: string) {
	//FIXME this will be changed to user Schema, users should store Home id's
}
