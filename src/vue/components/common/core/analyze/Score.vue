<template>
	<div
		class="aioseo-analyze-score"
		:class="getColorClass"
	>
		<span>{{ score }}/100</span>
	</div>
</template>

<script>
export default {
	props : {
		score : {
			type     : Number,
			required : true
		}
	},
	computed : {
		getColorClass () {
			return 33 >= this.score
				? 'red'
				: (
					66 >= this.score
						? 'orange'
						: 'green'
				)
		}
	}
}
</script>

<style lang="scss">
.aioseo-analyze-score {
	border: 1px solid $green;
	border-radius: 3px;
	color: $green;
	font-size: 14px;
	padding: 0 8px;
	height: 24px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-right: 14px;

	&.red {
		color: $red;
		border-color: $red;
	}

	&.orange {
		color: $orange;
		border-color: $orange;
	}
}
</style>