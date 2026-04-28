/*
	Component wraps another component and turns it into an overlay (makes the background unclickable and adds a backdrop)
*/

import React, { type ReactNode } from "react";

interface OverlayProps {
	children: ReactNode;
	isOpen: boolean;
	onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ children, isOpen, onClose }) => {
	if (!isOpen) return null;

	return (
		<div className="overlay-backdrop animate-floatUp" onMouseDown={onClose}>
			<div
				className="overlay-content"
				onMouseDown={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
};
export default Overlay;
