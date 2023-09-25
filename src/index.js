import { Noir } from "./noir";

const xInput = document.getElementById("x");
const yInput = document.getElementById("y");
const form = document.getElementById("form");
const results = document.getElementById("results");

form.onsubmit = async (e) => {
	e.preventDefault();
	const [x, y] = [xInput?.valueAsNumber, yInput?.valueAsNumber];

	if (x >= 0 && y >= 0) {
		const noir = await Noir();

		results.innerText = "Generating Witness...";
		const witness = await noir.generateWitness({ x, y });

		results.innerText = "Generating Proof...";
		const proof = await noir.generateProof(witness).catch((e) => {
			results.innerText = "Failed Generating Proof: " + e.message;
		});

		results.innerText = "Verifying Proof...";
		const verification = await noir.verifyProof(proof).catch((e) => {
			results.innerText = "Failed Verifying Proof: " + e.message;
		});

		results.innerText = verification ? "Verified" : "Failed";
		console.log("verified", verification);
	} else {
		results.innerText = "Invalid Input";
	}
};
