
/* auto */ import { VpcIntroProvider } from './vpcIntroProvider';
/* auto */ import { IntroPageBase } from './vpcIntroPageBase';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { UI512CompModalDialog } from './../../ui512/composites/ui512ModalDialog';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * forward-declare methods on the VpcIntroInterface presenter, solely
 * to break circular dependencies
 */
export abstract class VpcIntroInterface extends UI512Presenter {
    abstract beginLoadDocument(loader: VpcIntroProvider): void;
    abstract getModal(): UI512CompModalDialog;
    abstract beginNewDocument(): void;
    abstract goBackToFirstScreen(): void;

    activePage: IntroPageBase;
    bounds: number[];
}
