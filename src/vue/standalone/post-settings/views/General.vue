<template>
	<div class="aioseo-tab-content aioseo-post-general">
		<core-settings-row
			v-if="this.$allowed('aioseo_page_general_settings')"
			class="mobile-radio-buttons"
		>
			<template #content>
				<base-radio-toggle
					:value="currentPost.generalMobilePrev"
					v-if="'metabox' === $root._data.screenContext || 'modal' === parentComponentContext"
					name="previewGeneralIsMobile"
					class="circle"
					@input="isMobilePreviewEv"
					:options="[
						{ label: 'desktop', value: false, activeClass: 'dark', slot: 'desktop' },
						{ label: 'mobile', value: true, slot: 'mobile' }
					]"
				>
					<template #desktop>
						<svg-desktop />
					</template>
					<template #mobile>
						<svg-mobile />
					</template>
				</base-radio-toggle>
			</template>
		</core-settings-row>

		<core-settings-row
			:name="strings.snippetPreview"
			v-if="this.$allowed('aioseo_page_general_settings')"
			class="snippet-preview-row"
		>
			<template #content>
				<core-google-search-preview
					:title="parseTags(currentPost.title || currentPost.tags.title || '#post_title #separator_sa #site_title')"
					:separator="options.searchAppearance.global.separator"
					:description="parseTags(currentPost.description || currentPost.tags.description || '#post_content')"
					:class="{ ismobile: currentPost.generalMobilePrev }"
				>
					<template #domain>
						{{ liveTags.permalink }}
					</template>
				</core-google-search-preview>

				<base-button
					v-if="'sidebar' === $root._data.screenContext && 'modal' !== parentComponentContext"
					class="edit-snippet gray small"
					@click="editSnippetEv"
				>
					<svg-pencil />
					{{ strings.editSnippet }}
				</base-button>
			</template>
		</core-settings-row>

		<core-settings-row
			id="aioseo-post-settings-post-title-row"
			class="snippet-title-row"
			v-if="('metabox' === $root._data.screenContext || 'modal' === parentComponentContext) && this.$allowed('aioseo_page_general_settings')"
			:name="title"
			:key="titleKey"
		>
			<template #content>
				<core-html-tags-editor
					v-model="currentPost.title"
					:line-numbers="false"
					single
					@counter="count => updateCount(count, 'titleCount')"
					@input="setIsDirty"
					:tags-context="`${currentPost.postType || currentPost.termType}Title`"
					:defaultMenuOrientation="'modal' === parentComponentContext ? 'top' : 'bottom'"
					:default-tags="getDefaultTags('title')"
				>
					<template #tags-description>
						{{ strings.clickToAddTitle }}
					</template>

					<template #append-button>
						<ai-generator
							v-if="currentPost.postType && !isPageBuilderEditor()"
							type="title"
						/>
					</template>
				</core-html-tags-editor>

				<div
					class="max-recommended-count"
					v-html="maxRecommendedCount(titleCount, 60)"
				/>
			</template>
		</core-settings-row>

		<core-settings-row
			id="aioseo-post-settings-meta-description-row"
			class="snippet-description-row"
			v-if="('metabox' === $root._data.screenContext || 'modal' === parentComponentContext) && this.$allowed('aioseo_page_general_settings')"
			:name="strings.metaDescription"
			:key="descriptionKey"
		>
			<template #content>
				<core-html-tags-editor
					v-model="currentPost.description"
					:line-numbers="false"
					description
					@counter="count => updateCount(count, 'descriptionCount')"
					@input="setIsDirty"
					:tags-context="`${currentPost.postType || currentPost.termType}Description`"
					:defaultMenuOrientation="'modal' === parentComponentContext ? 'top' : 'bottom'"
					:default-tags="getDefaultTags('description')"
				>
					<template #tags-description>
						{{ strings.clickToAddDescription }}
					</template>

					<template #append-button>
						<ai-generator
							v-if="currentPost.postType && !isPageBuilderEditor()"
							type="description"
						/>
					</template>
				</core-html-tags-editor>

				<div
					class="max-recommended-count"
					v-html="maxRecommendedCount(descriptionCount, 160)"
				/>
			</template>
		</core-settings-row>

		<div
			v-if="displayTruSeoMetaboxCard && options.searchAppearance.advanced.useKeywords && options.searchAppearance.advanced.keywordsLooking"
		>
			<core-alert
				type="blue"
				show-close
				@close-alert="hideKeywordsLooking"
			>
				{{ strings.lookingForMetaKeywords }}

				<a
					href="#"
					@click="$emit('changeTab', 'advanced')"
				>
					{{ strings.goToAdvancedTab }}
				</a>

				<a
					class="no-underline"
					href="#"
					@click="$emit('changeTab', 'advanced')"
				>
						→
				</a>
			</core-alert>
		</div>

		<core-settings-row
			v-if="displayTruSeoMetaboxCard"
			class="snippet-focus-keyphrase-row"
			align
		>
			<template #name>
				{{ strings.focusKeyphrase }}

				<core-tooltip>
					<svg-circle-question-mark />

					<template #tooltip>
						<div v-html="strings.keyphraseDocumentation" />
					</template>
				</core-tooltip>
			</template>

			<template #content>
				<focus-keyphrase />
			</template>
		</core-settings-row>

		<core-settings-row
			v-if="displayTruSeoMetaboxCard"
			:name="strings.additionalKeyphrases"
			class="snippet-additional-keyphrases-row"
		>
			<template #content>
				<additional-keyphrases />
			</template>
		</core-settings-row>

		<core-settings-row
			v-if="displayTruSeoMetaboxCard && currentPost.page_analysis"
			:name="strings.pageAnalysis"
			class="snippet-page-analysis-row"
			align
		>
			<template #content>
				<page-analysis />
			</template>
		</core-settings-row>

		<core-sidebar-card
			v-if="displayTruSeoSidebarKeyphraseCard"
			slug="focus"
			:focusScore="focusKeyphraseScore"
			class="card-focus-keyphrase"
		>
			<template #header>
				<span>{{ strings.focusKeyphrase }}</span>

				<core-tooltip>
					<svg-circle-question-mark />

					<template #tooltip>
						<div v-html="strings.keyphraseDocumentation" />
					</template>
				</core-tooltip>
			</template>

			<focus-keyphrase />
		</core-sidebar-card>

		<core-sidebar-card
			v-if="displayTruSeoSidebarKeyphraseCard"
			slug="additional"
			:header-text="strings.additionalKeyphrases"
			class="card-additional-keyphrase"
		>
			<additional-keyphrases />
		</core-sidebar-card>

		<core-sidebar-card
			v-if="displayTruSeoSidebarAnalysisCard"
			slug="basicseo"
			:header-text="strings.basicSeo"
			:trueSeoScore="currentPost.page_analysis.analysis.basic.errors"
			class="card-basic-seo"
		>
			<metabox-analysis-detail :analysisItems="currentPost.page_analysis.analysis.basic" />
		</core-sidebar-card>

		<core-sidebar-card
			v-if="displayTruSeoSidebarAnalysisCard"
			slug="title"
			:header-text="strings.title"
			:trueSeoScore="currentPost.page_analysis.analysis.title.errors"
			class="card-title-seo"
		>
			<metabox-analysis-detail :analysisItems="currentPost.page_analysis.analysis.title" />
		</core-sidebar-card>

		<core-sidebar-card
			v-if="displayTruSeoSidebarAnalysisCard"
			slug="readability"
			:header-text="strings.readability"
			:trueSeoScore="currentPost.page_analysis.analysis.readability.errors"
			class="card-readability-seo"
		>
			<metabox-analysis-detail :analysisItems="currentPost.page_analysis.analysis.readability" />
		</core-sidebar-card>
	</div>
