/* 

PREREQUISITE:

1. Ensure that the drivers for the serial port are installed

2. Get the correct port name using `ls /dev/tty.* /dev/cu.*`

3. Use the port name in the path

 */

import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { WebSocketServer } from "ws";
import { DelimiterParser } from "@serialport/parser-delimiter";
import { parseData, DEFAULT_HEADERS, getLine } from "./parser.js";

let parsedData = {
	headers: DEFAULT_HEADERS,
	patientDetails: null,
	data: [],
};

const port = new SerialPort({
	baudRate: 9600,
	path: "/dev/tty.PL2303G-USBtoUART140",
});

// const parser = port.pipe(new DelimiterParser({ delimiter: "\r" }));
const parser = port.pipe(
	new ReadlineParser({ delimiter: "\r", encoding: "utf16le" })
);

// Set up WebSocket server
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
	console.log("Client connected");

	parser.on("data", (data) => {
		console.log(data);

		parseData(data, parsedData);

		ws.send(JSON.stringify(parsedData));
	});

	/* reset parsedData when client sends "reset" */
	/* ws.on("message", (message) => {
		if (message.toString() === "reset") {
			parsedData = {
				headers: DEFAULT_HEADERS,
				patientDetails: null,
				data: [],
			};
			console.log("parsedData has been reset");
			ws.send(JSON.stringify(parsedData));
		}
	}); */

	/* let currentIndex = 0;

	function getNextLine() {
		const line = getLine(currentIndex);
		currentIndex++;
		// ws.send(line);
		parseData(line, parsedData);
		ws.send(JSON.stringify(parsedData));
		setTimeout(getNextLine, 3000);
	}

	getNextLine(); */
	// parseData(nextLine, parsedData);
	// ws.send(nextLine);

	/* //FOR WHEN USING DELIMITER PARSER
	console.log("Raw bytes:", data.toString("hex"));

	// Ensure the buffer has an even number of bytes
	if (data.length % 2 !== 0) {
		console.warn("Received odd number of bytes. Padding with zero.");
		data = Buffer.concat([data, Buffer.from([0])]);
	}

	// Now it's safe to use swap16
	const swappedBuffer = Buffer.from(data).swap16();

	console.log("UTF-16LE:", swappedBuffer.toString("utf16le")); */
});

// Open the port and set up event listeners
port.on("open", () => {
	console.log("Serial Port Opened");
});

port.on("error", (err) => {
	console.error("Error:", err.message);
});

function decodeUnicodeString(str) {
	return str.replace(/\\u([0-9a-fA-F]{4})/g, (match, p1) =>
		String.fromCharCode(parseInt(p1, 16))
	);
}
