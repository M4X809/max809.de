import { Slider } from "@mantine/core";
import React, { useState } from "react";

const Test = () => {
	const [length, setLength] = useState(0);
	const [type, setType] = useState<
		| "pin"
		| "text"
		| "number"
		| "email"
		| "url"
		| "password"
		| "date"
		| "time"
		| "datetime"
		| "color"
		| "file"
		| "image"
		| "select"
		| "multiselect"
		| "checkbox"
		| "radio"
		| "switch"
		| "range"
		| "slider"
		| "map"
		| "frame"
		| "link"
	>("pin");

	return (
		<>
			<Slider
				hidden={type !== "pin"}
				value={length}
				onChange={setLength}
				min={type === "checkbox" ? 4 : 10}
				max={type === "pin" ? 4 : 100}
			/>
		</>
	);
};

export default Test;
