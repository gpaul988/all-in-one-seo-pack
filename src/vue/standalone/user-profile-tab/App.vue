<template>
	<div id="aioseo-user-profile-tab">
		<div class="navigation-bar">
			<a
				v-for="(tabObject, index) in tabs"
				:key="index"
				:class="{ active: index === activeTabIndex }"
				href="#"
				@click="setActiveTab(index)"
			>
				<component
					v-if="tabObject.svg"
					:is="tabObject.svg"
				/>

				{{ tabObject.label }}
			</a>
		</div>

		<CoreCard
			slug="userProfiles"
			:header-text="strings.socialProfiles"
			no-slide
			:toggles="false"
			v-if="'social-profiles' === activeTabObject.slug"
		>
			<div class="aioseo-settings-row aioseo-section-description">
				{{ strings.description }}
			</div>

			<CoreSocialProfiles
				:userProfiles="userProfile.profiles"
				@updated="newSocialProfiles => updateHiddenInputField(newSocialProfiles)"
			/>
		</CoreCard>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { setOptions } from '@/vue/utils/options'
import { merge } from 'lodash-es'

import CoreCard from '@/vue/components/common/core/Card'
import CoreSocialProfiles from '@/vue/components/common/core/SocialProfiles'
import SvgLogoGear from '@/vue/components/common/svg/aioseo/LogoGear'

export default {
	components : {
		CoreCard,
		CoreSocialProfiles,
		SvgLogoGear
	},
	data () {
		return {
			activeTabIndex : 0,
			strings        : {
				socialProfiles : this.$t.__('Social Profiles', this.$td),
				description    : this.$t.__('To let search engines know which profiles are associated with this user, enter them below:', this.$td)
			}
		}
	},
	methods : {
		setActiveTab (index) {
			const originalTabIndex = this.activeTabIndex
			this.activeTabIndex    = index

			switch (this.activeTabObject.slug) {
				case 'personal-options':
					document.getElementById('your-profile').childNodes.forEach(node => {
						if (node.style) {
							node.style.display = 'block'
						}
					})
					break
				case 'social-profiles':
					document.getElementById('your-profile').childNodes.forEach(node => {
						if (
							'aioseo-user-profile-tab' === node.id ||
							'submit' === node.className ||
							!node.style
						) {
							return
						}

						node.style.display = 'none'
					})
					break
				case 'customer-data':
					// Reset back to original tab index so that the screen isn't blank while we're loading the new page.
					this.activeTabIndex = originalTabIndex

					window.location.href = this.$aioseo.urls.home +
						'/wp-admin/admin.php?page=followup-emails-reports&tab=reportuser_view&email=' + encodeURIComponent(this.userProfile.userData.user_email) +
						'&user_id=' + this.userProfile.userData.ID
					break
				default:
					break
			}
		},
		updateHiddenInputField (newSocialProfiles) {
			document.getElementById('aioseo-user-social-profiles').value = JSON.stringify(newSocialProfiles)
		}
	},
	computed : {
		...mapState([ 'userProfile', 'options' ]),
		tabs () {
			const tabs = [
				{
					label : this.$t.__('Personal Options', this.$td),
					slug  : 'personal-options'
				},
				{
					label : this.$t.__('Social Profiles', this.$td),
					slug  : 'social-profiles',
					svg   : 'svg-logo-gear'
				}
			]

			if (this.userProfile.isWooCommerceFollowupEmailsActive) {
				tabs.push({
					label : this.$t.__('Customer Data', this.$td),
					slug  : 'customer-data'
				})
			}

			return tabs
		},
		activeTabObject () {
			return this.tabs[this.activeTabIndex]
		}
	},
	created () {
		if (!this.$store.state.loaded) {
			setOptions({})
		}

		// We're populating only the userProfile store since that's the only data we need here.
		this.$set(this.$store.state, 'userProfile', merge({ ...this.$store.state.userProfile }, { ...this.$aioseo.userProfile }))
		this.$set(this.$store.state, 'options', merge({ ...this.$store.state.options }, { ...this.$aioseo.options }))
		this.$set(this.$store.state, 'settings', merge({ ...this.$store.state.settings }, { ...this.$aioseo.settings }))

		// Set the initial values.
		this.updateHiddenInputField(this.userProfile.profiles)
	},
	mounted () {
		const params = new URLSearchParams(window.location.search)
		if (params && params.get('social-profiles')) {
			this.setActiveTab(1)
		}
	}
}
</script>

<style lang="scss">
// Hide the nav bar from WooCommerce Follow-up Emails.
h2.woo-nav-tab-wrapper {
	display: none !important;
}

#aioseo-user-profile-tab {
	max-width: 1220px;

	.navigation-bar {
		border-bottom: 1px solid #c3c4c7;
		margin: 0;
		padding-top: 9px;
		padding-bottom: 0;
		line-height: inherit;

		a {
			display: flex;
			align-items: center;

			float: left;
			border: 1px solid #c3c4c7;
			border-bottom: none;
			margin-left: 0.5em;
			padding: 5px 10px;
			font-size: 14px;
			line-height: 1.71428571;
			font-weight: 600;
			background: #dcdcde;
			color: #50575e;
			text-decoration: none;
			white-space: nowrap;

			&:hover {
				background-color: #fff;
				color: #3c434a;
			}

			&.active,
			&.active:hover {
				margin-bottom: -1px;
				color: #3c434a;
				background-color: #f1f1f1;
				border-bottom: 1px solid #f0f0f1;
				border-bottom-color: #f1f1f1;
			}

			svg {
				width: 20px;
				height: 20px;
				margin-right: 8px;
			}
		}

		&:after {
			content: "";
			display: table;
			clear: both;
		}
	}

	.aioseo-section-description {
		font-size: 16px;
		color: #141B38;
		line-height: 1.8;
		padding-bottom: 30px;
	}

	.aioseo-description {
		font-size: 14px;
		line-height: 1.8;
		margin: 8px 0 0;
		color: #141b38;
	}
}
</style>