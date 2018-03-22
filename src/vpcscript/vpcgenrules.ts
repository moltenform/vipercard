
/* autoimport:start */
import { cProductName, cTkSyntaxMarker, makeVpcScriptErr, makeVpcInternalErr, checkThrow, checkThrowEq, FormattedSubstringUtil, CodeLimits, VpcIntermedValBase, IntermedMapOfIntermedVals, VpcVal, VpcValS, VpcValN, VpcValBool, VarCollection, VariableCollectionConstants, VpcEvalHelpers, ReadableContainer, WritableContainer, RequestedChunk, ChunkResolution, VpcUI512Serialization, CountNumericId } from "../vpcscript/vpcutil.js";
import { RequestedChunkType, PropAdjective, SortStyle, OrdinalOrPosition, RequestedChunkTextPreposition, VpcElType, VpcTool, toolToPaintOntoCanvasShapes, VpcToolCtg, getToolCategory, VpcBuiltinMsg, getMsgNameFromType, VpcOpCtg, getPositionFromOrdinalOrPosition } from "../vpcscript/vpcenums.js";
import { ChvLexer, ChvParser, ChvToken, ChvILexingResult, ChvILexingError, ChvIToken } from "../vpcscript/bridgechv.js";
import { tokenType, isTkType, typeGreaterLessThanEqual, BuildFakeTokens, alsoReservedWordsList, listTokens, tks, partialReservedWordsList } from "../vpcscript/vpcgentokens.js";
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export class ChvParserClass extends ChvParser {
    constructor(input: any[], inlistTokens: any) {
        // we can adjust the "maxLookahead" here { outputCst: true, maxLookahead:8 }
        super(input, inlistTokens, { outputCst: true });
        ChvParser.performSelfAnalysis(this);
    }

    public TopBegin() {
        return this.RuleBuiltinCmdAdd();
    }

    // generated code, any changes past this point will be lost:

    public RuleHOrdinal = this.RULE("RuleHOrdinal", () => {
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenThe);
        });
        this.CONSUME1(tks.TokenTkordinal);
    });

    public RuleHPosition = this.RULE("RuleHPosition", () => {
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenThe);
        });
        this.CONSUME1(tks.TokenTkidentifier);
    });

    public RuleHSimpleContainer = this.RULE("RuleHSimpleContainer", () => {
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectPart);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkidentifier);
                },
            },
        ]);
    });

    public RuleHContainer = this.RULE("RuleHContainer", () => {
        this.OPTION1(() => {
            this.SUBRULE1(this.RuleHChunk);
        });
        this.SUBRULE1(this.RuleHSimpleContainer);
    });

    public RuleHChunk = this.RULE("RuleHChunk", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkcharorwordoritemorlineorplural);
                    this.SUBRULE1(this.RuleHChunk_1);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleHOrdinal);
                    this.CONSUME2(tks.TokenTkcharorwordoritemorlineorplural);
                },
            },
        ]);
        this.SUBRULE1(this.RuleOf);
    });

    public RuleHChunk_1 = this.RULE("RuleHChunk_1", () => {
        this.SUBRULE1(this.RuleLvl6Expression);
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenTo);
            this.SUBRULE2(this.RuleLvl6Expression);
        });
    });

    public RuleObject_1 = this.RULE("RuleObject_1", () => {
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenThe);
        });
        this.CONSUME1(tks.TokenTkidentifier);
    });

    public RuleObject = this.RULE("RuleObject", () => {
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectBtn);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectFld);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectCard);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectBg);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectStack);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObject_1);
                },
            },
        ]);
    });

    public RuleObjectBtn = this.RULE("RuleObjectBtn", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkcardorpluralsyn);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkbkgndorpluralsyn);
                },
            },
        ]);
        this.OR2([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkbtnorpluralsyn);
                    this.CONSUME1(tks.TokenId);
                    this.SUBRULE1(this.RuleLvl6Expression);
                },
            },
            {
                ALT: () => {
                    this.CONSUME2(tks.TokenTkbtnorpluralsyn);
                    this.SUBRULE2(this.RuleLvl6Expression);
                },
            },
        ]);
        this.OPTION1(() => {
            this.SUBRULE1(this.RuleOf);
            this.SUBRULE1(this.RuleObjectCard);
        });
    });

    public RuleObjectFld = this.RULE("RuleObjectFld", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkcardorpluralsyn);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkbkgndorpluralsyn);
                },
            },
        ]);
        this.OR2([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkfldorpluralsyn);
                    this.CONSUME1(tks.TokenId);
                    this.SUBRULE1(this.RuleLvl6Expression);
                },
            },
            {
                ALT: () => {
                    this.CONSUME2(tks.TokenTkfldorpluralsyn);
                    this.SUBRULE2(this.RuleLvl6Expression);
                },
            },
        ]);
        this.OPTION1(() => {
            this.SUBRULE1(this.RuleOf);
            this.SUBRULE1(this.RuleObjectCard);
        });
    });

    public RuleObjectCard = this.RULE("RuleObjectCard", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkcardorpluralsyn);
                    this.CONSUME1(tks.TokenId);
                    this.SUBRULE1(this.RuleLvl6Expression);
                },
            },
            {
                ALT: () => {
                    this.CONSUME2(tks.TokenTkcardorpluralsyn);
                    this.SUBRULE2(this.RuleLvl6Expression);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleHOrdinal);
                    this.CONSUME3(tks.TokenTkcardorpluralsyn);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleHPosition);
                    this.CONSUME4(tks.TokenTkcardorpluralsyn);
                },
            },
        ]);
        this.OPTION1(() => {
            this.SUBRULE1(this.RuleOf);
            this.SUBRULE1(this.RuleObjectBg);
        });
    });

    public RuleObjectBg = this.RULE("RuleObjectBg", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkbkgndorpluralsyn);
                    this.CONSUME1(tks.TokenId);
                    this.SUBRULE1(this.RuleLvl6Expression);
                },
            },
            {
                ALT: () => {
                    this.CONSUME2(tks.TokenTkbkgndorpluralsyn);
                    this.SUBRULE2(this.RuleLvl6Expression);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleHOrdinal);
                    this.CONSUME3(tks.TokenTkbkgndorpluralsyn);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleHPosition);
                    this.CONSUME4(tks.TokenTkbkgndorpluralsyn);
                },
            },
        ]);
        this.OPTION1(() => {
            this.SUBRULE1(this.RuleOf);
            this.SUBRULE1(this.RuleObjectStack);
        });
    });

    public RuleObjectStack = this.RULE("RuleObjectStack", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.CONSUME1(tks.TokenStack);
    });

    public RuleObjectPart = this.RULE("RuleObjectPart", () => {
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectBtn);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectFld);
                },
            },
        ]);
    });

    public RuleNtDest = this.RULE("RuleNtDest", () => {
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectCard);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectBg);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectStack);
                },
            },
        ]);
    });

    public RuleNtVisEffect = this.RULE("RuleNtVisEffect", () => {
        this.AT_LEAST_ONE(() => {
            this.SUBRULE1(this.RuleNtVisEffectTerm);
        });
    });

    public RuleNtVisEffectTerm = this.RULE("RuleNtVisEffectTerm", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkidentifier);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTo);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkinonly);
                },
            },
        ]);
    });

    public RuleBuiltinCmdAdd = this.RULE("RuleBuiltinCmdAdd", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleLvl4Expression);
        this.CONSUME1(tks.TokenTo);
        this.SUBRULE1(this.RuleHContainer);
    });

    public RuleBuiltinCmdAnswer = this.RULE("RuleBuiltinCmdAnswer", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleLvl6Expression);
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenTknewline);
            this.SUBRULE2(this.RuleLvl6Expression);
            this.OPTION2(() => {
                this.CONSUME1(tks.TokenOr);
                this.SUBRULE3(this.RuleLvl6Expression);
                this.OPTION3(() => {
                    this.CONSUME2(tks.TokenOr);
                    this.SUBRULE4(this.RuleLvl6Expression);
                });
            });
        });
    });

    public RuleBuiltinCmdAsk = this.RULE("RuleBuiltinCmdAsk", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenTkcomma);
        });
        this.SUBRULE1(this.RuleExpr);
        this.OPTION2(() => {
            this.CONSUME1(tks.TokenTknewline);
            this.SUBRULE2(this.RuleExpr);
        });
    });

    public RuleBuiltinCmdWait = this.RULE("RuleBuiltinCmdWait", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenTknewline);
        });
        this.SUBRULE1(this.RuleExpr);
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME2(tks.TokenTkidentifier);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkordinal);
                },
            },
        ]);
    });

    public RuleBuiltinCmdBeep = this.RULE("RuleBuiltinCmdBeep", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.OPTION1(() => {
            this.SUBRULE1(this.RuleExpr);
        });
    });

    public RuleBuiltinCmdChoose = this.RULE("RuleBuiltinCmdChoose", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleLvl6Expression);
        this.CONSUME1(tks.TokenTknewline);
    });

    public RuleBuiltinCmdClick = this.RULE("RuleBuiltinCmdClick", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.CONSUME2(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleLvl4Expression);
        this.CONSUME1(tks.TokenTkcomma);
        this.SUBRULE2(this.RuleLvl4Expression);
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenTknewline);
            this.CONSUME3(tks.TokenTkidentifier);
            this.OPTION2(() => {
                this.CONSUME2(tks.TokenTkcomma);
                this.CONSUME4(tks.TokenTkidentifier);
                this.OPTION3(() => {
                    this.CONSUME3(tks.TokenTkcomma);
                    this.CONSUME5(tks.TokenTkidentifier);
                });
            });
        });
    });

    public RuleBuiltinCmdCreate = this.RULE("RuleBuiltinCmdCreate", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.CONSUME1(tks.TokenTkcardorpluralsyn);
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkbtnorpluralsyn);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkfldorpluralsyn);
                },
            },
        ]);
    });

    public RuleBuiltinCmdDelete = this.RULE("RuleBuiltinCmdDelete", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleHChunk);
                    this.SUBRULE1(this.RuleHSimpleContainer);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectPart);
                },
            },
        ]);
    });

    public RuleBuiltinCmdDisable = this.RULE("RuleBuiltinCmdDisable", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleObjectBtn);
    });

    public RuleBuiltinCmdDivide = this.RULE("RuleBuiltinCmdDivide", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleHContainer);
        this.CONSUME1(tks.TokenTknewline);
        this.SUBRULE1(this.RuleLvl4Expression);
    });

    public RuleBuiltinCmdDrag = this.RULE("RuleBuiltinCmdDrag", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.CONSUME2(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleLvl4Expression);
        this.CONSUME1(tks.TokenTkcomma);
        this.SUBRULE2(this.RuleLvl4Expression);
        this.AT_LEAST_ONE(() => {
            this.CONSUME1(tks.TokenTo);
            this.SUBRULE3(this.RuleLvl4Expression);
            this.CONSUME2(tks.TokenTkcomma);
            this.SUBRULE4(this.RuleLvl4Expression);
        });
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenTknewline);
            this.CONSUME3(tks.TokenTkidentifier);
            this.OPTION2(() => {
                this.CONSUME3(tks.TokenTkcomma);
                this.CONSUME4(tks.TokenTkidentifier);
                this.OPTION3(() => {
                    this.CONSUME4(tks.TokenTkcomma);
                    this.CONSUME5(tks.TokenTkidentifier);
                });
            });
        });
    });

    public RuleBuiltinCmdEnable = this.RULE("RuleBuiltinCmdEnable", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleObjectBtn);
    });

    public RuleBuiltinCmdGet = this.RULE("RuleBuiltinCmdGet", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleExpr);
    });

    public RuleBuiltinCmdGoCard = this.RULE("RuleBuiltinCmdGoCard", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenTo);
        });
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleNtDest);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleHOrdinal);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleHPosition);
                },
            },
        ]);
    });

    public RuleBuiltinCmdHide = this.RULE("RuleBuiltinCmdHide", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObjectPart);
                },
            },
            {
                ALT: () => {
                    this.CONSUME2(tks.TokenTkidentifier);
                },
            },
        ]);
    });

    public RuleBuiltinCmdLock = this.RULE("RuleBuiltinCmdLock", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.CONSUME2(tks.TokenTkidentifier);
    });

    public RuleBuiltinCmdMultiply = this.RULE("RuleBuiltinCmdMultiply", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleHContainer);
        this.CONSUME1(tks.TokenTknewline);
        this.SUBRULE1(this.RuleLvl4Expression);
    });

    public RuleBuiltinCmdPut = this.RULE("RuleBuiltinCmdPut", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleExpr);
        this.CONSUME1(tks.TokenTknewline);
        this.CONSUME2(tks.TokenTkidentifier);
        this.CONSUME2(tks.TokenTknewline);
        this.OPTION1(() => {
            this.SUBRULE1(this.RuleHContainer);
        });
    });

    public RuleBuiltinCmdReset = this.RULE("RuleBuiltinCmdReset", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.CONSUME2(tks.TokenTkidentifier);
    });

    public RuleBuiltinCmdSet = this.RULE("RuleBuiltinCmdSet", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenThe);
        });
        this.SUBRULE1(this.RuleAnyPropertyName);
        this.OPTION2(() => {
            this.CONSUME1(tks.TokenTkofonly);
            this.OR1([
                {
                    ALT: () => {
                        this.SUBRULE1(this.RuleHChunk);
                        this.SUBRULE1(this.RuleObjectFld);
                    },
                },
                {
                    ALT: () => {
                        this.SUBRULE1(this.RuleObject);
                    },
                },
            ]);
        });
        this.CONSUME1(tks.TokenTo);
        this.SUBRULE1(this.RuleAnyPropertyVal);
    });

    public RuleBuiltinCmdShow = this.RULE("RuleBuiltinCmdShow", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleShow_1);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleShow_2);
                },
            },
            {
                ALT: () => {
                    this.CONSUME2(tks.TokenTkidentifier);
                },
            },
        ]);
    });

    public RuleShow_1 = this.RULE("RuleShow_1", () => {
        this.SUBRULE1(this.RuleObjectPart);
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenTknewline);
            this.SUBRULE1(this.RuleLvl4Expression);
            this.CONSUME1(tks.TokenTkcomma);
            this.SUBRULE2(this.RuleLvl4Expression);
        });
    });

    public RuleShow_2 = this.RULE("RuleShow_2", () => {
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenTkidentifier);
        });
        this.CONSUME1(tks.TokenTkcardorpluralsyn);
    });

    public RuleBuiltinCmdSort = this.RULE("RuleBuiltinCmdSort", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.OPTION1(() => {
            this.CONSUME2(tks.TokenTkidentifier);
        });
        this.CONSUME1(tks.TokenTkcharorwordoritemorlineorplural);
        this.SUBRULE1(this.RuleOf);
        this.SUBRULE1(this.RuleHContainer);
        this.OPTION2(() => {
            this.CONSUME3(tks.TokenTkidentifier);
        });
    });

    public RuleBuiltinCmdSubtract = this.RULE("RuleBuiltinCmdSubtract", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleLvl4Expression);
        this.CONSUME1(tks.TokenTknewline);
        this.SUBRULE1(this.RuleHContainer);
    });

    public RuleBuiltinCmdUnlock = this.RULE("RuleBuiltinCmdUnlock", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.CONSUME2(tks.TokenTkidentifier);
        this.OPTION1(() => {
            this.CONSUME3(tks.TokenTkidentifier);
            this.SUBRULE1(this.RuleNtVisEffect);
        });
    });

    public RuleBuiltinCmdVisual = this.RULE("RuleBuiltinCmdVisual", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleNtVisEffect);
    });

    public RuleAnyPropertyName = this.RULE("RuleAnyPropertyName", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenId);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkidentifier);
                },
            },
        ]);
    });

    public RuleAnyPropertyVal = this.RULE("RuleAnyPropertyVal", () => {
        this.AT_LEAST_ONE_SEP({
            SEP: tks.TokenTkcomma,
            DEF: () => {
                this.SUBRULE1(this.RuleLvl4Expression);
            },
        });
    });

    public RuleOf = this.RULE("RuleOf", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkofonly);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkinonly);
                },
            },
        ]);
    });

    public RuleFnCall = this.RULE("RuleFnCall", () => {
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleFnCall_Length);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleFnCallWithParens);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleFnCallWithoutParensOrGlobalGetPropOrTarget);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleFnCallNumberOf);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleExprThereIs);
                },
            },
        ]);
    });

    public RuleFnCall_Length = this.RULE("RuleFnCall_Length", () => {
        this.CONSUME1(tks.TokenThe);
        this.CONSUME1(tks.TokenLength);
        this.CONSUME1(tks.TokenTkofonly);
        this.SUBRULE1(this.RuleLvl6Expression);
    });

    public RuleFnCallWithParens = this.RULE("RuleFnCallWithParens", () => {
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenThe);
        });
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkidentifier);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenLength);
                },
            },
        ]);
        this.CONSUME1(tks.TokenTklparen);
        this.MANY_SEP({
            SEP: tks.TokenTkcomma,
            DEF: () => {
                this.SUBRULE1(this.RuleExpr);
            },
        });
        this.CONSUME1(tks.TokenTkrparen);
    });

    public RuleFnCallWithoutParensOrGlobalGetPropOrTarget = this.RULE("RuleFnCallWithoutParensOrGlobalGetPropOrTarget", () => {
        this.CONSUME1(tks.TokenThe);
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenTkadjective);
        });
        this.CONSUME1(tks.TokenTkidentifier);
    });

    public RuleFnCallNumberOf = this.RULE("RuleFnCallNumberOf", () => {
        this.CONSUME1(tks.TokenThe);
        this.CONSUME1(tks.TokenNumber);
        this.CONSUME1(tks.TokenTkofonly);
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleFnCallNumberOf_1);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleFnCallNumberOf_2);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleFnCallNumberOf_3);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleFnCallNumberOf_4);
                },
            },
        ]);
    });

    public RuleFnCallNumberOf_1 = this.RULE("RuleFnCallNumberOf_1", () => {
        this.CONSUME1(tks.TokenTkcharorwordoritemorlineorplural);
        this.SUBRULE1(this.RuleOf);
        this.SUBRULE1(this.RuleLvl6Expression);
    });

    public RuleFnCallNumberOf_2 = this.RULE("RuleFnCallNumberOf_2", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkcardorpluralsyn);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkbkgndorpluralsyn);
                },
            },
        ]);
        this.OR2([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkbtnorpluralsyn);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkfldorpluralsyn);
                },
            },
        ]);
    });

    public RuleFnCallNumberOf_3 = this.RULE("RuleFnCallNumberOf_3", () => {
        this.CONSUME1(tks.TokenTkcardorpluralsyn);
        this.OPTION1(() => {
            this.SUBRULE1(this.RuleOf);
            this.SUBRULE1(this.RuleObjectBg);
        });
        this.OPTION2(() => {
            this.SUBRULE2(this.RuleOf);
            this.SUBRULE1(this.RuleObjectStack);
        });
    });

    public RuleFnCallNumberOf_4 = this.RULE("RuleFnCallNumberOf_4", () => {
        this.CONSUME1(tks.TokenTkbkgndorpluralsyn);
        this.OPTION1(() => {
            this.SUBRULE1(this.RuleOf);
            this.SUBRULE1(this.RuleObjectStack);
        });
    });

    public RuleExprSource = this.RULE("RuleExprSource", () => {
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleExprGetProperty);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleFnCall);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleHSimpleContainer);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkstringliteral);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTknumliteral);
                },
            },
        ]);
    });

    public RuleExprGetProperty = this.RULE("RuleExprGetProperty", () => {
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenThe);
        });
        this.OPTION2(() => {
            this.CONSUME1(tks.TokenTkadjective);
        });
        this.SUBRULE1(this.RuleAnyPropertyName);
        this.CONSUME1(tks.TokenTkofonly);
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleHChunk);
                    this.SUBRULE1(this.RuleObjectFld);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleObject);
                },
            },
        ]);
    });

    public RuleExprThereIs = this.RULE("RuleExprThereIs", () => {
        this.CONSUME1(tks.TokenThere);
        this.CONSUME1(tks.TokenIs);
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenNot);
        });
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleObject);
    });

    public RuleExpr = this.RULE("RuleExpr", () => {
        this.SUBRULE1(this.RuleLvl1Expression);
        this.MANY(() => {
            this.SUBRULE1(this.RuleOpLogicalOrAnd);
            this.SUBRULE2(this.RuleLvl1Expression);
        });
    });

    public RuleLvl1Expression = this.RULE("RuleLvl1Expression", () => {
        this.SUBRULE1(this.RuleLvl2Expression);
        this.MANY(() => {
            this.SUBRULE1(this.RuleOpEqualityGreaterLessOrContains);
            this.SUBRULE2(this.RuleLvl2Expression);
        });
    });

    public RuleLvl2Expression = this.RULE("RuleLvl2Expression", () => {
        this.SUBRULE1(this.RuleLvl3Expression);
        this.MANY(() => {
            this.CONSUME1(tks.TokenIs);
            this.SUBRULE1(this.RuleLvl2Sub);
        });
    });

    public RuleLvl2Sub = this.RULE("RuleLvl2Sub", () => {
        this.OPTION1(() => {
            this.CONSUME1(tks.TokenNot);
        });
        this.OR1([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleLvl2TypeCheck);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleLvl2Within);
                },
            },
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleLvl3Expression);
                },
            },
        ]);
    });

    public RuleLvl2TypeCheck = this.RULE("RuleLvl2TypeCheck", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenNumber);
                },
            },
            {
                ALT: () => {
                    this.CONSUME2(tks.TokenTkidentifier);
                },
            },
        ]);
    });

    public RuleLvl2Within = this.RULE("RuleLvl2Within", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkinonly);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenWithin);
                },
            },
        ]);
        this.SUBRULE1(this.RuleLvl3Expression);
    });

    public RuleLvl3Expression = this.RULE("RuleLvl3Expression", () => {
        this.SUBRULE1(this.RuleLvl4Expression);
        this.MANY(() => {
            this.SUBRULE1(this.RuleOpStringConcat);
            this.SUBRULE2(this.RuleLvl4Expression);
        });
    });

    public RuleLvl4Expression = this.RULE("RuleLvl4Expression", () => {
        this.SUBRULE1(this.RuleLvl5Expression);
        this.MANY(() => {
            this.SUBRULE1(this.RuleOpPlusMinus);
            this.SUBRULE2(this.RuleLvl5Expression);
        });
    });

    public RuleLvl5Expression = this.RULE("RuleLvl5Expression", () => {
        this.SUBRULE1(this.RuleLvl6Expression);
        this.MANY(() => {
            this.SUBRULE1(this.RuleOpMultDivideExpDivMod);
            this.SUBRULE2(this.RuleLvl6Expression);
        });
    });

    public RuleLvl6Expression = this.RULE("RuleLvl6Expression", () => {
        this.OPTION1(() => {
            this.OR1([
                {
                    ALT: () => {
                        this.CONSUME1(tks.TokenTkplusorminus);
                    },
                },
                {
                    ALT: () => {
                        this.CONSUME1(tks.TokenNot);
                    },
                },
            ]);
        });
        this.OPTION2(() => {
            this.SUBRULE1(this.RuleHChunk);
        });
        this.OR2([
            {
                ALT: () => {
                    this.SUBRULE1(this.RuleExprSource);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTklparen);
                    this.SUBRULE1(this.RuleExpr);
                    this.CONSUME1(tks.TokenTkrparen);
                },
            },
        ]);
    });

    public RuleOpLogicalOrAnd = this.RULE("RuleOpLogicalOrAnd", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenOr);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenAnd);
                },
            },
        ]);
    });

    public RuleOpEqualityGreaterLessOrContains = this.RULE("RuleOpEqualityGreaterLessOrContains", () => {
        this.OR1([
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenContains);
                },
            },
            {
                ALT: () => {
                    this.CONSUME1(tks.TokenTkgreaterorlessequalorequal);
                },
            },
        ]);
    });

    public RuleOpStringConcat = this.RULE("RuleOpStringConcat", () => {
        this.CONSUME1(tks.TokenTkconcatdoubleorsingle);
    });

    public RuleOpPlusMinus = this.RULE("RuleOpPlusMinus", () => {
        this.CONSUME1(tks.TokenTkplusorminus);
    });

    public RuleOpMultDivideExpDivMod = this.RULE("RuleOpMultDivideExpDivMod", () => {
        this.CONSUME1(tks.TokenTkmultdivideexpdivmod);
    });

    public RuleTopLevelRequestEval = this.RULE("RuleTopLevelRequestEval", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.SUBRULE1(this.RuleExpr);
    });

    public RuleTopLevelRequestHandlerCall = this.RULE("RuleTopLevelRequestHandlerCall", () => {
        this.CONSUME1(tks.TokenTkidentifier);
        this.CONSUME2(tks.TokenTkidentifier);
        this.MANY_SEP({
            SEP: tks.TokenTkcomma,
            DEF: () => {
                this.SUBRULE1(this.RuleExpr);
            },
        });
    });
}
