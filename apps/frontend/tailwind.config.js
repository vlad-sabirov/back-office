/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('./config/tailwind/color.js');
const border = require('./config/tailwind/border.js');
const outline = require('./config/tailwind/outline.js');
const zIndex = require('./config/tailwind/z-index.js');
const font = require('./config/tailwind/font.js');
const sizes = require('./config/tailwind/sizes.js');

/** @type {import("tailwindcss").Config} */
module.exports = {
	content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
	theme: {
		height: { ...sizes, full: '100%', screen: '100vh' },
		width: { ...sizes, full: '100%', screen: '100vw' },
		fontWeight: font.weight,
		borderRadius: border.radius,
		outlineWidth: outline.width,
		margin: sizes,
		padding: sizes,
		inset: sizes,
		gap: sizes,
		colors,
		zIndex,
		extend: {
			transitionTimingFunction: { DEFAULT: 'ease-in-out' },
			transitionDuration: { DEFAULT: '200ms' },
			animation: {
				pulseOutline: 'pulseOutline 1.5s infinite',
				pulseSkeleton: 'pulseSkeleton 1.5s infinite',
				shake: 'shake 2s infinite',
				jello: 'jello 2s infinite',
				rubberBand: 'rubberBand 1s infinite',
			},
			keyframes: {
				pulseOutline: {
					'0%, 100%': { outlineWidth: 2 },
					'15%, 85%': { outlineWidth: 6 },
				},
				pulseSkeleton: {
					'0%, 100%': { opacity: 0.6 },
					'45%, 55%': { opacity: 1 },
				},
				shake: {
					'5%': { transform: 'rotate3d(0, 0, 1, 20deg)' },
					'10%': { transform: 'rotate3d(0, 0, 1, -15deg)' },
					'15%': { transform: 'rotate3d(0, 0, 1, 7deg)' },
					'20%': { transform: 'rotate3d(0, 0, 1, -7deg)' },
					to: { transform: 'rotate3d(0, 0, 1, 0deg)' },
				},
				rubberBand: {
					from: { transform: 'scale3d(1, 1, 1)' },
					'30%': { transform: 'scale3d(1.25, 0.75, 1)' },
					'40%': { transform: 'scale3d(0.75, 1.25, 1)' },
					'50%': { transform: 'scale3d(1.15, 0.85, 1)' },
					'65%': { transform: 'scale3d(0.95, 1.05, 1)' },
					'75%': { transform: 'scale3d(1.05, 0.95, 1)' },
					to: { transform: 'scale3d(1, 1, 1)' },
				},
				jello: {
					'from, 11.1%,to': { transform: 'translate3d(0, 0, 0)' },
					'22.2%': { transform: 'skewX(-12.5deg) skewY(-12.5deg)' },
					'33.3%': { transform: 'skewX(6.25deg) skewY(6.25deg)' },
					'44.4%': { transform: 'skewX(-3.125deg) skewY(-3.125deg)' },
					'55.5%': { transform: 'skewX(1.5625deg) skewY(1.5625deg)' },
					'66.6%': { transform: 'skewX(-0.78125deg) skewY(-0.78125deg)' },
					'77.7%': { transform: 'skewX(0.390625deg) skewY(0.390625deg)' },
					'88.8%': { transform: 'skewX(-0.1953125deg) skewY(-0.1953125deg)' },
				},
			},
		},
	},
	plugins: [],
};