</template>
<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import { IsDirty, MaxCounts, SaveChanges, Tags, TruSeoScore } from '@/vue/mixins'
import { debounce } from '@/vue/utils/debounce'
import { isPageBuilderEditor } from '@/vue/utils/context'
import { truSeoShouldAnalyze } from '@/vue/plugins/tru-seo/components'
import AdditionalKeyphrases from './partials/general/AdditionalKeyphrases'
import AiGenerator from './partials/general/ai/Generator'
import BaseRadioToggle from '@/vue/components/common/base/RadioToggle'
import CoreAlert from '@/vue/components/common/core/alert/Index.vue'
import CoreGoogleSearchPreview from '@/vue/components/common/core/GoogleSearchPreview'
import CoreHtmlTagsEditor from '@/vue/components/common/core/HtmlTagsEditor'
import CoreSettingsRow from '@/vue/components/common/core/SettingsRow'
import CoreSidebarCard from '@/vue/components/common/core/SidebarCard'
import CoreTooltip from '@/vue/components/common/core/Tooltip'
import FocusKeyphrase from './partials/general/FocusKeyphrase'
import MetaboxAnalysisDetail from './partials/general/MetaboxAnalysisDetail'
import PageAnalysis from './partials/general/PageAnalysis'
import SvgCircleQuestionMark from '@/vue/components/common/svg/circle/QuestionMark'
import SvgDesktop from '@/vue/components/common/svg/Desktop'
import SvgMobile from '@/vue/components/common/svg/Mobile'
import SvgPencil from '@/vue/components/common/svg/Pencil'
export default {
	mixins     : [ IsDirty, MaxCounts, SaveChanges, Tags, TruSeoScore ],
	components : {
		AdditionalKeyphrases,
		AiGenerator,
		BaseRadioToggle,
		CoreAlert,
		CoreGoogleSearchPreview,
		CoreHtmlTagsEditor,
		CoreSettingsRow,
		CoreSidebarCard,
		CoreTooltip,
		FocusKeyphrase,
		MetaboxAnalysisDetail,
		PageAnalysis,
		SvgCircleQuestionMark,
		SvgDesktop,
		SvgMobile,
		SvgPencil
	},
	props : {
		disabled : {
			type : Boolean,
			default () {
				return false
			}
		},
		parentComponentContext : String
	},
	data () {
		return {
			isPageBuilderEditor,
			titleCount        : 0,
			descriptionCount  : 0,
			keywords          : null,
			keyphrases        : null,
			selectedKeyphrase : 0,
			editSnippet       : false,
			truSeo            : null,
			titleKey          : 'title' + 0,
			descriptionKey    : 'description' + 0,
			strings           : {
				pageName               : this.$t.__('General', this.$td),
				snippetPreview         : this.$t.__('Snippet Preview', this.$td),
				snippetPreviewContent  : this.$t.__('Snippet Preview content here.', this.$td),
				editSnippet            : this.$t.__('Edit Snippet', this.$td),
				clickToAddTitle        : this.$t.__('Click on the tags below to insert variables into your title.', this.$td),
				metaDescription        : this.$t.__('Meta Description', this.$td),
				clickToAddDescription  : this.$t.__('Click on the tags below to insert variables into your meta description.', this.$td),
				pillarContent          : this.$t.__('Pillar Content', this.$td),
				pillarContentCopy      : this.$t.__('Cornerstone content should be the most important and extensive articles on your site.', this.$td),
				focusKeyphrase         : this.$t.__('Focus Keyphrase', this.$td),
				additionalKeyphrases   : this.$t.__('Additional Keyphrases', this.$td),
				pageAnalysis           : this.$t.__('Page Analysis', this.$td),
				basicSeo               : this.$t.__('Basic SEO', this.$td),
				title                  : this.$t.__('Title', this.$td),
				readability            : this.$t.__('Readability', this.$td),
				lookingForMetaKeywords : this.$t.__('Looking for meta keywords?', this.$td),
				goToAdvancedTab        : this.$t.__('Go to the Advanced tab to add/edit meta keywords', this.$td),
				keyphraseDocumentation : this.$t.sprintf(
					// Translators: 1 - "Learn more link".
					this.$t.__('Not sure what keyphrases are used for? Check out our documentation for more information. %1$s', this.$td),
					this.$links.getDocLink(this.$constants.GLOBAL_STRINGS.learnMore, 'useKeyphrasesTooltip', true)
				)
			}
		}
	},
	watch : {
		'currentPost.title' () {
			debounce(() => this.runAnalysis({ postId: this.currentPost.id }), 750)
		},
		'currentPost.description' () {
			debounce(() => this.runAnalysis({ postId: this.currentPost.id }), 750)
		}
	},
	computed : {
		...mapState([ 'currentPost', 'options' ]),
		...mapState('live-tags', [ 'liveTags' ]),
		title () {
			return this.$t.sprintf(
				// Translators: 1 - The type of page (Post, Page, Category, Tag, etc.).
				this.$t.__('%1$s Title', this.$td),
				this.currentPost.type
			)
		},
		toggled : function () {
			return 1 === this.currentPost.pillar_content
		},
		displayTruSeoMetaboxCard () {
			return truSeoShouldAnalyze() && 'metabox' === this.$root._data.screenContext && 'post' === this.currentPost.context && 'attachment' !== this.currentPost.postType && 'modal' !== this.parentComponentContext && this.$allowed('aioseo_page_analysis') && !this.currentPost.isSpecialPage && !this.isForum
		},
		displayTruSeoSidebarKeyphraseCard () {
			return truSeoShouldAnalyze() && 'sidebar' === this.$root._data.screenContext && 'modal' !== this.parentComponentContext && this.$allowed('aioseo_page_analysis') && !this.currentPost.isSpecialPage && !this.isForum
		},
		displayTruSeoSidebarAnalysisCard () {
			return truSeoShouldAnalyze() && 'sidebar' === this.$root._data.screenContext && this.currentPost.page_analysis && 'modal' !== this.parentComponentContext && this.$allowed('aioseo_page_analysis') && !this.currentPost.isSpecialPage && !this.isForum
		},
		isForum () {
			if (('forum' === this.currentPost.postType || 'topic' === this.currentPost.postType || 'reply' === this.currentPost.postType) && window.aioseo.data.isBBPressActive) {
				return true
			}
			return false
		},
		focusKeyphraseScore () {
			if (!this.currentPost.keyphrases.focus.keyphrase) {
				return null
			}

			return this.currentPost.keyphrases.focus.score
		}
	},
	methods : {
		...mapActions([ 'openModal' ]),
		...mapMutations([ 'changeTabSettings' ]),
		hideKeywordsLooking () {
			this.options.searchAppearance.advanced.keywordsLooking = false
			this.saveChanges()
		},
		isMobilePreviewEv (ev) {
			this.changeGeneralPreview(ev)
		},
		editSnippetEv () {
			this.editSnippet = !this.editSnippet
			this.changeTabSettings({ setting: 'modal', value: 'general' })
			this.openModal(true)
		},
		getDefaultTags (location) {
			switch (location) {
				case 'title':
					return 'post' === this.currentPost.context
						? [
							'post_title',
							'separator_sa',
							'site_title'
						]
						: [
							'taxonomy_title',
							'separator_sa',
							'site_title'
						]
				case 'description':
					return 'post' === this.currentPost.context
						? (
							'attachment' === this.currentPost.postType
								? [
									'attachment_caption',
									'separator_sa',
									'site_title'
								]
								: 'product' === this.currentPost.postType
									? [
										'post_excerpt',
										'post_content'
									]
									: [
										'post_excerpt',
										'post_content',
										'separator_sa'
									]
						)
						: [
							'taxonomy_title',
							'separator_sa',
							'taxonomy_description'
						]
			}
		}
	},
	mounted () {
		this.keyphrases = this.currentPost.keyphrases
		if ('post' === this.currentPost.context && !this.currentPost.keyphrases.length) {
			this.selectedKeyphrase = -1
		}

		this.$bus.$on('updateTitleKey', () => {
			this.titleKey = 'title' + Math.random(0, 999)
		})

		this.$bus.$on('updateDescriptionKey', () => {
			this.descriptionKey = 'description' + Math.random(0, 999)
		})
	}
}
</script>
<style lang="scss">
.aioseo-post-general {
	svg.aioseo-circle-question-mark {
		width: 17px;
		height: 17px;
		color: $placeholder-color;
		transition: background-color 0.2s ease;

		&:hover {
			color: darken($placeholder-color, 20%);
		}
	}

	svg.aioseo-pencil {
		width: 12px;
		height: 12px;
		color: $black2;
	}

	.mobile-radio-buttons {
		margin: 0!important;
		padding: 0!important;
		border: 0;

		> .aioseo-col {
			padding: 0;
		}

		.aioseo-radio-toggle {
			justify-content: flex-end;
			&> div {
				margin-left: 10px;
			}
		}
	}

	.ismobile {
		max-width: 375px;
	}

	.edit-snippet,
	.add-keyphrase {
		margin-top: 12px;
		border: 1px solid $gray;

		svg {
			margin-right: 5px;
		}
	}
	.disabled-button {
		margin-top: 12px;
		border: 1px solid #dcdde1;
		color: #8c8f9a;
		background-color: #f3f4f5;
		cursor: default;
		height: 30px;
		font-size: 14px;
		padding: 0 12px;
		flex-shrink: 0;
		line-height: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		border-radius: 4px;
		-webkit-appearance: none;
		transition: background-color .2s ease;
		position: relative;
		overflow: hidden;
		text-decoration: none;
		white-space: nowrap;

		svg {
			margin-right: 5px;
		}
	}

	.aioseo-toggle {
		display: block;

		.toggle-content input:checked + .toggle-switch {
			border: 1px solid $green;
			background-color: $green;
		}
	}

	.aioseo-keyphrase-tag {
		display: inline-block;
		margin-right: 10px;
		margin-bottom: 16px;
		border-radius: 3px;
		font-size: 14px;
		font-weight: 700;

		&.selected {
			position: relative;

			&:before,
			&:after {
				content: '';
				position: absolute;
				display: block;
				z-index: 10;
				bottom: -17px;
				border-style: solid;
			}

			&:before {
				left: calc( 50% - 6px );
				border-width: 0 10px 10px 10px;
				border-color: transparent transparent $border transparent;
			}

			&:after {
				left: calc( 50% - 4px );
				border-width: 0 8px 8px 8px;
				border-color: transparent transparent #fff transparent;
			}
		}

		.aioseo-add-keyphrase-tag {
			display: block;
			padding: 9px 10px;
			border: 1px solid $background;
			border-radius: 3px;
			background: $background;
			cursor: pointer;

			&.hidden {
				opacity: 0;
				height: 0;
				padding: 0
			}
		}

		.keyphrase-name {
			cursor: pointer;
		}

		.keyphrase-edit {
			opacity: 0;
			margin: 0 8px;
			cursor: pointer;

			svg {
				&.aioseo-pencil {
					width: 12px;
					height: 12px;
					color: $placeholder-color;
				}
			}
		}

		.keyphrase-score {
			cursor: pointer;

			&.score-green {
				color: $green
			}

			&.score-orange {
				color: $orange
			}

			&.score-red {
				color: $red
			}
		}

		.aioseo-edit-keyphrase-tag {
			position: relative;

			> input {
				width: 100%;
				padding: 8px 10px;
				border: 1px solid $border;
				border-radius: 3px;
			}

			.keyphrase-delete {
				position: absolute;
				top: 2px;
				right: 10px;
				width: 16px;
				height: 16px;
				display: block;
				cursor: pointer;
				&:hover {
					color: $red;
				}
			}
		}

		&:hover {
			.keyphrase-edit {
				opacity: 1;
			}
		}
	}

	.focus-keyphrase-panel {
		.aioseo-analysis-detail {
			margin-bottom: 0;
		}
	}

	.analysis-wrapper {
		border-top: 1px solid $border;
	}

	.analysis-loading {
		position: relative;
		margin-top: 16px;
	}
}

