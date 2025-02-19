<template>
	<div
		class="aioseo-tabs"
		:class="{ internal: internal, skinny: skinnyTabs }"
		ref="aioseo-tabs"
	>
		<div
			class="tabs-scroller"
			ref="tabs-scroller"
			v-show="!showMobileMenu || calculateWidth"
		>
			<md-tabs
				:md-sync-route="!active"
				:md-active-tab="active"
				@md-changed="id => $emit('changed', id)"
			>
				<template #md-tab="{ tab }">
					<slot name="md-tab" :tab="tab">
						<slot name="md-tab-icon" :tab="tab" />
						<span class="label">{{ tab.label }}</span>
						<md-tooltip
							v-if="'sidebar' === $root._data.screenContext && getActiveTabName() !== tab.label"
							md-direction="top"
						>
							{{ tab.label }}
						</md-tooltip>
						<span
						v-if="tab.data.errorCount >= 0"
							class="tab-score"
							:class="getErrorClass(currentPost.page_analysis.analysis[tab.data.slug].errors)"
						>
							<svg-ellipse
								v-if="0 < currentPost.page_analysis.analysis[tab.data.slug].errors"
								width="6"
							/>
							<svg-circle-check
								v-if="0 === currentPost.page_analysis.analysis[tab.data.slug].errors"
								width="12"
							/>
							{{ getErrorDisplay(currentPost.page_analysis.analysis[tab.data.slug].errors) }}
						</span>
						<span
							v-if="tab.data.warning && 'sidebar' !== $root._data.screenContext"
							class="warning"
						>
							<svg-circle-information
								width="15"
								height="15"
							/>
						</span>
					</slot>
				</template>

				<md-tab
					v-for="(tab, index) in tabs"
					:key="index"
					:id="tab.slug"
					:md-label="tab.name"
					:md-icon="tab.icon"
					:to="tab.url"
					:md-template-data="{
						pro         : tab.pro,
						analyze     : tab.analyze,
						errorCount  : tab.errorCount,
						slug        : tab.slug,
						warning     : tab.warning
					}"
				/>

			</md-tabs>
		</div>

		<div
			v-if="showMobileMenu"
			class="aioseo-mobile-tabs"
		>
			<div
				class="active-tab"
				@click="showMobileTabs = !showMobileTabs"
			>
				<div>
					{{ getActiveTabName() }}
					<svg-caret
						@click.stop="showMobileTabs = !showMobileTabs"
						:class="{ rotated: !showMobileTabs }"
					/>
					<span class="tab-indicator"></span>
				</div>
			</div>
			<transition-slide
				:active="showMobileTabs"
				class="tab-dropdown"
			>
				<div class="tab-links">
					<template
						v-if="!active"
					>
						<router-link
							v-for="(tab, index) in filteredTabs"
							:key="index"
							:to="tab.url"
							@click.native="showMobileTabs = false"
						>
							{{ tab.name }}
						</router-link>
					</template>

					<template
						v-if="active"
					>
						<a
							href="#"
							v-for="(tab, index) in filteredTabs"
							:key="index"
							@click.prevent="$emit('changed', tab.slug) && (showMobileTabs = false)"
						>
							{{ tab.name }}
						</a>
					</template>
				</div>
			</transition-slide>
		</div>

		<div
			class="button-right"
			v-if="showSaveButton"
			ref="tabs-button"
		>
			<slot name="button">
				<base-button
					type="blue"
					size="medium"
					:loading="loading"
					@click="processSaveChanges"
				>
					{{ strings.saveChanges }}
				</base-button>
			</slot>
		</div>

		<div class="tabs-extra">
			<slot name="extra" />
		</div>
	</div>
</template>

