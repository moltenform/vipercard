
/* auto */ import { VpcIntroProvider } from './vpcIntroProvider';
/* auto */ import { IntroPageBase } from './vpcIntroPageBase';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { UI512ElLabel } from './../../ui512/elements/ui512ElementLabel';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * the loading page, essentially just shows a message on a white background
 */
export class IntroPageLoading extends IntroPageBase {
    compositeType = 'IntroPageLoading';
    protected prompt: O<UI512ElLabel>;
    constructor(
        compId: string,
        bounds: number[],
        x: number,
        y: number,
        public loader: VpcIntroProvider,
        public initialLoadMessage: string
    ) {
        super(compId, bounds, x, y);
    }

    /**
     * initialize layout
     */
    createSpecific(app: UI512Application) {
        let grp = app.getGroup(this.grpId);
        let headerHeight = this.drawCommonFirst(app, grp);

        /* draw the text */
        const margin = 80;
        this.prompt = this.genChild(app, grp, 'prompt', UI512ElLabel);
        this.prompt.set('labeltext', this.initialLoadMessage + '...');
        this.prompt.set('labelwrap', true);
        this.prompt.set('labelhalign', true);
        this.prompt.setDimensionsX1Y1(
            this.x + margin,
            this.y + headerHeight + margin,
            this.x + this.logicalWidth - margin,
            this.y + this.logicalHeight - margin
        );

        this.drawCommonLast(app, grp);
    }

    /**
     * begin loading the document
     * the loader will run the callback to update the label
     */
    go(currentCntrl: UI512Presenter) {
        this.loader.prompt = this.prompt
        this.loader.startLoadDocument(currentCntrl, s => {
            if (this.prompt) {
                this.prompt.set('labeltext', s);
            }
        });
    }
}
