
/* auto */ import { Util512 } from './../../ui512/utils/util512';
/* auto */ import { IconGroupInfo, RenderIconGroup } from './../../ui512/draw/ui512DrawIconClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * specify the icon dimensions for ViperCard-specific icons.
 * define rectangles where each icon is in the image.
 */
export class VpcInitIcons {
    /**
     * define icons, if needed.
     */
    static go() {
        if (RenderIconGroup.cachedGridInfo['000']) {
            /* exit early if we've already loaded. */
            return;
        }

        VpcInitIcons.defineGroup000();
        VpcInitIcons.defineGroup001();
        VpcInitIcons.defineGroup002();
        VpcInitIcons.defineCursors();
        VpcInitIcons.defineGroupDissolve();
        VpcInitIcons.defineGroupSpace();
        VpcInitIcons.defineGroupLogo();
        VpcInitIcons.defineGroupGlider();
        VpcInitIcons.setGliderSprites();
        Util512.freezeRecurse(RenderIconGroup.cachedGridInfo);
    }

    /**
     * icon set for the vipercard logo
     */
    protected static defineGroupLogo() {
        let grpLogo = new IconGroupInfo();
        RenderIconGroup.cachedGridInfo['logo'] = grpLogo;
        grpLogo.totalIcons = 3;
        grpLogo.customOffsets[0] = [0, 0];
        grpLogo.customDims[0] = [176, 90];
        grpLogo.customOffsets[1] = [180, 0];
        grpLogo.customDims[1] = [284, 512];
        grpLogo.customOffsets[2] = [1, 491];
        grpLogo.customDims[2] = [22, 20];
    }

    /**
     * icon set for dissolve & visual fx implementation
     */
    protected static defineGroupDissolve() {
        let grpDissolve = new IconGroupInfo();
        RenderIconGroup.cachedGridInfo['fordissolve'] = grpDissolve;
        grpDissolve.gridSize = 64;
        grpDissolve.gridSpacing = 0;
        grpDissolve.gridWidth = 64;
        grpDissolve.totalIcons = 11;
    }

    /**
     * icon group 0, background textures
     */
    protected static defineGroup000() {
        let grp000 = new IconGroupInfo();
        RenderIconGroup.cachedGridInfo['000'] = grp000;
        grp000.totalIcons = 4;
        grp000.customOffsets[0] = [0, 0];
        grp000.customDims[0] = [896, 48];
        grp000.customOffsets[1] = [0, 48];
        grp000.customDims[1] = [896, 48];
        grp000.customOffsets[2] = [0, 48 + 48];
        grp000.customDims[2] = [896, 64];
        grp000.customOffsets[3] = [0, 48 + 48 + 64];
        grp000.customDims[3] = [896, 24];
    }

    /**
     * icon group 2, "icons" for vipercard buttons
     */
    protected static defineGroup002() {
        let grp002 = new IconGroupInfo();
        RenderIconGroup.cachedGridInfo['002'] = grp002;
        grp002.gridSize = 32;
        grp002.gridSpacing = 1;
        grp002.gridWidth = 12;
        grp002.totalIcons = 12 * 23;
    }

    /**
     * icon groups for cursors
     */
    protected static defineCursors() {
        let grpCursors1 = new IconGroupInfo();
        RenderIconGroup.cachedGridInfo['0cursors1'] = grpCursors1;
        grpCursors1.gridSize = 32;
        grpCursors1.gridSpacing = 1;
        grpCursors1.gridWidth = 12;
        grpCursors1.totalIcons = 12 * 3;

        let grpCursors2 = new IconGroupInfo();
        RenderIconGroup.cachedGridInfo['0cursors2'] = grpCursors2;
        grpCursors2.gridSize = 32 * 2;
        grpCursors2.gridSpacing = 1 * 2;
        grpCursors2.gridWidth = 12;
        grpCursors2.totalIcons = 12 * 3;

        let grpCursors3 = new IconGroupInfo();
        RenderIconGroup.cachedGridInfo['0cursors3'] = grpCursors3;
        grpCursors3.gridSize = 32 * 3;
        grpCursors3.gridSpacing = 1 * 3;
        grpCursors3.gridWidth = 12;
        grpCursors3.totalIcons = 12 * 3;

        let gps = [grpCursors1, grpCursors2, grpCursors3];
        for (let i = 0; i < gps.length; i++) {
            let m = i + 1;
            gps[i].customDims[0] = [m * 8, m * 16];
            gps[i].customDims[1] = [m * 17, m * 17];
            gps[i].customDims[2] = [m * 16, m * 16];
            gps[i].customDims[3] = [m * 16, m * 16];
            gps[i].customDims[4] = [m * 16, m * 16];
            gps[i].customDims[5] = [m * 16, m * 16];
            gps[i].customDims[6] = [m * 15, m * 15];
            gps[i].customDims[7] = [m * 16, m * 16];
            gps[i].customDims[8] = [m * 12, m * 16];
            gps[i].customDims[9] = [m * 16, m * 16];
            gps[i].customDims[10] = [m * 16, m * 16];
            gps[i].customDims[11] = [m * 16, m * 16];
            gps[i].customDims[12] = [m * 17, m * 17];
            gps[i].customDims[13] = [m * 16, m * 16];
            gps[i].customDims[14] = [m * 16, m * 17];
            gps[i].customDims[15] = [m * 15, m * 15];
            gps[i].customDims[16] = [m * 15, m * 15];
            gps[i].customDims[17] = [m * 15, m * 15];
        }
    }

