import admin, { ServiceAccount } from "firebase-admin";
import { readFile } from "fs/promises";
import dotenv from "dotenv";
import express, { CookieOptions } from "express";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import { resolve } from "path";
import sql from "mssql/msnodesqlv8.js";

dotenv.config();
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

const sqlConfig: sql.config = {
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	server: process.env.DB_HOST || "localhost",
	database: process.env.DB_NAME,
	driver: "msnodesqlv8",
	options: {
		trustServerCertificate: true,
	},
};

await sql.connect(sqlConfig);

app.all("*", (req, res, next) => {
	res.cookie("XSRF-TOKEN", req.csrfToken());
	next();
});

app.get("/api/csrf", (req, res) => {
	res.sendStatus(200);
});

app.get("/", csrfMiddleware, (req, res) => {
	res.sendFile(resolve("../frontend/dist/index.html"));
});

app.post("/api/login", csrfMiddleware, (req, res) => {
	const idToken: string = req.body.idToken || "";

	admin
		.auth()
		.verifyIdToken(idToken)
		.then(
			async (decodedToken) => {
				const getUserRes = await sql.query(
					`SELECT (AdministratorAccess) FROM Users WHERE FirebaseUID = '${decodedToken.uid}'`
				);

				let adminAccess = false;

				if (getUserRes.recordset.length === 0) {
					const setUserRes = await sql.query(
						`INSERT INTO Users (FirebaseUID, Email) VALUES ('${decodedToken.uid}', '${decodedToken.email}')`
					);
					await addCasesToUser(decodedToken.uid, "Weapon Case", 1);
				} else {
					adminAccess = getUserRes.recordset[0].AdministratorAccess;
				}

				res.status(200).json(adminAccess);
				return;
			},
			(err) => {
				res.status(401).send("Unauthorized Request");
				return;
			}
		);
});

app.get("/api/getcase", csrfMiddleware, (req, res) => {
	const idToken = req.query.idToken;

	if (typeof idToken !== "string") {
		res.status(400).send("Bad Request, No ID Token");
		return;
	}

	admin
		.auth()
		.verifyIdToken(idToken)
		.then(async (decodedToken) => {
			await addCasesToUser(decodedToken.uid, "Weapon Case", 1);
			res.sendStatus(200);
			return;
		})
		.catch((err) => {
			res.status(401).send("Unauthorized Request");
			console.log(err);
			return;
		});
});

app.get("/api/inventory", csrfMiddleware, (req, res) => {
	const idToken = req.query.idToken;

	if (typeof idToken !== "string") {
		res.status(400).send("Bad Request, No ID Token");
		return;
	}

	admin
		.auth()
		.verifyIdToken(idToken)
		.then(async (decodedToken) => {
			let inventoryRes =
				await sql.query(`SELECT Cases.CaseName, SUM(InventoryDetails.Quantity) AS Quantity
			FROM Users
			INNER JOIN InventoryDetails
			ON Users.ID = InventoryDetails.UserID
			INNER JOIN Cases
			ON InventoryDetails.CaseID = Cases.ID
			WHERE Users.FirebaseUID = '${decodedToken.uid}'
			GROUP BY Cases.CaseName`);

			res.status(200).json(inventoryRes.recordset);
		})
		.catch((err) => {
			res.status(401).send("Unauthorized Request");
		});
});

app.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`);
});

async function addCasesToUser(
	firebaseUID: string,
	caseName: string,
	quantity: number
) {
	let userRes = await sql.query(
		`SELECT ID from Users WHERE FirebaseUID = '${firebaseUID}'`
	);

	if (userRes.recordset.length === 0) {
		console.log("User not found with uid: " + firebaseUID);
		return;
	}

	const userID = userRes.recordset[0].ID;

	console.log("User ID: " + userID);

	let caseRes = await sql.query(
		`SELECT ID FROM Cases WHERE CaseName = '${caseName}'`
	);

	if (caseRes.recordset.length === 0) {
		console.log("Case not found with name: " + caseName);
		return;
	}

	const caseID = caseRes.recordset[0].ID;

	console.log("Case ID: " + caseID);

	let inventoryRes = await sql.query(
		`INSERT INTO InventoryDetails VALUES (${userID}, ${caseID}, ${quantity})`
	);

	console.log(inventoryRes.rowsAffected);
}
