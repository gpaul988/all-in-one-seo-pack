<template>
	<div class="page-analysis-panel">
		<core-alert
			v-if="pageBuilderAlert"
			type="yellow"
		>
			<span v-html="pageBuilderAlert" />
		</core-alert>

		<core-main-tabs
			:tabs="tabs"
			:showSaveButton="false"
			:active="this.initTab"
			internal
			@changed="value => processChangeTab(value)"
		/>
		<transition mode="out-in">
			<metaboxAnalysisDetail
				v-if="currentPost.page_analysis"
				:analysisItems="currentPost.page_analysis.analysis[this.initTab]"
			/>
		</transition>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { isBlockEditor } from '@/vue/utils/context'
import CoreAlert from '@/vue/components/common/core/alert/Index'
import CoreMainTabs from '@/vue/components/common/core/main/Tabs'
import metaboxAnalysisDetail from './MetaboxAnalysisDetail'
export default {
	components : {
		CoreAlert,
		CoreMainTabs,
		metaboxAnalysisDetail
	},
	data () {
		return {
			initTab : 'basic',
			tabs    : [
				{
					slug : 'basic',
					name : this.$t.__('Basic SEO', this.$td)
				},
				{
					slug : 'title',
					name : this.$t.__('Title', this.$td)
				},
				{
					slug : 'readability',
					name : this.$t.__('Readability', this.$td)
				}
			]
		}
	},
	computed : {
		...mapState([ 'currentPost' ]),
		pageBuilderAlert () {
			if (!isBlockEditor() || '' === this.$aioseo.integration) {
				return false
			}

			const pageBuilderName = this.$aioseo.integration.charAt(0).toUpperCase() + this.$aioseo.integration.slice(1)

			return this.$t.sprintf(
				// Translators: 1 - The Page Builder name, 2 - HTML code opening tag, 3 - HTML code closing tag.
				this.$t.__('We have detected that you are currently using the %1$s Page Builder. Please click %2$shere%3$s to use the %1$s editor for a most accurate result.', this.$td),
				pageBuilderName,
				'<a href="' + this.currentPost.editlink + '">',
				'</a>'
			)
		}
	},
	methods : {
		processChangeTab (newTabValue) {
			this.initTab = newTabValue
		}
	},
	mounted () {
		this.tabs.map(tab => {
			tab.errorCount = this.currentPost.page_analysis.analysis[tab.slug].errors
			return tab
		})
	}
}
</script>

<style lang="scss">
.aioseo-app .aioseo-post-general .page-analysis-panel {
	.aioseo-alert {
		margin-bottom: 12px;
	}

	.aioseo-tabs {
		background: #fff;

		.md-button-content {
			display: flex;
		}

		.md-button {
			font-weight: 700;
		}
	}
}
</style>