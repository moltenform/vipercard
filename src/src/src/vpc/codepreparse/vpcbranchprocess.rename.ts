
/* auto */ import { checkThrow, makeVpcInternalErr, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObject, checkThrowEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CountNumericId } from '../../vpc/vpcutils/vpcutils.js';
/* auto */ import { VpcLineCategory } from '../../vpc/codepreparse/vpcpreparsecommon.js';
/* auto */ import { VpcCodeLine, VpcCodeLineReference } from '../../vpc/codepreparse/vpccodeline.js';

// remember the entrance/exit points of a block.
// we'll use this to set the blockInformation for these lines,
// so that e.g. a loop knows which offset to go back up to.
class BranchTrackingBlock {
    constructor(public readonly cat: VpcLineCategory, firstline?: VpcCodeLine) {
        if (firstline) {
            this.add(firstline);
        }
    }

    add(line: VpcCodeLine) {
        this.relevantLines.push(line);
    }

    relevantLines: VpcCodeLine[] = [];
}

// create a BranchTrackingBlock for each block,
// also makes sure the opening/closing of a block is correct.
export class BranchTracking {
    handlers = new MapKeyToObject<VpcCodeLineReference>();
    stackBlocks: BranchTrackingBlock[] = [];

    constructor(protected idgen: CountNumericId) {}

    findCurrentLoop() {
        for (let i = this.stackBlocks.length - 1; i >= 0; i--) {
            if (this.stackBlocks[i].cat === VpcLineCategory.repeatForever) {
                return this.stackBlocks[i];
            }
        }

        throw makeVpcScriptErr(`5r|cannot call 'exit repeat' or 'next repeat' outside of a loop`);
    }

    findCurrentHandler(): BranchTrackingBlock {
        checkThrowEq(VpcLineCategory.handlerStart, this.stackBlocks[0].cat, `7>|could not find current handler`);
        return this.stackBlocks[0];
    }

    finalizeBlock() {
        let topOfStack = this.stackBlocks[this.stackBlocks.length - 1];
        let references = topOfStack.relevantLines.map(ln => new VpcCodeLineReference(ln));
        for (let line of topOfStack.relevantLines) {
            line.blockInfo = references;
        }

        this.stackBlocks.pop();
    }

    ensureComplete() {
        checkThrowEq(0, this.stackBlocks.length, `7=|missing 'end myHandler' at end of script.`);
    }

    go(line: VpcCodeLine) {
        if (this.stackBlocks.length === 0 && line.ctg !== VpcLineCategory.handlerStart) {
            throw makeVpcScriptErr(`5q|only 'on mouseup' and 'function myfunction' can exist at this scope`);
        } else if (this.stackBlocks.length > 0 && line.ctg === VpcLineCategory.handlerStart) {
            throw makeVpcScriptErr(`5p|cannot begin a handler inside an existing handler`);
        }

        switch (line.ctg) {
            case VpcLineCategory.repeatForever: // fall-through
            case VpcLineCategory.repeatWhile: // fall-through
            case VpcLineCategory.repeatUntil:
                this.stackBlocks.push(new BranchTrackingBlock(VpcLineCategory.repeatForever, line));
                break;
            case VpcLineCategory.repeatNext: // fall-through
            case VpcLineCategory.repeatExit:
                let tracking = this.findCurrentLoop();
                tracking.add(line);
                break;
            case VpcLineCategory.repeatEnd:
                let topOfStack = this.stackBlocks[this.stackBlocks.length - 1];
                checkThrowEq(
                    VpcLineCategory.repeatForever,
                    topOfStack.cat,
                    `7<|cannot "end repeat" interleaved within some other block.`
                );
                topOfStack.add(line);
                this.finalizeBlock();
                break;
            case VpcLineCategory.ifStart:
                this.stackBlocks.push(new BranchTrackingBlock(VpcLineCategory.ifStart, line));
                break;
            case VpcLineCategory.ifElse: // fall-through
            case VpcLineCategory.ifElsePlain:
                topOfStack = this.stackBlocks[this.stackBlocks.length - 1];
                checkThrowEq(
                    VpcLineCategory.ifStart,
                    topOfStack.cat,
                    `7;|cannot have an "else" interleaved within some other block.`
                );
                topOfStack.add(line);
                break;
            case VpcLineCategory.ifEnd:
                topOfStack = this.stackBlocks[this.stackBlocks.length - 1];
                checkThrowEq(
                    VpcLineCategory.ifStart,
                    topOfStack.cat,
                    `7:|cannot have an "end if" interleaved within some other block.`
                );
                topOfStack.add(line);
                this.finalizeBlock();
                break;
            case VpcLineCategory.handlerStart:
                this.stackBlocks.push(new BranchTrackingBlock(VpcLineCategory.handlerStart, line));
                break;
            case VpcLineCategory.handlerEnd:
                topOfStack = this.stackBlocks[this.stackBlocks.length - 1];
                checkThrowEq(
                    VpcLineCategory.handlerStart,
                    topOfStack.cat,
                    `7/|cannot have an "end myHandler" interleaved within some other block.`
                );
                topOfStack.add(line);
                this.checkStartAndEndMatch(topOfStack.relevantLines);
                let firstname = topOfStack.relevantLines[0].excerptToParse[1].image;

                // call add() so that we'll throw if there is a duplicate
                this.handlers.add(firstname, new VpcCodeLineReference(topOfStack.relevantLines[0]));
                this.finalizeBlock();
                break;
            case VpcLineCategory.handlerExit: // fall-through
            case VpcLineCategory.handlerPass:
                // if we're in "on mouseup", it's illegal to say "exit otherHandler"
                let currentHandlerStart = this.findCurrentHandler().relevantLines[0];
                checkThrow(currentHandlerStart.excerptToParse.length > 1, '7.|expected on myHandler, not found');
                let currentHandlerName = currentHandlerStart.excerptToParse[1].image;
                let gotName = line.excerptToParse[1].image;
                checkThrowEq(
                    gotName,
                    currentHandlerName,
                    '7-|we are in handler but got exit otherHandler',
                    currentHandlerName,
                    gotName
                );
                break;
            case VpcLineCategory.invalid:
                throw makeVpcInternalErr('5o|should not have this line category');
            default:
                break;
        }
    }

    checkStartAndEndMatch(lines: VpcCodeLine[]) {
        checkThrow(lines[0].excerptToParse.length > 1, '7,|on myHandler, missing name of handler');
        let firstname = lines[0].excerptToParse[1].image;
        let lastline = lines[lines.length - 1];
        checkThrow(lastline.excerptToParse.length > 1, '7+|end myHandler, missing name of handler');
        let lastname = lastline.excerptToParse[1].image;
        checkThrowEq(
            lastname,
            firstname,
            `7*|handler names mismatch. start with with "on ${firstname}" ended with "end ${lastname}"`
        );
    }
}
