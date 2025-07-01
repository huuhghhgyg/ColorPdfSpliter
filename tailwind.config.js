/** @type {import('tailwindcss').Config} */

module.exports = {
    content: ["./*.html"],
    theme: {
        extend: {},
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