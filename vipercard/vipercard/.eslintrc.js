// Useful references:
// https://www.npmjs.com/package/eslint-config-react-app
// https://github.com/facebook/create-react-app/blob/master/packages/eslint-config-react-app/index.js
// https://medium.com/@dors718/linting-your-react-typescript-project-with-eslint-and-prettier-2423170c3d42

// to run it from a shell
// npm run lint

const path = require('path');
module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    plugins: [
        '@typescript-eslint',
        'ban',
        // not 'prettier', we don't run prettier through eslint as it's slow
        // to run prettier, instead run `npm run prettierexceptlongimports`
    ],
    env: {
        browser: true,
        jest: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'plugin:@typescript-eslint/recommended-requiring-type-checking', // You need both to actually get the defaults
        'prettier/@typescript-eslint', // Disable ESLint rules if their redundant with a prettier error 
        // 'plugin:prettier/recommended' // Displays prettier errors as ESLint errors. (must be last)
    ],
    parserOptions: {
        project: path.resolve(__dirname, './tsconfig.json'),
        tsconfigRootDir: __dirname,
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        ecmaFeatures: {
            jsx: true // Allows for the parsing of JSX
        }
    },
    rules: {
        // let's alter rules from the recommendations above
        // turn off ones that typescript does a better job at
        'no-undef': 'off',
        'no-redeclare': 'off',

        // won't let you do myList.reduce(Util512.add)
        '@typescript-eslint/unbound-method': 'off',

        // don't needlessly have a call() or apply()
        'no-useless-call': 'warn', 

        // apply is dangerous, there could be max arg limits. see also the ban/ban
        'prefer-spread': 'warn', 

        // personal preference, ones that I think are fine
        'no-inner-declarations': 'off',
        'no-prototype-builtins': 'off',
        'no-debugger': 'off',
        'no-constant-condition': 'off',
        'prefer-const': 'off',
        'prefer-destructuring': 'off',

        // typescript, ones that I think are fine
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/class-name-casing': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/prefer-regexp-exec': 'off',
        '@typescript-eslint/promise-function-async': 'off',

        // leaving disabled, since default vals in classes seem to work fine
        'no-invalid-this': 'off',

        // we want let s1 || 'default' to be an error, s1 ?? 'default' is better
        // should I enable strict-boolean-expressions to detect this? 
        // no, causes false positives for code like if (str1) {...} which I think is ok.
        // so I've written my own || check, which runs when you run `npm run prettierexceptlongimports`
        '@typescript-eslint/prefer-nullish-coalescing': ["error", { 
            ignoreConditionalTests: false,
            ignoreMixedLogicalExpressions: false,
            forceSuggestionFixer: false,
          },],

        // went through all non-default ones, chose to turn these on
        'curly': 'warn',
        'eqeqeq': 'warn',
        'no-template-curly-in-string': 'warn',
        'block-scoped-var': 'warn',
        'default-case': 'warn',
        'default-param-last': 'warn',
        'guard-for-in': 'warn',
        'no-caller': 'warn',
        'no-constructor-return': 'warn',
        'no-eval': 'warn',
        'no-extend-native': 'warn',
        'no-extra-bind': 'warn',
        'no-extra-label': 'warn',
        'no-floating-decimal': 'warn',
        'no-implicit-coercion': 'warn',
        'no-implied-eval': 'warn',
        'no-labels': 'warn',
        'no-loop-func': 'warn',
        'no-new-func': 'warn',
        'no-new-wrappers': 'warn',
        'no-octal-escape': 'warn',
        'no-return-assign': 'warn',
        'no-return-await': 'warn',
        'no-self-compare': 'warn',
        'no-sequences': 'warn',
        'no-throw-literal': 'warn',
        'no-unused-expressions': 'warn',
        'wrap-iife': 'warn',
        'no-array-constructor': 'warn',
        'no-multi-assign': 'warn',
        'no-tabs': 'warn',
        'no-var': 'warn',
        'prefer-rest-params': 'warn',

        // unfortunately incompatible with prettier, see .prettier.js for more
        'no-mixed-operators': 'off',

        // went through all non-default ts ones, chose to turn these on
        '@typescript-eslint/no-extra-non-null-assertion': 'warn',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-implied-eval': 'warn',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
        '@typescript-eslint/no-throw-literal': 'warn',
        '@typescript-eslint/require-array-sort-compare': 'warn',

        // checks locals, not fn params.
        // annoying to leave this on while editing, so we'll use typescript 6133 instead
        // and leave typescript warning 6133 on only when building for production
        '@typescript-eslint/no-unused-vars': 'off', 

        // don't need `radix` due to ban below
        // don't need `prefer-for-of`, in some cases I want the slightly-faster for in
        // don't need `no-duplicate-super`, no longer seen
        // no-param-reassign might be useful one day
        // id-blacklist might be useful one day

        "ban/ban": [
            1, // warn
            {"name": ["*", "apply"], "message": "apply is dangerous, there could be max arg limits."},
            {"name": "parseInt", "message": "prefer my parseint in utils, don't need to remember to specify base10."},
            {"name": ["*", "setTimeout"], "message": "use syncToAsyncTransition instead or exceptions won't get logged."},
            {"name": "setTimeout", "message": "use syncToAsyncTransition instead or exceptions won't get logged."},
            {"name": ["*", "setInterval"], "message": "use syncToAsyncTransition instead or exceptions won't get logged."},
            {"name": "setInterval", "message": "use syncToAsyncTransition instead or exceptions won't get logged."},
        ]
    },
    settings: {
    }
};
