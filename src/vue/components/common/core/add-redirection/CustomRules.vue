<template>
	<div class="custom-rules">
		<table
			class="redirects-options-table"
			cellspacing="0"
			cellpadding="0"
			aria-label="Custom Rules"
		>
			<thead>
			<tr>
				<td colspan="2">{{ strings.customRules }}</td>
			</tr>
			</thead>
			<tbody>
			<tr
				class="rule"
				v-for="(match, index) in customRules"
				:class="{ even: 0 === index % 2 }"
				:key="index"
			>
				<td  class="rule-settings">
						<base-select
							:options="filteredTypes"
							size="medium"
							:placeholder="strings.selectMatchRule"
							:value="getRuleValue('type', index)"
							@input="updateRule('type', $event, index)"
						/>
						<base-select
							v-if="getType(index, 'options') || getType(index, 'taggable')"
							:options="getType(index, 'options') || []"
							size="medium"
							:value="getRuleValue('value', index)"
							@input="updateRule('value', $event, index)"
							:multiple="getType(index, 'multiple') || getType(index, 'taggable')"
							:taggable="getType(index, 'taggable')"
							:placeholder="getType(index, 'placeholder') || strings.selectAValue"
						/>
						<!-- Key field when there's a key/value pair. -->
						<base-input
							v-if="getType(index, 'keyValuePair')"
							:value="getRuleValue('key', index)"
							@input="updateRule('key', $event, index)"
							size="medium"
							:placeholder="getType(index, 'placeholderKey') || strings.key"
						/>
						<!-- Key field when there's a key/value pair. -->
						<!-- Value field if there are no options and the option is not taggable -->
						<base-input
							v-if="!getType(index, 'options') && !getType(index, 'taggable')"
							:value="getRuleValue('value', index)"
							@input="updateRule('value', $event, index)"
							size="medium"
							:placeholder="getType(index, 'placeholder') || strings.value"
							:disabled="!getType(index)"
						/>
						<!-- Value field if there are no options and the option is not taggable/multiple -->
						<base-toggle
							v-if="getType(index, 'regex')"
							:value="getRuleValue('regex', index)"
							@input="updateRule('regex', $event, index)"
						>
							{{ strings.regex }}
						</base-toggle>
				</td>
				<td class="actions">
					<core-tooltip
						class="action"
						type="action"
					>
						<svg-trash
							@click.native="removeRule(index)"
						/>

						<template #tooltip>
							{{ strings.delete }}
						</template>
					</core-tooltip>
				</td>
			</tr>
			</tbody>
			<tfoot>
			<tr>
				<td colspan="2">
					<base-button
						size="small-table"
						type="black"
						@click="addRule(null)"
					>
						<svg-circle-plus />
						{{ strings.add }}
					</base-button>
				</td>
			</tr>
			</tfoot>
		</table>
	</div>
</template>

