<template>
	<div class="aioseo-tools-import-export">
		<core-blur>
			<grid-row>
				<grid-column
					md="6"
				>
					<import-aioseo />
					<import-others />
				</grid-column>

				<grid-column
					md="6"
				>
					<export-settings />
				</grid-column>
			</grid-row>

			<grid-row>
				<grid-column>
					<backup-settings />
				</grid-column>
			</grid-row>
		</core-blur>

		<cta
			:cta-link="$links.getPricingUrl('network-tools', 'import-export')"
			:button-text="strings.ctaButtonText"
			:learn-more-link="$links.getUpsellUrl('network-tools', 'import-export', 'home')"
		>
			<template #header-text>
				{{ strings.ctaHeader }}
			</template>
			<template #description>
				<!-- <required-plans addon="aioseo-redirects" /> -->
				{{ strings.networkDatabaseToolsDescription }}
			</template>
		</cta>
	</div>
</template>

<script>
import BackupSettings from '../partials/BackupSettings'
import CoreBlur from '@/vue/components/common/core/Blur'
import Cta from '@/vue/components/common/cta/Index.vue'
import GridColumn from '@/vue/components/common/grid/Column'
import GridRow from '@/vue/components/common/grid/Row'
import ExportSettings from '../partials/ExportSettings'
import ImportAioseo from '../partials/ImportAioseo'
import ImportOthers from '../partials/ImportOthers'
export default {
	components : {
		BackupSettings,
		CoreBlur,
		Cta,
		GridColumn,
		GridRow,
		ExportSettings,
		ImportAioseo,
		ImportOthers
	},
	data () {
		return {
			strings : {
				ctaHeader : this.$t.sprintf(
					// Translators: 1 - Plugin short name ("AIOSEO"), 2 - "Pro".
					this.$t.__('This feature is not available in your current plan.', this.$td),
					import.meta.env.VITE_SHORT_NAME,
					'Pro'
				),
				ctaButtonText                   : this.$t.__('Upgrade Your Plan and Unlock Network Tools', this.$td),
				networkDatabaseToolsDescription : this.$t.__('Unlock network-level tools to manage all your sites from one easy-to-use location. Migrate data or create backups without the need to visit each dashboard.', this.$td)
			}
		}
	}
}
</script>

<style lang="scss">
.aioseo-tools-import-export {
	position: relative;

	.aioseo-row {
		margin: -0.5rem;

		.aioseo-card {
			margin: 0 0 1rem;

			&:last-of-type {
				margin-bottom: 0.5rem;
			}
		}

		.aioseo-col {
			display: flex;
			flex-direction: column;
		}
	}
}
</style>