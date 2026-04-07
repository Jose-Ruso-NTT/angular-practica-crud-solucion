import * as tailwind from 'prettier-plugin-tailwindcss';

export default {
  printWidth: 100,
  singleQuote: true,
  plugins: [tailwind],
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};
