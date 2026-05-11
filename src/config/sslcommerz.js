import SSLCommerzPayment from "sslcommerz-lts";
import dotenv from "dotenv";

dotenv.config();

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.IS_LIVE === "true";

export const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
