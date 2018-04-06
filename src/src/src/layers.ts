
import { isRelease } from './config.js';

/* vipercard code is strictly organized into layers, */
/* to promote good design and eliminate circular references. */

/* a module can only import from modules below it on this list. */
/* enforced by ts_exports_autoimport.py */

/*

/ui512/root/
rootStartCanvas
rootUI512

/test/vpcui/
testregistration

/test/vpc/
vpctestserver
vpctestscripteval
vpctestscriptrun
vpctestscriptparse
vpctestutils

/test/ui512/
uidemocomposites
uidemotextedit
uidemomenus
uidemobuttons
uidemopaint
uidemotext
uidemobasic
testui512elements
testui512utils

/vpcui/intro/
vpcintro
vpcintrofirst
vpcintroopen
vpcintroupload
vpcintroloading
vpcintrointerface
vpcintropickfile
vpcintroprovider
vpcInterfaceImpl

/vpcui/presentation/
vpcpresenter
vpcpresenterinit
vpcpresenterevents
vpcpresentersave
vpcpresenterinterface


/vpcui/menu/
vpcappmenuactions
vpcchangeselectedfont
vpcaboutdialog
vpcmenu
vpcmenustructure

/vpcui/nonmodaldialogs/
vpcformlogin
vpcformnewuser
vpcreplmessagebox
vpcsenderrreport
vpcdocviewer
vpcnonmodalcommon

/vpcui/tools/
vpctoolbrowse
vpctooledit
vpctoollasso
vpctoolselect
vpctoolselectbase
vpctoolcurve
vpctoolshape
vpctoolsmear
vpctoolstamp
vpctoolbucket
vpctoolbase

/vpcui/panels/
vpclyrpanels
vpclyrnotifications
vpclyrdraghandles
vpclyrtoolbox
vpceditpanelsstack
vpceditpanelscard
vpceditpanelsbtn
vpceditpanelsfld
vpceditpanelsempty
vpceditpanelsbase
vpcscripteditor
vpcpanelsbase
vpctoolboxtools
vpctoolboxnav
vpctoolboxpatterns


/vpcui/modelrender/
vpcmodelrender
vpcpaintrender
vpcgifexport


/vpcui/state/
vpcstate
vpcfulloutside
vpcundo
vpcstateserialize
vpcrawcreate
vpcinterface


/vpc/request/
vpcrequest
vpcsigned
bridgetextencoding

/vpc/codeexec/
vpcscriptexectop
vpcscriptexecframestack
vpcscriptexecframe
vpcscriptexecstatement
vpcscriptexecasync
vpcscriptcacheparsed
bridgejslru


/vpc/codepreparse/
vpcallcode
vpcbranchprocessing
vpcrewrite
vpcexpandfncalls
vpcdeterminecategory
vpccodeline
vpccheckreserved
vpcscriptfunctions
vpcpreparsecommon

/vpc/codeparse/
vpcvisitor
vpcvisitormethods
vpcrules
vpctokens
bridgechv


/vpc/vel/
velresolvename
velresolvereference
velmodel
vpcoutsideinterfaces
velproductopts
velstack
velbg
velcard
velbutton
velfield
velserialize
velbase

/vpc/vpcutils/
vpcoutsideclasses
vpciniticons
vpcaudio
vpcchunk
vpcstylecomplex
vpcvarcollection
vpcvaleval
vpcval
vpcutils
vpcenums


/ui512/composites/
ui512codeeditor
ui512codeeditorclasses
ui512modaldialog
ui512toolbox
ui512buttongroup
ui512composites

/ui512/presentation/
ui512presenter
ui512presenterbase



/ui512/textedit/
ui512textevents
ui512basichandlers
ui512textselect
ui512textselectclasses
ui512scrollbar
ui512clipboard
ui512genericfield


/ui512/menu/
ui512menulisteners
ui512menuanimation
ui512menurender
ui512presenterwithmenu
ui512events

/ui512/elements/
ui512elementsview
ui512elementsmenu
ui512elementscanvaspiece
ui512elementstextfield
ui512elementsbutton
ui512elementslabel
ui512elementsapp
ui512elementsgroup
ui512elementsbase
ui512elementsgettable

/ui512/draw/
ui512imagedissolve
ui512drawborders
ui512drawicon
ui512drawiconclasses
ui512imageserialize
ui512drawpaint
ui512drawpaintclasses
ui512drawpattern
ui512drawtext
ui512imagecollection
ui512drawtextchar
ui512drawtextparams
ui512formattedtext
ui512drawtextrequestdata
ui512drawtextclasses
ui512interfaces

/ui512/lang/
langbase

/ui512/utils/
utilsTestCanvas
utilsDraw
utilsDrawConstants
utilsTest
utilsCursors
utilsUI512
utilsAssert

/
layers
config

*/
