<template>
	<div>
	<core-settings-row
		:name="archive.label"
		:key="archive.name"
		v-for="archive in archives"
	>
		<template #content>
			<div>
				<preview
					:preview-data="getPreview(archive)"
					:useDefaultTemplate="dynamicOptions.breadcrumbs.archives.postTypes[archive.name].useDefaultTemplate"
				/>

				<grid-row>
					<grid-column>
						<base-toggle
							v-model="dynamicOptions.breadcrumbs.archives.postTypes[archive.name].useDefaultTemplate"
							class="current-item"
						/>
						{{ strings.useDefaultTemplate }}
					</grid-column>
				</grid-row>

				<grid-row v-if="!dynamicOptions.breadcrumbs.archives.postTypes[archive.name].useDefaultTemplate">
					<grid-column
						 v-if="options.breadcrumbs.breadcrumbPrefix && options.breadcrumbs.breadcrumbPrefix.length"
					>
						<base-toggle
							v-model="dynamicOptions.breadcrumbs.archives.postTypes[archive.name].showPrefixCrumb"
							class="current-item"
						/>
						{{ strings.showPrefixLabel }}
					</grid-column>

					<grid-column>
						<base-toggle
							v-model="dynamicOptions.breadcrumbs.archives.postTypes[archive.name].showHomeCrumb"
							class="current-item"
						/>
						{{ strings.showHomeLabel }}
					</grid-column>

					<grid-column>
						<core-html-tags-editor
							v-model="dynamicOptions.breadcrumbs.archives.postTypes[archive.name].template"
							:line-numbers="true"
							checkUnfilteredHtml
							:tags-context="'breadcrumbs-post-type-archive-'+archive.name"
							:minimum-line-numbers="3"
							:default-tags="[
								'breadcrumb_archive_post_type_format',
								'breadcrumb_archive_post_type_name',
								'breadcrumb_link'
							]"
						/>
					</grid-column>
				</grid-row>
			</div>
		</template>
	</core-settings-row>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import CoreHtmlTagsEditor from '@/vue/components/common/core/HtmlTagsEditor'
import CoreSettingsRow from '@/vue/components/common/core/SettingsRow'
import GridColumn from '@/vue/components/common/grid/Column'
import GridRow from '@/vue/components/common/grid/Row'
import Preview from './Preview'
export default {
	components : {
		CoreHtmlTagsEditor,
		CoreSettingsRow,
		GridColumn,
		GridRow,
		Preview
	},
	data () {
		return {
			strings : {
				useDefaultTemplate : this.$t.__('Use a default template', this.$td),
				showHomeLabel      : this.$t.__('Show homepage link', this.$td),
				showPrefixLabel    : this.$t.__('Show prefix link', this.$td)
			}
		}
	},
	methods : {
		getPreview (archive) {
			const breadcrumbOptions = this.options.breadcrumbs
			const archiveOptions = this.dynamicOptions.breadcrumbs.archives.postTypes[archive.name]
			const useDefault = archiveOptions.useDefaultTemplate
			return [
				(useDefault && breadcrumbOptions.breadcrumbPrefix) || (!useDefault && archiveOptions.showPrefixCrumb) ? breadcrumbOptions.breadcrumbPrefix : '',
				(useDefault && breadcrumbOptions.homepageLink) || (!useDefault && archiveOptions.showHomeCrumb) ? (breadcrumbOptions.homepageLabel ? breadcrumbOptions.homepageLabel : 'Home') : '',
				breadcrumbOptions.showBlogHome && this.$aioseo.data.staticBlogPage && 'post' === archive.name ? 'Blog Home' : '',
				this.getArchiveTemplate(archive)
			]
		},
		getArchiveTemplate (archive) {
			const template = this.dynamicOptions.breadcrumbs.archives.postTypes[archive.name].useDefaultTemplate ? this.$aioseo.breadcrumbs.defaultTemplates.archives.postTypes[archive.name] : this.dynamicOptions.breadcrumbs.archives.postTypes[archive.name].template
			return template.replace(/#breadcrumb_archive_post_type_format/g, this.options.breadcrumbs.archiveFormat).replace(new RegExp('#breadcrumb_archive_post_type_name', 'g'), archive.label)
		}
	},
	computed : {
		...mapState([ 'options', 'dynamicOptions' ]),
		archives () {
			return this.$aioseo.postData.archives
		}
	}
}
</script>