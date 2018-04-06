
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { UI512CompStdDialog } from '../../ui512/composites/ui512ModalDialog.js';
/* auto */ import { IntroPageBase } from '../../vpcui/intro/vpcIntroBase.js';
/* auto */ import { VpcDocLoader } from '../../vpcui/intro/vpcIntroProvider.js';

export abstract class VpcIntroPresenterInterface extends UI512Controller {
    abstract beginLoadDocument(loader: VpcDocLoader): void;
    abstract getModal(): UI512CompStdDialog;
    abstract newDocument(): void;
    abstract goBackToFirstScreen(): void;

    activePage: IntroPageBase;
    bounds: number[];
}
