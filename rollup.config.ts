import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
// import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

// tslint:disable-next-line: no-var-requires
const pkg = require('./package.json');
const libraryName = 'RxForm';

export default {
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  input: 'src/index.ts',
  output: [
    {
      file: pkg['umd:main'],
      format: 'umd',
      name: libraryName,
      sourcemap: false
    },
    {
      file: pkg.module,
      format: 'es',
      name: libraryName,
      sourcemap: true
    },
    {
      file: pkg.main,
      format: 'cjs',
      name: libraryName,
      sourcemap: true
    }
  ],
  plugins: [
    // Compile TypeScript files
    typescript({
      useTsconfigDeclarationDir: true
    }),
    babel(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    terser()
    // Resolve source maps to the original source
    // sourceMaps()
  ],
  watch: {
    include: 'src/**'
  }
};
