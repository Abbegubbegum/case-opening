<template>
	<div class="content">
		<CaseCanvas />
		<div class="website-content">
			<header>
				<h1>Case Openings</h1>
				<button
					type="button"
					class="logout-btn"
					v-if="authed"
					@click="signOutUser"
				>
					Sign out
				</button>
			</header>
			<button
				type="button"
				v-if="!authed"
				@click="googleSignIn"
				class="login-btn"
			>
				Login
			</button>
			<div class="inventory-container" v-if="authed">
				<div
					class="inventory-item"
					@click="selectCase(weaponCase)"
					v-for="weaponCase in inventory"
				>
					<span class="inventory-count">{{
						weaponCase.Quantity
					}}</span>
					<img
						class="inventory-img"
						:src="'img/' + weaponCase.ImagePath"
						alt="CSGO Case Icon"
					/>
					{{ weaponCase.CaseName }}
				</div>
			</div>
			<CasePopup
				:show="showPopup"
				@close="closePopup"
				:weapon-case="selectedItem"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CaseCanvas from "@/components/CaseCanvas.vue";
import {
	signInWithPopup,
	getAuth,
	GoogleAuthProvider,
	signOut,
} from "firebase/auth";
import CasePopup from "@/components/CasePopup.vue";

export default defineComponent({
	name: "HomeView",
	data() {
		return {
			authed: false,
			admin: false,
			inventory: [] as any,
			showPopup: false,
			selectedItem: {},
		};
	},
	methods: {
		closePopup() {
			this.getInventory();
			this.showPopup = false;
		},
		async loginUserWithBackend() {
			const user = getAuth().currentUser;
			if (user) {
				const idToken = await user.getIdToken();
				const res = await fetch("/api/login", {
					method: "POST",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
						"CSRF-Token": this.$cookies.get("XSRF-TOKEN"),
					},
					body: JSON.stringify({
						idToken,
					}),
				});

				if (res.ok) {
					const adminAccess = await res.json();
					await this.getInventory();
					this.authed = true;
					this.admin = adminAccess;
				} else if (res.status === 401) {
					this.authed = false;
					this.admin = false;
				}
			} else {
				this.authed = false;
				this.admin = false;
			}
		},
		googleSignIn() {
			signInWithPopup(getAuth(), new GoogleAuthProvider())
				.then(async (data) => {
					await this.loginUserWithBackend();
				})
				.catch((err) => {
					console.log("Error Signing in with Google " + err);
				});
		},
		signOutUser() {
			signOut(getAuth()).then(() => {
				this.authed = false;
			});
		},
		async getInventory() {
			let idToken = (await getAuth().currentUser?.getIdToken()) || "";
			fetch(
				"/api/inventory?" +
					new URLSearchParams({
						idToken,
					})
			)
				.then(async (res) => {
					if (res.ok) {
						this.inventory = await res.json();
						console.log(this.inventory);
						(
							this.$refs.inventoryItem as unknown as any
						).updateValues();
					} else {
						console.log(res);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		},
		selectCase(item: any) {
			this.showPopup = true;
			this.selectedItem = item;
			console.log(this.selectedItem);
		},
	},
	mounted() {
		fetch("/api/csrf");

		this.loginUserWithBackend();
	},
	components: { CaseCanvas, CasePopup },
});
</script>

<style scoped>
.content {
	height: 100%;
}
.website-content {
	width: 100%;
	min-height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

header {
	display: flex;
	align-items: center;
}

h1 {
	text-transform: uppercase;
	letter-spacing: 0.5rem;
	font-size: 3rem;
	font-weight: bold;
}

.logout-btn {
	font-family: "Kanit", sans-serif;
	position: absolute;
	padding: 0;
	margin: 0;
	top: 0.5rem;
	right: 1rem;
	font-size: 2rem;
	color: white;
	border: none;
	text-transform: uppercase;
}

.logout-btn:hover {
	color: lightgray;
}

.login-btn {
	margin-top: auto;
	margin-bottom: auto;
	background-color: whitesmoke;
	font-size: 2rem;
	font-weight: 600;
	padding: 1rem 2rem;
	border-radius: 20px;
}

.login-btn:hover {
	background-color: lightgray;
	cursor: pointer;
}

.inventory-container {
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
	border: 3px solid #350000;
	background-color: #0b0b0b;
	margin-top: auto;
	margin-bottom: 1rem;
	width: 60vw;
	height: 40vh;
	box-shadow: 0 0 10px black;
	border-radius: 15px;
}

.inventory-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	background-color: #282a2c;
	box-shadow: 0 0 5px rgb(96, 109, 121);
	border-radius: 5px;
	margin: 0.4rem;
	width: 8rem;
}

.inventory-item:hover {
	background-color: #343638;
	cursor: pointer;
}

.inventory-item:active {
	background-color: #222425;
}

.inventory-count {
	margin-bottom: auto;
	margin-right: auto;
	margin-left: 0.5rem;
}

.inventory-img {
	width: 80%;
}
</style>
