import React from "react";
import { useState, useRef, useEffect } from "react";
import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import { Map, View } from "ol";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import { defaults as defaultControls } from "ol/control";
import Zoom from "ol/control/Zoom";

/*Component is a form field to create a new home object */
type CreateHomeProps = {
	onBack: (data: string) => void;
};

export default function CreateHomeOverlay({ onBack }: CreateHomeProps) {
	const mapDivRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<Map | null>(null);
	const sourceRef = useRef<VectorSource | null>(null);
	const toolbarRef = useRef<HTMLDivElement | null>(null);
	const [street, setStreet] = useState("");
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [postalCode, setPostalCode] = useState("");
	const [loading, setLoading] = useState(true);
	const [errorMsg, setErrorMsg] = useState("");
	const [coords, setCoords] = useState<{ lon: number; lat: number }>({
		lon: 0,
		lat: 0,
	});
	useEffect(() => {
		setLoading(true);
		if (!street || !city || !state || !postalCode) {
			return;
		}
		const geocodeAddress = async () => {
			const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
				`${street}, ${city}, ${state}, ${postalCode}`
			)}`;
			try {
				const response = await fetch(url);
				const data = await response.json();

				if (data && data.length > 0) {
					const { lat, lon } = data[0];
					setCoords({ lon: parseFloat(lon), lat: parseFloat(lat) });
				}
				setLoading(false);
			} catch (error) {
				console.error("Failed to geocode address:", error);
				setErrorMsg("Invalid Address");
				setLoading(false);
			}
		};

		geocodeAddress();
	}, [street, city, state, postalCode]);

	//creates the inital map and gets user location, also sets up cleanup on unmount
	useEffect(() => {
		if (!mapDivRef.current || !toolbarRef.current || mapRef.current) return;

		const target = toolbarRef.current;

		target.innerHTML = "";
		const source = new VectorSource();
		sourceRef.current = source;

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setCoords({
					lon: position.coords.longitude,
					lat: position.coords.latitude,
				});
				console.log("Position obtained:", position.coords);
			},
			(error) => {
				console.error("Error getting position:", error);
			}
		);

		const map = new Map({
			target: mapDivRef.current,
			controls: defaultControls({
				zoom: false,
				attribution: false,
				rotate: false,
			}),
			layers: [
				new TileLayer({ source: new OSM() }),
				new VectorLayer({ source }),
			],
			view: new View({
				center: fromLonLat([coords.lon, coords.lat]),
				zoom: 2,
			}),
		});

		const zoomControl = new Zoom({ target });
		map.addControl(zoomControl);
		mapRef.current = map;

		return () => {
			map.removeControl(zoomControl);
			map.setTarget(undefined);
			mapRef.current = null;
			sourceRef.current = null;

			target.innerHTML = "";
		};
	}, []);

	//zooms in to current coords when they change and updates map
	useEffect(() => {
		const map = mapRef.current;
		const source = sourceRef.current;
		if (!map || !source) return;
		if (coords.lon === 0 && coords.lat === 0) return;

		map.getView().animate({
			center: fromLonLat([coords.lon, coords.lat]),
			zoom: 16,
			duration: 500,
		});

		source.clear();
		const feature = new Feature({
			geometry: new Point(fromLonLat([coords.lon, coords.lat])),
		});

		const markerStyle = new Style({
			text: new Text({
				text: "\uf3c5",
				font: '900 30px "Font Awesome 5 Free"',
				fill: new Fill({ color: "#b5a398" }),
				stroke: new Stroke({ color: "#584945", width: 2 }),
				textBaseline: "bottom",
			}),
		});

		feature.setStyle(markerStyle);

		source.addFeature(feature);

		setLoading(false);
	}, [coords]);

	return (
		<div className="flex flex-col relative  max-h-150 overflow-auto gap-1 animate-floatUp">
			<button
				className="button self-start-safe w-15 "
				onClick={() => onBack("Base")}
			>
				←
			</button>
			<h1 className="header-secondary self-center bg-primary/70 rounded-lg shadow-md">
				Create Home
			</h1>
			<h2 className="header-thirdary">Home Name : </h2>
			<input type="text" placeholder="Home Name" className="input" />
			<h2 className="header-thirdary">Home Address : </h2>
			<div className="flex flex-row gap-1">
				<input
					type="text"
					placeholder="Street"
					className="input"
					onChange={(e) => setStreet(e.target.value)}
				/>
				<input
					type="text"
					placeholder="City"
					className="input"
					onChange={(e) => setCity(e.target.value)}
				/>
				<input
					type="text"
					placeholder="State"
					className="input"
					onChange={(e) => setState(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Postal Code"
					className="input"
					onChange={(e) => setPostalCode(e.target.value)}
				/>
			</div>

			{errorMsg && (
				<p className="text-red-500 text-sm text-center mt-2">
					{errorMsg}
				</p>
			)}
			<div className="bg-primary/70 rounded-lg shadow-md h-80 max-h-100 min-w-80 max-w-100 flex flex-col self-center-safe">
				<div
					ref={mapDivRef}
					className="h-10/12 w-10/12 self-center-safe relative top-3"
				/>
				<div ref={toolbarRef} className="self-center header-thirdary" />
			</div>
			<button className="button self-center">Create Home</button>
		</div>
	);
}
