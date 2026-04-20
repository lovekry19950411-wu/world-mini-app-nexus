export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  worldAppId: process.env.VITE_WORLD_APP_ID ?? "",
  worldRpId: process.env.VITE_WORLD_RP_ID ?? "",
  rpSigningKey: process.env.RP_SIGNING_KEY ?? "",
  rpPublicKey: process.env.RP_PUBLIC_KEY ?? "",
};
