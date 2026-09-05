// Gera um certificado autoassinado (gratuito) pra assinar eletronicamente
// os PDFs de certificado emitidos pela plataforma. Não é ICP-Brasil — é
// uma assinatura eletrônica "avançada" (Lei 14.063/2020), válida
// juridicamente por acordo/uso, mas sem a presunção legal automática nem
// o selo de confiança nativo do Adobe Reader que um e-CNPJ ICP-Brasil
// teria (ver conversa/pesquisa que embasou essa escolha).
//
// Rode uma vez com `node scripts/gerar-certificado-assinatura.mjs` e
// cadastre a saída como variáveis de ambiente (Vercel/​.env.local):
//   SIGNING_CERT_P12_BASE64  — o certificado (.pfx) em base64
//   SIGNING_CERT_PASSWORD    — a senha que protege o .pfx
// NUNCA commite a saída deste script no git.

import forge from "node-forge";
import { randomBytes } from "node:crypto";

const CN = "Revollution Ideas Brand";
const ORG = "Revollution Ideas Brand";
const ANOS_VALIDADE = 15;

const keys = forge.pki.rsa.generateKeyPair(2048);

const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = randomBytes(8).toString("hex");
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + ANOS_VALIDADE);

const attrs = [
  { name: "commonName", value: CN },
  { name: "organizationName", value: ORG },
  { name: "countryName", value: "BR" },
];
cert.setSubject(attrs);
cert.setIssuer(attrs); // self-signed: issuer = subject

cert.setExtensions([
  { name: "basicConstraints", cA: false },
  { name: "keyUsage", digitalSignature: true, nonRepudiation: true, keyEncipherment: false, dataEncipherment: false },
  { name: "extKeyUsage", emailProtection: true, "1.2.840.113583.1.1.10": true }, // Adobe PDF signing OID
]);

cert.sign(keys.privateKey, forge.md.sha256.create());

const senha = randomBytes(24).toString("base64url");
const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], senha, {
  algorithm: "3des",
});
const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
const p12Base64 = forge.util.encode64(p12Der);

console.log("=== SIGNING_CERT_P12_BASE64 ===");
console.log(p12Base64);
console.log("\n=== SIGNING_CERT_PASSWORD ===");
console.log(senha);
console.log("\n=== Certificado PEM (referência, não é segredo) ===");
console.log(forge.pki.certificateToPem(cert));
