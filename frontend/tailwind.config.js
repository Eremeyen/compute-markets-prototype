/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				cmx: {
					green: '#31D158',
					red: '#E3492B',
					gold: '#C5AC7A',
				},
			},
		},
	},
	plugins: [],
};
