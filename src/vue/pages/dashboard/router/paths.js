import { __ } from '@wordpress/i18n'

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
		name      : 'dashboard',
		component : loadView('Main'),
		meta      : {
			access : 'aioseo_dashboard',
			name   : __('Dashboard', td)
		}
	}
]