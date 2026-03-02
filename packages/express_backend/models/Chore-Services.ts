import { Chore } from "./Chore";

export function getChoresByHome(homeId: string) {
	return Chore.find({ homeId: homeId });
}

export function getChoreById(choreId: string) {
	return Chore.findById(choreId);
}

export function createChore(data: any) {
	return Chore.create(data);
}

export function removeChoreById(choreId: string) {
	return Chore.findByIdAndDelete({ _id: choreId });
}

export function updateChore(choreId: string, data: any) {
	return Chore.findByIdAndUpdate(choreId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}
