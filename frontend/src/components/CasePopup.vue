<template>
	<Transition name="modal">
		<div v-if="show" class="modal-mask">
			<div class="modal-wrapper">
				<div class="question-popup" :class="{ hide: confirmed }">
					<h1>Open {{ caseName }}?</h1>
					<img :src="'img/' + imagePath" alt="CSGO Case Icon" />
					<div class="button-group">
						<button
							type="button"
							class="accept-btn"
							@click="confirm"
						>
							YES
						</button>
						<button
							type="button"
							class="close-btn"
							@click="closePopup"
						>
							NO
						</button>
					</div>
				</div>
			</div>
			<div class="items" :class="{ hideItems: !confirmed }">
				<div
					v-for="(item, index) in items"
					class="item-box"
					:class="[
						'rarity' + item.Rarity,
						{
							selected: index === items.length - 2,
							hidden: !confirmed,
						},
					]"
				>
					<img
						:src="'img/' + item.ImagePath"
						alt="Item Picture"
						class="item-picture"
					/>
					<h2>{{ item.ItemName }}</h2>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import { getAuth } from "@firebase/auth";
import { defineComponent } from "vue";

export default defineComponent({
	data() {
		return {
			caseName: this.weaponCase.CaseName,
			imagePath: this.weaponCase.ImagePath,
			confirmed: false,
			items: [] as any,
			itemCount: 30,
		};
	},
	methods: {
		async removeCase(): Promise<boolean> {
			let idToken = await getAuth().currentUser?.getIdToken();

			if (idToken) {
				let res = await fetch("/api/case", {
					method: "DELETE",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
						"CSRF-Token": this.$cookies.get("XSRF-TOKEN"),
					},
					body: JSON.stringify({ idToken, caseName: this.caseName }),
				});

				return res.json();
			} else {
				return false;
			}
		},

		async getItemsFromCase() {
			let idToken = await getAuth().currentUser?.getIdToken();
			if (idToken) {
				let res = await fetch(
					"/api/items?" +
						new URLSearchParams({
							idToken,
							caseName: this.caseName,
						})
				);
				let caseItems: [] = await res.json();

				for (let i = 0; i < this.itemCount; i++) {
					this.items.push(
						caseItems[Math.floor(Math.random() * caseItems.length)]
					);
				}
			}
		},
		async confirm() {
			let validRemove = await this.removeCase();

			if (!validRemove) {
				this.closePopup();
				return;
			}

			await this.getItemsFromCase();
			this.confirmed = true;
			setTimeout(() => {
				this.closePopup();
			}, 8000);
		},
		closePopup() {
			this.confirmed = false;
			this.$emit("close");
		},
	},
	watch: {
		show(to, from) {
			this.caseName = this.weaponCase.CaseName;
			this.imagePath = this.weaponCase.ImagePath;
			this.confirmed = false;
		},
	},
	props: ["show", "weaponCase"],
});
</script>

<style scoped>
.modal-mask {
	position: fixed;
	z-index: 9998;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	transition: opacity 0.3s ease;
}

.modal-wrapper {
	position: fixed;
	margin: auto auto;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.question-popup {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	padding: 2rem;
	background-color: #282a2c;
	border-radius: 10px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
	transition: all 0.3s ease;
}

h1 {
	letter-spacing: 0.1rem;
}
.button-group {
	width: 100%;
	display: flex;
	justify-content: space-between;
}

button {
	color: white;
	font-size: 1.5rem;
	font-weight: bold;
	letter-spacing: 0.1rem;
	padding: 0.5rem 1rem;
	background-color: rgb(95, 97, 99);
	border: none;
	border-radius: 10px;
}

button:hover {
	cursor: pointer;
	background-color: rgb(109, 111, 114);
}

.modal-enter-from {
	opacity: 0;
}

.modal-leave-to {
	opacity: 0;
}
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
	-webkit-transform: scale(1.1);
	transform: scale(1.1);
}

.hide {
	opacity: 0;
}

.items {
	position: fixed;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	margin: auto 0;
	top: 50%;
	left: 50%;
	transform: translate(calc(-100% + 30vw + 7rem + 15vw), -50%);
	transition: all 4s cubic-bezier(0.27, 0.59, 0.08, 1);
}

.hideItems {
	transform: translate(60vw, -50%);
}

.item-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	background-color: #141414;
	margin: 1rem;
	padding: 1rem;
	width: 30vw;
	border-radius: 20px;
	box-shadow: 0 0 10px rgb(97, 97, 97);
}

.selected {
	animation: shake 1s linear 5s 3 normal;
}

@keyframes shake {
	0% {
		transform: rotate(0);
	}
	10% {
		transform: rotate(10deg);
	}
	20% {
		transform: rotate(-10deg);
	}
	30% {
		transform: rotate(10deg);
	}
	40% {
		transform: rotate(-10deg);
	}
	50% {
		transform: rotate(0);
	}
	100% {
		transform: rotate(0);
	}
}

.hidden {
	animation: none;
}

.rarity1 {
	background: rgb(2, 0, 36);
	background: linear-gradient(
		0deg,
		rgba(2, 0, 36, 1) 0%,
		rgba(20, 20, 20, 1) 100%
	);
}

.rarity2 {
	background: rgb(28, 0, 75);
	background: linear-gradient(
		0deg,
		rgba(28, 0, 75, 1) 0%,
		rgba(20, 20, 20, 1) 100%
	);
}

.rarity3 {
	background: rgb(97, 0, 105);
	background: linear-gradient(
		0deg,
		rgba(97, 0, 105, 1) 0%,
		rgba(20, 20, 20, 1) 100%
	);
}

.rarity4 {
	background: rgb(144, 0, 9);
	background: linear-gradient(
		0deg,
		rgba(144, 0, 9, 1) 0%,
		rgba(20, 20, 20, 1) 100%
	);
}

.rarity5 {
	background: rgb(177, 141, 0);
	background: linear-gradient(
		0deg,
		rgba(177, 141, 0, 1) 0%,
		rgba(20, 20, 20, 1) 100%
	);
}

h2 {
	font-size: 2rem;
	font-weight: bold;
	letter-spacing: 0.1rem;
}

.item-picture {
	width: 100%;
}
</style>
