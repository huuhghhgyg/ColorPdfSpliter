/** @type {import('tailwindcss').Config} */

module.exports = {
    content: ["./*.html"],
    theme: {
        extend: {
            colors: {
                paper: {
                    50: '#fffdf7',
                    100: '#fffaf0',
                    200: '#fff8ea',
                    300: '#f7ecd7',
                    400: '#efe2c9',
                    500: '#efe7d8'
                },
                ink: {
                    DEFAULT: '#232323',
                    muted: '#675f54'
                },
                sage: '#667a62',
                clay: '#a45b48',
                brass: '#917b53'
            },
            boxShadow: {
                paper: '0 1px 3px rgba(35, 35, 35, 0.12)',
                upload: '0 1px 3px rgba(35, 35, 35, 0.12)',
                lift: '0 4px 12px rgba(35, 35, 35, 0.14)'
            },
            minHeight: {
                6: '1.5rem',
                12: '3rem',
                28: '7rem',
                32: '8rem',
                36: '9rem',
                40: '10rem',
                44: '11rem',
                48: '12rem'
            }
        },
        // https://www.tailwindcss.cn/docs/customizing-colors#default-color-palette
        colors: {
            brown: { container: '#ece2d8', accent: '#917b53' },
            dark: '#232323',
            white: '#ffffff',
            gray: {
                50: "#f9fafb",
                100: "#f3f4f6",
                200: "#e5e7eb",
                300: "#d1d5db",
                400: "#9ca3af",
                500: "#6b7280",
                600: "#4b5563",
                700: "#374151",
                800: "#1f2937",
                900: "#111827",
                950: "#030712"
            }
        },
    },
    plugins: [],
}
