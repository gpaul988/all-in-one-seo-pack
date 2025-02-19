<template>
	<div class="aioseo-search-appearance-taxonomies">
		<core-card
			v-for="(taxonomy, index) in taxonomies"
			:key="index"
			:slug="`${taxonomy.name}SA`"
		>
			<template #header>
				<div
					class="icon dashicons"
					:class="`${taxonomy.icon || 'dashicons-admin-post'}`"
				/>

				{{ taxonomy.label }}

				<core-tooltip
					z-index="99999"
				>
					<svg-circle-question-mark />

					<template #tooltip>
						<div class="aioseo-description">
							{{ strings.label }} <strong>{{ taxonomy.label }}</strong><br>
							{{ strings.name }} <strong>{{ taxonomy.name }}</strong><br>
							{{ strings.postTypes }}<br>

							<ul>
								<template
									v-for="(postType, index) in taxonomy.postTypes"
								>
									<li
										:key="index"
									>
										<strong>{{ postType }}</strong>
									</li>
								</template>
							</ul>
						</div>
					</template>
				</core-tooltip>
			</template>

			<template
				#tabs
			>
				<core-main-tabs
					:tabs="tabs"
					:showSaveButton="false"
					:active="settings.internalTabs[`${taxonomy.name}SA`]"
					internal
					@changed="value => processChangeTab(taxonomy.name, value)"
				/>
			</template>

			<transition
				name="route-fade" mode="out-in"
			>
				<component
					:is="settings.internalTabs[`${taxonomy.name}SA`]"
					:object="taxonomy"
					:separator="options.searchAppearance.global.separator"
					:options="dynamicOptions.searchAppearance.taxonomies[taxonomy.name]"
					type="taxonomies"
					:show-bulk="false"
				/>
			</transition>
		</core-card>
	</div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import Advanced from './partials/Advanced'
import CoreCard from '@/vue/components/common/core/Card'
import CoreMainTabs from '@/vue/components/common/core/main/Tabs'
import CoreTooltip from '@/vue/components/common/core/Tooltip'
import SvgCircleQuestionMark from '@/vue/components/common/svg/circle/QuestionMark'
import TitleDescription from './partials/TitleDescription'
export default {
	components : {
		Advanced,
		CoreCard,
		CoreMainTabs,
		CoreTooltip,
		SvgCircleQuestionMark,
		TitleDescription
	},
	data () {
		return {
			internalDebounce : null,
			strings          : {
				label          : this.$t.__('Label:', this.$td),
				name           : this.$t.__('Slug:', this.$td),
				postTypes      : this.$t.__('Post Types:', this.$td),
				ctaButtonText  : this.$t.__('Upgrade to Pro and Unlock Custom Taxonomies', this.$td),
				ctaDescription : this.$t.sprintf(
					// Translators: 1 - The plugin short name ("AIOSEO"), 2 - "Pro".
					this.$t.__('%1$s %2$s lets you set the SEO title and description for custom taxonomies. You can also control all of the robots meta and other options just like the default category and tags taxonomies.', this.$td),
					import.meta.env.VITE_SHORT_NAME,
					'Pro'
				),
				ctaHeader : this.$t.sprintf(
					// Translators: 1 - Plugin short name ("AIOSEO"), 2 - "Pro".
					this.$t.__('Custom Taxonomy Support is only available for licensed %1$s %2$s users.', this.$td),
					import.meta.env.VITE_SHORT_NAME,
					'Pro'
				)
			},
			tabs : [
				{
					slug   : 'title-description',
					name   : this.$t.__('Title & Description', this.$td),
					access : 'aioseo_search_appearance_settings',
					pro    : false
				},
				{
					slug   : 'advanced',
					name   : this.$t.__('Advanced', this.$tdPro),
					access : 'aioseo_search_appearance_settings',
					pro    : false
				}
			]
		}
	},
	computed : {
		...mapGetters([ 'isUnlicensed' ]),
		...mapState([ 'options', 'dynamicOptions', 'settings' ]),
		taxonomies () {
			return this.$aioseo.postData.taxonomies
		}
	},
	methods : {
		...mapActions([ 'changeTab' ]),
		processChangeTab (taxonomy, value) {
			if (this.internalDebounce) {
				return
			}

			this.internalDebounce = true
			this.changeTab({ slug: `${taxonomy}SA`, value })

			// Debouncing a little here to save extra API calls.
			setTimeout(() => {
				this.internalDebounce = false
			}, 50)
		}
	}
}
</script>

<style lang="scss">
.aioseo-search-appearance-taxonomies {
	.icon {
		display: flex;
		align-items: center;
		margin-right: 16px;
	}

	.aioseo-description {
		ul {
			list-style: initial;
			list-style-position: inside;
			margin: 0;

			li {
				padding-left: 5px;
			}
		}
	}
}
</style>