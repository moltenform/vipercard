
/* auto */ import { UndoManager } from './../state/vpcUndo';
/* auto */ import { VpcAppUIToolStamp } from './../tools/vpcToolStamp';
/* auto */ import { VpcAppUIToolSmear } from './../tools/vpcToolSmear';
/* auto */ import { VpcAppUIToolShape } from './../tools/vpcToolShape';
/* auto */ import { VpcAppUIToolSelect } from './../tools/vpcToolSelect';
/* auto */ import { VpcAppUIToolLasso } from './../tools/vpcToolLasso';
/* auto */ import { VpcAppUIToolEdit } from './../tools/vpcToolEdit';
/* auto */ import { VpcAppUIToolCurve } from './../tools/vpcToolCurve';
/* auto */ import { VpcAppUIToolBucket } from './../tools/vpcToolBucket';
/* auto */ import { VpcAppUIToolBrowse } from './../tools/vpcToolBrowse';
/* auto */ import { VpcAppUIToolBase } from './../tools/vpcToolBase';
/* auto */ import { VpcRuntime } from './../state/vpcState';
/* auto */ import { VpcSave } from './vpcSave';
/* auto */ import { VpcSession } from './../../vpc/request/vpcRequest';
/* auto */ import { VpcPresenterInterface } from './vpcPresenterInterface';
/* auto */ import { VpcPresenterEvents } from './vpcPresenterEvents';
/* auto */ import { VpcPaintRender } from './../modelrender/vpcPaintRender';
/* auto */ import { VpcModelRender } from './../modelrender/vpcModelRender';
/* auto */ import { VpcAppMenu } from './../menu/vpcMenu';
/* auto */ import { VpcAppLyrToolbox } from './../panels/vpcLyrToolbox';
/* auto */ import { VpcAppLyrPanels } from './../panels/vpcLyrPanels';
/* auto */ import { VpcAppLyrNotification } from './../panels/vpcLyrNotification';
/* auto */ import { VpcLyrNonModalHolder } from './../nonmodaldialogs/vpcLyrNonModalHolder';
/* auto */ import { VpcAppLyrDragHandles } from './../panels/vpcLyrDragHandles';
/* auto */ import { VpcStateInterface, VpcUILayer } from './../state/vpcInterface';
/* auto */ import { VpcTool, VpcToolCtg, getToolCategory } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcMenuActions } from './../menu/vpcAppMenuActions';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { ScreenConsts, getUI512WindowBounds } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { RepeatingTimer } from './../../ui512/utils/util512Higher';
/* auto */ import { O, bool, checkIsProductionBuild } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512 } from './../../ui512/utils/util512';
/* auto */ import { UI512PresenterBase } from './../../ui512/presentation/ui512PresenterBase';
/* auto */ import { ElementObserverToTwo } from './../../ui512/elements/ui512ElementGettable';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * contains initialization code for the ViperCard presenter
 */
export abstract class VpcPresenterInit extends VpcPresenterInterface {
    /* window dimensions */
    bounds: number[] = [];
    userBounds: number[] = [];

    /* callbacks to the higher level provider */
    cbExitToMainMenu: () => void;
    cbExitToNewDocument: () => void;
    cbExitToOpen: (mystacksonly: boolean) => void;
    cbSaveToBrowserStorage: (s: string, identifier: O<string>, humanName: O<string>) => string;

    /* higher level has told us this is a demo stack */
    cameFromDemoSoNeverPromptSave = '';

    /* repeating timers */
    /* use a very fast runScriptPeriod */
    /*  - needed for appropriate responsiveness in games */
    /*  - drawframe pings even faster, so no harm done */
    /*  - will be a no-op most of the time */
    readonly sendMouseWithinPeriod = 250;
    readonly blinkMarqueePeriod = 350;
    readonly runMaintenancePeriod = 60 * 1000;
    readonly runScriptPeriod = 5;
    readonly runScriptTimeslice = 400;
    timerSendMouseWithin = new RepeatingTimer(this.sendMouseWithinPeriod);
    timerRunScript = new RepeatingTimer(this.runScriptPeriod);
    timerBlinkMarquee = new RepeatingTimer(this.blinkMarqueePeriod);
    timerRunMaintenance = new RepeatingTimer(this.runMaintenancePeriod);

    /* have we been told to refresh the cursor */
    cursorRefreshPending = true;

    /* menu actions helper object */
    menuActions: VpcMenuActions;

