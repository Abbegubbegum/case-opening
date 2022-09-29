import admin, { ServiceAccount } from "firebase-admin";
import { readFile } from "fs/promises";

import express from "express";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import { resolve } from "path";
import ejs from "ejs";

const serviceAccount: ServiceAccount = JSON.parse(
	await readFile(new URL("serviceAccountKey.json", import.meta.url), {
		encoding: "utf8",
	})
);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT || 8080;

const csrfMiddleware = csrf({ cookie: true });

app.use("/main", express.static(resolve("../frontend/dist")));

app.use(express.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.all("*", (req, res, next) => {
	res.cookie("XSRF-TOKEN", req.csrfToken());
	console.log("fdsafsda");
	next();
});

app.get("/", csrfMiddleware, (req, res) => {
	res.sendFile(resolve("../frontend/dist/index.html"));
});

app.get("/api/", csrfMiddleware, (req, res) => {
	res.render("index.html");
	res.status(200).send("Yes");
});

app.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`);
});
