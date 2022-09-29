import admin, { ServiceAccount } from "firebase-admin";
import { readFile } from "fs/promises";

import express, { CookieOptions } from "express";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import { resolve } from "path";

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

const csrfMiddleware = csrf({ cookie: { sameSite: true } });

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

app.post("/api/login", csrfMiddleware, (req, res) => {
	const idToken: string = req.body.idToken.toString();

	const expiresIn = 60 * 60 * 24 * 7 * 1000;

	admin
		.auth()
		.createSessionCookie(idToken, { expiresIn: expiresIn })
		.then(
			(cookie) => {
				const options: CookieOptions = {
					maxAge: expiresIn,
					httpOnly: true,
				};
				res.cookie("session", cookie, options);
				res.sendStatus(200);
			},
			(err) => {
				res.status(401).send("Unauthorized Request");
			}
		);
});

app.get("/api/logout", csrfMiddleware, (req, res) => {
	res.clearCookie("session");
	res.sendStatus(200);
});

app.get("/api/inventory", csrfMiddleware, (req, res) => {
	const sessionCookie = req.cookies.session || "";

	admin.auth().verifySessionCookie(sessionCookie, true);
});

app.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`);
});
