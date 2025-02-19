<template>
	<div class="aioseo-search-appearance-global">
		<core-card
			slug="searchTitleSeparator"
			:header-text="strings.titleSeparator"
		>
			<core-settings-row
				:name="$constants.GLOBAL_STRINGS.preview"
			>
				<template #content>
					<core-google-search-preview
						:title="parseTags('#site_title #separator_sa #tagline')"
						:separator="options.searchAppearance.global.separator"
						:description="parseTags('#tagline')"
					/>
				</template>
			</core-settings-row>

			<core-settings-row
				:name="strings.separatorCharacter"
			>
				<template #content>
					<core-settings-separator
						:options-separator="options.searchAppearance.global.separator"
						@change="value => updateSeparator(value)"
						show-more-slug="searchShowMoreSeparators"
					/>
				</template>
			</core-settings-row>
		</core-card>

		<core-card
			slug="searchHomePage"
			:header-text="strings.homePage"
			id="home-page-settings"
		>
			<div
				v-if="$aioseo.data.staticHomePage"
				class="aioseo-settings-row aioseo-section-description"
			>
				<span v-html="strings.homePageDisabledDescription" />
				&nbsp;
				<span
					v-html="$links.getDocLink($constants.GLOBAL_STRINGS.learnMore, 'staticHomePage', true)"
				/>
			</div>

			<core-settings-row
				:name="$constants.GLOBAL_STRINGS.preview"
			>
				<template #content>
					<core-google-search-preview
						v-if="$aioseo.data.staticHomePage"
						:title="parseTags($aioseo.data.staticHomePageTitle || '#site_title')"
						:separator="options.searchAppearance.global.separator"
						:description="parseTags($aioseo.data.staticHomePageDescription || '#tagline')"
					/>

					<core-google-search-preview
						v-if="!$aioseo.data.staticHomePage"
						:title="parseTags(options.searchAppearance.global.siteTitle || '#site_title')"
						:separator="options.searchAppearance.global.separator"
						:description="parseTags(options.searchAppearance.global.metaDescription || '#tagline')"
					/>
				</template>
			</core-settings-row>

			<core-settings-row
				id="aioseo-home-page-site-title"
				v-if="!$aioseo.data.staticHomePage"
				:name="strings.siteTitle"
			>
				<template #content>
					<core-html-tags-editor
						v-model="options.searchAppearance.global.siteTitle"
						:line-numbers="false"
						single
						@counter="count => updateCount(count, 'titleCount')"
						tags-context="homePage"
						:default-tags="[
							'site_title',
							'separator_sa',
							'tagline'
						]"
					>
						<template #tags-description>
							{{ strings.clickToAddSiteTitle }}
						</template>
					</core-html-tags-editor>

					<div
						class="max-recommended-count"
						v-html="maxRecommendedCount(titleCount, 60)"
					/>
				</template>
			</core-settings-row>

			<core-settings-row
				id="aioseo-home-page-meta-description"
				v-if="!$aioseo.data.staticHomePage"
				:name="strings.metaDescription"
			>
				<template #content>
					<core-html-tags-editor
						v-model="options.searchAppearance.global.metaDescription"
						:line-numbers="false"
						description
						@counter="count => updateCount(count, 'descriptionCount')"
						tags-context="homePage"
						:default-tags="[
							'site_title',
							'separator_sa',
							'tagline'
						]"
					>
						<template #tags-description>
							{{ strings.clickToAddSiteDescription }}
						</template>
					</core-html-tags-editor>

					<div
						class="max-recommended-count"
						v-html="maxRecommendedCount(descriptionCount, 160)"
					/>
				</template>
			</core-settings-row>

			<core-settings-row
				v-if="options.searchAppearance.advanced.useKeywords && !$aioseo.data.staticHomePage"
				:name="strings.keywords"
				align
			>
				<template #content>
					<base-select
						multiple
						taggable
						:options="getJsonValue(options.searchAppearance.global.keywords, []) || []"
						:value="getJsonValue(options.searchAppearance.global.keywords, []) || []"
						@input="values => options.searchAppearance.global.keywords = setJsonValue(values)"
						:tag-placeholder="strings.tagPlaceholder"
					/>
				</template>
			</core-settings-row>
		</core-card>

		<core-card
			slug="searchSchema"
			:header-text="strings.knowledgeGraph"
		>
			<template #tooltip>
				{{ strings.knowledgeGraphDescription }}
			</template>

			<core-settings-row
				v-if="internalOptions.internal.deprecatedOptions.includes('enableSchemaMarkup')"
				:name="strings.enableSchemaMarkup"
				align
			>
				<template #content>
					<base-radio-toggle
						v-model="options.deprecated.searchAppearance.global.schema.enableSchemaMarkup"
						name="enableSchemaMarkup"
						:options="[
							{ label: $constants.GLOBAL_STRINGS.off, value: false, activeClass: 'dark' },
							{ label: $constants.GLOBAL_STRINGS.on, value: true }
						]"
					/>
				</template>
			</core-settings-row>

			<core-settings-row
				:name="strings.websiteName"
			>
				<template #content>
					<base-input
						size="medium"
						v-model="options.searchAppearance.global.schema.websiteName"
					/>

					<div class="aioseo-description">
						{{ strings.websiteNameDescription }}
					</div>
				</template>
			</core-settings-row>

			<core-settings-row
				:name="strings.websiteAlternateName"
			>
				<template #content>
					<base-input
						size="medium"
						v-model="options.searchAppearance.global.schema.websiteAlternateName"
					/>

					<div class="aioseo-description">
						{{ strings.websiteAlternateNameDescription }}
					</div>
				</template>
			</core-settings-row>

			<core-settings-row
				id="schema-graph-site-represents"
				:name="strings.personOrOrganization"
			>
				<template #content>
					<base-radio-toggle
						v-model="options.searchAppearance.global.schema.siteRepresents"
						name="siteRepresents"
						:options="[
							{ label: strings.person, value: 'person' },
							{ label: strings.organization, value: 'organization' }
						]"
					/>

					<div class="aioseo-description">
						{{ strings.personOrOrganizationDescription }}
					</div>
				</template>
			</core-settings-row>

			<core-settings-row
				v-if="'person' === options.searchAppearance.global.schema.siteRepresents"
				:name="strings.choosePerson"
			>
				<template #content>
					<base-select
						class="person-chooser"
						:options="users"
						:value="getPersonOptions(options.searchAppearance.global.schema.person)"
						@input="value => options.searchAppearance.global.schema.person = value.value"
					>
						<template #singleLabel="{ option }">
							<div class="person-label">
								<div
									v-if="option.gravatar"
									class="person-avatar"
								>
									<img
										alt="User Gravatar"
										:src="option.gravatar"
									/>
								</div>
								<div class="person-name">
									{{ option.label }}
								</div>
							</div>
						</template>

						<template #option="{ option }">
							<div class="person-label">
								<div
									v-if="option.gravatar"
									class="person-avatar"
								>
									<img
										alt="User Gravatar"
										:src="option.gravatar"
									/>
								</div>
								<div class="person-name">
									{{ option.label }}
								</div>
							</div>
						</template>
					</base-select>
				</template>
			</core-settings-row>

			<core-settings-row
				class="schema-graph-name"
				v-if="'organization' === options.searchAppearance.global.schema.siteRepresents"
				:name="name"
			>
				<template #content>
					<base-input
						size="medium"
						v-model="options.searchAppearance.global.schema.organizationName"
					/>
				</template>
			</core-settings-row>

			<core-settings-row
				class="schema-graph-name"
				v-if="'organization' !== options.searchAppearance.global.schema.siteRepresents && 'manual' === options.searchAppearance.global.schema.person"
				:name="name"
			>
				<template #content>
					<base-input
						size="medium"
						v-model="options.searchAppearance.global.schema.personName"
					/>
				</template>
			</core-settings-row>

			<core-settings-row
				id="schema-graph-phone"
				class="schema-graph-phone"
				v-if="'organization' === options.searchAppearance.global.schema.siteRepresents"
				:name="strings.phone"
			>
				<template #content>
					<base-phone
						v-model="options.searchAppearance.global.schema.phone"
					/>
				</template>
			</core-settings-row>

			<core-settings-row
				class="schema-graph-contact-type"
				v-if="'organization' === options.searchAppearance.global.schema.siteRepresents"
				:name="strings.contactType"
			>
				<template #content>
					<base-select
						size="medium"
						:options="$constants.CONTACT_TYPES"
						:placeholder="strings.chooseContactType"
						:value="getContactTypeOptions(options.searchAppearance.global.schema.contactType)"
						@input="value => options.searchAppearance.global.schema.contactType = value.value"
					/>

					<div class="aioseo-description">
						{{ strings.contactTypeDescription }}
					</div>
				</template>
			</core-settings-row>

			<core-settings-row
				class="schema-graph-contact-type-manual"
				v-if="'organization' === options.searchAppearance.global.schema.siteRepresents && 'manual' === options.searchAppearance.global.schema.contactType"
				:name="strings.contactType"
			>
				<template #content>
					<base-input
						size="medium"
						v-model="options.searchAppearance.global.schema.contactTypeManual"
					/>
				</template>
			</core-settings-row>

			<core-settings-row
				class="schema-graph-image"
				v-if="'organization' === options.searchAppearance.global.schema.siteRepresents"
				:name="strings.logo"
			>
				<template #content>
					<div class="image-upload">
						<base-input
							size="medium"
							v-model="options.searchAppearance.global.schema.organizationLogo"
							:placeholder="strings.pasteYourImageUrl"
						/>

						<base-button
							class="insert-image"
							@click="openUploadModal('organizationLogo', (imageUrl) => options.searchAppearance.global.schema.organizationLogo = imageUrl)"
							size="medium"
							type="black"
						>
							<svg-circle-plus />
							{{ strings.uploadOrSelectImage }}
						</base-button>

						<base-button
							class="remove-image"
							@click="options.searchAppearance.global.schema.organizationLogo = null"
							size="medium"
							type="gray"
						>
							{{ strings.remove }}
						</base-button>
					</div>

					<div class="aioseo-description">
						{{ strings.minimumSize }}
					</div>

					<base-img :src="options.searchAppearance.global.schema.organizationLogo" />
				</template>
			</core-settings-row>

			<core-settings-row
				class="schema-graph-image"
				v-if="'organization' !== options.searchAppearance.global.schema.siteRepresents && 'manual' === options.searchAppearance.global.schema.person"
				:name="strings.logo"
			>
				<template #content>
					<div class="image-upload">
						<base-input
							size="medium"
							v-model="options.searchAppearance.global.schema.personLogo"
							:placeholder="strings.pasteYourImageUrl"
						/>

						<base-button
							class="insert-image"
							@click="openUploadModal('personLogo', (imageUrl) => options.searchAppearance.global.schema.personLogo = imageUrl)"
							size="medium"
							type="black"
						>
							<svg-circle-plus />
							{{ strings.uploadOrSelectImage }}
						</base-button>

						<base-button
							class="remove-image"
							@click="options.searchAppearance.global.schema.personLogo = null"
							size="medium"
							type="gray"
						>
							{{ strings.remove }}
						</base-button>
					</div>

					<div class="aioseo-description">
						{{ strings.minimumSize }}
					</div>

					<base-img :src="options.searchAppearance.global.schema.personLogo" />
				</template>
			</core-settings-row>

			<div class="aioseo-settings-row local-seo">
				<svg-local-seo />
				<div class="local-seo-text">
					<div v-html="strings.goToLocalSeo" />
					<base-button
						size="medium"
						type="blue"
						tag="a"
						:href="$aioseo.urls.aio.localSeo"
					>
						{{ strings.goToLocalSeoSettings }}
					</base-button>
				</div>
			</div>
		</core-card>
	</div>
