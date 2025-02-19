<template>
	<div
		class="aioseo-toc-container"
	>
		<div
			:class="[
				'aioseo-toc-menu',
				{ 'aioseo-toc-placeholder' : 0 === headings.length }
			]"
			>
			<header class="aioseo-toc-header">
				<div class="aioseo-toc-header-title">
					{{strings.header}}

					<core-tooltip placement="bottom">
						<Info />

						<template #tooltip>
							<p>{{strings.tooltipMainDescription}}</p>
						</template>
					</core-tooltip>
				</div>
				<div
					v-if="0 === headings.length"
					class="aioseo-toc-header-instructions"
				>
					{{strings.instructions}}
				</div>

				<div
					v-if="0 !== headings.length"
					class="aioseo-toc-header-buttons"
				>
					<a
						href="#"
						class="aioseo-button-link"
						@click="showModal = true"
					>
						{{strings.reorder}}
					</a>

					<a
						href="#"
						class="aioseo-button-link"
						@click="save"
					>
						{{strings.done}}
					</a>
				</div>
			</header>

			<div
				v-if="0 !== headings.length"
				class="aioseo-toc-content"
			>
				<List :headings="headings"/>
			</div>

			<Reorder
				v-if="showModal"
				:headings="headings"
				@closeModal="showModal = false"
			/>
		</div>

		<ListRendered
			v-if="0 !== headings.length"
			:headings="headings"
		/>
	</div>
</template>

<script>
import CoreTooltip from '@/vue/components/common/core/Tooltip'
import Info from '@/vue/components/common/svg/Info'
import List from './List'
import ListRendered from './ListRendered'
import Reorder from './AIOSEO_VERSION/Reorder'

import { mapState, mapMutations } from 'vuex'
import { deepCopy } from '@/vue/standalone/blocks/utils'
import { flattenHeadings, formatHeadingList } from '../helpers'
import { extraHeadingProperties } from '../constants'

const { __, sprintf } = window.wp.i18n
const td              = import.meta.env.VITE_TEXTDOMAIN

