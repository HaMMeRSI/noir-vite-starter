import { decompressSync } from "fflate";
import { Buffer } from "buffer";

import circuit from "../circuits/target/main.json";
import acvmJsBgWasmInput from "@noir-lang/acvm_js/web/acvm_js_bg.wasm?url";

export async function Noir() {
	const { Barretenberg, RawBuffer, Crs } = await import("@aztec/bb.js");
	const {
		default: initACVM,
		executeCircuit,
		compressWitness,
	} = await import("@noir-lang/acvm_js");

	const acirBuffer = Buffer.from(circuit.bytecode, "base64");
	const acirBufferUncompressed = decompressSync(acirBuffer);
	const api = await Barretenberg.new(4);

	await initACVM(acvmJsBgWasmInput);

	const [, total] = await api.acirGetCircuitSizes(acirBufferUncompressed);
	const subgroupSize = Math.pow(2, Math.ceil(Math.log2(total)));
	const acirComposer = await api.acirNewAcirComposer(subgroupSize);

	const crs = await Crs.new(subgroupSize + 1);
	await api.commonInitSlabAllocator(subgroupSize);
	await api.srsInitSrs(
		new RawBuffer(crs.getG1Data()),
		crs.numPoints,
		new RawBuffer(crs.getG2Data())
	);

	async function generateWitness(input) {
		const initialWitness = new Map();

		initialWitness.set(1, `0x${input.x.toString(16).padStart(64, "0")}`);
		initialWitness.set(2, `0x${input.y.toString(16).padStart(64, "0")}`);

		const witnessMap = await executeCircuit(acirBuffer, initialWitness, () => {
			throw Error("unexpected oracle");
		});

		const witnessBuff = compressWitness(witnessMap);
		console.log("witnessBuff: ", witnessBuff);
		return witnessBuff;
	}

	async function generateProof(witness) {
		const proof = await api.acirCreateProof(
			acirComposer,
			acirBufferUncompressed,
			decompressSync(witness),
			false
		);
		console.log("proof: ", proof);
		return proof;
	}

	async function verifyProof(proof) {
		await api.acirInitProvingKey(acirComposer, acirBufferUncompressed);
		const verified = await api.acirVerifyProof(acirComposer, proof, false);
		return verified;
	}

	async function destroy() {
		await api.destroy();
	}

	return {
		generateWitness,
		generateProof,
		verifyProof,
		destroy,
	};
}
