
/* auto */ import { O, assertTrue, checkThrow, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { base10, slength } from '../../ui512/utils/utils512.js';
/* auto */ import { CodeLimits, VpcScriptMessage } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcVal } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VarCollection } from '../../vpc/vpcutils/vpcVarCollection.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcModelTop } from '../../vpc/vel/velModelTop.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { VpcLineCategory } from '../../vpc/codepreparse/vpcPreparseCommon.js';
/* auto */ import { VpcCodeOfOneVel } from '../../vpc/codepreparse/vpcAllCode.js';

/**
 * an "execution frame"
 * holding local variables and the offset to the current line of code
 */
export class VpcExecFrame {
    locals = new VarCollection(CodeLimits.MaxLocalVars, 'local');
    codeSection: VpcCodeOfOneVel;
    declaredGlobals: { [varName: string]: boolean } = {};
    args: VpcVal[] = [];
    currentHandler: O<number>;
    protected offset: number;
    constructor(public handlerName: string, public message: VpcScriptMessage) {
        /* make special locals */
        this.locals.set('$result', VpcVal.Empty);
        this.locals.set('it', VpcVal.Empty);
        assertTrue(!!this.message, '5N|message is null');
    }

    /* use to mark when a branch has been taken */
    offsetsMarked: { [offset: number]: boolean } = {};

    /**
     * get offset (index within codeSection of the current line of code)
     */
    getOffset() {
        return this.offset;
    }

    /**
     * advance to the next line of code
     */
    next() {
        this.offset += 1;
        checkThrow(this.offset < this.codeSection.lines.length, '7n|went past end of code');
        checkThrow(
            this.codeSection.lines[this.offset].ctg !== VpcLineCategory.HandlerStart,
            '7m|we should never walk onto a handler start'
        );
    }

    /**
     * set the instruction pointer, jumping to another line of code
     */
    jumpToOffset(newOffset: number, okToStartHandler?: boolean) {
        this.offset = newOffset;
        checkThrow(this.offset < this.codeSection.lines.length, '7l|went past end of code');
        checkThrow(
            okToStartHandler || this.codeSection.lines[this.offset].ctg !== VpcLineCategory.HandlerStart,
            '7k|we should never walk onto a handler start'
        );

        /* make sure we did not jump into a different handler */
        let next = this.codeSection.determineHandlerFromOffset(this.offset);
        checkThrow(next !== -1, '7j|could not determine handler', next);
        if (this.currentHandler === undefined) {
            this.currentHandler = next;
        } else {
            checkThrow(next === this.currentHandler, '7i|jumping into a different handler is not allowed', next);
            this.currentHandler = next;
        }
    }

    /**
     * indicates temporary code
     */
    static getTempCodePrefix() {
        return '----$$vipercard internal temporary handler$$'
    }

    /**
     * add dynamic code to the script
     */
    static appendTemporaryDynamicCodeToScript(outside: OutsideWorldReadWrite, ownerId: string, codeBody: string, hintSourceId: string, hintLineNumber:number) {
        let handlerName = 'tempdynamic' + Math.random().toString().replace(/\./g, '')
        let s = ''
        s += `\n\n${VpcExecFrame.getTempCodePrefix()}${hintSourceId}$$${hintLineNumber}$$----`
        s += '\n----(this is temporary and can be safely removed)'
        s += `\non ${handlerName}\n` + codeBody + `\nend ${handlerName}\n`
        let vel = outside.FindVelById(ownerId)
        vel = throwIfUndefined(vel, 'not found', ownerId)
        let curScript = VpcElBase.getScript(vel)
        VpcElBase.setScript(vel, curScript + s)
        return handlerName
    }

    /**
     * strip out the dynamic code
     */
    static filterTemporaryFromAllScripts(model:VpcModelTop) {
        for (let vel of model.stack.iterEntireStack()) {
            let s = vel.getS('script')
            s = VpcExecFrame.filterTemporaryFromScript(s)
            vel.set('script', s)
        }
    }

    /**
     * strip out the dynamic code
     */
    static filterTemporaryFromScript(s:string) {
        /* exit early if script is empty */
        if (!slength(s)) {
            return s
        }

        /* clear everything after marker */
        s = s.split(VpcExecFrame.getTempCodePrefix())[0]

        /* delete trailing whitespace, otherwise it'd accumulate over time */
        s = s.replace(/\s+$/g, '\n');
        return s
    }

    /**
     * did the script error within dynamic code?
     */
    static getBetterLineNumberIfTemporary(script:string, givenVelId:string, given:number):[string, number] {
        let lines = script.split('\n')
        let lastSeen:[string, number] = [givenVelId, given]
        for (let i=0, len = lines.length; i<len; i++) {
            if (lines[i].startsWith(VpcExecFrame.getTempCodePrefix())) {
                let rest = lines[i].substr(VpcExecFrame.getTempCodePrefix().length)
                let parts = rest.split('$$')
                if (parts.length === 3) {
                    let velid = parts[0]
                    let linenumber = parseInt(parts[1], base10) || 0
                    lastSeen = [velid, linenumber]
                }
            } else if (lines[i].startsWith('end tempdynamic')) {
                lastSeen = [givenVelId, given]
            }

            if (i >= given) {
                break;
            }
        }

        return lastSeen
    }
}
