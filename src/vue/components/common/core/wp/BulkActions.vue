<template>
	<div class="aioseo-wp-bulk-actions alignleft actions bulkactions">
		<select
			v-model="bulkAction"
			:disabled="disableTable"
		>
			<option value="-1">{{ strings.bulkActions }}</option>

			<option
				v-for="(option, index) in bulkOptions"
				:key="index"
				:value="option.value"
			>{{ option.label }}</option>
		</select>

		<button
			class="button action"
			@click="'-1' !== bulkAction ? $emit('process-bulk-action', bulkAction) : null"
			:disabled="disableTable"
		>
			{{strings.apply}}
		</button>
	</div>
</template>

<script>
export default {
	props : {
		bulkOptions : {
			type     : Array,
			required : true
		},
		disableTable : Boolean
	},
	data () {
		return {
			bulkAction : '-1',
			strings    : {
				bulkActions : this.$t.__('Bulk Actions', this.$td),
				apply       : this.$t.__('Apply', this.$td)
			}
		}
	}
}
</script>

<style lang="scss">
.aioseo-wp-bulk-actions {
	select {
		margin-left: 0;
	}
}
</style>