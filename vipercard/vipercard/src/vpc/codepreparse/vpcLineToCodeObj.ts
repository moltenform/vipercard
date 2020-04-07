
/* auto */ import { CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { isTkType, tks } from './../codeparse/vpcTokens';
/* auto */ import { VpcChvParser } from './../codeparse/vpcParser';
/* auto */ import { CheckReservedWords } from './vpcCheckReserved';
/* auto */ import { O, checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../ui512/utils/util512';

/**
 * determine the category of a line of code
 */
export class DetermineCategory {
    reusableRequestEval: ChvIToken;
    reusableRequestUserHandler: ChvIToken;
    constructor(
        protected idGen: CountNumericId,
        protected parser: VpcChvParser,
        protected mapBuiltinCmds: MapBuiltinCmds,
        protected check: CheckReservedWords
    ) {}

    /**
     * some variable names can't be used because they are separate tokens in the lexer
     * since a variable name must be a TkIdentifier token, if you tried to do this,
     * you'd get a weird "syntax error" instead of just saying "you can't use this variable name"
     *
     * so let's do a few basic checks here to try to give you a better error message
     */
    static checkCommonMistakenVarNames(tk: O<ChvIToken>) {
        checkThrow(
            !tk || !isTkType(tk, tks.TokenTkadjective),
            `8f|we don't support variables named "short", "long", etc`
        );

        checkThrow(
            !tk || !isTkType(tk, tks.TokenNumber),
            `8e|we don't support variables named "number"`
        );
        checkThrow(
            !tk || !isTkType(tk, tks.TokenLength),
            `Jj|we don't support variables named "length"`
        );
        checkThrow(
            !tk || !isTkType(tk, tks.TokenContains),
            `Ji|we don't support variables named "contains"`
        );
        checkThrow(
            !tk || !isTkType(tk, tks.TokenWithin),
            `8d|we don't support variables named "within"`
        );
        checkThrow(
            !tk || !isTkType(tk, tks.TokenId),
            `8c|we don't support variables named "id"`
        );
        checkThrow(
            !tk || !isTkType(tk, tks.TokenTkordinal),
             deleteThis.longstr(`Jh|we don't support variables with names like "first", "last", "second", "middle", "any"`, '')
        );
        checkThrow(
            !tk || !isTkType(tk, tks.TokenTkcharorwordoritemorlineorplural),
            `Jg|we don't support variables with names like "char", "word", "item", "line"`
        );
        checkThrow(
            !tk || !isTkType(tk, tks.TokenTkmultdivideexpdivmod),
            `Jf|we don't support variables with names like "div", "mod"`
        );
        checkThrow(
            !tk || !isTkType(tk, tks.TokenTkbkgndorpluralsyn),
            `Je|we don't support variables with names like "bgs", "bkgnds", "backgrounds"`
        );
        checkThrow(
            !tk || !isTkType(tk, tks.TokenTkcardorpluralsyn),
            `Jd|we don't support variables with names like "cds", "cards"`
        );
        checkThrow(
            !tk || !isTkType(tk, tks.TokenTkbtnorpluralsyn),
            `Jc|we don't support variables with names like "btns", "buttons"`
        );
        checkThrow(
            !tk || !isTkType(tk, tks.TokenTkfldorpluralsyn),
            `8b|we don't support variables with names like "flds", "fields"`
        );
    }
}