    /**
     * icon group 1, parts of the ui like scrollbar arrows, patterns, tools
     */
    protected static defineGroup001() {
        let grp001 = new IconGroupInfo();
        RenderIconGroup.cachedGridInfo['001'] = grp001;
        grp001.gridSize = 32;
        grp001.gridSpacing = 1;
        grp001.gridWidth = 9;
        grp001.totalIcons = 9 * 16 + 2;
        for (let i = 0; i < 18; i++) {
            grp001.customDims[i] = [22, 20];
        }
        grp001.customDims[18] = [9, 9];
        grp001.customDims[19] = [9, 8];
        for (let i = 20; i < 23; i++) {
            grp001.customDims[i] = [22, 20];
        }
        for (let i = 23; i < 27; i++) {
            grp001.customDims[i] = [14, 14];
        }
        grp001.customDims[27] = [11, 8];
        for (let i = 28; i < 36; i++) {
            grp001.customDims[i] = [12, 12];
        }
        /* pattern toolbox icons part 1 */
        for (let i = 36; i < 75; i++) {
            grp001.customDims[i] = [17, 12];
        }
        grp001.customDims[75] = [18, 16];
        grp001.customDims[76] = [32, 32];
        grp001.customDims[77] = [32, 32];
        grp001.customDims[78] = [12, 15];
        grp001.customDims[79] = [11, 13];
        grp001.customDims[80] = [8, 11];
        /* pattern toolbox icons part 2 */
        for (let i = 81; i < 90; i++) {
            grp001.customDims[i] = [17, 12];
        }
        /* nav icons */
        for (let i = 90; i < 100; i++) {
            grp001.customDims[i] = [22, 20];
        }
        /* first gray pattern */
        grp001.customOffsets[144] = [0, 529];
        grp001.customDims[144] = [304, 384];
        /* second gray pattern */
        grp001.customOffsets[145] = [0, 529 + 384];
        grp001.customDims[145] = [304, 383];
    }

    /**
     * icon set for space game
     */
    protected static defineGroupSpace() {
        let grpSpace = new IconGroupInfo();
        RenderIconGroup.cachedGridInfo['spacegame'] = grpSpace;
        grpSpace.gridSize = 14;
        grpSpace.gridSpacing = 0;
        grpSpace.gridWidth = 10;
        grpSpace.totalIcons = 7 * grpSpace.gridWidth + 4;
        grpSpace.customOffsets[grpSpace.totalIcons - 4] = [12, 402];
        grpSpace.customDims[grpSpace.totalIcons - 4] = [396, 134];
        grpSpace.customOffsets[grpSpace.totalIcons - 3] = [2, 136];
        grpSpace.customDims[grpSpace.totalIcons - 3] = [437, 264];
        grpSpace.customOffsets[grpSpace.totalIcons - 2] = [6, 105];
        grpSpace.customDims[grpSpace.totalIcons - 2] = [253, 27];
        grpSpace.customOffsets[grpSpace.totalIcons - 1] = [145, 1];
        grpSpace.customDims[grpSpace.totalIcons - 1] = [36, 30];
    }

