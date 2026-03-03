import React, { type ReactNode } from "react";

interface OverlayProps {
	children: ReactNode;
	isOpen: boolean;
	onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ children, isOpen, onClose }) => {
	if (!isOpen) return null;

	return (
		<div className="overlay-backdrop" onClick={onClose}>
			<div
				className="overlay-content"
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
};
export default Overlay;