    /* tool event responder objects */
    tlctgBrowse = new VpcAppUIToolBrowse(this.bounds, this.userBounds);
    tlctgEdit = new VpcAppUIToolEdit(this.bounds, this.userBounds);
    tlctgShape = new VpcAppUIToolShape(this.bounds, this.userBounds);
    tlctgRectSelect = new VpcAppUIToolSelect(this.bounds, this.userBounds);
    tlctgLasso = new VpcAppUIToolLasso(this.bounds, this.userBounds);
    tlctgSmear = new VpcAppUIToolSmear(this.bounds, this.userBounds);
    tlctgBucket = new VpcAppUIToolBucket(this.bounds, this.userBounds);
    tlctgCurve = new VpcAppUIToolCurve(this.bounds, this.userBounds);
    tlctgStamp = new VpcAppUIToolStamp(this.bounds, this.userBounds);
    tlResponses: { [ctg: string]: VpcAppUIToolBase } = {};
    tlNumToResponse: { [tl: number]: VpcAppUIToolBase } = {};

    /* background to foreground: */
    /* layer 1: paint */
    /* layer 2: rendering model */
    /* layer 3: resize handles */
    /* layer 4: white cover */
    /* layer 5: toolboxes */
    /* layer 6: prop panels */
    /* layer 7: menus */
    /* layer 8: non-modal dialog */
    lyrPaintRender = new VpcPaintRender();
    lyrModelRender = new VpcModelRender();
    lyrResizeHandles = new VpcAppLyrDragHandles();
    lyrCoverArea = new VpcAppLyrNotification();
    lyrToolboxes = new VpcAppLyrToolbox();
    lyrPropPanel = new VpcAppLyrPanels();
    lyrMenus = new VpcAppMenu();
    lyrNonModalDlgHolder = new VpcLyrNonModalHolder();
    layers: VpcUILayer[] = [
        this.lyrPaintRender,
        this.lyrModelRender,
        this.lyrResizeHandles,
        this.lyrCoverArea,
        this.lyrToolboxes,
        this.lyrPropPanel,
        this.lyrMenus,
        this.lyrNonModalDlgHolder
    ];

    /**
     * construct an instance
     */
    constructor(public vci: VpcStateInterface, protected runtime: VpcRuntime) {
        super();
        this.menuActions = new VpcMenuActions(this.vci);
    }

    /**
     * initialize member variables
     */
    initPresenter(undoManager: UndoManager) {
        super.init();

        /* when a vel changes: */
        /* - notify undo manager */
        /* - notify "modelRender", so ui can be updated. */
        let observeVelChange = new ElementObserverToTwo();
        observeVelChange.observer1 = undoManager;
        observeVelChange.observer2 = this.lyrModelRender;
        this.runtime.useThisObserverForVpcEls = observeVelChange;

        /* when a runtime option changes: */
        /* - set a flag in observeRuntimeOptChanges that we'll check during render */
        this.vci.getCodeExec().cbOnScriptError = scriptErr => this.defaultShowScriptErr(scriptErr);
        this.vci.getCodeExec().cbCauseUIRedraw = () => this.lyrModelRender.uiRedrawNeeded();
        this.vci.getCodeExec().runStatements.cbAnswerMsg = (a, b, c, d, e) => this.answerMsg(a, b, c, d, e);
        this.vci.getCodeExec().runStatements.cbAskMsg = (a, b, c) => this.askMsg(a, b, c);
        this.vci.getCodeExec().runStatements.cbStopCodeRunning = () => {
            /* stop all code, even an infinite loop */
            this.vci.getCodeExec().forceStopRunning();
            this.vci.setTool(VpcTool.Button);
        };

        /* window dimensions*/
        Util512.extendArray(this.bounds, getUI512WindowBounds());
        Util512.extendArray(this.userBounds, [
            this.bounds[0],
            this.bounds[1] + ScreenConsts.yMenuBar,
            ScreenConsts.xAreaWidth,
            ScreenConsts.yAreaHeight
        ]);

        Util512.freezeProperty(this, 'bounds');
        Util512.freezeProperty(this, 'userBounds');
        Util512.freezeProperty(this, 'layers');

        /* provide a callback to menuActions */
        this.menuActions.save = new VpcSave(this);
        this.menuActions.fontChanger.cbGetEditToolSelectedFldOrBtn = () => this.lyrPropPanel.selectedFldOrBtn();
        this.setUpUnbeforeloadWarning();
    }

