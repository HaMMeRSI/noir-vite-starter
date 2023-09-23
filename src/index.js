import { Noir } from "./noir";

const noir = await Noir();

const witness = await noir.generateWitness({ x: 1, y: 0 });
const proof = await noir.generateProof(witness);

const verification = await noir.verifyProof(proof);

console.log("verified", verification);
