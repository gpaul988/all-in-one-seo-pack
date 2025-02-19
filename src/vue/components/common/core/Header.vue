<template>
	<div class="aioseo-header">
		<core-upgrade-bar
			v-if="!$isPro && settings.showUpgradeBar && upgradeBar && pong"
		/>

		<core-license-key-bar
			v-if="$isPro && isUnlicensed && pong"
		/>

		<core-api-bar
			v-if="!pong"
		/>

		<grid-container
			:full-width="fullWidth"
			:small="small"
		>
			<div class="aioseo-header-content">
				<a
					v-if="isUnlicensed"
					:href="$links.utmUrl('header-logo')"
					target="_blank"

				>
					<svg-aioseo-logo />
				</a>
				<svg-aioseo-logo
					v-if="!isUnlicensed"
				/>
				<span
					v-if="pageName"
					class="spacer"
				/>
				<span
					v-if="pageName"
					class="page-name"
				>{{ pageName }}</span>

				<div
					v-if="actions"
					class="header-actions"
			>
					<transition name="fade-percent-circle">
						<core-percent-circle
							v-if="activeScan && showPopup"
							:percentage="percentage"
							@click.native="toggleCirclePopup"
						/>
					</transition>

					<transition
						name="fade-processing-popup"
					>
						<core-processing-popup
							v-if="showPopup"
							:strings="popupStrings"
							:percentage="percentage"
							@close="toggleCirclePopup"
						/>
					</transition>

					<span
						class="round"
						@click.stop="toggleNotifications"
					>
						<span class="round number"
							v-if="activeNotificationsCount"
						>
							{{ activeNotificationsCount > 9 ? '!' : activeNotificationsCount }}
						</span>

						<svg-notifications
							@click.stop="toggleNotifications"
						/>
					</span>

					<span
						class="round"
						@click.stop="toggleModal"
						v-if="helpPanel.docs && Object.keys(helpPanel.docs).length"
					>
						<svg-circle-question-mark />
					</span>
				</div>
			</div>
		</grid-container>
	</div>
</template>

<script>
import { ScrollAndHighlight } from '@/vue/mixins'
import { mapGetters, mapMutations, mapState } from 'vuex'
import CoreApiBar from '@/vue/components/common/core/ApiBar'
import CoreLicenseKeyBar from '@/vue/components/AIOSEO_VERSION/core/LicenseKeyBar'
import CorePercentCircle from '@/vue/components/common/core/PercentCircle'
import CoreProcessingPopup from '@/vue/components/common/core/ProcessingPopup'
import CoreUpgradeBar from '@/vue/components/AIOSEO_VERSION/core/UpgradeBar'
import GridContainer from '@/vue/components/common/grid/Container'
import SvgAioseoLogo from '@/vue/components/common/svg/aioseo/Logo'
import SvgCircleQuestionMark from '@/vue/components/common/svg/circle/QuestionMark'
import SvgNotifications from '@/vue/components/common/svg/Notifications'
export default {
	components : {
		CoreApiBar,
		CoreLicenseKeyBar,
		CorePercentCircle,
		CoreProcessingPopup,
		CoreUpgradeBar,
		GridContainer,
		SvgAioseoLogo,
		SvgCircleQuestionMark,
		SvgNotifications
	},
	mixins : [ ScrollAndHighlight ],
	props  : {
		fullWidth : Boolean,
		small     : Boolean,
		pageName  : String,
		actions   : {
			type : Boolean,
			default () {
				return true
			}
		},
		upgradeBar : {
			type : Boolean,
			default () {
				return true
			}
		}
	},
	data () {
		return {
			activeScan : null,
			strings    : {
				linkAssistantPopup : {
					header      : this.$t.__('Link suggestions are being processed.', this.$td),
					description : this.$t.__('Depending on the number of posts being scanned, this process can take some time. You can safely leave this page and check back later.', this.$td)
				},
				searchStatisticsPopup : {
					header      : this.$t.__('Search statistics are being fetched.', this.$td),
					description : this.$t.__('Depending on the amount of content on your site, this process can take some time. You can safely leave this page and check back later.', this.$td)
				}
			}
		}
	},
	computed : {
		...mapGetters([ 'settings', 'activeNotificationsCount', 'isUnlicensed', 'helpPanel' ]),
		...mapState([ 'notifications', 'pong' ]),
		...mapState('linkAssistant', [ 'suggestionsScan' ]),
		percentage () {
			switch (this.activeScan) {
				case 'linkAssistant':
					return this.suggestionsScan.percent
				default:
					return null
			}
		},
		showPopup () {
			switch (this.activeScan) {
				case 'linkAssistant':
					return this.suggestionsScan.showProcessingPopup && 100 !== this.suggestionsScan.percent
				default:
					return null
			}
		},
		popupStrings () {
			switch (this.activeScan) {
				case 'linkAssistant':
					return this.strings.linkAssistantPopup
				default:
					return null
			}
		}
	},
	methods : {
		...mapMutations([ 'toggleNotifications' ]),
		...mapMutations('linkAssistant', [ 'toggleProcessingPopup' ]),
		debounce (fn) {
			let frame
			return (...params) => {
				if (frame) {
					cancelAnimationFrame(frame)
				}
				frame = requestAnimationFrame(() => {
					fn(...params)
				})
			}
		},
		storeScroll () {
			document.documentElement.dataset.scroll = window.scrollY
		},
		toggleModal () {
			const modal = document.getElementById('aioseo-help-modal')
			modal.classList.toggle('visible')
			document.body.classList.toggle('modal-open')
		},
		checkForActiveScan () {
			if (
				'link-assistant' === this.$aioseo.page &&
				this.$addons.isActive('aioseo-link-assistant') &&
				!this.$addons.requiresUpgrade('aioseo-link-assistant') &&
				this.$addons.hasMinimumVersion('aioseo-link-assistant') &&
				('links-report' === this.$route.name || 'overview' === this.$route.name) &&
				100 !== this.suggestionsScan.percent
			) {
				this.activeScan = 'linkAssistant'
			}
		},
		toggleCirclePopup () {
			switch (this.activeScan) {
				case 'linkAssistant':
					return this.toggleProcessingPopup()
				default:
					return null
			}
		}
	},
	mounted () {
		this.storeScroll()
		document.addEventListener('scroll', this.debounce(this.storeScroll), { passive: true })

		this.checkForActiveScan()
	}
}
</script>

