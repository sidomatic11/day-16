/* L&T PLANET 55 Parser */

import fs from "fs";

// Predefined expected headers
const DEFAULT_HEADERS = [
	"Date",
	"Time",
	"HR",
	"PVC",
	"SpO2",
	"RR",
	"NBPs",
	"NBPd",
	"NBPm",
];

// Read the content of the file
const fileContent = fs.readFileSync("../static/output-v2.txt", "utf-8");

// Split the content into lines
const lines = fileContent.split("\n");

// Commented out code to print all lines
// lines.forEach((line, index) => {
// 	console.log(`Line ${index + 1}: ${line}`);
// });

function getLine(currentIndex) {
	return lines[currentIndex];
}

let receivingPatientDetails = false;

function parseData(line, data) {
	if (line === undefined) {
		return;
	}
	// Check if the line is a header line
	if (line.startsWith("Date")) {
		data.headers = line.split(/\s+/).filter(Boolean);
		return;
	}

	// Check if the line contains patient details
	if (line.includes("Patient Name:")) {
		receivingPatientDetails = true;
		// data.patientDetails = {};
	}

	if (receivingPatientDetails) {
		//If line is empty, set receivingPatientDetails to false
		if (line.trim() === "") {
			receivingPatientDetails = false;
		}
		parsePatientDetails(line, data);
		return;
	}

	// Parse data row
	parseDataRow(line, data);
}

function parsePatientDetails(line, data) {
	// Split the line on the first colon followed by any amount of whitespace
	const [key, ...valueParts] = line.split(/:\s*/);
	const value = valueParts.join(":").trim(); // Join the rest of the parts back together and trim

	if (key) {
		// Initialize patientDetails if it doesn't exist
		if (!data.patientDetails) {
			data.patientDetails = {};
		}
		data.patientDetails[key.trim()] = value; // Store the value even if it's empty
	}
}

function parseDataRow(line, data) {
	const row = line.split(/\s+/).filter(Boolean);
	if (row.length > 0) {
		const rowData = {};
		data.headers.forEach((header, index) => {
			if (index < row.length) {
				rowData[header] = row[index];
			}
		});
		data.data.push(rowData);
	}
}

// Export both the parseData function and the default headers
export { parseData, DEFAULT_HEADERS, getLine };
