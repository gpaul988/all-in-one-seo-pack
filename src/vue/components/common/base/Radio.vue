<template>
	<label
		class="aioseo-radio"
		:class="[
			labelClass,
			{ [size]: size },
			typeClass,
			{ disabled: disabled }
		]"
		@keydown.enter="labelToggle"
		@keydown.space="labelToggle"
		@click.stop="() => {}"
	>
		<slot name="header"></slot>

		<span class="form-radio-wrapper">
			<span class="form-radio">
				<input
					type="radio"
					@input="$emit('input', $event.target.checked)"
					:checked="value"
					:disabled="disabled"
					:name="name"
					:id="id"
					:class="inputClass"
					ref="input"
				>
				<span class="fancy-radio">
					<svg-checkmark
						v-if="1 === type"
					/>
				</span>
			</span>
		</span>

		<slot />
	</label>
</template>
<script>
import SvgCheckmark from '@/vue/components/common/svg/Checkmark'
export default {
	components : {
		SvgCheckmark
	},
	props : {
		value      : [ String, Boolean ],
		name       : String,
		labelClass : {
			type : String,
			default () {
				return ''
			}
		},
		inputClass : {
			type : String,
			default () {
				return ''
			}
		},
		id       : String,
		size     : String,
		disabled : Boolean,
		type     : {
			type : Number,
			default () {
				return 1
			}
		}
	},
	computed : {
		typeClass () {
			return `type-${this.type}`
		}
	},
	methods : {
		labelToggle () {
			this.$refs.input.click()
		}
	}
}
</script>

<style lang="scss">
.aioseo-radio {
	display: inline-flex;
	align-items: center;

	.form-radio-wrapper {
		margin-right: 10px;
		display: flex;
	}

	&.small {
		.form-radio {
			width: 16px;
			height: 16px;
		}

		&.type-2 {
			.form-radio {
				span {
					&:before {
						width: inherit;
						height: inherit;
					}

					&:after {
						left: 4px;
						bottom: 4px;
						height: 6px;
						width: 6px;
					}
				}
			}
		}
	}

	&.medium {
		.form-radio {
			width: 20px;
			height: 20px;

			.fancy-radio {
				svg {
					width: 12px;
					height: 12px;
				}
			}
		}

		&.type-1 {
			.form-radio {
				span {
					&:before {
						height: 18px;
						width: 18px;
						line-height: 20px;
					}
				}
			}
		}

		&.type-2 {
			.form-radio {
				span {
					&:before {
						height: 16px;
						width: 16px;
						line-height: 20px;
					}

					&:after {
						height: 6px;
						width: 6px;
						left: 6px;
						bottom: 6px;
					}
				}
			}
		}
	}

	.form-radio {
		position:relative;
		display: inline-block;
		width: 28px;
		height: 28px;
		color: white;
		vertical-align: bottom;
		text-align: center;

		/* Hide default HTML radio */
		input {
			opacity: 0;

			&:checked + .fancy-radio {
				background: $blue;
				border-color: $blue;

				&:before {
					background: transparent;
				}

				&:after {
					display: block;
				}
			}

			&:disabled + .fancy-radio {
				cursor: default;
			}

			&:focus + .fancy-radio {
				border-color: $blue;
				box-shadow: 0 0 0 1px $blue;
			}
		}

		.fancy-radio {
			border-radius: 50%;

			svg {
				color: #fff;
				width: 16px;
				height: 16px;
			}
		}

		span {
			position: absolute;
			cursor: pointer;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			transition: 0.2s;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;

			&:before {
				position: absolute;
				content: "";
				height: 26px;
				width: 26px;
				left: 1px;
				bottom: 1px;
				transition: 0.2s;
				font-size: 18px;
				line-height: 28px;
				border-radius: 50%;
			}
		}
	}

	&.type-1 {
		.form-radio {
			span {
				background-color: $background;

				&:before {
					background-color: $background;
				}
			}
		}
	}

	&.type-2 {
		.form-radio {
			span {
				border: 1px solid $input-border;
				background-color: #fff;

				&:before {
					background-color: #fff;
				}

				&:after {
					display: none;
					position: absolute;
					content: "";
					height: 10px;
					width: 10px;
					left: 8px;
					bottom: 8px;
					background-color: #fff;
					transition: 0.2s;
					border-radius: 50%;
				}
			}
		}
	}

	&.disabled {
		cursor: default;

		&.type-2 {
			.form-radio {
				input {
					&:checked + .fancy-radio {
						background-color: $border;
						border-color: $input-border;
					}
				}

				span {
					background-color: $border;

					&:before {
						background-color: $border;
					}

					&:after {
						background-color: $placeholder-color;
					}
				}
			}
		}
	}
}
</style>