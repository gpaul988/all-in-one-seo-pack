<template>
	<div class="aioseo-redirects-sidebar">
		<core-settings-row
			v-if="'sidebar' === $root._data.screenContext"
			class="snippet-description-row open-redirects-copy"
		>
			<template #content>
				<div class="aioseo-sidebar-content-title">{{ strings.title }}</div>

				<p>{{ strings.description }}</p>

				<base-button
					class="open-redirects-modal gray small"
					@click="toggleRedirectsModal"
				>
					<svg-right-arrow-short />
					{{ strings.button }}
				</base-button>
			</template>
		</core-settings-row>
	</div>
</template>

<script>
import { mapMutations } from 'vuex'
import CoreSettingsRow from '@/vue/components/common/core/SettingsRow'
import SvgRightArrowShort from '@/vue/components/common/svg/right-arrow/Short.vue'
export default {
	components : {
		CoreSettingsRow,
		SvgRightArrowShort
	},
	data () {
		return {
			strings : {
				title       : this.$t.__('Redirects', this.$td),
				description : this.$t.__('Here you can add a redirect or view your existing redirects from this page. Click on the button below to view the Redirects panel.', this.$td),
				button      : this.$t.__('Open Redirects', this.$td)
			}
		}
	},
	methods : {
		...mapMutations([ 'toggleRedirectsModal' ])
	}
}
</script>
<style lang="scss" scoped>
.open-redirects-modal {
	margin: 12px 0 12px 0;

	svg {
		margin-right: 8px;
		width: 10px;
		height: 10px;
	}
}
</style>