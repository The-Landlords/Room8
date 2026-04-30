import React, { FormEvent, useState } from "react";
import Overlay from "./overlay";

type AddOverlayProps = {
	isOpen: boolean;
	title: string;
	placeholder: string;
	onSubmit: (value: string) => void | Promise<void>;
	onClose: () => void;
	errorMsg?: string;
};

export default function AddOverlay({
	isOpen,
	title,
	placeholder,
	onSubmit,
	onClose,
	errorMsg,
}: AddOverlayProps) {
	const [value, setValue] = useState("");

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const trimmedValue = value.trim();

		if (!trimmedValue) return;

		await onSubmit(trimmedValue);
		setValue("");
		onClose();
	}

	function handleClose() {
		setValue("");
		onClose();
	}

	return (
		<Overlay isOpen={isOpen} onClose={handleClose}>
			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-2 animate-floatUp"
			>
				<button
					type="button"
					className="button self-start-safe w-15"
					onClick={handleClose}
				>
					←
				</button>

				<h1 className="header-secondary self-center">{title}</h1>

				<input
					type="text"
					placeholder={placeholder}
					className="input"
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>

				{errorMsg && (
					<p className="text-red-500 text-sm text-center mt-2">
						{errorMsg}
					</p>
				)}

				<button className="button self-center">Submit</button>
			</form>
		</Overlay>
	);
}
