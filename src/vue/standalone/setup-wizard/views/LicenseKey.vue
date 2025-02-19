<template>
	<div class="aioseo-wizard-license-key">
		<wizard-header />
		<wizard-container>
			<wizard-body>
				<wizard-steps />

				<div class="header">
					{{ strings.enterYourLicenseKey }}
				</div>

				<div
					v-if="!$isPro"
					class="description"
					v-html="noLicenseNeeded"
				/>

				<div class="license-cta-box">
					<div v-html="tooltipText" />

					<br>

					<grid-row>
						<grid-column
							sm="6"
							v-for="(feature, index) in getSelectedUpsellFeatures"
							:key="index"
						>
							<svg-checkmark />
							{{ feature.name }}
						</grid-column>
					</grid-row>
				</div>

				<div
					v-if="!$isPro"
					v-html="alreadyPurchased"
				/>

				<form class="license-key">
					<input type="text" name="username" autocomplete="username" style="display:none;" />
					<base-input
						type="password"
						:placeholder="strings.placeholder"
						:append-icon="localLicenseKey ? 'circle-check' : null"
						autocomplete="new-password"
						v-model="localLicenseKey"
					/>
					<base-button
						type="green"
						:disabled="!localLicenseKey"
						:loading="loading"
						@click="processConnectOrActivate"
					>
						{{ strings.connect }}
					</base-button>
				</form>

				<core-alert
					class="license-key-error"
					v-if="error"
					type="red"
					v-html="error"
				/>

				<template #footer>
					<div class="go-back">
						<router-link :to="getPrevLink" class="no-underline">&larr;</router-link>
						&nbsp;
						<router-link :to="getPrevLink">{{ strings.goBack }}</router-link>
					</div>
					<div class="spacer"></div>
					<base-button
						type="gray"
						@click="skipStep"
					>{{ strings.skipThisStep }}</base-button>
				</template>
			</wizard-body>

			<wizard-close-and-exit />
		</wizard-container>
	</div>
</template>