.edit-post-sidebar {
	.aioseo-google-search-preview {
		.google-post {
			padding: 10px;
		}
	}

	.aioseo-button.edit-snippet {
		display: inline-flex;
	}

	.snippet-focus-keyphrases-row {
		border-bottom: none;
		margin-bottom: 0 !important;
	}

	.snippet-preview-row {
		padding-bottom: 0 !important;
		border-bottom: none;
	}

	.card-focus-keyphrase,
	.card-additional-keyphrase,
	.card-basic-seo,
	.card-title-seo,
	.card-readability-seo {
		margin: 0 -1rem;
		box-shadow: none;
		border: none;
		border-top: 1px solid $border;

		.header {
			padding: 1rem;
			border-bottom: none;
			font-size: 14px;
			font-weight: 700;
		}

		.content {
			padding: 24px 16px;
			font-size: 14px;
			border-top: 1px solid $border;
		}

		.aioseo-analysis-detail:last-of-type {
			margin-bottom: 0;

			.title {
				margin-bottom: 0;
			}
		}
	}

	.card-focus-keyphrase {
		.aioseo-analysis-detail {
			margin: 16px 0 !important;
			&:empty {
				margin: 16px;
			}
		}

		.add-keyphrase {
			width: 100%;
		}
	}

	.card-focus-keyphrase,
	.card-additional-keyphrase {
		.aioseo-analysis-detail {
			margin: 0 0 16px !important;
		}

		.add-keyphrase {
			width: 100%;
			margin-bottom: 16px;
		}
	}

	.card-readability-seo {
		border-bottom: 1px solid $border;
	}

	.aioseo-keyphrase-tag {
		display: block;
		margin-right: 0;
		margin-bottom: 10px;

		&:after {
			content: none !important;
		}

		&.selected {
			border: 2px solid $border;

			&:before,
			&:after {
				content: none;
			}
		}

		.aioseo-add-keyphrase-tag {
			display: flex;
			width: 100%;

			.keyphrase-score {
				flex: 1;
				text-align: right
			}
		}
	}

	.card-basic-seo,
	.card-title-seo,
	.card-readability-seo {
		.aioseo-analysis-detail {
			margin-top: 0;
		}
	}

	.analysis-wrapper {
		border-top: none;
	}
}

