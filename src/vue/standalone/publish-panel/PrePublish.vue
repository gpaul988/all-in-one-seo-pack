<template>
	<div
		class="seo-overview"
		v-if="currentPost.id"
	>
		<ul class="pre-publish-checklist">
			<li
				v-for="(tip, index) in tips"
				:key="index"
			>
				<span class="icon">
					<component
						:is="tip.icon"
						:class="tip.type"
					/>
				</span>

				<span>{{ tip.label }}: <span class="result" :class="tip.value.endsWith('/100') ? tip.type : null">{{ tip.value }}</span></span>

				<span
					v-if="dynamicOptions.searchAppearance.postTypes[currentPost.postType] && dynamicOptions.searchAppearance.postTypes[currentPost.postType].advanced.showMetaBox"
					class="edit"
					@click="openSidebar(tip.name)"
				>
					<svg-pencil />
				</span>
			</li>
		</ul>

		<div
			class="snippet-preview"
			v-if="$allowed('aioseo_page_analysis')"
		>
			<p class="title">{{ strings.snippetPreview }}:</p>
			<core-google-search-preview
				:title="parseTags(currentPost.title || currentPost.tags.title || '#post_title #separator_sa #site_title')"
				:separator="options.searchAppearance.global.separator"
				:description="parseTags(currentPost.description || currentPost.tags.description || '#post_content')"
				:class="{ ismobile: currentPost.generalMobilePrev }"
			>
				<template #domain>
					<a :href="liveTags.permalink" target="_blank">
						{{ liveTags.permalink }}
					</a>
				</template>
			</core-google-search-preview>
		</div>

		<div
			class="canonical-url"
			v-if="$allowed('aioseo_page_analysis') && currentPost.canonicalUrl"
		>
			<p class="title">
				{{ strings.canonicalUrl }}:
				<span class="edit" @click="openSidebar('canonical')">
					<svg-pencil />
				</span>
			</p>
			<a :href="currentPost.canonicalUrl" target="_blank" rel="noopener noreferrer">
				<span>{{ currentPost.canonicalUrl }}</span>
				<svg-external />
			</a>
		</div>
	</div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { Tags, ImagePreview } from '@/vue/mixins'