<script>
import { popup } from '@/vue/utils/popup'
import { Wizard } from '@/vue/mixins'
import { mapActions, mapMutations, mapState } from 'vuex'
import CoreAlert from '@/vue/components/common/core/alert/Index.vue'
import GridColumn from '@/vue/components/common/grid/Column'
import GridRow from '@/vue/components/common/grid/Row'
import SvgCheckmark from '@/vue/components/common/svg/Checkmark'
import WizardBody from '@/vue/components/common/wizard/Body'
import WizardCloseAndExit from '@/vue/components/common/wizard/CloseAndExit'
import WizardContainer from '@/vue/components/common/wizard/Container'
import WizardHeader from '@/vue/components/common/wizard/Header'
import WizardSteps from '@/vue/components/common/wizard/Steps'
export default {
	components : {
		CoreAlert,
		GridColumn,
		GridRow,
		SvgCheckmark,
		WizardBody,
		WizardCloseAndExit,
		WizardContainer,
		WizardHeader,
		WizardSteps
	},
	mixins : [ Wizard ],
	data () {
		return {
			error           : null,
			loading         : false,
			stage           : 'license-key',
			localLicenseKey : null,
			strings         : {
				enterYourLicenseKey : this.$t.sprintf(
					// Translators: 1 - The plugin short name ("AIOSEO").
					this.$t.__('Enter your %1$s License Key', this.$td),
					import.meta.env.VITE_SHORT_NAME
				),
				boldText : this.$t.sprintf(
					'<strong>%1$s %2$s</strong>',
					import.meta.env.VITE_SHORT_NAME,
					'Lite'
				),
				purchasedBoldText : this.$t.sprintf(
					'<strong>%1$s %2$s</strong>',
					import.meta.env.VITE_SHORT_NAME,
					'Pro'
				),
				linkText : this.$t.sprintf(
					// Translators: 1 - "Pro".
					this.$t.__('upgrade to %1$s', this.$td),
					'Pro'
				),
				placeholder : this.$t.__('Paste your license key here', this.$td),
				connect     : this.$t.__('Connect', this.$td)
			}
		}
	},
	watch : {
		localLicenseKey (newVal) {
			this.updateLicenseKey(newVal)
		}
	},
	computed : {
		...mapState([ 'options' ]),
		...mapState('wizard', {
			stateLicenseKey : 'licenseKey',
			presetFeatures  : 'features'
		}),
		noLicenseNeeded () {
			return this.$t.sprintf(
				// Translators: 1 - The plugin name ("All in One SEO").
				this.$t.__('You\'re using %1$s - no license needed. Enjoy!', this.$td) + ' 🙂',
				this.strings.boldText
			)
		},
		link () {
			return this.$t.sprintf(
				'<strong><a href="%1$s" target="_blank">%2$s</a></strong>', this.$links.utmUrl('general-settings', 'license-box'),
				this.strings.linkText
			)
		},
		tooltipText () {
			return this.$isPro
				? this.$t.__('To unlock the selected features, please enter your license key below.', this.$td)
				: this.$t.sprintf(
					// Translators: 1 - "upgrade to Pro".
					this.$t.__('To unlock the selected features, please %1$s and enter your license key below.', this.$td),
					this.link
				)
		},
		alreadyPurchased () {
			return this.$t.sprintf(
				// Translators: 1 - The plugin name ("All in One SEO").
				this.$t.__('Already purchased? Simply enter your license key below to connect with %1$s!', this.$td),
				this.strings.purchasedBoldText
			)
		}
	},
	methods : {
		...mapActions([ 'getConnectUrl', 'processConnect', 'activate' ]),
		...mapActions('wizard', [ 'saveWizard' ]),
		...mapMutations('wizard', [ 'updateLicenseKey' ]),
		processConnectOrActivate () {
			if (this.$isPro) {
				return this.processActivateLicense()
			}

			this.processGetConnectUrl()
		},
		processActivateLicense () {
			this.error   = null
			this.loading = true
			this.$store.commit('loading', true)
			this.activate(this.localLicenseKey)
				.then(() => {
					this.$aioseo.internalOptions.internal.license.expired = false
					this.saveWizard('license-key')
						.then(() => {
							this.$router.push(this.getNextLink)
						})
				})
				.catch(error => {
					this.loading         = false
					this.localLicenseKey = null
					this.$store.commit('loading', false)
					if (!error || !error.response || !error.response.body || !error.response.body.error || !error.response.body.licenseData) {
						this.error = this.$t.__('An unknown error occurred, please try again later.', this.$tdPro)
						return
					}

					const data = error.response.body.licenseData
					if (data.invalid) {
						this.error = this.$t.__('The license key provided is invalid. Please use a different key to continue receiving automatic updates.', this.$tdPro)
					} else if (data.disabled) {
						this.error = this.$t.__('The license key provided is disabled. Please use a different key to continue receiving automatic updates.', this.$tdPro)
					} else if (data.expired) {
						this.error = this.licenseKeyExpired
					} else if (data.activationsError) {
						this.error = this.$t.__('This license key has reached the maximum number of activations. Please deactivate it from another site or purchase a new license to continue receiving automatic updates.', this.$tdPro)
					} else if (data.connectionError || data.requestError) {
						this.error = this.$t.__('There was an error connecting to the licensing API. Please try again later.', this.$tdPro)
					}
				})
		},
		processGetConnectUrl () {
			this.loading = true
			this.$store.commit('loading', true)
			this.getConnectUrl({
				key    : this.localLicenseKey,
				wizard : true
			})
				.then(response => {
					if (response.body.url) {
						if (!response.body.popup) {
							this.loading = false
							this.$store.commit('loading', false)
							return window.open(response.body.url)
						}

						this.openPopup(response.body.url)
					}
				})
		},
		openPopup (url) {
			popup(
				url,
				'_self',
				600,
				630,
				true,
				[ 'file', 'token' ],
				this.completedCallback,
				this.closedCallback
			)
		},
		completedCallback (payload) {
			payload.wizard = true
			return this.processConnect(payload)
		},
		closedCallback (reload) {
			if (reload) {
				return window.location.reload()
			}

			this.loading = false
			this.$store.commit('loading', false)
		},
		skipStep () {
			this.saveWizard()
			this.$router.push(this.getNextLink)
		}
	},
	mounted () {
		this.localLicenseKey = this.stateLicenseKey
	}
}
</script>

<style lang="scss">
.aioseo-wizard-license-key {
	font-size: 16px;
	color: $black;

	.header {
		font-size: 24px;
		color: $black;
		font-weight: 600;
	}

	.description {
		margin-top: 32px;
		font-size: 16px;
		color: $black2;
		margin-bottom: 20px;
	}

	.aioseo-settings-row {
		&:last-child {
			border-bottom: none;
			margin-bottom: 0;
		}

		&.feature-grid {
			.settings-name {
				.name {
					font-size: 18px;
				}
			}

			.aioseo-col {
				display: flex;
				align-items: center;
			}
		}
	}

	.go-back {
		a {
			color: $black2;
			font-size: 14px;
		}
	}

	.license-cta-box {
		border-radius: 3px;
		background-color: $inline-background;
		padding: 20px;
		max-width: 620px;
		margin: 10px 0 30px;

		a {
			color: $green;
		}

		> div:first-child {
			font-weight: 600;
			line-height: 1.4;
		}

		.aioseo-row {
			.aioseo-col {
				display: flex;
				align-items: center;

				svg {
					width: 16px;
					height: 16px;
					color: $blue;
					margin-right: 10px;
				}
			}
		}
	}

	.license-key {
		margin-top: 10px;
		display: flex;
		max-width: 620px;

		.aioseo-input {
			margin-right: 10px;
		}
	}

	.license-key-error {
		margin-top: 20px;
	}
}
</style>