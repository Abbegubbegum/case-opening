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
				@click="signInUser"
				class="login-btn"
			>
				Login
			</button>
			<div class="inventory-container" v-if="authed"></div>
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

export default defineComponent({
	name: "HomeView",
	data() {
		return {
			authed: false,
		};
	},
	methods: {
		signInUser() {
			signInWithPopup(getAuth(), new GoogleAuthProvider())
				.then(async (data) => {
					const user = getAuth().currentUser;
					if (user) {
						this.authed = true;
						let idToken = await user.getIdToken();
						await fetch("/api/login", {
							method: "POST",
							headers: {
								Accept: "application/json",
								"Content-Type": "application/json",
								"CSRF-Token": this.$cookies.get("XSRF-TOKEN"),
							},
							body: JSON.stringify({ idToken }),
						});
						await signOut(getAuth());
					}
				})
				.catch((err) => {
					console.log("Error Signing in with Google " + err);
				});
		},
		signOutUser() {
			fetch("/api/logout").then((res) => {
				this.authed = false;
			});
		},
	},
	components: { CaseCanvas },
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
</style>
