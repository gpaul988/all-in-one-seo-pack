<template>
	<div class="keyword-inner">
		<div class="keyword-inner-loading" v-if="loading" >
			<core-loader dark />
		</div>

		<core-wp-table
			v-if="row.pages && ! loading"
			ref="table"
			class="posts-table"
			:key="1"
			:columns="postColumns"
			:rows="row.pages"
			:show-header="false"
			:show-bulk-actions="false"
			:show-table-footer="false"
		>
			<template #post_title="{ row }">
				<div class="post-title">
					<a
						href="#"
						v-if="row.postId"
						@click="openPostDetail(row)"
					>
						{{ row.postTitle }}
					</a>

					<span
						v-else
						class="post-title"
					>
						{{ row.postTitle }}
					</span>
				</div>
				<div
					class="row-actions"
					v-if="row.postId"
				>
					<span>
						<a
							class="view"
							:href="row.context.permalink"
							target="_blank"
						>
							<span>{{ viewPost(row.context.postType.singular) }}</span>
						</a> |
					</span>

					<span>
						<a
							class="edit"
							:href="row.context.editLink"
							target="_blank"
						>
							<span>{{ editPost(row.context.postType.singular) }}</span>
						</a>
					</span>
				</div>
			</template>

			<template #clicks="{ row }">
				{{ $numbers.compactNumber(row.clicks) }}
			</template>

			<template #ctr="{ row }">
				{{ row.ctr }}%
			</template>

			<template #impressions="{ row }">
				{{ $numbers.compactNumber(row.impressions) }}
			</template>

			<template #position="{ row }">
				<statistic
					v-if="row.difference.comparison"
					type="position"
					:total="row.position"
					:difference="row.difference.position"
				/>
			</template>
		</core-wp-table>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import PostTypesMixin from '@/vue/mixins/PostTypes.js'
import CoreLoader from '@/vue/components/common/core/Loader'
import CoreWpTable from '@/vue/components/common/core/wp/Table'
import Statistic from './Statistic.vue'
export default {
	components : {
		CoreLoader,
		CoreWpTable,
		Statistic
	},
	mixins : [ PostTypesMixin ],
	props  : {
		index : {
			type     : Number,
			required : true
		},
		postDetail : {
			type     : Boolean,
			required : false,
			default  : false
		}
	},
	data () {
		return {
			loading : false
		}
	},
	computed : {
		...mapState('search-statistics', [ 'data' ]),
		postColumns () {
			return [
				{
					slug  : 'post_title',
					label : this.$t.__('Title', this.$td),
					width : '100%'
				},
				{
					slug  : 'clicks',
					label : this.$t.__('Clicks', this.$td),
					width : '120px'
				},
				{
					slug  : 'ctr',
					label : this.$t.__('Avg. CTR', this.$td),
					width : '120px'
				},
				{
					slug  : 'impressions',
					label : this.$t.__('Impressions', this.$td),
					width : '120px'
				},
				{
					slug  : 'position',
					label : this.$t.__('Position', this.$td),
					width : '120px'
				}
			]
		},
		keywords () {
			if (this.postDetail) {
				return this.data.postDetail.keywords.paginated.rows
			}

			return this.data.keywords.paginated.rows
		},
		row () {
			return this.keywords[this.index]
		}
	},
	methods : {
		...mapActions('search-statistics', [ 'getPagesByKeywords' ]),
		openPostDetail (post) {
			this.$router.push({
				path  : '/post-detail',
				query : {
					postId        : post.postId,
					previousRoute : this.$route.name
				}
			})
		}
	},
	mounted () {
		if (!this.row || this.row?.pages?.length) {
			return
		}

		this.loading = true
		this.getPagesByKeywords([ this.row.keyword ]).then(data => {
			this.loading = false

			const pages = data[this.row.keyword]
			if (!pages) {
				return
			}

			if (this.postDetail) {
				this.data.postDetail.keywords.paginated.rows[this.index].pages = Object.values(pages).slice(0, 10)
			} else {
				this.data.keywords.paginated.rows[this.index].pages = Object.values(pages).slice(0, 10)
			}
		})
	}
}
</script>

<style lang="scss">
.aioseo-search-statistics-keywords-table .keyword-inner {
	&-loading {
		padding: 20px;

		.aioseo-loading-spinner {
			position: relative;
			margin: 0 auto;
		}
	}

	.aioseo-wp-table .wp-table {
		td.manage-column,
		th.manage-column {
			padding: 8px 10px;
		}
	}
}
</style>