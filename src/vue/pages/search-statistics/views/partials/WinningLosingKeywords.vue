<template>
	<div class="aioseo-search-statistics-winning-losing-keywords">
		<div
			v-if="0 === rows"
			class="winning-losing-keywords-empty"
			:class="{ blurred : loading.keywords }"
		>
			<h3 class="title">{{ strings.noKeywords }}</h3>
		</div>

		<div
			v-if="0 < rows"
			class="winning-losing-keywords"
			:class="{ blurred : loading.keywords }"
		>
			<div class="winning-losing-keywords-title">
				<div>{{ strings.winning }}</div>

				<div>{{ strings.losing }}</div>
			</div>

			<div
				v-for="i in rows"
				:key="i"
				class="winning-losing-keywords-row"
				:class="{ even: 0 === i % 2 }"
			>
				<div class="keyword">
					<template v-if="topWinning[i-1]">
						<core-tooltip v-if="shouldLimitText(topWinning[i-1].keyword)">
							<span class="limit-line">{{ decodeHTMLEntities(topWinning[i-1].keyword) }}</span>

							<template #tooltip>
								{{ decodeHTMLEntities(topWinning[i-1].keyword) }}
							</template>
						</core-tooltip>

						<span v-else>{{ decodeHTMLEntities(topWinning[i-1].keyword) }}</span>

						<statistic
							type="decay"
							:difference="topWinning[i-1].difference.decay"
							:showCurrent="false"
						/>
					</template>
				</div>

				<div class="keyword">
					<template v-if="topLosing[i-1]">
						<core-tooltip v-if="shouldLimitText(topLosing[i-1].keyword)">
							<span class="limit-line">{{ decodeHTMLEntities(topLosing[i-1].keyword) }}</span>

							<template #tooltip>
								{{ decodeHTMLEntities(topLosing[i-1].keyword) }}
							</template>
						</core-tooltip>

						<span v-else>{{ decodeHTMLEntities(topLosing[i-1].keyword) }}</span>

						<statistic
							type="decay"
							:difference="topLosing[i-1].difference.decay"
							:showCurrent="false"
						/>
					</template>
				</div>
			</div>
		</div>

		<core-loader v-if="loading.keywords" dark />
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { decodeHTMLEntities } from '@/vue/utils/helpers'
import CoreLoader from '@/vue/components/common/core/Loader'
import CoreTooltip from '@/vue/components/common/core/Tooltip'
import Statistic from './Statistic.vue'
export default {
	components : {
		CoreLoader,
		CoreTooltip,
		Statistic
	},
	data () {
		return {
			strings : {
				winning    : this.$t.__('Top Winning', this.$td),
				losing     : this.$t.__('Top Losing', this.$td),
				noKeywords : this.$t.__('You don\'t yet have any keywords.', this.$td)
			}
		}
	},
	computed : {
		...mapState('search-statistics', [ 'data', 'loading' ]),
		topWinning () {
			if (!this.data?.keywords?.topWinning?.length) {
				return []
			}
			return this.data.keywords.topWinning.slice(0, 5)
		},
		topLosing () {
			if (!this.data?.keywords?.topLosing?.length) {
				return []
			}
			return this.data.keywords.topLosing.slice(0, 5)
		},
		rows () {
			const winning = this.topWinning.length
			const losing = this.topLosing.length

			return Math.max(winning, losing)
		}
	},
	methods : {
		decodeHTMLEntities,
		shouldLimitText (line) {
			return 60 < decodeHTMLEntities(line).length
		}
	}
}
</script>

<style lang="scss">
.aioseo-search-statistics-winning-losing-keywords {
	.aioseo-loading-spinner {
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto;
	}

	.blurred {
		filter: blur(2px);
		pointer-events: none;
		user-select: none;
	}

	.winning-losing-keywords {
		margin-bottom: 20px;

		&-title {
			display: flex;
			font-weight: 700;
			font-size: 14px;
			margin-bottom: 16px;

			> div {
				flex-basis: 50%;
				max-width: 50%;

				&:first-child {
					margin-right: 12px;
				}

				&:last-child {
					margin-left: 12px;
				}
			}
		}

		&-row {
			display: flex;

			.keyword {
				display: flex;
				align-items: start;
				flex-basis: 50%;
				max-width: 50%;
				padding: 12px;
				background-color: $box-background;
				font-weight: 400;
				font-size: 14px;
				line-height: 125%;

				.limit-line {
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					line-clamp: 2;
					-webkit-box-orient: vertical;
				}

				.statistic {
					margin-left: auto;
					padding-left: 12px;
					font-weight: 700;

					&-direction {
						font-size: 14px;
					}
				}

				.aioseo-tooltip {
					margin-left: 0;
				}

				&:first-child {
					margin-right: 12px;
				}

				&:last-child {
					margin-left: 12px;
				}
			}

			&.even {
				.keyword {
					background-color: $white;
				}
			}
		}

		&-empty {
			text-align: center;

			.title {
				font-weight: 700;
				font-size: 16px;
				margin: 0 0 12px;
			}
		}
	}
}
</style>