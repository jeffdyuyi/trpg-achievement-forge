/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                wenkai: ['"LXGW WenKai"', 'serif'],
                sans: ['"LXGW WenKai"', 'Inter', 'sans-serif'],
            },
            colors: {
                gold: {
                    100: '#fbf5b7',
                    200: '#fcf6ba',
                    300: '#f0d060',
                    400: '#d4a017',
                    500: '#b38728',
                    600: '#bf953f',
                    700: '#aa771c',
                    800: '#8b6914',
                },
            },
            animation: {
                'shine': 'shine 3s linear infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                shine: {
                    'to': { backgroundPosition: '200% center' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 8px 2px rgba(191,149,63,0.4)' },
                    '50%': { boxShadow: '0 0 18px 6px rgba(252,246,186,0.7)' },
                },
                fadeIn: {
                    'from': { opacity: '0', transform: 'translateY(8px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    'from': { opacity: '0', transform: 'translateX(-12px)' },
                    'to': { opacity: '1', transform: 'translateX(0)' },
                },
            },
        },
    },
    plugins: [],
}
