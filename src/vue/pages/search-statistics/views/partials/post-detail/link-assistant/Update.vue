<template>
	<div class="aioseo-search-statistics-link-assistant">
		<blur />

		<cta :type="4">
			<template #header-text>
				{{ strings.ctaHeader }}
			</template>
			<template #description>
				{{ strings.ctaDescription }}

				<base-button
					type="blue"
					tag="a"
					:href="$aioseo.urls.aio.linkAssistant"
					size="small"
				>
					{{ strings.updateLinkAssistant }}
				</base-button>
			</template>
		</cta>
	</div>
</template>

<script>
import Blur from './Blur'
import Cta from '@/vue/components/common/cta/Index.vue'
export default {
	components : {
		Blur,
		Cta
	},
	data () {
		return {
			strings : {
				ctaHeader           : this.$t.__('Update Link Assistant to the latest version', this.$tdPro),
				ctaDescription      : this.$t.__('Get internal link suggestions for all your content including orphaned posts that have no internal links.', this.$td),
				updateLinkAssistant : this.$t.__('Update Link Assistant', this.$td)
			}
		}
	}
}
</script>