import { Standalone } from '@/vue/mixins/Standalone'
import CoreGoogleSearchPreview from '@/vue/components/common/core/GoogleSearchPreview'
import SvgCircleCheck from '@/vue/components/common/svg/circle/Check'
import SvgCircleClose from '@/vue/components/common/svg/circle/Close'
import SvgCircleExclamation from '@/vue/components/common/svg/circle/Exclamation'
import SvgExternal from '@/vue/components/common/svg/External'
import SvgPencil from '@/vue/components/common/svg/Pencil'
export default {
	components : {
		CoreGoogleSearchPreview,
		SvgCircleCheck,
		SvgCircleClose,
		SvgCircleExclamation,
		SvgExternal,
		SvgPencil
	},
	mixins : [ Standalone, Tags, ImagePreview ],
	data () {
		return {
			socialImageKey : 0,
			strings        : {
				snippetPreview : this.$t.__('Snippet Preview', this.$td),
				canonicalUrl   : this.$t.__('Canonical URL', this.$td)
			}
		}
	},
	computed : {
		...mapState([ 'currentPost' ]),
		...mapState('live-tags', [ 'liveTags' ]),
		tips () {
			let tips = [
				{
					label  : this.$t.__('Visibility', this.$td),
					name   : 'visibility',
					access : 'aioseo_page_advanced_settings'
				},
				{
					label  : this.$t.__('SEO Analysis', this.$td),
					name   : 'seoAnalysis',
					access : 'aioseo_page_analysis'
				},
				{
					label  : this.$t.__('Readability', this.$td),
					name   : 'readabilityAnalysis',
					access : 'aioseo_page_analysis'
				},
				{
					label  : this.$t.__('Focus Keyphrase', this.$td),
					name   : 'focusKeyphrase',
					access : 'aioseo_page_analysis'
				},
				{
					label  : this.$t.__('Social', this.$td),
					name   : 'social',
					access : 'aioseo_page_social_settings'
				}
			].filter((tip) => {
				return this.$allowed(tip.access) && (
					// Exclude items which require TruSEO to be enabled.
					'aioseo_page_analysis' !== tip.access ||
					this.options.advanced.truSeo
				)
			})

			// Remove Social tip if both Twitter and Facebook markup are disabled.
			if (!this.options.social.facebook.general.enable && !this.options.social.twitter.general.enable) {
				tips = tips.filter(tip => 'social' !== tip.name)
			}

			tips.forEach((tip, index) => {
				tips[index] = { ...tip, ...this.getData(tip.name) }
			})

			return tips
		},
		canImprove () {
			return this.tips.some(tip => 'error' === tip.type)
		}
	},
	methods : {
		...mapMutations([ 'changeTabSettings' ]),
		getIcon (type) {
			switch (type) {
				case 'error':
					return 'svg-circle-close'
				case 'warning':
					return 'svg-circle-exclamation'
				case 'success':
				default:
					return 'svg-circle-check'
			}
		},
		getData (tipName) {
			const result = {}

			if ('visibility' === tipName) {
				result.value = this.$t.__('Good!', this.$td)
				result.type  = 'success'

				const value = this.currentPost.default
					? (
						this.dynamicOptions.searchAppearance.postTypes[this.currentPost.postType] &&
						!this.dynamicOptions.searchAppearance.postTypes[this.currentPost.postType].advanced.robotsMeta.default &&
						this.dynamicOptions.searchAppearance.postTypes[this.currentPost.postType].advanced.robotsMeta.noindex
					)
					: this.currentPost.noindex
				if (value) {
					result.value = this.$t.__('Blocked!', this.$td)
					result.type  = 'error'
				}
			}

			if ('seoAnalysis' === tipName) {
				result.value = this.$t.__('N/A', this.$td)
				result.type  = 'error'

				const value = this.currentPost.seo_score
				if (Number.isInteger(value)) {
					result.value = value + '/100'
					result.type  = 80 < value ? 'success' : 50 < value ? 'warning' : 'error'
				}
			}

			if ('readabilityAnalysis' === tipName) {
				result.value = this.$t.__('Good!', this.$td)
				result.type  = 'success'

				const value = this.currentPost.page_analysis.analysis.readability.errors
				if (value && 0 < value) {
					result.value = this.$t.sprintf(
						// Translators: 1 - How many errors were found.
						this.$t._n('%1$s error found!', '%1$s errors found!', value, this.$td),
						value
					)
					result.type  = 'error'
				}
			}

			if ('focusKeyphrase' === tipName) {
				result.value = this.$t.__('No focus keyphrase!', this.$td)
				result.type  = 'error'

				const value = this.currentPost.keyphrases.focus
				if (value && value.keyphrase) {
					result.value = value.score + '/100'
					result.type  = 80 < value.score ? 'success' : 50 < value.score ? 'warning' : 'error'
				}
			}

			if ('social' === tipName) {
				result.value = this.$t.__('Good!', this.$td)
				result.type  = 'success'

				// We're just putting the social image key here to force the computed property to recompute when the key is updated.
				// eslint-disable-next-line no-unused-expressions
				this.socialImageKey

				const socialTitle       = this.parseTags(this.currentPost.og_title || this.currentPost.title || this.currentPost.tags.title).trim()
				const socialDescription = this.parseTags(this.currentPost.og_description || this.currentPost.description || this.currentPost.tags.description).trim()
				const socialImage       = this.socialImage

				if (!socialTitle || !socialDescription || !socialImage) {
					result.value = this.$t.__('Missing social markup!', this.$td)
					result.type  = 'error'
				}
			}

			return { ...result, icon: this.getIcon(result.type) }
		},
		openSidebar (tipName) {
			const { closePublishSidebar, openGeneralSidebar } = window.wp.data.dispatch('core/edit-post')

			closePublishSidebar()
			openGeneralSidebar('aioseo-post-settings-sidebar/aioseo-post-settings-sidebar')

			const sidebarSettings = {}

			switch (tipName) {
				case 'canonical':
				case 'visibility':
					sidebarSettings.tab = 'advanced'
					break
				case 'seoAnalysis':
					sidebarSettings.tab  = 'general'
					sidebarSettings.card = 'basicseo'
					break
				case 'readabilityAnalysis':
					sidebarSettings.tab  = 'general'
					sidebarSettings.card = 'readability'
					break
				case 'focusKeyphrase':
					sidebarSettings.tab  = 'general'
					sidebarSettings.card = 'focus'
					break
				case 'social':
					sidebarSettings.tab = 'social'
					break
			}

			this.changeTabSettings({ setting: 'mainSidebar', value: sidebarSettings })
		}
	},
	async mounted () {
		await this.setImageUrl().then(() => {
			this.socialImage = this.imageUrl
		})

		this.$bus.$on('updateSocialImagePreview', (param) => {
			this.socialImage = param.image
			this.socialImageKey++
		})

		this.$nextTick(() => {
			const menuItem = document.querySelector('.aioseo-pre-publish .editor-post-publish-panel__link')
			if (menuItem) {
				menuItem.innerHTML = this.canImprove
					? this.$t.__('Your post needs improvement!', this.$td)
					: this.$t.__('You\'re good to go!', this.$td)
			}
		})
	}
}
</script>

<style lang="scss">
.aioseo-seo-overview {
	&.components-panel__body {
		.components-button {
			display: inline-block;
			line-height: 140%;
		}
		&.is-opened {
			.components-panel__body-title,
			.components-panel__body-title:hover {
				border-bottom: 1px solid #e0e0e0;
			}
		}
	}
}
.seo-overview {
	ul {
		margin: 16px 0;
		padding-bottom: 6px;
		border-bottom: 1px solid #E8E8EB;
		li {
			display: flex;
			align-items: center;
			margin-bottom: 12px;
		}
		.icon {
			margin-right: 10px;
			line-height: 0;

			svg {
				width: 22px;
				height: 22px;
			}
		}
		.result {
			font-weight: 700;
		}

		.warning {
			color: $orange;
		}

		.info {
			color: $blue;
		}

		.success {
			color: $green;
		}

		.error {
			color: $red;
		}
	}
	.title {
		font-size: 13px;
		line-height: 130%;
		color: $placeholder-color;
		margin-bottom: 8px;
		display: flex;
	}
	.edit {
		cursor: pointer;
		margin-left: auto;
		margin-right: 5px;
		svg {
			width: 14px;
			height: 14px;
			color: $black2;
		}
		&:hover {
			svg {
				color: $black2-hover;
			}
		}
	}
	.snippet-preview {
		margin-bottom: 16px;
		.aioseo-google-search-preview {
			.google-post {
				padding: 10px;
			}
			a {
				color: $black3;
				text-decoration: none;
			}
		}
	}
	.canonical-url {
		a {
			font-size: 12px;
			color: $blue;
			svg {
				margin-left: 5px;
				width: 16px;
				height: 16px;
				vertical-align: middle;
			}
		}
		span {
			vertical-align: middle;
			overflow-wrap: break-word;
		}
	}
}
</style>