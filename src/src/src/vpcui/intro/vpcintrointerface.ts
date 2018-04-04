
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512presenter.js';
/* auto */ import { UI512CompStdDialog } from '../../ui512/composites/ui512modaldialog.js';
/* auto */ import { VpcDocLoader } from '../../vpcui/intro/vpcintroprovider.js';
/* auto */ import { IntroPageBase } from '../../vpcui/intro/vpcintrobase.js';

export abstract class VpcIntroPresenterInterface extends UI512Controller {
    abstract beginLoadDocument(loader: VpcDocLoader): void;
    abstract getModal(): UI512CompStdDialog;
    abstract newDocument(): void;
    abstract goBackToFirstScreen(): void;

    activePage: IntroPageBase;
    root: Root;
    bounds: number[];
}
