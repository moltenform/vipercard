
/* auto */ import { BuildFakeTokens, ChvITk, tks } from './../codeparse/vpcTokens';
/* auto */ import { VpcRewritesLoops } from './vpcRewritesLoops';
/* auto */ import { VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { checkCommonMistakenVarNames } from './vpcPreparseCommon';
/* auto */ import { VpcTool, VpcVisualEffectType, VpcVisualEffectTypeDestination, VpcVisualEffectTypeDirection, checkThrow, checkThrowEq } from './../vpcutils/vpcEnums';
/* auto */ import { ChunkResolutionSort } from './../vpcutils/vpcChunkResolutionSort';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, arLast, findStrToEnum, longstr } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
 *      'put 3 %INTO% x'
 * since that's what the put-rewriter would do.
 *
 * we will do a final pass for custom functions,
 * but everything else needs to be output in finished form here.
 */
export class VpcRewriteForCommands {
    constructor(protected rw: VpcSuperRewrite) {}
    rewriteAnswer(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'T1|not enough args');
        if (line[1].image === 'file' || line[1].image === 'program') {
            return [this.hBuildNyi('answer ' + line[1].image, line[0])];
        }
        this.rw.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'with', false);
        return [line];
    }
    rewriteAsk(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'T0|not enough args');
        if (line[1].image === 'file' || line[1].image === 'program') {
            return [this.hBuildNyi('ask ' + line[1].image, line[0])];
        }

        this.rw.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'password', false, ',');
        this.rw.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'with', false);
        return [line];
    }
    rewriteChoose(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'S~|not enough args');

        /* delete "tool" */
        let found = this.rw.searchTokenGivenEnglishTerm(line, line[0], 'tool');
        checkThrow(found !== -1, "S}|expected to see something like 'choose brush tool'");
        line.splice(found, 1);

        /* turn "spray can" into "spray" */
        found = this.rw.searchTokenGivenEnglishTerm(line, line[0], 'can');
        if (found !== -1 && found !== 0) {
            if (line[found - 1].image === 'spray') {
                line.splice(found, 1);
            }
        }

        /* turn "round rect" into "round" */
        found = this.rw.searchTokenGivenEnglishTerm(line, line[0], 'rect');
        if (found !== -1 && found !== 0) {
            if (line[found - 1].image === 'round') {
                line.splice(found, 1);
            }
        }

        /* turn "reg poly" into "reg", "regular poly" into "regular" */
        found = this.rw.searchTokenGivenEnglishTerm(line, line[0], 'poly');
        if (found !== -1 && found !== 0) {
            if (line[found - 1].image === 'reg' || line[found - 1].image === 'regular') {
                line.splice(found, 1);
            }
        }

        /* turn "reg polygon" into "reg", "regular polygon" into "regular" */
        found = this.rw.searchTokenGivenEnglishTerm(line, line[0], 'polygon');
        if (found !== -1 && found !== 0) {
            if (line[found - 1].image === 'reg' || line[found - 1].image === 'regular') {
                line.splice(found, 1);
            }
        }

        /* turn any plain identifiers that are valid VpcTools into string literals */
        for (let i = 0; i < line.length; i++) {
            let im = line[i].image;
            let en = findStrToEnum<VpcTool>(VpcTool, im);
            if (en !== undefined) {
                line[i] = BuildFakeTokens.makeStringLiteral(line[i], im);
            }
        }

        return [line];
    }
    rewriteClick(line: ChvITk[]): ChvITk[][] {
        this.rw.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'with', false);
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
    rewriteDivide(line: ChvITk[]): ChvITk[][] {
        this.rw.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'by', true);
        return [line];
    }
    rewriteDo(line: ChvITk[]): ChvITk[][] {
        let template = `send ( %ARG0% ) to me`;
        return this.rw.gen(template, line[0], [line.slice(1)]);
    }
    rewriteDoMenu(line: ChvITk[]): ChvITk[][] {
        let allImages = line.map(t => t.image).join('***') + '***';
        if (allImages.includes('***with***keys***')) {
            return [this.hBuildNyi('doMenu with keys', line[0])];
        } else if (allImages.includes('***without***dialog***')) {
            return [this.hBuildNyi('doMenu without dialog', line[0])];
        } else {
            /* use internalvpcdeletebghelper to delete a bg */
            /* before, we partially supported domenu by looking for string literals,
            i.e. domenu "back" could be rewritten to go back.
            that doesn't work if the domenu can be trapped, though.
            current design is much better: in fact, many ui commands themselves
            will call domenu, going through domenu will be the true implementation,
            since it's simpler to call events like closecard and opencard.
            see silenceMessagesForUIAction. */
            return [line];
        }
    }
    rewriteDrag(line: ChvITk[]): ChvITk[][] {
        this.rw.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'with', false);
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
        checkThrow(line.length > 1, 'S||exit: not enough args');
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
        return this.rw.gen(template, line[0], [line.slice(1)]);
    }
    rewriteGo(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, "8k|can't have just 'go' on its own. try 'go next' or 'go prev' ");
        /* remove the "to" */
        if (line[1].image === 'to') {
            line.splice(1, 1);
        }

        let shouldSuspendHistory = '""';
        if (line[1].image === 'back' || line[1].image === 'recent') {
            shouldSuspendHistory = '"applyback"';
        } else if (line[1].image === 'forth') {
            shouldSuspendHistory = '"applyforth"';
        }

        let allImages = line.map(t => t.image).join('***') + '***';
        if (allImages.includes('***new***window***')) {
            return [this.hBuildNyi(`go to new window`, line[0])];
        } else if (allImages.includes('***without***dialog***')) {
            return [this.hBuildNyi(`go without dialog`, line[0])];
        }

        let template = '';
        if (line.length === 2 && (line[1].tokenType === tks.tkOrdinal || line[1].tokenType === tks.tkPosition)) {
            template = `
if there is a %ARG0% card then
    internalvpcmovecardhelper ( the short id of %ARG0% card ) , ${shouldSuspendHistory}
else
    internalvpcmovecardhelper -1000 , ${shouldSuspendHistory}
end if`;
        } else {
            /* the id might refer to a bg or stack, we will correctly handle that.
            also note that `the id of back` is correctly understood.
            to match the product, we need to say 'short id' */
            template = `
if there is a %ARG0% then
    internalvpcmovecardhelper  ( the short id of %ARG0% ) , ${shouldSuspendHistory}
else
    internalvpcmovecardhelper -1000 , ${shouldSuspendHistory}
end if`;
        }
        return this.rw.gen(template, line[0], [line.slice(1)]);
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
    rewriteLock(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length === 2, "S{|we only support 'lock screen'");
        if (line[1].image !== 'screen') {
            return [this.hBuildNyi('any type of unlock besides unlock screen', line[0])];
        } else {
            /* make it just "lock" */
            return [[line[0]]];
        }
    }
    rewriteMark(line: ChvITk[], fromUnmark=false): ChvITk[][] {
        checkThrow(line.length > 1, "not enough args for mark/unmark.");
        let isAll = false
        if (line[1].image === 'cards') {
            if (line[2].image === 'where') {
                return this.hBuildMarkExpression(line.slice(3), fromUnmark)
            } else {
                return [this.hBuildNyi('this type of mark expression', line[0])];
            }
        } else if (line[1].image === 'all') {
            if (line[2].image === 'cards' || line[2].image === 'cds') {
                isAll = true
            } else {
                checkThrow(false, "expected mark all cards")
            }
        }
        
        let ret:ChvITk[] = [line[0]]
        if (fromUnmark) {
            ret.push(this.rw.tokenFromEnglishTerm('not', line[0]))
        }

        if (isAll) {
            ret.push(line[1])
        } else {
            ret.push(BuildFakeTokens.makeSyntaxMarker(line[0]))
            ret = ret.concat(line.slice(1))
        }
        return [ret]
    }
    rewriteMultiply(line: ChvITk[]): ChvITk[][] {
        this.rw.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'by', true);
        return [line];
    }
    rewritePass(line: ChvITk[]): ChvITk[][] {
        /* add a return statement afterwards, solely to make code exec simpler. */
        return this.rw.gen(
            `%ARG0%
return 0`,
            line[0],
            [line]
        );
    }
    rewritePop(line: ChvITk[]): ChvITk[][] {
        /* two forms: only one actually moves it */
        checkThrow(line.length >= 2, 'S_|not enough args');
        checkThrowEq(tks.tkCard, line[1], 'S^|must be pop *card*');
        if (line.length === 2) {
            return this.rw.gen('pop true', line[0]);
        } else {
            let newCode = `
pop false
put the result %ARG0%`;
            let gen = this.rw.gen(newCode, line[0], [line.slice(2)]);
            let fixedPut = this.rewritePut(gen[1]);
            return [gen[0], fixedPut[0]];
        }
    }
    rewritePlay(line: ChvITk[]): ChvITk[][] {
        this.rw.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'tempo', false);
        return [line];
    }
    rewritePush(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length === 2, 'S]|expect 2 args');
        checkThrowEq(tks.tkCard, line[1], 'S[|must be push *card*');
        return this.rw.gen('push "card"', line[0]);
    }
    rewritePut(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'S@|not enough args');

        let foundPreposition = -1;
        for (let i = 0; i < line.length; i++) {
            let tk = line[i];
            if (tk.image === 'into' || tk.image === 'before' || tk.image === 'after') {
                checkThrowEq(-1, foundPreposition, '5#|expected to only see one of into, before, or after...');
                foundPreposition = i;
            }
        }

        if (foundPreposition !== -1) {
            /* let's say you don't realize that "length" is a reserved word,
            and you try to use it as a variable. "put 4 into length"
            you'd get the error message NotAllInputParsed exception,
            which doesn't make too much sense, let's try to give you a better error message */
            checkCommonMistakenVarNames(arLast(line));
        } else {
            /* you can say `put 1+1` to add to the message box */
            foundPreposition = line.length;
            line.push(this.rw.tokenFromEnglishTerm('into', line[0]));
            line.push(this.rw.tokenFromEnglishTerm('msg', line[0]));
            line.push(this.rw.tokenFromEnglishTerm('box', line[0]));
        }

        /* transform to put "abc" (TkSyntaxMarker) into (TkSyntaxMarker) x */
        line.splice(foundPreposition + 1, 0, BuildFakeTokens.makeSyntaxMarker(line[0]));
        line.splice(foundPreposition, 0, BuildFakeTokens.makeSyntaxMarker(line[0]));
        return [line];
    }
    rewriteRead(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the read command', line[0])];
    }
    rewriteReplace(line: ChvITk[]): ChvITk[][] {
        this.rw.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'with', true);
        return [line];
    }
    rewriteReply(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the reply command', line[0])];
    }
    rewriteRequest(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the request command', line[0])];
    }
    rewriteReset(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length === 2, "S?|we only support 'reset paint");
        if (line[1].image !== 'paint') {
            return [this.hBuildNyi('any type of unlock besides reset paint', line[0])];
        } else {
            return [line];
        }
    }
    rewriteSave(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the save command', line[0])];
    }
    rewriteSelect(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'S>|not enough args');
        if (line[1].image === 'empty') {
            checkThrowEq(1, line.length, 'S=|select empty should be alone');
            return [[line[0], BuildFakeTokens.makeStringLiteral(line[0], 'empty')]];
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
                line[startContainer].tokenType === tks.tkChunkGranularity || 'text' === line[startContainer].image,
                'S<|we only support `select *text* of` or `select char 2 of'
            );
            if ('text' === line[startContainer].image) {
                startContainer += 1;
                checkThrowEq('of', line[startContainer].image, 'S;|we only support `select text *of*`');
                startContainer += 1;
            }

            let container = line.slice(startContainer);
            ret.push(BuildFakeTokens.makeStringLiteral(line[0], whereToSelect));
            return [ret.concat(container)];
        }
    }
    rewriteShow(line: ChvITk[]): ChvITk[][] {
        this.rw.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'at', false);

        for (let unsupportedTerm of ['all', 'menu', 'picture', 'window']) {
            if (this.rw.searchTokenGivenEnglishTermInParensLevel(0, line, line[0], unsupportedTerm) !== -1) {
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
            return [this.hBuildNyi(`We don't yet support sorting by cards`, line[0])];
        }

        /* split off by */
        let byPhrase: O<ChvITk[]>;
        let byLvl0 = this.rw.searchTokenGivenEnglishTermInParensLevel(0, line, line[0], 'by');
        if (byLvl0 !== -1) {
            byPhrase = line.slice(byLvl0 + 1);
            line = line.slice(0, byLvl0);
            checkThrow(byPhrase.length, "S:|expect something like 'sort lines of x by char 1 of each'");
        }

        /* go backwards and pick up sort options until we don't see the first that isn't one */
        let sortOptions: { [key: string]: string } = {};
        sortOptions['order'] = 'ascending';
        sortOptions['method'] = 'text';

        /* support old-style ones where ascending/descending could be anywhere*/
        let found = this.rw.searchTokenGivenEnglishTermInParensLevel(0, line, line[0], 'ascending');
        if (found !== -1) {
            sortOptions['order'] = 'ascending';
            line.splice(found, 1);
        }
        found = this.rw.searchTokenGivenEnglishTermInParensLevel(0, line, line[0], 'descending');
        if (found !== -1) {
            sortOptions['order'] = 'descending';
            line.splice(found, 1);
        }

        /* check correct syntax */
        checkThrow(
            line.length >= 3 && line[1].tokenType === tks.tkChunkGranularity && line[2].image === 'of',
            "S/|expect something like 'sort lines of x'"
        );

        /* look backwards for any keywords. */
        let i = line.length - 1;
        for (; i >= 0; i--) {
            let t = line[i];
            if (t.image === 'ascending' || t.image === 'descending') {
                sortOptions['order'] = t.image;
            } else if (t.image === 'text' || t.image === 'numeric' || t.image === 'international' || t.image === 'datetime') {
                sortOptions['method'] = t.image;
            } else {
                break;
            }
        }

        /* grab just the part before the options */
        let template = longstr(
            `sort
            "${sortOptions['method']}"
            "${sortOptions['order']}" %ARG0%`
        );
        if (!byPhrase) {
            return this.rw.gen(template, line[0], [line.slice(1, i + 1)]);
        } else {
            let granularity = line[1];
            let container = line.slice(3, i + 1);
            let template = ChunkResolutionSort.writeCodeCustomSort(granularity.image, sortOptions);
            let newcode = this.rw.gen(template, line[0], [container, byPhrase]);
            /* expand the repeats in the new code, I'm too lazy to do this manually */
            let ret: ChvITk[][] = [];
            for (let line of newcode) {
                if (line[0].image === 'repeat') {
                    let newlines = VpcRewritesLoops.Go(line, this.rw);
                    for (let newline of newlines) {
                        if (newline[0].image === 'put') {
                            Util512.extendArray(ret, this.rewritePut(newline));
                        } else {
                            ret.push(newline);
                        }
                    }
                } else {
                    ret.push(line);
                }
            }

            return ret;
        }
    }
    rewriteStart(line: ChvITk[]): ChvITk[][] {
        return this.hReturnNoOp(line);
    }
    rewriteStop(line: ChvITk[]): ChvITk[][] {
        return this.hReturnNoOp(line);
    }
    rewriteSubtract(line: ChvITk[]): ChvITk[][] {
        this.rw.replaceWithSyntaxMarkerAtLvl0(line, line[0], 'from', true);
        return [line];
    }
    rewriteType(line: ChvITk[]): ChvITk[][] {
        return [this.hBuildNyi('the type command', line[0])];
    }
    rewriteUnlock(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'S.|not enough args');
        if (line[1].image !== 'screen') {
            return [this.hBuildNyi('any type of unlock besides unlock screen', line[0])];
        } else if (line.length === 2) {
            return [line];
        } else {
            /* strip any "with" */
            let foundWith = this.rw.searchTokenGivenEnglishTerm(line, line[0], 'with');
            if (foundWith !== -1) {
                line.splice(foundWith, 1);
            }

            return this.hParseVisualEffect(line, 'unlock screen');
        }
    }
    rewriteUnmark(line: ChvITk[]): ChvITk[][] {
        return this.rewriteMark(line, true)
    }
    rewriteVisual(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'S-|not enough args');
        if (line[1].image !== 'effect') {
            return [this.hBuildNyi('any type of visual besides visual effect', line[0])];
        } else {
            return this.hParseVisualEffect(line, 'visual effect');
        }
    }
    rewriteWait(line: ChvITk[]): ChvITk[][] {
        checkThrow(line.length > 1, 'S,|not enough args');
        if (line[1].image === 'for') {
            line.splice(1, 1);
        }

        if (line[1].image === 'until' || line[1].image === 'while') {
            /* remember that the only type of repeat we can make is an unconditional one */
            let isNegated = line[1].image === 'while' ? 'not' : '';
            let template = `
repeat
    if ${isNegated} ( %ARG0% ) then
        exit repeat
    end if
    wait 100 "ms"
end repeat`;
            return this.rw.gen(template, line[0], [line.slice(2)]);
        } else {
            return [line];
        }
    }

    /* interpret a visual effect, currently order doesn't matter */
    hParseVisualEffect(line: ChvITk[], prefix: string) {
        let opts: { [key: string]: string } = {};
        opts['speed'] = '';
        opts['method'] = '';
        opts['direction'] = '';
        opts['dest'] = 'card';
        for (let t of line) {
            if (t.image === 'slow' || t.image === 'slowly' || t.image === 'fast') {
                opts['speed'] += t.image;
            } else if (t.image === 'very') {
                opts['speed'] = 'very' + opts['speed'];
            } else {
                let foundMethod = findStrToEnum<VpcVisualEffectType>(VpcVisualEffectType, t.image);
                let foundDirection = findStrToEnum<VpcVisualEffectTypeDirection>(VpcVisualEffectTypeDirection, t.image);
                let foundDest = findStrToEnum<VpcVisualEffectTypeDestination>(VpcVisualEffectTypeDestination, t.image);
                if (foundMethod) {
                    opts['method'] = t.image;
                } else if (foundDirection) {
                    opts['direction'] = t.image;
                } else if (foundDest) {
                    opts['dest'] = t.image;
                } else if (t.image !== 'to' && t.image !== 'from' && t.image !== 'door' && t.image !== 'blinds') {
                    checkThrow(false, 'S+|unknown visual effect term', t.image);
                }
            }
        }

        if (!opts['speed']) {
            opts['speed'] = 'normal';
        }

        let template = longstr(
            `${prefix} "${opts['speed']}"
            "${opts['method']}" "${opts['direction']}" "${opts['dest']}" `
        );

        return this.rw.gen(template, line[0]);
    }

    /* doesn't produce a pre-parse error, produces a runtime error */
    hBuildNyi(msg: string, basis: ChvITk) {
        return [BuildFakeTokens.makeTk(basis, tks.tkIdentifier, 'errordialog'), BuildFakeTokens.makeStringLiteral(basis, msg)];
    }

    /* helper that builds an nyi if 'menu' is seen */
    hReturnNyiIfMenuMentionedOutsideParens(line: ChvITk[]): ChvITk[][] {
        let found = this.rw.searchTokenGivenEnglishTermInParensLevel(0, line, line[0], 'menu');
        if (found !== -1) {
            return [this.hBuildNyi('deleting from a menu', line[0])];
        } else {
            return [line];
        }
    }

    /* insert code that does nothing. leaving out the line entirely might destabalize syntax. */
    hReturnNoOp(line: ChvITk[]): ChvITk[][] {
        let template = `put "no-op" %INTO% c%UNIQUE% `;
        return this.rw.gen(template, line[0]);
    }

    /* build a mark expression in software */
    hBuildMarkExpression(expression: ChvITk[], fromUnmark: boolean): ChvITk[][] {
        /* can't put this in standardlib, it needs "each" access */
        /* go to each card, so that bg field accesses work */
        checkThrow(expression?.length, "requires expression")
        let code = `
put the short id of this cd into prevCard%UNIQUE%
put 1 into i%UNIQUE%
repeat
    go cd i%UNIQUE%
    if ( %ARG0% ) then
        set the marked of this cd to true
    else
        set the marked of this cd to false
    end if
    add 1 to i%UNIQUE%
    if i%UNIQUE% > the number of cds then
        exit repeat
    end if
end repeat
go cd id prevCard%UNIQUE%
        `
        return this.rw.gen(code, expression[0], [expression]);
    }
}
