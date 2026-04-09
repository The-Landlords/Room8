//import { useParams } from "react-router-dom";

export default function ChorePage() {
	//const { homeId = "" } = useParams();

	return (
		<div className="">
			{/* TOP BAR */}
			<header className="  w-full flex justify-center header mb-4">
				Chores
			</header>
			<div className=" panel flex flex-col items-center animate-floatUp min-w-[380px] bg-primary/70">
				<h2 className="font-primary text-text text-3xl text-center mb-6">
					Current Chores
				</h2>

				{/* LIST OF CURRENT CHORES */}
				<div className="bg-"></div>

				{/* BOTTOM CONTROLS */}
				<div className="columns-2 gap-50">
					<div className="button">+</div>
					<div className="button">-</div>
				</div>
			</div>
		</div>
	);
}
