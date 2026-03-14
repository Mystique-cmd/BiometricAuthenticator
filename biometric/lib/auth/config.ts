export function getRpConfig() {
  const rpId = process.env.RP_ID;
  const rpName = process.env.RP_NAME;
  const expectedOrigin = process.env.EXPECTED_ORIGIN;

  if (!rpId) throw new Error("RP_ID is required");
  if (!rpName) throw new Error("RP_NAME is required");
  if (!expectedOrigin) throw new Error("EXPECTED_ORIGIN is required");

  return { rpId, rpName, expectedOrigin };
}