</template>

<script>
import { JsonValues, MaxCounts, Tags, Uploader } from '@/vue/mixins'
import { mapState } from 'vuex'
import BaseImg from '@/vue/components/common/base/Img'
import BasePhone from '@/vue/components/common/base/Phone'
import BaseRadioToggle from '@/vue/components/common/base/RadioToggle'
import CoreCard from '@/vue/components/common/core/Card'
import CoreGoogleSearchPreview from '@/vue/components/common/core/GoogleSearchPreview'
import CoreHtmlTagsEditor from '@/vue/components/common/core/HtmlTagsEditor'
import CoreSettingsRow from '@/vue/components/common/core/SettingsRow'
import CoreSettingsSeparator from '@/vue/components/common/core/SettingsSeparator'
import SvgCirclePlus from '@/vue/components/common/svg/circle/Plus'
import SvgLocalSeo from '@/vue/components/common/svg/local/Seo'
export default {
	components : {
		BaseImg,
		BasePhone,
		BaseRadioToggle,
		CoreCard,
		CoreGoogleSearchPreview,
		CoreHtmlTagsEditor,
		CoreSettingsRow,
		CoreSettingsSeparator,
		SvgCirclePlus,
		SvgLocalSeo
	},
	mixins : [ JsonValues, MaxCounts, Tags, Uploader ],
	data () {
		return {
			titleCount       : 0,
			descriptionCount : 0,
			strings          : {
				titleSeparator              : this.$t.__('Title Separator', this.$td),
				separatorCharacter          : this.$t.__('Separator Character', this.$td),
				homePageDisabledDescription : this.$t.sprintf(
					// Translators: 1 - Opening HTML link tag, 2 - Closing HTML link tag.
					this.$t.__('You are using a static home page which is found under Pages. You can %1$sedit your home page settings%2$s directly to change the title and description.', this.$td),
					`<a href="${this.$aioseo.urls.staticHomePage}&aioseo-scroll=aioseo-post-settings-post-title-row&aioseo-highlight=aioseo-post-settings-post-title-row,aioseo-post-settings-meta-description-row">`,
					'</a>'
				),
				homePage                        : this.$t.__('Home Page', this.$td),
				siteTitle                       : this.$t.__('Site Title', this.$td),
				clickToAddSiteTitle             : this.$t.__('Click on the tags below to insert variables into your site title.', this.$td),
				metaDescription                 : this.$t.__('Meta Description', this.$td),
				clickToAddSiteDescription       : this.$t.__('Click on the tags below to insert variables into your meta description.', this.$td),
				knowledgeGraph                  : this.$t.__('Knowledge Graph', this.$td),
				knowledgeGraphDescription       : this.$t.__('Google, Bing and other search engines use specific data from your schema markup to output data in their Knowledge Panels. This data is known as the Knowledge Graph. Use these settings to change how that data looks.', this.$td),
				personOrOrganization            : this.$t.__('Person or Organization', this.$td),
				person                          : this.$t.__('Person', this.$td),
				organization                    : this.$t.__('Organization', this.$td),
				personOrOrganizationDescription : this.$t.__('Choose whether the site represents a person or an organization.', this.$td),
				choosePerson                    : this.$t.__('Choose a Person', this.$td),
				organizationName                : this.$t.__('Organization Name', this.$td),
				personName                      : this.$t.__('Person Name', this.$td),
				phone                           : this.$t.__('Phone Number', this.$td),
				chooseContactType               : this.$t.__('Choose a Contact Type', this.$td),
				contactType                     : this.$t.__('Contact Type', this.$td),
				contactTypeDescription          : this.$t.__('Select which team or department the phone number belongs to.', this.$td),
				logo                            : this.$t.__('Logo', this.$td),
				uploadOrSelectImage             : this.$t.__('Upload or Select Image', this.$td),
				pasteYourImageUrl               : this.$t.__('Paste your image URL or select a new image', this.$td),
				minimumSize                     : this.$t.__('Minimum size: 112px x 112px, The image must be in JPG, PNG, GIF, SVG, or WEBP format.', this.$td),
				remove                          : this.$t.__('Remove', this.$td),
				goToLocalSeo                    : this.$t.sprintf(
					// Translators: 1 - Opening HTML bold tag, 2 - Closing HTML bold tag., 3 - "Pro", 4 - "Pro".
					this.$t.__('Go to %1$sLocal SEO Settings%2$s and set up your local business info like location address, opening hours (%3$s), and Google Maps settings (%4$s).', this.$td),
					 '<strong>',
					'</strong>',
					'Pro',
					'Pro'
				),
				goToLocalSeoSettings            : this.$t.__('Go to Local SEO Settings', this.$td),
				enableSchemaMarkup              : this.$t.__('Enable Schema Markup', this.$td),
				keywords                        : this.$t.__('Keywords', this.$td),
				tagPlaceholder                  : this.$t.__('Press enter to create a keyword', this.$td),
				websiteName                     : this.$t.__('Website Name', this.$td),
				websiteNameDescription          : this.$t.__('A name that Google may use for your homepage in mobile search results. This will default to the WordPress site title if left blank.', this.$td),
				websiteAlternateName            : this.$t.__('Alternate Website Name', this.$td),
				websiteAlternateNameDescription : this.$t.__('An alternate name for your site. This could be an acronym or shorter version of your website name.', this.$td)
			}
		}
	},
	computed : {
		...mapState([ 'options', 'internalOptions' ]),
		users () {
			return [ {
				label : this.$t.__('Manually Enter Person', this.$td),
				value : 'manual'
			} ].concat(this.$aioseo.users.map(u => ({
				label    : `${u.displayName} (${u.email})`,
				gravatar : u.gravatar,
				value    : u.id
			})))
		},
		name () {
			if ('organization' === this.options.searchAppearance.global.schema.siteRepresents) {
				return this.strings.organizationName
			}

			return this.strings.personName
		}
	},
	methods : {
		getPersonOptions (option) {
			return this.users.find(u => option && u.value.toString() === option.toString())
		},
		getContactTypeOptions (option) {
			return this.$constants.CONTACT_TYPES.find(t => t.value === option)
		},
		updateSeparator (value) {
			const separatorTagIndex = this.tags.tags.findIndex(x => 'separator_sa' === x.id)
			if (-1 !== separatorTagIndex) {
				this.tags.tags[separatorTagIndex].value = value
			}

			this.options.searchAppearance.global.separator = value
		}
	}
}
</script>

