<template>
	<div class="aioseo-search-appearance-content-types">
		<core-card
			v-for="(postType, index) in postTypes"
			:key="index"
			:slug="`${postType.name}SA`"
		>
			<template #header>
				<div
					class="icon dashicons"
					:class="`${postType.icon || 'dashicons-admin-post'}`"
				/>

				{{ postType.label }}

				<core-tooltip
					z-index="99999"
				>
					<svg-circle-question-mark />

					<template #tooltip>
						<div class="aioseo-description">
							{{ strings.label }} <strong>{{ postType.label }}</strong><br>
							{{ strings.name }} <strong>{{ postType.name }}</strong><br>
						</div>
					</template>
				</core-tooltip>
			</template>

			<template #tabs>
				<core-main-tabs
					:tabs="tabs"
					:showSaveButton="false"
					:active="settings.internalTabs[`${postType.name}SA`]"
					internal
					@changed="value => processChangeTab(postType.name, value)"
				/>
			</template>

			<transition name="route-fade" mode="out-in">
				<component
					:is="settings.internalTabs[`${postType.name}SA`]"
					:object="postType"
					:separator="options.searchAppearance.global.separator"
					:options="dynamicOptions.searchAppearance.postTypes[postType.name]"
					type="postTypes"
				/>
			</transition>
		</core-card>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import Advanced from './partials/Advanced'
import CoreCard from '@/vue/components/common/core/Card'
import CoreMainTabs from '@/vue/components/common/core/main/Tabs'
import CoreTooltip from '@/vue/components/common/core/Tooltip'
import CustomFields from './partials/CustomFields'
import Schema from './partials/Schema'
import SvgCircleQuestionMark from '@/vue/components/common/svg/circle/QuestionMark'
import TitleDescription from './partials/TitleDescription'
export default {
	components : {
		Advanced,
		CoreCard,
		CoreMainTabs,
		CoreTooltip,
		CustomFields,
		Schema,
		SvgCircleQuestionMark,
		TitleDescription
	},
	data () {
		return {
			internalDebounce : null,
			strings          : {
				label : this.$t.__('Label:', this.$td),
				name  : this.$t.__('Slug:', this.$td)
			},
			tabs : [
				{
					slug   : 'title-description',
					name   : this.$t.__('Title & Description', this.$td),
					access : 'aioseo_search_appearance_settings',
					pro    : false
				},
				{
					slug   : 'schema',
					name   : this.$t.__('Schema Markup', this.$td),
					access : 'aioseo_search_appearance_settings',
					pro    : true
				},
				{
					slug   : 'custom-fields',
					name   : this.$t.__('Custom Fields', this.$td),
					access : 'aioseo_search_appearance_settings',
					pro    : true
				},
				{
					slug   : 'advanced',
					name   : this.$t.__('Advanced', this.$td),
					access : 'aioseo_search_appearance_settings',
					pro    : false
				}
			]
		}
	},
	computed : {
		...mapState([ 'options', 'dynamicOptions', 'settings' ]),
		postTypes () {
			return this.$aioseo.postData.postTypes
				.filter(pt => 'attachment' !== pt.name)
		}
	},
	methods : {
		...mapActions([ 'changeTab' ]),
		processChangeTab (postType, value) {
			if (this.internalDebounce) {
				return
			}

			this.internalDebounce = true
			this.changeTab({ slug: `${postType}SA`, value })

			// Debouncing a little here to save extra API calls.
			setTimeout(() => {
				this.internalDebounce = false
			}, 50)
		}
	}
}
</script>

<style lang="scss">
.aioseo-search-appearance-content-types {
	.icon {
		display: flex;
		align-items: center;
		margin-right: 16px;
	}
}
</style>