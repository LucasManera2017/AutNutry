/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        login: "url('/images/backgroundLogin.jpg')",
      },
      borderColor: {
        'green-15': 'rgba(5, 223, 114, 0.15)',
      },
    },
  },
  plugins: [],
};
