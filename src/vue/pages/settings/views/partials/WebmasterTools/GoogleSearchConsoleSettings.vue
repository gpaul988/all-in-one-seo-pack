<template>
	<grid-column class="tool-settings tool-settings-google-search-console">
		<template
			v-for="(setting, index) in tool.settings"
		>
			<core-settings-row
				noHorizontalMargin
				align-small
				:key="index"
			>
				<template #name>
					{{ setting.label }}
				</template>

				<template #content>
					<div class="d-flex">
						<base-input
							size="small"
							@blur="maybeUpdateId(setting.option)"
							v-model="options.webmasterTools[setting.option]"
						/>
					</div>

					<p class="aioseo-description" v-html="setting.description" />

					<core-alert
						class="inline-upsell"
						type="blue"
						v-if="isUnlicensed"
					>
						<div v-html="strings.liteUpsell" />
					</core-alert>

					<core-alert
						class="inline-upsell"
						type="blue"
						v-if="!isUnlicensed && !$license.hasCoreFeature('search-statistics', 'seo-statistics')"
					>
						<div v-html="requiredPlansString" />
					</core-alert>

					<core-alert
						class="inline-upsell"
						type="blue"
						v-if="!isUnlicensed && $license.hasCoreFeature('search-statistics', 'seo-statistics') && !$aioseo?.searchStatistics.isConnected"
					>
						<div v-html="strings.notConnected" />
					</core-alert>
				</template>
			</core-settings-row>
		</template>
	</grid-column>
</template>

<script>
import { mapGetters } from 'vuex'
import { WebmasterTools } from '@/vue/pages/settings/mixins'
import CoreAlert from '@/vue/components/common/core/alert/Index.vue'
import CoreSettingsRow from '@/vue/components/common/core/SettingsRow'
import GridColumn from '@/vue/components/common/grid/Column'
export default {
	components : {
		CoreAlert,
		CoreSettingsRow,
		GridColumn
	},
	mixins : [ WebmasterTools ],
	data () {
		return {
			strings : {
				thisFeatureRequires         : this.$t.__('Advanced tracking and actionable reports require one of the following plans:', this.$td),
				thisFeatureRequiresSingular : this.$t.__('Advanced tracking and actionable reports require the following plan:', this.$td),
				liteUpsell                  : this.$t.sprintf(
					// Translators: 1 - The plugin short name name ("AIOSEO") + Pro, 2 - "Learn more".
					this.$t.__('Advanced tracking and actionable reports are available to licensed %1$s users. %2$s', this.$td),
					`${import.meta.env.VITE_SHORT_NAME} Pro`,
					this.$links.getUpsellLink('search-statistics', this.$constants.GLOBAL_STRINGS.learnMore, 'webmaster-tools', true)
				),
				notConnected : this.$t.sprintf(
					// Translators: 1 - The opening anchor tag, 2 - The closing anchor tag, 3 - "Learn more".
					this.$t.__('Connect your site with Google Search Console in %1$sSearch Statistics%2$s to track how your site is performing in search rankings and generate actionable reports. %3$s', this.$td),
					`<a href='${this.$aioseo.urls.aio.searchStatistics}#/settings'>`,
					'</a>',
					this.$links.getPlainLink(
						this.$constants.GLOBAL_STRINGS.learnMore,
						`${this.$aioseo.urls.aio.searchStatistics}#/settings`,
						true,
						false
					)
				)
			}
		}
	},
	computed : {
		...mapGetters([ 'settings', 'isUnlicensed' ]),
		requiredPlans () {
			return this.$license.getPlansForFeature('search-statistics', 'seo-statistics')
		},
		requiredPlansString () {
			let string = 1 < this.requiredPlans
				? this.strings.thisFeatureRequires + ' ' + this.requiredPlans.join(', ')
				: this.strings.thisFeatureRequiresSingular + ' ' + this.requiredPlans.join(', ')

			string += '<br />'
			string += this.$links.getUpsellLink('search-statistics', this.$constants.GLOBAL_STRINGS.learnMore, 'webmaster-tools', true)

			return string
		}
	}
}
</script>

<style lang="scss">
.tool-settings-google-search-console {
	.inline-upsell {
		display: inline-block;
		margin-top: 20px;
	}
}
</style>