export default {
	components : {
		CoreTooltip,
		Info,
		List,
		ListRendered,
		Reorder
	},
	data () {
		return {
			showModal : false,
			strings   : {
				header : sprintf(
					// Translators: 1 - The plugin short name ("AIOSEO").
					__('%1$s Table of Contents', td),
					import.meta.env.VITE_SHORT_NAME
				),
				instructions           : this.$t.__('Add a heading block below to begin generating the Table of Contents.', this.$tdPro),
				tooltipMainDescription : this.$t.sprintf(
					// Translators: 1 - The plugin short name ("AIOSEO").
					this.$t.__('%1$s can automatically output a table of contents based on your heading tags below. Search engines sometimes use table of contents in search results or rich snippets which can help you increase your rankings.', this.$tdPro),
					import.meta.env.VITE_SHORT_NAME
				),
				reorder : __('Reorder', td),
				save    : __('Save', td),
				done    : __('Done', td)
			}
		}
	},
	computed : {
		...mapState([ 'blockClientId', 'headings', 'reOrdered' ])
	},
	methods : {
		...mapMutations([ 'setHeadings' ]),
		save (event) {
			const block = event.target.closest('.wp-block')
			block?.classList.remove('is-selected')
		},
		setDefaultHeadingProps (heading) {
			Object.keys(extraHeadingProperties).forEach((propName) => {
				heading[propName] = extraHeadingProperties[propName]
			})

			return heading
		},
		updateHeadings (latestHeadings) {
			// First, clone the existing headings from the state. It's important that we clone them because we're also flattening them and we don't want to flatten by reference.
			const existingHeadings = flattenHeadings(deepCopy(this.headings))

			// Then, add all dynamic properties to the new headings.
			let newHeadings = latestHeadings.map((newHeading) => {
				return this.setDefaultHeadingProps(newHeading)
			})

			// Next, override the dynamic properties of the new headings with the values from our existing headings if we find a match.
			// NOTE: It's important that we do it in this direction and do not simply try to update the existing headings directly; otherwise the block client IDs will not switch positions when a heading is moved up or down.
			existingHeadings.forEach((existingHeading) => {
				const matchingHeadingIndex = newHeadings.findIndex(x => x.blockClientId === existingHeading.blockClientId)

				if (-1 === matchingHeadingIndex) {
					return
				}

				Object.keys(extraHeadingProperties).forEach((propName) => {
					newHeadings[matchingHeadingIndex][propName] = existingHeading[propName]
				})

				// If the edited heading of the existing heading is the same as the new heading, we should reset the changes
				// so that the heading from our ToC block and the heading block itself are synced up again.
				if (newHeadings[matchingHeadingIndex].editedContent === newHeadings[matchingHeadingIndex].content) {
					newHeadings[matchingHeadingIndex].editedContent = ''
				}

				if (newHeadings[matchingHeadingIndex].hidden) {
					newHeadings[matchingHeadingIndex].editedLevel = 9
				} else if (9 === newHeadings[matchingHeadingIndex].editedLevel) {
					newHeadings[matchingHeadingIndex].editedLevel = 0
				}
			})

			// If the list isn't following the content order and a new heading is added
			// we need to give that heading an editedOrder number for proper sorting.
			if (this.$store.state.reOrdered) {
				if (0 < newHeadings.length - existingHeadings.length) {
					newHeadings.sort((a, b) => a.id - b.id)
					newHeadings.forEach((heading, index) => {
						if (!heading.editedOrder) {
							heading.editedOrder = index + 1
						}
					})
					newHeadings.sort((a, b) => a.editedOrder - b.editedOrder)
				}
			} else {
				// Otherwise make sure we're following the content order.
				newHeadings.sort((a, b) => a.id - b.id)
			}

			// Finally, before we update the state, create a new nested structure.
			newHeadings = formatHeadingList(newHeadings)

			this.setHeadings(newHeadings)
		}
	},
	watch : {
		headings : {
			handler (headings) {
				window.aioseoBus.$emit('setAttributes' + this.blockClientId, headings)
			},
			deep : true
		},
		reOrdered : {
			handler (reOrdered) {
				window.aioseoBus.$emit('setAttributes' + this.blockClientId, reOrdered)
			}
		}
	},
	mounted () {
		window.aioseoBus.$on('updateHeadings' + this.blockClientId, (latestHeadings) => {
			this.updateHeadings(latestHeadings)
		})
	}
}
</script>

<style lang="scss">
.modal-mask .modal-wrapper .modal-container {
	border-radius: 4px;
}

.wp-block-aioseo-table-of-contents .aioseo-toc-menu,
.aioseo-toc-modal .modal-body {
	font-family: system-ui, $font-family;
	background-color: $background;
	padding: 20px;
	min-height: 70px;
	border-radius: 2px;

	// Since our element selectors are susceptible to theme styles, we need to do a little reset.
	a, p, li, button, input, header {
		font-family: inherit;
		padding: unset;
		margin: unset;
		font-size: inherit;
	}

	.aioseo-toc-header {
		display: flex;
		align-items: center;
		margin-bottom: 25px;
		flex-wrap: wrap;

		.aioseo-toc-header-title {
			align-items: center;
			color: $black2;
			display: flex;
			flex: 1 0 auto;
			font-size: 24px;
			font-weight: 700;
			line-height: 125%;
			max-width: 100%;
		}

		.aioseo-toc-header-instructions {
			color: $black2-hover;
			font-size: 16px;
			margin-bottom: 0;
			margin-top: 16px;
		}

		.aioseo-toc-header-buttons {
			flex: 0 1 auto;
		}
	}

	a.aioseo-button-link {
		display: inline-block;
		padding: 8px 12px;
		border: 1px solid $gray;
		background-color: $box-background;
		font-weight: 700;
		text-decoration: none;
		font-size: 12px;
		color: $black2-hover !important;
		border-radius: 4px;

		+ .aioseo-button-link {
			margin-left: 10px;
		}

		&:hover {
			background-color: rgb(251, 251, 251);
		}
	}
}

.aioseo-toc-modal {

	.modal-mask .modal-wrapper {
		font-family: inherit;

		.modal-body {
			padding: 20px 28px 20px 10px;

			> header {
				padding-left: 10px;
			}
		}
	}
}
</style>