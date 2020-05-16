
/* https://github.com/alemangui/pizzicato
pizzicato bare-bones typing
by Ben Fisher
this library is loaded dynamically */

export declare namespace Pz {
    class Sound {
        public constructor(...args: any[]);
        public play(): void;
    }
}

export declare namespace Pizzicato {
    let context: any;
    let Util: any;
}