    /**
     * initialize UI tools and layers
     */
    initUI() {
        this.app = new UI512Application(this.bounds, this);
        this.initLayers();
        VpcPresenterEvents.initEvents(this);
        this.tlctgEdit.lyrPanels = this.lyrPropPanel;
        this.tlResponses[VpcToolCtg.CtgBrowse] = this.tlctgBrowse;
        this.tlResponses[VpcToolCtg.CtgEdit] = this.tlctgEdit;
        this.tlResponses[VpcToolCtg.CtgShape] = this.tlctgShape;
        this.tlResponses[VpcToolCtg.CtgRectSelect] = this.tlctgRectSelect;
        this.tlResponses[VpcToolCtg.CtgLasso] = this.tlctgLasso;
        this.tlResponses[VpcToolCtg.CtgSmear] = this.tlctgSmear;
        this.tlResponses[VpcToolCtg.CtgBucket] = this.tlctgBucket;
        this.tlResponses[VpcToolCtg.CtgCurve] = this.tlctgCurve;
        this.tlResponses[VpcToolCtg.CtgStamp] = this.tlctgStamp;

        /* provide callbacks for tool responses */
        for (let tlresp of Util512.getMapVals(this.tlResponses)) {
            tlresp.vci = this.vci;
            tlresp.cbModelRender = () => this.lyrModelRender;
            tlresp.cbPaintRender = () => this.lyrPaintRender;
            tlresp.cbScheduleScriptEventSend = a => VpcPresenterEvents.scheduleScriptMsg(this, this.vci, a);
        }

        /* make a map of tool number to tool response */
        for (let tl = VpcTool.__first; tl <= VpcTool.__last; tl++) {
            let ctg = getToolCategory(tl);
            assertTrue(bool(this.tlResponses[ctg]), 'Km|');
            this.tlNumToResponse[tl] = this.tlResponses[ctg];
        }

        this.useOSClipboard = this.vci.getOptionB('optUseHostClipboard');
        this.inited = true;
    }

    /**
     * initialize layers
     */
    protected initLayers() {
        for (let layer of this.layers) {
            layer.vci = this.vci;
            layer.init(this);
        }

        /* provide callbacks */
        this.lyrPropPanel.handles = this.lyrResizeHandles;
        this.lyrPropPanel.editor.cbAnswerMsg = (s, cb) =>
            this.answerMsg(s, n => {
                cb();
            });

        this.lyrToolboxes.cbAnswerMsg = (s, cb) =>
            this.answerMsg(s, n => {
                cb();
            });

        this.lyrToolboxes.cbStopCodeRunning = () => this.vci.getCodeExec().forceStopRunning();
        this.lyrNonModalDlgHolder.pr = this as UI512PresenterBase;

        if (
            this.cameFromDemoSoNeverPromptSave &&
            this.cameFromDemoSoNeverPromptSave !== 'demo_game.json' &&
            this.cameFromDemoSoNeverPromptSave !== 'demo_anim.json'
        ) {
            this.lyrCoverArea.hideMyMessage();
        }

        let ses = VpcSession.fromRoot();
        let username = ses ? ses.username : '';
        if (username) {
            this.lyrCoverArea.hideMyMessage();
        }
    }

    /**
     * get the selected vel
     */
    getSelectedFieldVel(): O<VpcElField> {
        let focused = this.getCurrentFocus();
        if (focused) {
            let vel = this.lyrModelRender.findElIdToVel(focused);
            if (vel && vel instanceof VpcElField) {
                return vel;
            }
        }

        return undefined;
    }

    /**
     * register with the browser so that if you try to navigate to a new page,
     * and you haven't hit Save,
     * browser will warn you before moving to the page (since you'd lose your changes)
     */
    protected setUpUnbeforeloadWarning() {
        if (WeakMap) {
            /* let's not keep a strong reference to _VpcPresenter_, */
            /* because that would tie up a lot of memory from being freed. */
            /* a WeakMap accomplishes this well. */
            let weakRef = new WeakMap<any, VpcPresenterInit>();
            let key = new Object();
            weakRef.set(key, this);
            window.onbeforeunload = () => {
                if (weakRef.has(key)) {
                    let pr = weakRef.get(key);
                    if (pr && pr.isDocDirty() && checkIsProductionBuild() && !pr.cameFromDemoSoNeverPromptSave.length) {
                        return lng('lngReminder that unsaved changes will be lost.\nContinue?');
                    }
                }

                return undefined;
            };
        }
    }

    /**
     * we no longer need this warning
     */
    protected teardownBeforeUnloadWarning() {
        window.onbeforeunload = () => {};
    }
}
