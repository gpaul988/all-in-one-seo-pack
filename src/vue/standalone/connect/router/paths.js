import { __, sprintf } from '@wordpress/i18n'

const td       = import.meta.env.VITE_TEXTDOMAIN
const loadView = view => {
	return () => import(`../views/${view}.vue`)
}

export default [
	{
		path     : '*',
		redirect : '/'
	},
	{
		path      : '/',
		name      : 'main',
		component : loadView('Main'),
		meta      : {
			access : 'aioseo_manage_seo',
			name   : sprintf(
				// Translators: 1 - The plugin short name ("AIOSEO").
				__('Connect with %1$s', td),
				import.meta.env.VITE_SHORT_NAME
			)
		}
	}
]