<style lang="scss">
html:not([data-scroll='0']) {
	.aioseo-header {
		box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
		transition: box-shadow 0.6s;
	}
}

.aioseo-header {
	position: fixed;
	z-index: 1051;
	top: 0;
	right: 0;
	left: 0;
	background-color: #fff;
	height: 72px;
	color: $black;

	.mascot {
		width: 35px;
		height: auto;
		margin-right: 10px;
	}

	.aioseo-header-content {
		padding: 0;
		display: flex;
		height: 72px;
		align-items: center;

		a:focus {
			box-shadow: none;
		}

		svg.aioseo-logo {
			height: 26px;
			margin-right: 10px;
		}

		.spacer {
			display: inline-flex;
			width: 26.25px;
			height: 0px;
			border: 1px solid $input-border;
			transform: rotate(-72.26deg);
		}

		.page-name {
			display: inline-flex;
			margin-left: 10px;
			font-size: 18px;
			font-weight: normal;
			flex: 1 0 auto;
		}

		.header-actions {
			display: flex;

			.round {
				position: relative;
				background-color: $background;
				border-radius: 50%;
				width: 40px;
				height: 40px;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-left: 10px;
				cursor: pointer;
				transition: background-color 0.2s ease;

				svg {
					width: 20px;
					height: 20px;
				}

				&:hover {
					background-color: darken($background, 5%);
				}
			}

			.number {
				position: absolute;
				background-color: $red;
				width: 16px;
				height: 16px;
				font-weight: 600;
				font-size: 10px;
				color: #fff;
				top: -8px;
				left: 50%;
				transform: translateX(-50%);
				margin: 0;
				animation: bounce 2s 5;

				&:hover {
					background-color: $red;
				}

				@keyframes bounce {
					0%, 25%, 50%, 75%, 100% {
						transform: translateX(-50%) translateY(0);
					}
					40% {
						transform: translateX(-50%) translateY(-8px);
					}
					60% {
						transform: translateX(-50%) translateY(-4px);
					}
				}
			}
		}
	}

	.fade-percent-circle-enter-active, .fade-percent-circle-leave-active {
		transition: opacity .5s;
	}
	.fade-percent-circle-enter, .fade-percent-circle-leave-to {
		opacity: 0;
	}
}
</style>