    /**
     * icon set for glider game
     */
    protected static defineGroupGlider() {
        let gliderBg = new IconGroupInfo();
        RenderIconGroup.cachedGridInfo['gliderBg'] = gliderBg;
        gliderBg.totalIcons = 43;
        for (let i = 0; i < gliderBg.totalIcons; i++) {
            gliderBg.customOffsets[i] = [0, i * 343];
            gliderBg.customDims[i] = [512, 343];
        }
    }

    /**
     * icon set for glider sprites,
     * the glider icons aren't in a fixed grid and need custom dims
     */
    protected static setGliderSprites() {
        let grpGlider = new IconGroupInfo();
        RenderIconGroup.cachedGridInfo['gliderSprites'] = grpGlider;
        grpGlider.totalIcons = 80;
        grpGlider.customOffsets[0] = [0, 0];
        grpGlider.customDims[0] = [1, 1];
        grpGlider.customOffsets[1] = [256, 0];
        grpGlider.customDims[1] = [48, 11];
        grpGlider.customOffsets[2] = [256, 12];
        grpGlider.customDims[2] = [48, 11];
        grpGlider.customOffsets[3] = [0, 0];
        grpGlider.customDims[3] = [48, 20];
        grpGlider.customOffsets[4] = [0, 21];
        grpGlider.customDims[4] = [48, 20];
        grpGlider.customOffsets[5] = [0, 42];
        grpGlider.customDims[5] = [48, 20];
        grpGlider.customOffsets[6] = [0, 63];
        grpGlider.customDims[6] = [48, 20];
        grpGlider.customOffsets[7] = [208, 0];
        grpGlider.customDims[7] = [48, 20];
        grpGlider.customOffsets[8] = [208, 21];
        grpGlider.customDims[8] = [48, 20];
        grpGlider.customOffsets[9] = [208, 42];
        grpGlider.customDims[9] = [48, 20];
        grpGlider.customOffsets[10] = [208, 63];
        grpGlider.customDims[10] = [48, 20];
        grpGlider.customOffsets[11] = [208, 84];
        grpGlider.customDims[11] = [48, 20];
        grpGlider.customOffsets[12] = [208, 105];
        grpGlider.customDims[12] = [48, 20];
        grpGlider.customOffsets[13] = [256, 24];
        grpGlider.customDims[13] = [48, 36];
        grpGlider.customOffsets[14] = [256, 61];
        grpGlider.customDims[14] = [48, 36];
        grpGlider.customOffsets[15] = [256, 98];
        grpGlider.customDims[15] = [48, 36];
        grpGlider.customOffsets[16] = [256, 135];
        grpGlider.customDims[16] = [48, 36];
        grpGlider.customOffsets[17] = [414, 179];
        grpGlider.customDims[17] = [48, 20];
        grpGlider.customOffsets[18] = [463, 179];
        grpGlider.customDims[18] = [48, 20];
        grpGlider.customOffsets[19] = [0, 84];
        grpGlider.customDims[19] = [48, 12];
        grpGlider.customOffsets[20] = [0, 97];
        grpGlider.customDims[20] = [48, 13];
        grpGlider.customOffsets[21] = [0, 111];
        grpGlider.customDims[21] = [48, 13];
        grpGlider.customOffsets[22] = [0, 125];
        grpGlider.customDims[22] = [48, 21];
        grpGlider.customOffsets[23] = [0, 147];
        grpGlider.customDims[23] = [38, 27];
        grpGlider.customOffsets[24] = [304, 84];
        grpGlider.customDims[24] = [32, 31];
        grpGlider.customOffsets[25] = [304, 116];
        grpGlider.customDims[25] = [32, 31];
        grpGlider.customOffsets[26] = [304, 148];
        grpGlider.customDims[26] = [32, 31];
        grpGlider.customOffsets[27] = [304, 180];
        grpGlider.customDims[27] = [32, 31];
        grpGlider.customOffsets[28] = [304, 212];
        grpGlider.customDims[28] = [32, 31];
        grpGlider.customOffsets[29] = [304, 244];
        grpGlider.customDims[29] = [32, 31];
        grpGlider.customOffsets[30] = [0, 175];
        grpGlider.customDims[30] = [41, 30];
        grpGlider.customOffsets[31] = [0, 206];
        grpGlider.customDims[31] = [35, 55];
        grpGlider.customOffsets[32] = [0, 262];
        grpGlider.customDims[32] = [35, 54];
        grpGlider.customOffsets[33] = [48, 23];
        grpGlider.customDims[33] = [64, 22];
        grpGlider.customOffsets[34] = [48, 46];
        grpGlider.customDims[34] = [64, 24];
        grpGlider.customOffsets[35] = [48, 71];
        grpGlider.customDims[35] = [64, 55];
        grpGlider.customOffsets[36] = [112, 0];
        grpGlider.customDims[36] = [32, 29];
        grpGlider.customOffsets[37] = [112, 30];
        grpGlider.customDims[37] = [32, 21];
        grpGlider.customOffsets[38] = [112, 52];
        grpGlider.customDims[38] = [32, 23];
        grpGlider.customOffsets[39] = [112, 76];
        grpGlider.customDims[39] = [32, 32];
        grpGlider.customOffsets[40] = [112, 109];
        grpGlider.customDims[40] = [32, 29];
        grpGlider.customOffsets[41] = [144, 109];
        grpGlider.customDims[41] = [16, 16];
        grpGlider.customOffsets[42] = [144, 126];
        grpGlider.customDims[42] = [16, 16];
        grpGlider.customOffsets[43] = [144, 143];
        grpGlider.customDims[43] = [16, 16];
        grpGlider.customOffsets[44] = [144, 160];
        grpGlider.customDims[44] = [16, 16];
        grpGlider.customOffsets[45] = [112, 139];
        grpGlider.customDims[45] = [32, 29];
        grpGlider.customOffsets[46] = [112, 169];
        grpGlider.customDims[46] = [32, 29];
        grpGlider.customOffsets[47] = [112, 199];
        grpGlider.customDims[47] = [32, 29];
        grpGlider.customOffsets[48] = [142, 0];
        grpGlider.customDims[48] = [18, 26];
        grpGlider.customOffsets[49] = [144, 27];
        grpGlider.customDims[49] = [18, 27];
        grpGlider.customOffsets[50] = [160, 264];
        grpGlider.customDims[50] = [32, 25];
        grpGlider.customOffsets[51] = [160, 290];
        grpGlider.customDims[51] = [32, 25];
        grpGlider.customOffsets[52] = [160, 316];
        grpGlider.customDims[52] = [32, 25];
        grpGlider.customOffsets[53] = [144, 82];
        grpGlider.customDims[53] = [18, 26];
        grpGlider.customOffsets[54] = [48, 127];
        grpGlider.customDims[54] = [64, 170];
        grpGlider.customOffsets[55] = [192, 42];
        grpGlider.customDims[55] = [16, 13];
        grpGlider.customOffsets[56] = [192, 71];
        grpGlider.customDims[56] = [16, 29];
        grpGlider.customOffsets[57] = [448, 270];
        grpGlider.customDims[57] = [63, 71];
        grpGlider.customOffsets[58] = [408, 53];
        grpGlider.customDims[58] = [102, 93];
        grpGlider.customOffsets[59] = [144, 55];
        grpGlider.customDims[59] = [16, 26];
        grpGlider.customOffsets[60] = [256, 209];
        grpGlider.customDims[60] = [45, 58];
        grpGlider.customOffsets[61] = [0, 0];
        grpGlider.customDims[61] = [161, 254];
        grpGlider.customOffsets[62] = [0, 0];
        grpGlider.customDims[62] = [161, 254];
        grpGlider.customOffsets[63] = [144, 189];
        grpGlider.customDims[63] = [16, 12];
        grpGlider.customOffsets[64] = [144, 202];
        grpGlider.customDims[64] = [16, 12];
        grpGlider.customOffsets[65] = [144, 215];
        grpGlider.customDims[65] = [16, 12];
        grpGlider.customOffsets[66] = [192, 0];
        grpGlider.customDims[66] = [16, 13];
        grpGlider.customOffsets[67] = [192, 14];
        grpGlider.customDims[67] = [16, 13];
        grpGlider.customOffsets[68] = [192, 28];
        grpGlider.customDims[68] = [16, 13];
        grpGlider.customOffsets[69] = [192, 42];
        grpGlider.customDims[69] = [16, 13];
        grpGlider.customOffsets[70] = [192, 56];
        grpGlider.customDims[70] = [16, 14];

        /* vent pattern, added manually */
        grpGlider.customOffsets[71] = [512, 0];
        grpGlider.customDims[71] = [16, 342];
    }
}
