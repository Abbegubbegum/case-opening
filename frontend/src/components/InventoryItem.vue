<template>
	<div class="box" @click="selectCase">
		<span class="count">{{ quantity }}</span>
		<img src="bravo_case.png" alt="CSGO Case Icon" />
		{{ caseName }}
	</div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
	data() {
		return {
			caseName: this.item.CaseName,
			quantity: this.item.Quantity,
		};
	},
	methods: {
		selectCase() {
			this.$emit("select", this.item);
		},
	},

	props: ["item"],
});
</script>
<style scoped>
.box {
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

.box:hover {
	background-color: #343638;
}

.count {
	margin-bottom: auto;
	margin-right: auto;
	margin-left: 0.5rem;
}

img {
	width: 80%;
}
</style>
