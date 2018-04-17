
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { UI512CompModalDialog } from '../../ui512/composites/ui512ModalDialog.js';
/* auto */ import { IntroPageBase } from '../../vpcui/intro/vpcIntroPageBase.js';
/* auto */ import { VpcIntroProvider } from '../../vpcui/intro/vpcIntroProvider.js';

export abstract class VpcIntroInterface extends UI512Presenter {
    abstract beginLoadDocument(loader: VpcIntroProvider): void;
    abstract getModal(): UI512CompModalDialog;
    abstract newDocument(): void;
    abstract goBackToFirstScreen(): void;

    activePage: IntroPageBase;
    bounds: number[];
}
