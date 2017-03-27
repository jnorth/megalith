import babel from 'rollup-plugin-babel';

export default {
  entry: 'index.js',
  targets: [
    { dest: 'dist/index.cjs.js', format: 'cjs' },
    { dest: 'dist/index.es.js', format: 'es' },
  ],
  plugins: [
    babel(),
  ],
};