<style lang="scss">
.aioseo-search-appearance-global {
	.schema-graph-name,
	.schema-graph-contact-type-manual {
		margin-bottom: 16px;

		.aioseo-input {
			max-width: 600px;
		}
	}
	.schema-graph-contact-type {
		margin-bottom: 16px;

		.aioseo-select {
			max-width: 300px;
		}
	}

	.schema-graph-image {
		margin-bottom: 16px;

		.image-upload {
			display: flex;

			.aioseo-input-container {
				width: 100%;
				max-width: 445px;
				margin-right: 10px;

				.aioseo-input {
					width: 100%;
				}
			}

			.insert-image {
				min-width: 214px;
				margin-right: 10px;

				svg.aioseo-circle-plus {
					width: 13px;
					height: 13px;
					margin-right: 10px;
				}
			}
		}

		img {
			margin-top: 20px;
			width: auto;
			max-width: 525px;
			max-height: 525px;
			height: auto;
		}
	}

	.person-chooser {
		max-width: 600px;

		.person-label {
			display: flex;
			align-items: center;

			.person-avatar {
				margin-right: 16px;
				height: 30px;

				img {
					height: 30px;
					width: 30px;
					border-radius: 50%;
				}
			}
		}
	}

	.aioseo-settings-row.local-seo {
		display: flex;
		align-items: center;
		background: $box-background;

		.local-seo-text {
			line-height: 1.4;
			font-size: 16px;
			color: $black;
			max-width: 550px;

			.aioseo-button {
				margin-top: 10px;
			}
		}

		svg.aioseo-local-seo {
			width: 139px;
			height: 106px;
			margin-right: 60px;
		}

		// Override of global settings.
		&:last-child {
			padding: 30px;
		}
	}
}
</style>