.aioseo-modal-content {
	> .aioseo-settings-row {
		border: none;
		margin-bottom: 0!important;
	}

	.aioseo-post-general > .mobile-radio-buttons {
		position: absolute;
		right: 40px;
		top: 18px;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.settings-name .name {
		font-size: 16px!important;
		margin-bottom: 6px!important;
	}

	.snippet-title-row,
	.snippet-description-row {
		position: relative;
		display: block;
		margin-top: 32px;

		.settings-name {
			margin-bottom: 8px;
		}

		.aioseo-description {
			display: none;
		}

		.add-tags {
			position: absolute;
			top: 0;
			right: 8px;
			margin: 0;

			.aioseo-add-template-tag {
				@media screen and (max-width: 520px) {
					display: none;
				}
			}
		}
	}

	.snippet-title-row {
		margin-top: 24px;
		padding-bottom: 24px !important;
	}

	.snippet-preview-row,
	.snippet-description-row {
		border: none;
		margin-bottom: 0!important;
		padding-bottom: 0!important;
	}

	.snippet-pillar-row {
		display: none;
	}

	.component-wrapper {
		.aioseo-settings-row>.aioseo-col {
			padding-top: .5rem!important;
		}

		.aioseo-tabs .md-button {
			&:not(.md-active) {
				min-width: 72px!important;
				margin: 0 !important;
			}

			&:hover {
				background-color: #e2e3e6;
			}

			&:before {
				border-radius: 100%!important;
				display: none;
			}

			.label {
				display: inline!important;
			}
		}
	}

	.mobile-radio-buttons {
		.aioseo-tabs .md-button:not(.md-active) {
			margin: 0!important;

			&:before {
				top: 0!important;
			}
		}
	}
}
</style>