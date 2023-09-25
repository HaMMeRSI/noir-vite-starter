import { Noir } from "./noir";

const xInput = document.getElementById("x");
const yInput = document.getElementById("y");
const form = document.getElementById("form");
const results = document.getElementById("results");

form.onsubmit = async (e) => {
	e.preventDefault();
	const [x, y] = [xInput?.valueAsNumber, yInput?.valueAsNumber];
	if (x >= 0 && y >= 0) {
		try {
			const noir = await Noir();

			results.innerText = "Generating Witness...";
			const witness = await noir.generateWitness({ x, y }).catch((e) => {
				throw new Error("Failed Generating Witness: " + e.message);
			});

			results.innerText = "Generating Proof...";
			const proof = await noir.generateProof(witness).catch((e) => {
				throw new Error("Failed Generating Proof: " + e.message);
			});

			results.innerText = "Verifying Proof...";
			const verification = await noir.verifyProof(proof).catch((e) => {
				throw new Error("Failed Verifying Proof: " + e.message);
			});

			results.innerText = verification ? "Verified" : "Failed";
		} catch (e) {
			results.innerText = e.message;
		}
	} else {
		results.innerText = "Invalid Input";
	}
};
