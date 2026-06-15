//import env from "./env";
const DEVELOPMENT_BASE_URL = "https://paydar.scentworld.net/public/api/";

// const PRODUCTION_BASE_URL = "https://baydar-iq.com/back/public/api/";
const PRODUCTION_BASE_URL = "https://paydar.scentworld.net/public/api/";
// ("https://baydar-iq.com/public/api/");

const DEVELOPMENT_API_BASE_URL = `${DEVELOPMENT_BASE_URL}`;
const PRODUCTION_API_BASE_URL = `${PRODUCTION_BASE_URL}`;

export const SERVER_BASE_URL =
  import.meta.env.MODE === "production" ? PRODUCTION_BASE_URL : DEVELOPMENT_BASE_URL;

export const API_BASE_URL =
  import.meta.env.MODE === "production" ? PRODUCTION_API_BASE_URL : DEVELOPMENT_API_BASE_URL;
