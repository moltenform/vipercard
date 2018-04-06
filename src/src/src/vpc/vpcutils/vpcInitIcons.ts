
/* auto */ import { Util512 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { IconSetInfo, RenderIconSet } from '../../ui512/draw/ui512DrawIconClasses.js';

export class VpcInitIcons {
    static go() {
        if (RenderIconSet.setInfo['000']) {
            // already loaded.
            return;
        }

        let iconset000 = new IconSetInfo();
        RenderIconSet.setInfo['000'] = iconset000;
        iconset000.totalIcons = 4;
        iconset000.customOffsets[0] = [0, 0];
        iconset000.customDims[0] = [896, 48];
        iconset000.customOffsets[1] = [0, 48];
        iconset000.customDims[1] = [896, 48];
        iconset000.customOffsets[2] = [0, 48 + 48];
        iconset000.customDims[2] = [896, 64];
        iconset000.customOffsets[3] = [0, 48 + 48 + 64];
        iconset000.customDims[3] = [896, 24];

        let iconset001 = new IconSetInfo();
        RenderIconSet.setInfo['001'] = iconset001;
        iconset001.gridsize = 32;
        iconset001.gridspacing = 1;
        iconset001.gridwidth = 9;
        iconset001.totalIcons = 9 * 16 + 2;
        for (let i = 0; i < 18; i++) {
            iconset001.customDims[i] = [22, 20];
        }
        iconset001.customDims[18] = [9, 9];
        iconset001.customDims[19] = [9, 8];
        for (let i = 20; i < 23; i++) {
            iconset001.customDims[i] = [22, 20];
        }
        for (let i = 23; i < 27; i++) {
            iconset001.customDims[i] = [14, 14];
        }
        iconset001.customDims[27] = [11, 8];
        for (let i = 28; i < 36; i++) {
            iconset001.customDims[i] = [12, 12];
        }
        // pattern toolbox icons part 1
        for (let i = 36; i < 75; i++) {
            iconset001.customDims[i] = [17, 12];
        }
        iconset001.customDims[75] = [18, 16];
        iconset001.customDims[76] = [32, 32];
        iconset001.customDims[77] = [32, 32];
        iconset001.customDims[78] = [12, 15];
        iconset001.customDims[79] = [11, 13];
        iconset001.customDims[80] = [8, 11];
        // pattern toolbox icons part 2
        for (let i = 81; i < 90; i++) {
            iconset001.customDims[i] = [17, 12];
        }
        // nav icons
        for (let i = 90; i < 100; i++) {
            iconset001.customDims[i] = [22, 20];
        }
        // first gray pattern
        iconset001.customOffsets[144] = [0, 529];
        iconset001.customDims[144] = [304, 384];
        // second gray pattern
        iconset001.customOffsets[145] = [0, 529 + 384];
        iconset001.customDims[145] = [304, 383];

        let iconset002 = new IconSetInfo();
        RenderIconSet.setInfo['002'] = iconset002;
        iconset002.gridsize = 32;
        iconset002.gridspacing = 1;
        iconset002.gridwidth = 12;
        iconset002.totalIcons = 20 * 13;

        let iconsetDissolve = new IconSetInfo();
        RenderIconSet.setInfo['fordissolve'] = iconsetDissolve;
        iconsetDissolve.gridsize = 64;
        iconsetDissolve.gridspacing = 0;
        iconsetDissolve.gridwidth = 64;
        iconsetDissolve.totalIcons = 11;

        let iconsetSpace = new IconSetInfo();
        RenderIconSet.setInfo['spacegame'] = iconsetSpace;
        iconsetSpace.gridsize = 14;
        iconsetSpace.gridspacing = 0;
        iconsetSpace.gridwidth = 10;
        iconsetSpace.totalIcons = 7 * iconsetSpace.gridwidth + 4;
        iconsetSpace.customOffsets[iconsetSpace.totalIcons - 4] = [12, 402];
        iconsetSpace.customDims[iconsetSpace.totalIcons - 4] = [396, 134];
        iconsetSpace.customOffsets[iconsetSpace.totalIcons - 3] = [2, 136];
        iconsetSpace.customDims[iconsetSpace.totalIcons - 3] = [437, 264];
        iconsetSpace.customOffsets[iconsetSpace.totalIcons - 2] = [6, 105];
        iconsetSpace.customDims[iconsetSpace.totalIcons - 2] = [253, 27];
        iconsetSpace.customOffsets[iconsetSpace.totalIcons - 1] = [145, 1];
        iconsetSpace.customDims[iconsetSpace.totalIcons - 1] = [36, 30];

        let iconsetLogo = new IconSetInfo();
        RenderIconSet.setInfo['logo'] = iconsetLogo;
        iconsetLogo.totalIcons = 3;
        iconsetLogo.customOffsets[0] = [0, 0];
        iconsetLogo.customDims[0] = [176, 90];
        iconsetLogo.customOffsets[1] = [180, 0];
        iconsetLogo.customDims[1] = [284, 512];
        iconsetLogo.customOffsets[2] = [1, 491];
        iconsetLogo.customDims[2] = [22, 20];

        let screenshots_anim = new IconSetInfo();
        RenderIconSet.setInfo['screenshots_anim'] = screenshots_anim;
        screenshots_anim.totalIcons = 29;
        for (let i = 0; i < screenshots_anim.totalIcons; i++) {
            screenshots_anim.customOffsets[i] = [0, i * 351];
            screenshots_anim.customDims[i] = [726, 351];
        }

        let screenshots_hello = new IconSetInfo();
        RenderIconSet.setInfo['screenshots_hello'] = screenshots_hello;
        screenshots_hello.totalIcons = 11;
        for (let i = 0; i < screenshots_hello.totalIcons; i++) {
            screenshots_hello.customOffsets[i] = [0, i * 362];
            screenshots_hello.customDims[i] = [726, 362];
        }

        let glider_bg = new IconSetInfo();
        RenderIconSet.setInfo['glider_bg'] = glider_bg;
        glider_bg.totalIcons = 43;
        for (let i = 0; i < glider_bg.totalIcons; i++) {
            glider_bg.customOffsets[i] = [0, i * 343];
            glider_bg.customDims[i] = [512, 343];
        }

        VpcInitIcons.setGliderSprites();
        Util512.freezeRecurse(RenderIconSet.setInfo);
    }

    static setGliderSprites() {
        let glider_sprites = new IconSetInfo();
        RenderIconSet.setInfo['glider_sprites'] = glider_sprites;
        glider_sprites.totalIcons = 80;
        glider_sprites.customOffsets[0] = [0, 0];
        glider_sprites.customDims[0] = [1, 1];
        glider_sprites.customOffsets[1] = [256, 0];
        glider_sprites.customDims[1] = [48, 11];
        glider_sprites.customOffsets[2] = [256, 12];
        glider_sprites.customDims[2] = [48, 11];
        glider_sprites.customOffsets[3] = [0, 0];
        glider_sprites.customDims[3] = [48, 20];
        glider_sprites.customOffsets[4] = [0, 21];
        glider_sprites.customDims[4] = [48, 20];
        glider_sprites.customOffsets[5] = [0, 42];
        glider_sprites.customDims[5] = [48, 20];
        glider_sprites.customOffsets[6] = [0, 63];
        glider_sprites.customDims[6] = [48, 20];
        glider_sprites.customOffsets[7] = [208, 0];
        glider_sprites.customDims[7] = [48, 20];
        glider_sprites.customOffsets[8] = [208, 21];
        glider_sprites.customDims[8] = [48, 20];
        glider_sprites.customOffsets[9] = [208, 42];
        glider_sprites.customDims[9] = [48, 20];
        glider_sprites.customOffsets[10] = [208, 63];
        glider_sprites.customDims[10] = [48, 20];
        glider_sprites.customOffsets[11] = [208, 84];
        glider_sprites.customDims[11] = [48, 20];
        glider_sprites.customOffsets[12] = [208, 105];
        glider_sprites.customDims[12] = [48, 20];
        glider_sprites.customOffsets[13] = [256, 24];
        glider_sprites.customDims[13] = [48, 36];
        glider_sprites.customOffsets[14] = [256, 61];
        glider_sprites.customDims[14] = [48, 36];
        glider_sprites.customOffsets[15] = [256, 98];
        glider_sprites.customDims[15] = [48, 36];
        glider_sprites.customOffsets[16] = [256, 135];
        glider_sprites.customDims[16] = [48, 36];
        glider_sprites.customOffsets[17] = [414, 179];
        glider_sprites.customDims[17] = [48, 20];
        glider_sprites.customOffsets[18] = [463, 179];
        glider_sprites.customDims[18] = [48, 20];
        glider_sprites.customOffsets[19] = [0, 84];
        glider_sprites.customDims[19] = [48, 12];
        glider_sprites.customOffsets[20] = [0, 97];
        glider_sprites.customDims[20] = [48, 13];
        glider_sprites.customOffsets[21] = [0, 111];
        glider_sprites.customDims[21] = [48, 13];
        glider_sprites.customOffsets[22] = [0, 125];
        glider_sprites.customDims[22] = [48, 21];
        glider_sprites.customOffsets[23] = [0, 147];
        glider_sprites.customDims[23] = [38, 27];
        glider_sprites.customOffsets[24] = [304, 84];
        glider_sprites.customDims[24] = [32, 31];
        glider_sprites.customOffsets[25] = [304, 116];
        glider_sprites.customDims[25] = [32, 31];
        glider_sprites.customOffsets[26] = [304, 148];
        glider_sprites.customDims[26] = [32, 31];
        glider_sprites.customOffsets[27] = [304, 180];
        glider_sprites.customDims[27] = [32, 31];
        glider_sprites.customOffsets[28] = [304, 212];
        glider_sprites.customDims[28] = [32, 31];
        glider_sprites.customOffsets[29] = [304, 244];
        glider_sprites.customDims[29] = [32, 31];
        glider_sprites.customOffsets[30] = [0, 175];
        glider_sprites.customDims[30] = [41, 30];
        glider_sprites.customOffsets[31] = [0, 206];
        glider_sprites.customDims[31] = [35, 55];
        glider_sprites.customOffsets[32] = [0, 262];
        glider_sprites.customDims[32] = [35, 54];
        glider_sprites.customOffsets[33] = [48, 23];
        glider_sprites.customDims[33] = [64, 22];
        glider_sprites.customOffsets[34] = [48, 46];
        glider_sprites.customDims[34] = [64, 24];
        glider_sprites.customOffsets[35] = [48, 71];
        glider_sprites.customDims[35] = [64, 55];
        glider_sprites.customOffsets[36] = [112, 0];
        glider_sprites.customDims[36] = [32, 29];
        glider_sprites.customOffsets[37] = [112, 30];
        glider_sprites.customDims[37] = [32, 21];
        glider_sprites.customOffsets[38] = [112, 52];
        glider_sprites.customDims[38] = [32, 23];
        glider_sprites.customOffsets[39] = [112, 76];
        glider_sprites.customDims[39] = [32, 32];
        glider_sprites.customOffsets[40] = [112, 109];
        glider_sprites.customDims[40] = [32, 29];
        glider_sprites.customOffsets[41] = [144, 109];
        glider_sprites.customDims[41] = [16, 16];
        glider_sprites.customOffsets[42] = [144, 126];
        glider_sprites.customDims[42] = [16, 16];
        glider_sprites.customOffsets[43] = [144, 143];
        glider_sprites.customDims[43] = [16, 16];
        glider_sprites.customOffsets[44] = [144, 160];
        glider_sprites.customDims[44] = [16, 16];
        glider_sprites.customOffsets[45] = [112, 139];
        glider_sprites.customDims[45] = [32, 29];
        glider_sprites.customOffsets[46] = [112, 169];
        glider_sprites.customDims[46] = [32, 29];
        glider_sprites.customOffsets[47] = [112, 199];
        glider_sprites.customDims[47] = [32, 29];
        glider_sprites.customOffsets[48] = [142, 0];
        glider_sprites.customDims[48] = [18, 26];
        glider_sprites.customOffsets[49] = [144, 27];
        glider_sprites.customDims[49] = [18, 27];
        glider_sprites.customOffsets[50] = [160, 264];
        glider_sprites.customDims[50] = [32, 25];
        glider_sprites.customOffsets[51] = [160, 290];
        glider_sprites.customDims[51] = [32, 25];
        glider_sprites.customOffsets[52] = [160, 316];
        glider_sprites.customDims[52] = [32, 25];
        glider_sprites.customOffsets[53] = [144, 82];
        glider_sprites.customDims[53] = [18, 26];
        glider_sprites.customOffsets[54] = [48, 127];
        glider_sprites.customDims[54] = [64, 170];
        glider_sprites.customOffsets[55] = [192, 42];
        glider_sprites.customDims[55] = [16, 13];
        glider_sprites.customOffsets[56] = [192, 71];
        glider_sprites.customDims[56] = [16, 29];
        glider_sprites.customOffsets[57] = [448, 270];
        glider_sprites.customDims[57] = [63, 71];
        glider_sprites.customOffsets[58] = [408, 53];
        glider_sprites.customDims[58] = [102, 93];
        glider_sprites.customOffsets[59] = [144, 55];
        glider_sprites.customDims[59] = [16, 26];
        glider_sprites.customOffsets[60] = [256, 209];
        glider_sprites.customDims[60] = [45, 58];
        glider_sprites.customOffsets[61] = [0, 0];
        glider_sprites.customDims[61] = [161, 254];
        glider_sprites.customOffsets[62] = [0, 0];
        glider_sprites.customDims[62] = [161, 254];
        glider_sprites.customOffsets[63] = [144, 189];
        glider_sprites.customDims[63] = [16, 12];
        glider_sprites.customOffsets[64] = [144, 202];
        glider_sprites.customDims[64] = [16, 12];
        glider_sprites.customOffsets[65] = [144, 215];
        glider_sprites.customDims[65] = [16, 12];
        glider_sprites.customOffsets[66] = [192, 0];
        glider_sprites.customDims[66] = [16, 13];
        glider_sprites.customOffsets[67] = [192, 14];
        glider_sprites.customDims[67] = [16, 13];
        glider_sprites.customOffsets[68] = [192, 28];
        glider_sprites.customDims[68] = [16, 13];
        glider_sprites.customOffsets[69] = [192, 42];
        glider_sprites.customDims[69] = [16, 13];
        glider_sprites.customOffsets[70] = [192, 56];
        glider_sprites.customDims[70] = [16, 14];

        // vent pattern, added manually
        glider_sprites.customOffsets[71] = [512, 0];
        glider_sprites.customDims[71] = [16, 342];
    }
}
