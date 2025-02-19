<template>
	<div class="aioseo-headline-analyzer">
		<core-card
			slug="analyzeNewHeadline"
			hide-header
			no-slide
			:toggles="false"
		>
			<core-analyze
				:header="strings.enterYourHeadline"
				:description="strings.writeIrresistibleSEOHeadlines"
				:isAnalyzing="isAnalyzing"
				:analyzeTime="analyzeTime"
				@startAnalyzing="startAnalyzing"
				:placeholder="strings.placeholder"
			>
				<template #errors>
					<div
						class="analyze-errors aioseo-description aioseo-error"
						v-if="'headline' === analyzer && analyzeError"
						v-html="analyzeError"
					/>
				</template>
			</core-analyze>
		</core-card>

		<core-card
			v-for="(result, headline) in headlines"
			:key="headline"
			:id="'aioseo-headline-result' + hashCode(headline)"
			:slug="'analyzeHeadline' + headline"
			:save-toggle-status="false"
		>
			<template #header>
				<core-analyze-score
					:score="parseResult(result).score"
				/>

				<span>&ldquo;{{ headline }}&rdquo;</span>

				<svg-trash
					@click.native="startDeleteheadline(headline)"
				/>
			</template>

			<div class="headline-result-main">
				<core-headline-score
					:score="parseResult(result).score"
					:loading="analyzing"
				/>

				<div class="headline-result-body">
					<core-headline-result
						:result="parseResult(result).result"
					/>
				</div>
			</div>
		</core-card>
	</div>
</template>

<script>
import { mapActions, mapState, mapGetters, mapMutations } from 'vuex'
import CoreAnalyze from '@/vue/components/common/core/analyze/Index.vue'
import CoreAnalyzeScore from '@/vue/components/common/core/analyze/Score'
import CoreCard from '@/vue/components/common/core/Card'
import CoreHeadlineResult from '@/vue/components/common/core/headline/Result'
import CoreHeadlineScore from '@/vue/components/common/core/headline/Score'
import SvgTrash from '@/vue/components/common/svg/Trash'
export default {
	components : {
		CoreAnalyze,
		CoreAnalyzeScore,
		CoreCard,
		CoreHeadlineResult,
		CoreHeadlineScore,
		SvgTrash
	},
	data () {
		return {
			headline    : null,
			headlines   : {},
			isAnalyzing : false,
			analyzeTime : 2,
			strings     : {
				enterYourHeadline             : this.$t.__('Enter Your Headline', this.$td),
				placeholder                   : this.$t.__('Top 10 Ways to Increase Traffic', this.$td),
				writeIrresistibleSEOHeadlines : this.$t.sprintf(
					// Translators: 1 - HTML Line break tag.
					this.$t.__('Our Headline Analyzer tool enables you to write irresistible SEO headlines%1$sthat drive traffic, shares, and rank better in search results.', this.$td),
					'<br>'
				),
				analyze : this.$t.__('Analyze', this.$td)
			}
		}
	},
	watch : {
		analyzeError (newValue) {
			if (newValue) {
				this.isAnalyzing = false
			}
		}
	},
	computed : {
		...mapState([ 'options', 'analyzer', 'analyzing', 'analyzeError' ]),
		...mapGetters([ 'getHeadlineAnalysisResults' ])
	},
	methods : {
		...mapActions([ 'runHeadlineAnalyzer', 'deleteHeadline' ]),
		...mapMutations([ 'toggleCard', 'closeCard' ]),
		parseResult (results) {
			return JSON.parse(results)
		},
		startAnalyzing (headline) {
			this.headline = headline
			this.$store.commit('analyzing', true)
			this.$store.commit('analyzeError', false)
			this.runHeadlineAnalyzer({
				headline            : this.headline,
				shouldStoreHeadline : true
			})

			this.isAnalyzing = true
			setTimeout(this.checkStatus, this.analyzeTime * 1000)

			this.closeAllCards()
		},
		checkStatus () {
			this.isAnalyzing = false
			if (this.analyzing) {
				this.$nextTick(() => {
					this.isAnalyzing = true

					// Don't allow it to go too fast.
					if (2 > this.analyzeTime) {
						this.analyzeTime = 1
					}

					this.analyzeTime = this.analyzeTime / 2
					setTimeout(this.checkStatus, this.analyzeTime * 1000)
				})

				return
			}

			this.headline  = null
			this.headlines = this.getHeadlineAnalysisResults
			this.toggleFirstCard()

			this.$nextTick(() => {
				const keys   = Object.keys(this.headlines)
				const header = document.querySelector('.aioseo-header')
				const offset = header.offsetHeight + header.offsetTop + 30

				this.$scrollTo('#aioseo-headline-result' + this.hashCode(keys[0]), { offset: -offset })
			})
		},
		startDeleteheadline (headline) {
			this.closeAllCards()

			this.$delete(this.headlines, headline)

			this.deleteHeadline(headline)
				.then(() => {
					this.headlines = this.getHeadlineAnalysisResults
				})
		},
		closeAllCards () {
			const keys = Object.keys(this.headlines)
			keys.forEach(key => {
				this.closeCard('analyzeHeadline' + key)
			})
		},
		toggleFirstCard () {
			const keys = Object.keys(this.headlines)
			this.toggleCard('analyzeHeadline' + keys[0])
		},
		hashCode (string) {
			if (!string) {
				return
			}
			let hash = 0, i, chr
			for (i = 0; i < string.length; i++) {
				chr   = string.charCodeAt(i)
				hash  = ((hash << 5) - hash) + chr
				hash |= 0 // Convert to 32bit integer
			}
			return hash
		}
	},
	mounted () {
		this.$store.commit('analyzeError', false)
		this.headlines = this.getHeadlineAnalysisResults

		this.toggleFirstCard()
	}
}
</script>

<style lang="scss">
.aioseo-headline-analyzer {
	.aioseo-trash {
		width: 20px;
		height: 20px;
		color: $placeholder-color;
		margin-left: 14px;
		cursor: pointer;

		&:hover {
			color: $black2;
		}
	}

	.headline-result-main {
		display: flex;
		flex-direction: row;
		font-size: 16px;
		align-items: flex-start;
		color: $black;

		.headline-result-body {
			flex: 1;
			margin-left: 30px;
			min-width: 0; // @link: https://weblog.west-wind.com/posts/2016/feb/15/flexbox-containers-pre-tags-and-managing-overflow

			@media (max-width: 782px) {
				margin-left: 0;
			}
		}

		@media (max-width: 782px) {
			display: block;

			.aioseo-headline-score {
				margin-bottom: 30px;
			}
		}
	}
}
</style>