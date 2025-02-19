<template>
	<core-blur>
		<div class="aioseo-search-statistics-dashboard">
			<grid-row>
				<grid-column>
					<core-card
						slug="keywordPositions"
						:header-text="strings.keywordPositionsCard"
						:toggles="false"
						no-slide
					>
						<template #tooltip>
							<span v-html="strings.keywordPositionsTooltip" />
						</template>

						<seo-statistics-overview
							:statistics="[ 'keywords', 'impressions', 'position' ]"
							:show-graph="false"
							view="side-by-side"
						/>

						<grid-row>
							<grid-column md="6">
								<keywords-graph legend-style="simple" />
							</grid-column>

							<grid-column md="6">
								<keywords-distribution-graph />
							</grid-column>
						</grid-row>
					</core-card>

					<core-card
						slug="keywordPerformance"
						:header-text="strings.keywordPerformanceCard"
						:toggles="false"
						no-slide
					>
						<template #tooltip>
							<span v-html="strings.keywordPerformanceTooltip" />
						</template>

						<keywords-table
							:keywords="data?.keywords?.paginated || defaultKeywords"
							ref="table"
							show-items-per-page
							show-table-footer
						/>
					</core-card>
				</grid-column>
			</grid-row>
		</div>
	</core-blur>
</template>

<script>
import { mapState } from 'vuex'
import CoreBlur from '@/vue/components/common/core/Blur'
import CoreCard from '@/vue/components/common/core/Card'
import GridColumn from '@/vue/components/common/grid/Column'
import GridRow from '@/vue/components/common/grid/Row'
import KeywordsDistributionGraph from '../../partials/KeywordsDistributionGraph.vue'
import KeywordsGraph from '../../partials/KeywordsGraph.vue'
import KeywordsTable from '../../partials/KeywordsTable.vue'
import SeoStatisticsOverview from '../../partials/SeoStatisticsOverview'
export default {
	components : {
		CoreBlur,
		CoreCard,
		GridColumn,
		GridRow,
		KeywordsDistributionGraph,
		KeywordsGraph,
		KeywordsTable,
		SeoStatisticsOverview
	},
	data () {
		return {
			strings : {
				keywordPositionsCard      : this.$t.__('Keyword Positions', this.$td),
				keywordPositionsTooltip   : this.$t.__('This graph is a visual representation of how well <strong>keywords are ranking in search results over time</strong> based on their position and average CTR. This can help you understand the performance of keywords and identify any trends or fluctuations.', this.$td),
				keywordPerformanceCard    : this.$t.__('Keyword Performance', this.$td),
				keywordPerformanceTooltip : this.$t.__('This table displays the performance of keywords that your site ranks for over time, including metrics such as impressions, click-through rate, and average position in search results. It allows for easy analysis of how keywords are performing and identification of any underperforming keywords that may need to be optimized or replaced.', this.$td)
			},
			defaultKeywords : {
				rows   : [],
				totals : {
					page  : 0,
					pages : 0,
					total : 0
				}
			}
		}
	},
	computed : {
		...mapState('search-statistics', [ 'data' ])
	}
}
</script>