//import React,{ useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserSetting() {
	const navigate = useNavigate();
	return (
		<div className="min-h-screen w-full bg-blue-900 flex flex-col">
			{/* HEADER */}
			<header className="w-full py-6">
				<h1 className="text-center text-4xl font-bold text-white">
					User Settings
				</h1>
			</header>

			{/* TOP BAR */}
			<div className="w-full flex justify-center px-6">
				<div className="w-full max-w-6xl flex items-center gap-6">
					{/* left controls */}
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => navigate("/")} // change to "/home" if that's your route
							className="bg-white/90 h-10 w-10 flex items-center justify-center font-bold hover:bg-purple-600"
						>
							←
						</button>
						<div className="bg-white/90 h-10 px-6 flex items-center justify-center font-semibold">
							Profile
						</div>
					</div>

					{/* center welcome */}
					<div className="flex-1 bg-white/90 h-10 flex items-center justify-center font-semibold">
						Welcome Barry
					</div>

					{/* right spacer (figma has empty space) */}
					<div className="w-[140px]" />
				</div>
			</div>

			{/* MAIN GRID */}
			<main className="flex-1 flex justify-center px-6 py-10">
				<div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-10">
					{/* LEFT COLUMN */}
					<div className="bg-white/90 p-4">
						<div className="bg-black/10 text-center font-bold py-2 mb-4">
							Personal Info
						</div>

						{/*detail on personal*/}
						<div className="space-y-3">
							<div className="bg-white p-3">
								Name: Barry Benson
							</div>
							<div className="bg-white p-3">Pronouns: He/Him</div>
							<div className="bg-white p-3">DOB: 01/01/2001</div>
							<div className="bg-white p-3">
								Allergies: Peanuts
							</div>
							<div className="bg-white p-3">Likes: Burgers</div>
							<div className="bg-white p-3">
								Dislikes: Loud music
							</div>
						</div>
					</div>

					{/* MIDDLE COLUMN */}
					<div className="flex flex-col gap-6">
						<div className="bg-white/90 p-4">
							<div className="bg-black/10 text-center font-bold py-2 mb-4">
								Display Settings
							</div>

							<div className="bg-white p-4 mb-4">
								<div className="font-semibold mb-2">
									Text Size:
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between"></div>
									<div className="flex items-center justify-between"></div>
									<div className="flex items-center justify-between"></div>
								</div>
							</div>

							<div className="bg-white p-4 mb-4">
								<div className="font-semibold mb-2">Theme:</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between"></div>
									<div className="flex items-center justify-between"></div>
								</div>
							</div>

							<div className="bg-white p-4">
								<div className="font-semibold mb-2">
									Color-blind Mode:
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between"></div>
									<div className="flex items-center justify-between"></div>
								</div>
							</div>
						</div>
					</div>

					{/* RIGHT COLUMN */}
					<div className="flex flex-col gap-10">
						<div className="bg-white/90 p-4">
							<div className="bg-black/10 text-center font-bold py-2 mb-4">
								Emergency Info
							</div>

							<div className="space-y-4">
								<div className="bg-white p-3">
									Phone: (111) 111-1111
								</div>
								<div className="bg-white p-3">
									Emergency: Mom (222) 222-2222
								</div>
							</div>
						</div>

						<div className="bg-white/90 p-4">
							<div className="bg-black/10 text-center font-bold py-2 mb-4">
								Who can see <br /> my schedule?
							</div>

							<div className="space-y-3">
								<div className="bg-white p-3 flex items-center justify-between"></div>

								<div className="bg-white p-3 flex items-center justify-between"></div>

								<div className="bg-white p-3 flex items-center justify-between"></div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
