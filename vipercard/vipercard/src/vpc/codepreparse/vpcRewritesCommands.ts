
/* auto */ import { LogToReplMsgBox } from './../vpcutils/vpcUtils';
/* auto */ import { BuildFakeTokens, ChvITk, tks } from './../codeparse/vpcTokens';
/* auto */ import { VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { checkCommonMistakenVarNames } from './vpcPreparseCommon';
/* auto */ import { MapTermToMilliseconds, VpcVisualEffectType, VpcVisualEffectTypeDestination, VpcVisualEffectTypeModifier } from './../vpcutils/vpcEnums';
/* auto */ import { checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { checkThrowEq, findStrToEnum, last, longstr } from './../../ui512/utils/util512';

/**
 * SyntaxRewriter rewrites syntax for some lines:
    1) To minimize number of tokens needed in the lexer (for faster lexing)
        for example:
        ask line 2 of x with "defaultText"
        we could make 'with' a token so that it wouldn't get lumped into the expression line 2 of x.
        but we want to minimze number of tokens.
        so instead, during codepreparse, if the command is ask, replace any tokens that are exactly 'with'.
        ask line 2 of x $syntaxmarker$ "defaultText"
        a $syntaxmarker$ is never part of an expression, and so the parser has no difficulty.
    2) To transform "repeat with x=1 to 5" into a "repeat while" loop with the same functionality
    3) To simplify parsing for a few commands
 */

/**
 * important:
 * replacements must be in raw form!
 * you shouldn't write
 *      'put 3 into x'
 * you should write
 *      'put 3 %MARK% into %MARK% x'
 * since that's what the put-rewriter would do.
 *
 * we will do a final pass for custom functions,
 * but everything else needs to be output in finished form here.
 */
export class VpcRewriteForCommands {
    rewriteAnswer(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'not enough args');
        if (line[1].image === 'file' || line[1].image === 'program') {
            return [this.hBuildNyi('answer ' + line[1].image, line[0])];
        }
        VpcSuperRewrite.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'with', false);
        return [line];
    }
    rewriteAsk(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'not enough args');
        if (line[1].image === 'file' || line[1].image === 'program') {
            return [this.hBuildNyi('ask ' + line[1].image, line[0])];
        }
        VpcSuperRewrite.replaceWithSyntaxMarkerAtLvl0(
            line,
            line[0],
            'password',
            false,
            ','
        );
        VpcSuperRewrite.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'with', false);
        return [line];
    }
    rewriteChoose(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'not enough args');
        if (last(line).image === 'tool' && line.length >= 3) {
            let s = line
                .slice(1, -1)
                .map(t => t.image)
                .join(' ');
            return [
                [
                    line[0],
                    BuildFakeTokens.inst.makeSyntaxMarker(line[0]),
                    BuildFakeTokens.inst.makeStringLiteral(line[0], s)
                ]
            ];
        } else {
            VpcSuperRewrite.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'tool', true);
            return [line];
        }
    }
    rewriteClick(line: ChvITk[]): ChvITk[][] {
        VpcSuperRewrite.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'with', false);
        return [line];
    }
    rewriteClose(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the close command', line[0])];
    }
    rewriteCommandkeydown(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the commandKeyDown command', line[0])];
    }
    rewriteConvert(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the convert command', line[0])];
    }
    rewriteCopy(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the copy command', line[0])];
    }
    rewriteCreate(line: ChvITk[]): ChvITk[][] {
        return [
            this.hBuildNyi(
                longstr(`the create command. Note: use 'doMenu
                    "Create Button"' to create a button and
                    'doMenu "Create Field"' to create a field.`),
                line[0]
            )
        ];
    }
    rewriteDebug(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the debug command', line[0])];
    }
    rewriteDelete(line: ChvITk[]): ChvITk[][] {
        return this.hReturnNyiIfMenuMentionedOutsideParens(line);
    }
    rewriteDisable(line: ChvITk[]): ChvITk[][] {
        return this.hReturnNyiIfMenuMentionedOutsideParens(line);
    }
    rewriteDo(line: ChvITk[]): ChvITk[][] {
        let template = `send ( %ARG0% ) to me`;
        return VpcSuperRewrite.go(template, line[0], [line.slice(1)]);
    }
    rewriteDoMenu(line: ChvITk[]): ChvITk[][] {
        let allImages = line.map(t => t.image).join('***') + '***';
        if (allImages.includes('***with***keys***')) {
            return [this.hBuildNyi('doMenu with keys', line[0])];
        } else if (allImages.includes('***without***dialog***')) {
            return [this.hBuildNyi('doMenu without dialog', line[0])];
        } else {
            return [line];
        }
    }
    rewriteDrag(line: ChvITk[]): ChvITk[][] {
        VpcSuperRewrite.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'with', false);
        return [line];
    }
    rewriteEdit(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the edit command', line[0])];
    }
    rewriteEnable(line: ChvITk[]): ChvITk[][] {
        return this.hReturnNyiIfMenuMentionedOutsideParens(line);
    }
    rewriteExport(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the export command', line[0])];
    }
    rewriteExit(line: ChvITk[]): ChvITk[][] {
        /* remove the 'to' for easier parsing later */
        checkThrow(line.length > 1, 'exit: not enough args');
        if (line[1].image === 'to') {
            line.splice(1, 1);
        }
        return [line];
    }
    rewriteFind(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the find command', line[0])];
    }
    rewriteGet(line: ChvITk[]): ChvITk[][] {
        let template = `put ( %ARG0% ) %INTO% it`;
        return VpcSuperRewrite.go(template, line[0], [line.slice(1)]);
    }
    rewriteGo(line: ChvITk[]): ChvITk[][] {
        checkThrow(
            line.length > 1,
            "8k|can't have just 'go' on its own. try 'go next' or 'go prev' "
        );
        let shouldSuspendHistory = 'false';
        if (
            line[1].image === 'back' ||
            line[1].image === 'forth' ||
            line[1].image === 'recent'
        ) {
            shouldSuspendHistory = 'true';
        }

        let template = `
global internalvpcgocardimplsuspendhistory
builtinInternalVpcGoCardImpl "gettarget" c%UNIQUE% %ARG0%
builtinInternalVpcGoCardImpl "closeorexitfield" c%UNIQUE%
builtinInternalVpcGoCardImpl "closecard" c%UNIQUE%
builtinInternalVpcGoCardImpl "closebackground" c%UNIQUE%
if ${shouldSuspendHistory} then
    put 1 %INTO% internalvpcgocardimplsuspendhistory
end if
builtinInternalVpcGoCardImpl "set" c%UNIQUE%
put 0 %INTO% internalvpcgocardimplsuspendhistory
builtinInternalVpcGoCardImpl "openbackground" c%UNIQUE%
builtinInternalVpcGoCardImpl "opencard" c%UNIQUE%
builtinInternalVpcGoCardImpl "setresult" c%UNIQUE%
        `;
        return VpcSuperRewrite.go(template, line[0], [line.slice(1), []]);
    }
    rewriteHide(line: ChvITk[]): ChvITk[][] {
        return this.hReturnNyiIfMenuMentionedOutsideParens(line);
    }
    rewriteImport(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the import command', line[0])];
    }
    rewriteKeydown(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the keydown command', line[0])];
    }
    rewriteMark(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the mark command', line[0])];
    }
    rewritePass(line: ChvITk[]): ChvITk[][] {
        /* add a return statement afterwards, solely to make code exec simpler. */
        return VpcSuperRewrite.go(
            `
%ARG0%
return 0`,
            line[0],
            [line]
        );
    }
    rewritePlay(line: ChvITk[]): ChvITk[][] {
        VpcSuperRewrite.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'tempo', false);
        return [line];
    }
    rewritePut(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'not enough args');

        let foundPreposition = -1;
        for (let i = 0; i < line.length; i++) {
            let tk = line[i];
            if (tk.image === 'into' || tk.image === 'before' || tk.image === 'after') {
                checkThrowEq(
                    -1,
                    foundPreposition,
                    '5#|expected to only see one of into, before, or after...'
                );
                foundPreposition = i;
            }
        }

        if (foundPreposition !== -1) {
            /* let's say you don't realize that "length" is a reserved word,
            and you try to use it as a variable. "put 4 into length"
            you'd get the error message NotAllInputParsed exception,
            which doesn't make too much sense, let's try to give you a better error message */
            checkCommonMistakenVarNames(last(line));
        } else {
            /* you can say `put 1+1` to add to the message box */
            foundPreposition = line.length;
            line.push(VpcSuperRewrite.tokenFromEnglishTerm('into', line[0]));
            line.push(
                VpcSuperRewrite.tokenFromEnglishTerm(
                    LogToReplMsgBox.redirectThisVariableToMsgBox,
                    line[0]
                )
            );
        }

        /* transform to put "abc" (TkSyntaxMarker) into (TkSyntaxMarker) x */
        line.splice(
            foundPreposition + 1,
            0,
            BuildFakeTokens.inst.makeSyntaxMarker(line[0])
        );
        line.splice(foundPreposition, 0, BuildFakeTokens.inst.makeSyntaxMarker(line[0]));
        return [line];
    }
    rewriteRead(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the read command', line[0])];
    }
    rewriteReplace(line: ChvITk[]): ChvITk[][] {
        VpcSuperRewrite.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'with', true);
        return [line];
    }
    rewriteReply(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the reply command', line[0])];
    }
    rewriteRequest(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the request command', line[0])];
    }
    rewriteSave(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the save command', line[0])];
    }
    rewriteSelect(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'not enough args');
        if (line[1].image === 'empty') {
            checkThrowEq(1, line.length, 'select empty should be alone');
            return [[line[0], BuildFakeTokens.inst.makeStringLiteral(line[0], 'empty')]];
        } else {
            let startContainer = 1;
            let ret = [line[0]];
            let whereToSelect = 'all';
            if (line[1].image === 'before') {
                whereToSelect = 'before';
                startContainer += 1;
            } else if (line[1].image === 'after') {
                whereToSelect = 'after';
                startContainer += 1;
            }

            checkThrow(
                line[startContainer].tokenType === tks.tkChunkGranularity ||
                    'text' === line[startContainer].image,
                'we only support `select *text* of` or `select char 2 of'
            );
            if ('text' === line[startContainer].image) {
                startContainer += 1;
                checkThrowEq(
                    'of',
                    line[startContainer].image,
                    'we only support `select text *of*`'
                );
                startContainer += 1;
            }

            let container = line.slice(startContainer);
            ret.push(BuildFakeTokens.inst.makeStringLiteral(line[0], whereToSelect));
            return [ret.concat(container)];
        }
    }
    rewriteShow(line: ChvITk[]): ChvITk[][] {
        for (let unsupportedTerm of ['all', 'menu', 'picture', 'window']) {
            if (
                VpcSuperRewrite.searchTokenGivenEnglishTermInParensLevel(
                    0,
                    line,
                    line[0],
                    unsupportedTerm
                ) !== -1
            ) {
                return [this.hBuildNyi(`the show ${unsupportedTerm} command`, line[0])];
            }
        }
        return [line];
    }
    rewriteSort(line: ChvITk[]): ChvITk[][] {
        let allImages = line.map(t => t.image).join('***') + '***';
        if (
            allImages.startsWith('sort***cards') ||
            allImages.startsWith('sort***cds') ||
            allImages.startsWith('sort***marked***cards') ||
            allImages.startsWith('sort***marked***cds')
        ) {
            return [this.hBuildNyi(`sorting by cards`, line[0])];
        }
        let sortOptions = new Map<string, string>();
        sortOptions['order'] = 'ascending';
        sortOptions['granularity'] = 'lines';
        sortOptions['method'] = 'text';
        let lastOpt = 1;
        let foundBy = -1;
        for (let i = 0; i < line.length; i++) {
            let t = line[i];
            if (t.image === 'ascending' || t.image === 'descending') {
                lastOpt = i;
                sortOptions['order'] = t.image;
            } else if (
                t.image === 'text' ||
                t.image === 'numeric' ||
                t.image === 'international' ||
                t.image === 'dateTime'
            ) {
                lastOpt = i;
                sortOptions['method'] = t.image;
            } else if (t.image === 'lines' || t.image === 'items') {
                lastOpt = i;
                sortOptions['granularity'] = t.image;
            } else if (t.image === 'by') {
                foundBy = i;
                break;
            }
        }
        lastOpt += 1;
        if (line[lastOpt].image === 'of') {
            lastOpt += 1;
        }

        let containerExpression = line.slice(lastOpt);
        if (foundBy) {
            containerExpression = line.slice(lastOpt, foundBy);
        }

        let template = longstr(
            `internalvpcsort
            "${sortOptions['granularity']}"
            "${sortOptions['method']}"
            "${sortOptions['order']}" %ARG0%`
        );
        let cmd = VpcSuperRewrite.go(template, line[0], [containerExpression]);
        if (!foundBy) {
            return cmd;
        } else {
            // let's build a sort here! use decorate-sort-undecorate
            if (
                sortOptions['granularity'] !== 'items' &&
                sortOptions['granularity'] !== 'lines'
            ) {
                return [
                    this.hBuildNyi(
                        'for expr, we only support sorting by lines or items',
                        line[0]
                    )
                ];
            }

            /* check_long_lines_silence_subsequent */
            let delimExpr = sortOptions['granularity'] === 'items' ? 'the itemDel' : 'cr';
            let byExpr = line.slice(foundBy + 1);
            let internalDelim = '\x01\x01\x01vpcinternal\x01\x01\x01';
            let template = `
put ( %ARG0% ) %INTO% content%UNIQUE%
if length ( content%UNIQUE% ) then
    if "${internalDelim}" is in content%UNIQUE% then
        cantSortTextByExpressionThatHasThis
    end if
    put "" %INTO% container%UNIQUE%
    repeat with loop%UNIQUE% = 1 to the number of ${sortOptions['granularity']} of content%UNIQUE%
        put ${sortOptions['granularity']} loop%UNIQUE% of content%UNIQUE% %INTO% each
        put ( %ARG1% ) %INTO% sortkey%UNIQUE%
        put sortkey%UNIQUE% && "${internalDelim}" && each & ${delimExpr} %AFTER% container%UNIQUE%
    end repeat
    put char 1 to (the length of container%UNIQUE% - the length of ${delimExpr}) of container%UNIQUE% %INTO% container%UNIQUE%
    %ARG2%
    put "" %INTO% result%UNIQUE%
    repeat with loop%UNIQUE% = 1 to the number of ${sortOptions['granularity']} of container%UNIQUE%
        put ${sortOptions['granularity']} loop%UNIQUE% of container%UNIQUE% %INTO% each
        put char ( offset ( "${internalDelim}" , each ) + ${internalDelim.length} ) to ( the length of each ) of each %INTO% each
        put each & ${delimExpr} %AFTER% result%UNIQUE%
    end repeat
    put char 1 to (the length of result%UNIQUE% - the length of ${delimExpr}) of result%UNIQUE% %INTO% result%UNIQUE%
    put result%UNIQUE% %INTO% %ARG0%
end if`;
            return VpcSuperRewrite.go(template, line[0], [
                containerExpression,
                byExpr,
                cmd[0]
            ]);
        }
    }
    rewriteStart(line: ChvITk[]): ChvITk[][] {
        return this.hReturnNoOp(line);
    }
    rewriteStop(line: ChvITk[]): ChvITk[][] {
        return this.hReturnNoOp(line);
    }
    rewriteSubtract(line: ChvITk[]): ChvITk[][] {
        VpcSuperRewrite.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'from', true);
        return [line];
    }
    rewriteType(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the type command', line[0])];
    }
    rewriteUnlock(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'not enough args');
        if (line[1].image !== 'screen') {
            return [this.hBuildNyi('any type of unlock besides unlock screen', line[0])];
        } else {
            return this.hParseVisualEffect(line, 'unlock screen');
        }
    }
    rewriteUnmark(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the unmark command', line[0])];
    }
    rewriteVisual(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'not enough args');
        if (line[1].image !== 'effect') {
            return [this.hBuildNyi('any type of visual besides visual effect', line[0])];
        } else {
            return this.hParseVisualEffect(line, 'visual effect');
        }
    }
    rewriteWait(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'not enough args');
        if (line[1].image === 'for') {
            line.splice(1, 1);
        }

        if (line[1].image === 'until' || line[1].image === 'while') {
            // remember that the only type of repeat we can make is an unconditional one
            let isNegated = line[1].image === 'while' ? 'not' : '';
            let template = `
repeat
    if ${isNegated} ( %ARG0% ) then
        exit repeat
    end if
    wait 100 "ms"
end repeat`;
            return VpcSuperRewrite.go(template, line[0], [line.slice(2)]);
        } else {
            let asQuantity = findStrToEnum<MapTermToMilliseconds>(
                MapTermToMilliseconds,
                last(line).image
            );
            if (asQuantity) {
                line[line.length - 1] = BuildFakeTokens.inst.makeStringLiteral(
                    line[0],
                    last(line).image
                );
            }

            return [line];
        }
    }

    hParseVisualEffect(line: ChvITk[], prefix: string) {
        let opts = new Map<string, string>();
        opts['speed'] = 'slow';
        opts['speedmodify'] = '';
        opts['method'] = '';
        opts['modifier'] = '';
        opts['dest'] = 'card';
        for (let t of line) {
            if (t.image === 'slow' || t.image === 'slowly' || t.image === 'fast') {
                opts['speed'] = t.image;
            } else if (t.image === 'very') {
                opts['speedmodify'] = t.image;
            } else {
                let foundMethod = findStrToEnum<VpcVisualEffectType>(
                    VpcVisualEffectType,
                    t.image
                );
                let foundModifier = findStrToEnum<VpcVisualEffectTypeModifier>(
                    VpcVisualEffectTypeModifier,
                    t.image
                );
                let foundDest = findStrToEnum<VpcVisualEffectTypeDestination>(
                    VpcVisualEffectTypeDestination,
                    t.image
                );
                if (foundMethod) {
                    opts['method'] = t.image;
                } else if (foundModifier) {
                    opts['modifier'] = t.image;
                } else if (foundDest) {
                    opts['dest'] = t.image;
                } else if (
                    t.image !== 'to' &&
                    t.image !== 'from' &&
                    t.image !== 'door' &&
                    t.image !== 'blinds'
                ) {
                    checkThrow(false, 'unknown visual effect term', t.image);
                }
            }
        }

        let template = longstr(
            `${prefix} "${opts['speed']}" "${opts['speedmodify']}"
            "${opts['method']}" "${opts['modifier']}" "${opts['dest']}" `
        );
        return VpcSuperRewrite.go(template, line[0], []);
    }

    hBuildNyi(msg: string, basis: ChvITk) {
        return [
            BuildFakeTokens.inst.makeTk(
                basis,
                tks.tkIdentifier,
                'internalShowNyiMessage'
            ),
            BuildFakeTokens.inst.makeStringLiteral(basis, msg)
        ];
    }

    hReturnNyiIfMenuMentionedOutsideParens(line: ChvITk[]): ChvITk[][] {
        let found = VpcSuperRewrite.searchTokenGivenEnglishTermInParensLevel(
            0,
            line,
            line[0],
            'menu'
        );
        if (found !== -1) {
            return [this.hBuildNyi('deleting from a menu', line[0])];
        } else {
            return [line];
        }
    }

    hReturnNoOp(line: ChvITk[]): ChvITk[][] {
        let template = `put "no-op" %INTO% c%UNIQUE% `;
        return VpcSuperRewrite.go(template, line[0], []);
    }
}