<script>
import CoreTooltip from '@/vue/components/common/core/Tooltip'
import SvgCirclePlus from '@/vue/components/common/svg/circle/Plus'
import SvgTrash from '@/vue/components/common/svg/Trash'
const matchDefaults = {
	type  : null,
	key   : null,
	value : null,
	regex : null
}
export default {
	components : {
		CoreTooltip,
		SvgCirclePlus,
		SvgTrash
	},
	props : {
		editCustomRules : Array
	},
	data () {
		return {
			strings : {
				customRules     : this.$t.__('Custom Rules', this.$td),
				selectMatchRule : this.$t.__('Select Rule', this.$td),
				delete          : this.$t.__('Delete', this.$td),
				add             : this.$t.__('Add Custom Rule', this.$td),
				regex           : this.$t.__('Regex', this.$td),
				selectAValue    : this.$t.__('Select a Value or Add a New One', this.$td),
				key             : this.$t.__('Key', this.$td),
				value           : this.$t.__('Value', this.$td)
			},
			customRules : [],
			types       : [
				{
					label       : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.login,
					value       : 'login',
					placeholder : this.$t.__('Select Status', this.$td),
					singleRule  : true,
					options     : [
						{ label: this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.loggedin, value: 'loggedin' },
						{ label: this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.loggedout, value: 'loggedout' }
					]
				},
				{
					label       : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.role,
					value       : 'role',
					multiple    : true,
					placeholder : this.$t.__('Select Roles', this.$td),
					options     : Object.entries(this.$aioseo.user.roles).map((item) => {
						return { label: item[1], value: item[0] }
					})
				},
				{
					label      : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.referrer,
					value      : 'referrer',
					regex      : true,
					singleRule : true
				},
				{
					label    : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.agent,
					value    : 'agent',
					regex    : true,
					taggable : true,
					multiple : true,
					options  : [
						{
							label   : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.mobile,
							value   : 'mobile',
							docLink : this.$links.getDocLink(this.$t.__('Learn more', this.$td), 'redirectCustomRulesUserAgent', true)
						},
						{
							label   : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.feeds,
							value   : 'feeds',
							docLink : this.$links.getDocLink(this.$t.__('Learn more', this.$td), 'redirectCustomRulesUserAgent', true)
						},
						{
							label   : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.libraries,
							value   : 'libraries',
							docLink : this.$links.getDocLink(this.$t.__('Learn more', this.$td), 'redirectCustomRulesUserAgent', true)
						}
					]
				},
				{
					label        : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.cookie,
					value        : 'cookie',
					keyValuePair : true,
					regex        : true
				},
				{
					label       : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.ip,
					value       : 'ip',
					placeholder : this.$t.__('Enter an IP Address', this.$td),
					taggable    : true,
					regex       : true,
					singleRule  : true
				},
				{
					label       : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.server,
					value       : 'server',
					placeholder : this.$t.__('Enter the Server Name', this.$td),
					regex       : true,
					singleRule  : true
				},
				{
					label        : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.header,
					value        : 'header',
					keyValuePair : true,
					regex        : true
				},
				{
					label       : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.wp_filter,
					value       : 'wp_filter',
					placeholder : this.$t.__('Enter a WordPress Filter Name', this.$td),
					taggable    : true
				},
				{
					label       : this.$constants.REDIRECTS_CUSTOM_RULES_LABELS.locale,
					value       : 'locale',
					taggable    : true,
					regex       : true,
					placeholder : this.$t.__('Enter a Locale Code, e.g.: en_GB, es_ES', this.$td),
					singleRule  : true
				}
			]
		}
	},
	computed : {
		hasCustomRules () {
			return 0 < this.customRules.length
		},
		filteredTypes () {
			return this.types.map(type => {
				type.$isDisabled = false
				if (type.singleRule && this.customRules.find(rule => type.value === rule.type)) {
					type.$isDisabled = true
				}
				return type
			})
		}
	},
	methods : {
		removeRule (index) {
			this.$delete(this.customRules, index)
			if (!this.hasCustomRules) {
				this.addRule(null)
			}
		},
		addRule (row, preventDuplicates = false) {
			if (!row) {
				row = JSON.parse(JSON.stringify(matchDefaults))
			}

			if (!preventDuplicates || (preventDuplicates && 0 === this.customRules.filter(header => header === row).length)) {
				this.customRules.push(row)
			}
		},
		updateRule (type, value, index) {
			const rule = this.customRules[index]

			value = 'undefined' !== typeof value.value ? value.value : value
			value = 'object' === typeof value && value.length ? value.map(item => item.value) : value

			rule[type] = value

			if ('type' === type) {
				rule.value = ''
			}

			this.$set(this.customRules, index, rule)
		},
		getRuleValue (type, index, raw = false) {
			if (!this.customRules[index]) {
				return
			}

			const match = this.customRules[index]

			let value = match[type], typeOptions = null

			if (raw) {
				return value
			}

			switch (type) {
				case 'type':
					value = this.types.find(option => value === option.value)
					break
				case 'value':
					typeOptions = this.getType(index, 'options')
					if (typeOptions) {
						if ('object' === typeof value) {
							value = value.map(val => typeOptions.find(option => val === option.value) || val).filter(item => !!item)
						} else {
							value = typeOptions.find(option => value === option.value) || value
						}
					}

					if (this.getType(index, 'taggable')) {
						value = 'object' === typeof value
							? value.map(val => {
								return 'undefined' === typeof val.label ? { label: val, value: val } : val
							})
							: []
					}
					break
			}

			return value
		},
		getType (index, key) {
			const currentType = this.getRuleValue('type', index)
			if (key) {
				return currentType && 'undefined' !== typeof currentType[key] ? currentType[key] : false
			}
			return currentType
		}
	},
	mounted () {
		if (this.editCustomRules) {
			this.customRules = this.editCustomRules
		}
		if (!this.hasCustomRules) {
			this.addRule(null)
		}
	}
}
</script>

<style lang="scss" scoped>
.custom-rules {
	width: 100%;
	margin-top: 14px;
	.rule {
		.rule-settings {
			display: flex;
			flex-direction: row;
			align-items: center;
			flex: 1;

			> .aioseo-select:first-child {
				width: 100%;
				max-width: 250px;
			}

			> * {
				margin: 0 16px 0 0;

				&:last-child{
					margin-right: 0;
				}

				&.aioseo-toggle {
					margin: 0 10px 0 4px;
				}
			}
		}

		.actions{
			flex: 0;
		}

		.logical {
			flex: 0;
		}
	}

	svg {
		width: 14px;
		height: 14px;
		cursor: pointer;

		&.aioseo-trash {
			color: $gray2;

			&:hover {
				color: $red;
			}
		}
	}

	.aioseo-tooltip {
		margin: 0;
		display: flex;
	}

	.aioseo-button {
		svg {
			color: #fff;
			margin-right: 6px;
		}
	}
}
</style>