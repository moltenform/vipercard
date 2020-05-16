
/* [JSGIF](https://github.com/antimatter15/jsgif)
jsgif bare-bones typing
by Ben Fisher
this library is loaded dynamically */

export declare class GIFEncoderInterface {
    public setRepeat(n: number): void;
    public setDelay(n: number): void;
    public start(): void;
    public finish(): void;
    public addFrame(context: CanvasRenderingContext2D): void;

    /* method exposed by Ben Fisher */
    public getUint8Array(): Uint8Array;
}

export function getGIFEncoderInst() {
    let inst = GIFEncoder();
    return (inst as any) as GIFEncoderInterface;
}

declare const GIFEncoder: VoidFunction;
