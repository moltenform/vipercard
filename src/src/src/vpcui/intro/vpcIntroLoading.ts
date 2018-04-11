
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512ElementsLabel.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { IntroPageBase } from '../../vpcui/intro/vpcIntroBase.js';
/* auto */ import { VpcDocLoader } from '../../vpcui/intro/vpcIntroProvider.js';

export class IntroWaitWhileLoadingPage extends IntroPageBase {
    isIntroWaitWhileLoadingPage = true;
    compositeType = 'IntroWaitWhileLoadingPage';
    protected prompt: O<UI512ElLabel>;
    constructor(
        compid: string,
        bounds: number[],
        x: number,
        y: number,
        public loader: VpcDocLoader,
        public initialLoadMessage: string
    ) {
        super(compid, bounds, x, y);
    }

    createSpecific(app: UI512Application) {
        let grp = app.getGroup(this.grpId);
        let headerheight = this.drawCommonFirst(app, grp);

        /* draw the prompt */
        const margin = 80;
        this.prompt = this.genChild(app, grp, 'prompt', UI512ElLabel);
        this.prompt.set('labeltext', this.initialLoadMessage + '...');
        this.prompt.set('labelwrap', true);
        this.prompt.set('labelhalign', true);
        this.prompt.setDimensionsX1Y1(
            this.x + margin,
            this.y + headerheight + margin,
            this.x + this.logicalWidth - margin,
            this.y + this.logicalHeight - margin
        );

        this.drawCommonLast(app, grp);
    }

    static respondBtnClick(pr: UI512Presenter, self: IntroWaitWhileLoadingPage, el: UI512Element) {}

    go(currentCntrl: UI512Presenter) {
        this.loader.startLoadDocument(currentCntrl, s => {
            if (this.prompt) {
                this.prompt.set('labeltext', s);
            }
        });
    }
}