<script>
import { SaveChanges } from '@/vue/mixins/SaveChanges'
import { TruSeoScore } from '@/vue/mixins/TruSeoScore'
import { mapActions, mapState } from 'vuex'
import SvgCaret from '@/vue/components/common/svg/Caret'
import SvgCircleCheck from '@/vue/components/common/svg/circle/Check'
import SvgCircleInformation from '@/vue/components/common/svg/circle/Information'
import SvgEllipse from '@/vue/components/common/svg/Ellipse'
import TransitionSlide from '@/vue/components/common/transition/Slide'
export default {
	components : {
		SvgCaret,
		SvgCircleCheck,
		SvgCircleInformation,
		SvgEllipse,
		TransitionSlide
	},
	mixins : [ SaveChanges, TruSeoScore ],
	props  : {
		tabs : {
			type     : Array,
			required : true
		},
		skinnyTabs     : Boolean,
		active         : String,
		showSaveButton : {
			type : Boolean,
			default () {
				return true
			}
		},
		internal      : Boolean,
		disableMobile : Boolean
	},
	data () {
		return {
			buttonLoading  : false,
			showMobileMenu : true,
			calculateWidth : false,
			showMobileTabs : false,
			strings        : {
				saveChanges : this.$t.__('Save Changes', this.$td)
			}
		}
	},
	computed : {
		...mapState([ 'loading', 'currentPost' ]),
		filteredTabs () {
			return this.tabs.filter(t => t.slug !== (this.active ? this.active : (this.$route && this.$route.name ? this.$route.name : '')))
		}
	},
	methods : {
		...mapActions([ 'openModal' ]),
		getActiveTabName () {
			const tab = this.tabs.find(t => t.slug === (this.active ? this.active : (this.$route && this.$route.name ? this.$route.name : '')))
			if (tab) {
				return tab.name
			}

			return ''
		},
		maybeShowMobileMenu () {
			if (window.matchMedia('(max-width: 782px)').matches && !this.disableMobile) {
				this.showMobileMenu = true
				return
			}

			let width           = 0
			this.calculateWidth = true
			this.$nextTick(() => {
				width = this.$refs['tabs-scroller'].offsetWidth
				this.calculateWidth     = false
				let tabsButtonWidth     = 0
				const tabsButtonElement = this.$refs['tabs-button']
				if (tabsButtonElement) {
					const buttonElement = tabsButtonElement.querySelector('.aioseo-button')
					tabsButtonWidth = buttonElement ? buttonElement.scrollWidth : 0
				}

				if ((width + tabsButtonWidth) > this.$refs['aioseo-tabs'].offsetWidth) {
					this.showMobileMenu = true
					return
				}

				this.showMobileMenu = false
			})
		}
	},
	beforeDestroy () {
		window.removeEventListener('resize', this.maybeShowMobileMenu)
	},
	mounted () {
		window.addEventListener('resize', this.maybeShowMobileMenu)
		this.$nextTick(() => this.maybeShowMobileMenu())
	}
}
</script>

