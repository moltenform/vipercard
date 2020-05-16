module.exports = {
    /* note: because prettier strips most formatting on its way down to an AST, */
    /* it strips parentheses from math expressions even when you've intentionally */
    /* added them. */

    /* and there's no way to disable this behavior, see */
    /* https://github.com/prettier/prettier/issues/3968 */
    /* almost a deal-breaker for me. for now I'll use prettier-ignore when needed. */

    semi: true,
    trailingComma: 'none',
    singleQuote: true,
    printWidth: 90,
    tabWidth: 4,
    arrowParens: 'avoid',
};
