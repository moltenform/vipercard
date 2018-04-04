
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512elementslabel.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512presenter.js';
/* auto */ import { VpcDocLoader } from '../../vpcui/intro/vpcintroprovider.js';
/* auto */ import { IntroPageBase } from '../../vpcui/intro/vpcintrobase.js';

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
        public initialLoadMessage: string,
        protected root: Root
    ) {
        super(compid, bounds, x, y);
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        let grp = app.getGroup(this.grpid);
        let headerheight = this.drawCommonFirst(app, grp, lang);

        // draw the prompt
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

        this.drawCommonLast(app, grp, lang);
    }

    static respondBtnClick(c: UI512Controller, root: Root, self: IntroWaitWhileLoadingPage, el: UI512Element) {}

    go(currentCntrl: UI512Controller) {
        this.loader.startLoadDocument(this.root, currentCntrl, s => {
            if (this.prompt) {
                this.prompt.set('labeltext', s);
            }
        });
    }
}