<style lang="scss">
.aioseo-app {
	.aioseo-tabs {
		&.internal {
			margin-bottom: 0;

			.md-tabs {
				&.md-theme-default {
					.md-tabs-navigation {
						margin-top: 5px;

						.md-button {
							height: 60px;

							.md-ripple {
								padding: 0 25px;
							}
						}
					}
				}
			}
		}

		&.skinny {
			.md-tabs {
				&.md-theme-default {
					.md-tabs-navigation {
						.md-button {
							.md-ripple {
								padding: 0 16px;
							}
						}
					}
				}
			}
		}
	}

	.md-tabs {
		display: flex;
		flex-direction: column;

		&.md-theme-default {
			.md-tabs-navigation {
				margin-top: 2px;
				background: transparent;
				display: flex;
				position: relative;
				justify-content: flex-start;

				&.md-elevation-0 {
					box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(0, 0, 0, 0.14), 0 0 0 0 rgba(0, 0, 0, 0.12);
				}

				.md-button {
					color: $black;
					max-width: 264px;
					min-width: 68px;
					height: 60px;
					margin: 0;
					border-radius: 0;
					font-size: 15px;
					font-weight: 500;
					padding: 0;
					display: inline-block;
					position: relative;
					overflow: hidden;
					outline: none;
					background: transparent;
					border: 0;
					transition: .4s cubic-bezier(.4,0,.2,1);
					font-family: inherit;
					line-height: normal;
					text-decoration: none;
					vertical-align: top;
					white-space: nowrap;

					&:before {
						position: absolute;
						top: 0;
						right: 0;
						bottom: 0;
						left: 0;
						opacity: 0;
						transition: .4s cubic-bezier(.4,0,.2,1);
						will-change: background-color,opacity;
						content: " ";
					}

					.md-ripple {
						padding: 0 18px;
						display: flex;
						justify-content: center;
						align-items: center;
						width: 100%;
						height: 100%;
						position: relative;
						overflow: hidden;
						mask-image: radial-gradient(circle, #fff 100%, #000 0);

						.md-button-content {
							position: static;
							z-index: 2;
						}

						// Fixes a weird jittery bug on internal tabs.
						.md-ripple-wave {
							display: none;
						}
					}

					&:not([disabled]) {
						cursor: pointer;

						&:active:before,
						&:hover:before {
							background-color: currentColor;
							opacity: 0.12;
						}
					}

					&.md-active {
						color: $blue;

						&:focus {
							outline: none;
							box-shadow: none;
						}
					}
				}

				.md-tabs-indicator {
					height: 2px;
					background-color: $blue;
					bottom: -2px;
					position: absolute;
					left: 0;
					transform: translateZ(0);
					will-change: left,right;

					&.md-tabs-indicator-left {
						transition: left .3s cubic-bezier(0.4, 0, 0.2, 1), right .35s cubic-bezier(0.4, 0, 0.2, 1);
					}
					&.md-tabs-indicator-right {
						transition: right .3s cubic-bezier(0.4, 0, 0.2, 1),left .35s cubic-bezier(0.4, 0, 0.2, 0.1);
					}
				}
			}
		}
	}

	.aioseo-tabs {
		display: flex;
		border-bottom: 2px solid $border;
		position: relative;
		margin-bottom: 38px;

		.button-right,
		.tabs-extra {
			position: absolute;
			right: 0;
			bottom: 10px;
		}

		.tab-score {
			display: inline-flex;
			align-items: center;
			justify-content: flex-end;
			font-size: 11px;
			font-weight: 700;
			padding-left: 12px;
			-webkit-text-stroke-width: 0;
			&.green {
				color: $green;
			}
			&.orange {
				color: $orange;
			}
			&.red {
				color: $red;
			}
			svg {
				display: inline;
				margin-right: 7px;
			}
		}

		.warning {
			color: $orange !important;
			svg {
				position: relative;
				top: 2px;
				left: 5px;
				display: inline;
				color: $orange !important;
			}
		}
	}

	.aioseo-mobile-tabs {
		--mobile-font-size: 14px;

		height: 40px;
		margin-top: 20px;
		position: relative;
		user-select: none;
		width: 100%;

		.active-tab {
			--spacing-x: 18px;

			align-items: center;
			color: $blue;
			cursor: pointer;
			display: inline-flex;
			min-height: 100%;
			padding-left: var(--spacing-x);
			position: relative;

			div {
				font-size: var(--mobile-font-size);

				span {
					background-color: $blue;
					bottom: -2px;
					height: 2px;
					left: 0;
					position: absolute;
					right: calc(var(--spacing-x) * -2);
					z-index: 10;
				}
			}

			svg.aioseo-caret {
				--caret-size: 24px;

				height: var(--caret-size);
				left: 100%;
				position: absolute;
				top: calc(50% - var(--caret-size) / 2);
				transform: rotate(180deg);
				transition: transform 0.3s;
				width: var(--caret-size);

				&.rotated {
					transform: rotate(0);
				}
			}
		}

		.tab-dropdown {
			border: 1px solid $border;
			border-top: none;
		}

		.tab-links {
			background: #fff;
			position: relative;
			z-index: 3;
			padding: 8px;
			width: 100%;
			max-width: 300px;

			@media screen and (max-width: 782px) {
				max-width: 100%;
			}

			a {
				font-size: var(--mobile-font-size);
				padding: 10px;
				display: block;
				color: $black;
				text-decoration: none;

				&:hover {
					color: $blue;
				}
			}
		}
	}
}

.md-tooltip {
	background-color: $black !important;
	color: #fff !important;
	border-radius: 2px;
	padding: 6px 12px;
	font-size: 14px;
	&:after {
		content: "";
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: $black transparent transparent transparent;
	}
}
</style>