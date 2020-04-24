/**
 * Bresenham Curve Rasterizing Algorithms
 * @author  Zingl Alois
 * @date    17.12.2014
 * @version 1.3
 * @url     http://members.chello.at/easyfilter/bresenham.html
*/

function assert(a) {
    if (!a) console.log("Assertion failed in bresenham.js "+a);
    return a;
}
    
function plotLine(x0, y0, x1, y1)
{
    var dx =  Math.abs(x1-x0), sx = x0<x1 ? 1 : -1;
    var dy = -Math.abs(y1-y0), sy = y0<y1 ? 1 : -1;
    var err = dx+dy, e2;                                   /* error value e_xy */

    for (;;){                                                          /* loop */
            setPixel(x0,y0);
            if (x0 == x1 && y0 == y1) break;
            e2 = 2*err;
            if (e2 >= dy) { err += dy; x0 += sx; }                        /* x step */
            if (e2 <= dx) { err += dx; y0 += sy; }                        /* y step */
    }
}

function plotEllipse(xm, ym, a, b)
{
    var x = -a, y = 0;           /* II. quadrant from bottom left to top right */
    var e2, dx = (1+2*x)*b*b;                              /* error increment  */
    var dy = x*x, err = dx+dy;                              /* error of 1.step */

    do {
            setPixel(xm-x, ym+y);                                 /*   I. Quadrant */
            setPixel(xm+x, ym+y);                                 /*  II. Quadrant */
            setPixel(xm+x, ym-y);                                 /* III. Quadrant */
            setPixel(xm-x, ym-y);                                 /*  IV. Quadrant */
            e2 = 2*err;                                        
            if (e2 >= dx) { x++; err += dx += 2*b*b; }                   /* x step */
            if (e2 <= dy) { y++; err += dy += 2*a*a; }                   /* y step */
    } while (x <= 0);

    while (y++ < b) {            /* too early stop for flat ellipses with a=1, */
            setPixel(xm, ym+y);                        /* -> finish tip of ellipse */
            setPixel(xm, ym-y);
    }
}

function plotCircle(xm, ym, r)
{
    var x = -r, y = 0, err = 2-2*r;                /* bottom left to top right */
    do {
            setPixel(xm-x, ym+y);                            /*   I. Quadrant +x +y */
            setPixel(xm-y, ym-x);                            /*  II. Quadrant -x +y */
            setPixel(xm+x, ym-y);                            /* III. Quadrant -x -y */
            setPixel(xm+y, ym+x);                            /*  IV. Quadrant +x -y */
            r = err;                                       
            if (r <= y) err += ++y*2+1;                                   /* y step */
            if (r > x || err > y) err += ++x*2+1;                         /* x step */
    } while (x < 0);
}

function plotEllipseRect(x0, y0, x1, y1)
{                              /* rectangular parameter enclosing the ellipse */
    var a = Math.abs(x1-x0), b = Math.abs(y1-y0), b1 = b&1;        /* diameter */
    var dx = 4*(1.0-a)*b*b, dy = 4*(b1+1)*a*a;              /* error increment */
    var err = dx+dy+b1*a*a, e2;                             /* error of 1.step */

    if (x0 > x1) { x0 = x1; x1 += a; }        /* if called with swapped points */
    if (y0 > y1) y0 = y1;                                  /* .. exchange them */
    y0 += (b+1)>>1; y1 = y0-b1;                              /* starting pixel */
    a = 8*a*a; b1 = 8*b*b;                               
                                                                                                                
    do {                                                 
            setPixel(x1, y0);                                      /*   I. Quadrant */
            setPixel(x0, y0);                                      /*  II. Quadrant */
            setPixel(x0, y1);                                      /* III. Quadrant */
            setPixel(x1, y1);                                      /*  IV. Quadrant */
            e2 = 2*err;
            if (e2 <= dy) { y0++; y1--; err += dy += a; }                 /* y step */
            if (e2 >= dx || 2*err > dy) { x0++; x1--; err += dx += b1; }       /* x */
    } while (x0 <= x1);

    while (y0-y1 <= b) {                /* too early stop of flat ellipses a=1 */
            setPixel(x0-1, y0);                         /* -> finish tip of ellipse */
            setPixel(x1+1, y0++);
            setPixel(x0-1, y1);
            setPixel(x1+1, y1--);
    }
}

function plotQuadBezierSeg(x0, y0, x1, y1, x2, y2)
{                                  /* plot a limited quadratic Bezier segment */
    var sx = x2-x1, sy = y2-y1;
    var xx = x0-x1, yy = y0-y1, xy;               /* relative values for checks */
    var dx, dy, err, cur = xx*sy-yy*sx;                            /* curvature */

    assert(xx*sx <= 0 && yy*sy <= 0);       /* sign of gradient must not change */

    if (sx*sx+sy*sy > xx*xx+yy*yy) {                 /* begin with shorter part */
        x2 = x0; x0 = sx+x1; y2 = y0; y0 = sy+y1; cur = -cur;       /* swap P0 P2 */
    }
    if (cur != 0) {                                         /* no straight line */
        xx += sx; xx *= sx = x0 < x2 ? 1 : -1;                /* x step direction */
        yy += sy; yy *= sy = y0 < y2 ? 1 : -1;                /* y step direction */
        xy = 2*xx*yy; xx *= xx; yy *= yy;               /* differences 2nd degree */
        if (cur*sx*sy < 0) {                                /* negated curvature? */
            xx = -xx; yy = -yy; xy = -xy; cur = -cur;
        }
        dx = 4.0*sy*cur*(x1-x0)+xx-xy;                  /* differences 1st degree */
        dy = 4.0*sx*cur*(y0-y1)+yy-xy;
        xx += xx; yy += yy; err = dx+dy+xy;                     /* error 1st step */
        do {
            setPixel(x0,y0);                                          /* plot curve */
            if (x0 == x2 && y0 == y2) return;       /* last pixel -> curve finished */
            y1 = 2*err < dx;                       /* save value for test of y step */
            if (2*err > dy) { x0 += sx; dx -= xy; err += dy += yy; }      /* x step */
            if (    y1    ) { y0 += sy; dy -= xy; err += dx += xx; }      /* y step */
        } while (dy < 0 && dx > 0);        /* gradient negates -> algorithm fails */
    }
    plotLine(x0,y0, x2,y2);                       /* plot remaining part to end */
}

function plotQuadBezier(x0, y0, x1, y1, x2, y2)
{                                          /* plot any quadratic Bezier curve */
    var x = x0-x1, y = y0-y1, t = x0-2*x1+x2, r;

    if (x*(x2-x1) > 0) {                              /* horizontal cut at P4? */
            if (y*(y2-y1) > 0)                           /* vertical cut at P6 too? */
                if (Math.abs((y0-2*y1+y2)/t*x) > Math.abs(y)) {      /* which first? */
                        x0 = x2; x2 = x+x1; y0 = y2; y2 = y+y1;            /* swap points */
                }                            /* now horizontal cut at P4 comes first */
            t = (x0-x1)/t;
            r = (1-t)*((1-t)*y0+2.0*t*y1)+t*t*y2;                       /* By(t=P4) */
            t = (x0*x2-x1*x1)*t/(x0-x1);                       /* gradient dP4/dx=0 */
            x = Math.floor(t+0.5); y = Math.floor(r+0.5);
            r = (y1-y0)*(t-x0)/(x1-x0)+y0;                  /* intersect P3 | P0 P1 */
            plotQuadBezierSeg(x0,y0, x,Math.floor(r+0.5), x,y);
            r = (y1-y2)*(t-x2)/(x1-x2)+y2;                  /* intersect P4 | P1 P2 */
            x0 = x1 = x; y0 = y; y1 = Math.floor(r+0.5);        /* P0 = P4, P1 = P8 */
    }
    if ((y0-y1)*(y2-y1) > 0) {                          /* vertical cut at P6? */
            t = y0-2*y1+y2; t = (y0-y1)/t;
            r = (1-t)*((1-t)*x0+2.0*t*x1)+t*t*x2;                       /* Bx(t=P6) */
            t = (y0*y2-y1*y1)*t/(y0-y1);                       /* gradient dP6/dy=0 */
            x = Math.floor(r+0.5); y = Math.floor(t+0.5);
            r = (x1-x0)*(t-y0)/(y1-y0)+x0;                  /* intersect P6 | P0 P1 */
            plotQuadBezierSeg(x0,y0, Math.floor(r+0.5),y, x,y);
            r = (x1-x2)*(t-y2)/(y1-y2)+x2;                  /* intersect P7 | P1 P2 */
            x0 = x; x1 = Math.floor(r+0.5); y0 = y1 = y;        /* P0 = P6, P1 = P7 */
    }
    plotQuadBezierSeg(x0,y0, x1,y1, x2,y2);                  /* remaining part */
}

function plotQuadRationalBezierSeg(x0, y0, x1, y1, x2, y2, w)
{                   /* plot a limited rational Bezier segment, squared weight */
    var sx = x2-x1, sy = y2-y1;                   /* relative values for checks */
    var dx = x0-x2, dy = y0-y2, xx = x0-x1, yy = y0-y1;
    var xy = xx*sy+yy*sx, cur = xx*sy-yy*sx, err;                  /* curvature */

    assert(xx*sx <= 0.0 && yy*sy <= 0.0);   /* sign of gradient must not change */

    if (cur != 0.0 && w > 0.0) {                            /* no straight line */
        if (sx*sx+sy*sy > xx*xx+yy*yy) {               /* begin with shorter part */
            x2 = x0; x0 -= dx; y2 = y0; y0 -= dy; cur = -cur;         /* swap P0 P2 */
        }
        xx = 2.0*(4.0*w*sx*xx+dx*dx);                   /* differences 2nd degree */
        yy = 2.0*(4.0*w*sy*yy+dy*dy);
        sx = x0 < x2 ? 1 : -1;                                /* x step direction */
        sy = y0 < y2 ? 1 : -1;                                /* y step direction */
        xy = -2.0*sx*sy*(2.0*w*xy+dx*dy);

        if (cur*sx*sy < 0.0) {                              /* negated curvature? */
            xx = -xx; yy = -yy; xy = -xy; cur = -cur;
        }
        dx = 4.0*w*(x1-x0)*sy*cur+xx/2.0+xy;            /* differences 1st degree */
        dy = 4.0*w*(y0-y1)*sx*cur+yy/2.0+xy;

        if (w < 0.5 && (dy > xy || dx < xy)) {   /* flat ellipse, algorithm fails */
            cur = (w+1.0)/2.0; w = Math.sqrt(w); xy = 1.0/(w+1.0);
            sx = Math.floor((x0+2.0*w*x1+x2)*xy/2.0+0.5);/*subdivide curve in half */
            sy = Math.floor((y0+2.0*w*y1+y2)*xy/2.0+0.5);
            dx = Math.floor((w*x1+x0)*xy+0.5); dy = Math.floor((y1*w+y0)*xy+0.5);
            plotQuadRationalBezierSeg(x0,y0, dx,dy, sx,sy, cur);/* plot separately */
            dx = Math.floor((w*x1+x2)*xy+0.5); dy = Math.floor((y1*w+y2)*xy+0.5);
            plotQuadRationalBezierSeg(sx,sy, dx,dy, x2,y2, cur);
            return;
        }
        err = dx+dy-xy;                                           /* error 1.step */
        do {
            setPixel(x0,y0);                                          /* plot curve */
            if (x0 == x2 && y0 == y2) return;       /* last pixel -> curve finished */
            x1 = 2*err > dy; y1 = 2*(err+yy) < -dy;/* save value for test of x step */
            if (2*err < dx || y1) { y0 += sy; dy += xy; err += dx += xx; }/* y step */
            if (2*err > dx || x1) { x0 += sx; dx += xy; err += dy += yy; }/* x step */
        } while (dy <= xy && dx >= xy);    /* gradient negates -> algorithm fails */
    }
    plotLine(x0,y0, x2,y2);                     /* plot remaining needle to end */
}

function plotQuadRationalBezier(x0, y0, x1, y1, x2, y2, w)
{                                 /* plot any quadratic rational Bezier curve */
    var x = x0-2*x1+x2, y = y0-2*y1+y2;
    var xx = x0-x1, yy = y0-y1, ww, t, q;

    assert(w >= 0.0);

    if (xx*(x2-x1) > 0) {                             /* horizontal cut at P4? */
            if (yy*(y2-y1) > 0)                          /* vertical cut at P6 too? */
                if (Math.abs(xx*y) > Math.abs(yy*x)) {               /* which first? */
                        x0 = x2; x2 = xx+x1; y0 = y2; y2 = yy+y1;          /* swap points */
                }                            /* now horizontal cut at P4 comes first */
            if (x0 == x2 || w == 1.0) t = (x0-x1)/x;
            else {                                 /* non-rational or rational case */
                q = Math.sqrt(4.0*w*w*(x0-x1)*(x2-x1)+(x2-x0)*(x2-x0));
                if (x1 < x0) q = -q;
                t = (2.0*w*(x0-x1)-x0+x2+q)/(2.0*(1.0-w)*(x2-x0));        /* t at P4 */
            }
            q = 1.0/(2.0*t*(1.0-t)*(w-1.0)+1.0);                 /* sub-divide at t */
            xx = (t*t*(x0-2.0*w*x1+x2)+2.0*t*(w*x1-x0)+x0)*q;               /* = P4 */
            yy = (t*t*(y0-2.0*w*y1+y2)+2.0*t*(w*y1-y0)+y0)*q;
            ww = t*(w-1.0)+1.0; ww *= ww*q;                    /* squared weight P3 */
            w = ((1.0-t)*(w-1.0)+1.0)*Math.sqrt(q);                    /* weight P8 */
            x = Math.floor(xx+0.5); y = Math.floor(yy+0.5);                   /* P4 */
            yy = (xx-x0)*(y1-y0)/(x1-x0)+y0;                /* intersect P3 | P0 P1 */
            plotQuadRationalBezierSeg(x0,y0, x,Math.floor(yy+0.5), x,y, ww);
            yy = (xx-x2)*(y1-y2)/(x1-x2)+y2;                /* intersect P4 | P1 P2 */
            y1 = Math.floor(yy+0.5); x0 = x1 = x; y0 = y;       /* P0 = P4, P1 = P8 */
    }
    if ((y0-y1)*(y2-y1) > 0) {                          /* vertical cut at P6? */
            if (y0 == y2 || w == 1.0) t = (y0-y1)/(y0-2.0*y1+y2);
            else {                                 /* non-rational or rational case */
                q = Math.sqrt(4.0*w*w*(y0-y1)*(y2-y1)+(y2-y0)*(y2-y0));
                if (y1 < y0) q = -q;
                t = (2.0*w*(y0-y1)-y0+y2+q)/(2.0*(1.0-w)*(y2-y0));        /* t at P6 */
            }
            q = 1.0/(2.0*t*(1.0-t)*(w-1.0)+1.0);                 /* sub-divide at t */
            xx = (t*t*(x0-2.0*w*x1+x2)+2.0*t*(w*x1-x0)+x0)*q;               /* = P6 */
            yy = (t*t*(y0-2.0*w*y1+y2)+2.0*t*(w*y1-y0)+y0)*q;
            ww = t*(w-1.0)+1.0; ww *= ww*q;                    /* squared weight P5 */
            w = ((1.0-t)*(w-1.0)+1.0)*Math.sqrt(q);                    /* weight P7 */
            x = Math.floor(xx+0.5); y = Math.floor(yy+0.5);           /* P6 */
            xx = (x1-x0)*(yy-y0)/(y1-y0)+x0;                /* intersect P6 | P0 P1 */
            plotQuadRationalBezierSeg(x0,y0, Math.floor(xx+0.5),y, x,y, ww);
            xx = (x1-x2)*(yy-y2)/(y1-y2)+x2;                /* intersect P7 | P1 P2 */
            x1 = Math.floor(xx+0.5); x0 = x; y0 = y1 = y;       /* P0 = P6, P1 = P7 */
    }
    plotQuadRationalBezierSeg(x0,y0, x1,y1, x2,y2, w*w);          /* remaining */
}

function plotRotatedEllipse(x, y, a, b, angle)
{                                   /* plot ellipse rotated by angle (radian) */
    var xd = a*a, yd = b*b;
    var s = Math.sin(angle), zd = (xd-yd)*s;               /* ellipse rotation */
    xd = Math.sqrt(xd-zd*s), yd = Math.sqrt(yd+zd*s);      /* surrounding rect */
    a = Math.floor(xd+0.5); b = Math.floor(yd+0.5); zd = zd*a*b/(xd*yd);  
    plotRotatedEllipseRect(x-a,y-b, x+a,y+b, (4*zd*Math.cos(angle)));
}

function plotRotatedEllipseRect(x0, y0, x1, y1, zd)
{                  /* rectangle enclosing the ellipse, integer rotation angle */
    var xd = x1-x0, yd = y1-y0, w = xd*yd;
    if (zd == 0) return plotEllipseRect(x0,y0, x1,y1);          /* looks nicer */
    if (w != 0.0) w = (w-zd)/(w+w);                    /* squared weight of P1 */
    assert(w <= 1.0 && w >= 0.0);                /* limit angle to |zd|<=xd*yd */
    xd = Math.floor(xd*w+0.5); yd = Math.floor(yd*w+0.5);       /* snap to int */
    plotQuadRationalBezierSeg(x0,y0+yd, x0,y0, x0+xd,y0, 1.0-w);
    plotQuadRationalBezierSeg(x0,y0+yd, x0,y1, x1-xd,y1, w);
    plotQuadRationalBezierSeg(x1,y1-yd, x1,y1, x1-xd,y1, 1.0-w);
    plotQuadRationalBezierSeg(x1,y1-yd, x1,y0, x0+xd,y0, w);
}

function plotCubicBezierSeg(x0, y0, x1, y1, x2, y2, x3, y3)
{                                        /* plot limited cubic Bezier segment */
    var f, fx, fy, leg = 1;
    var sx = x0 < x3 ? 1 : -1, sy = y0 < y3 ? 1 : -1;        /* step direction */
    var xc = -Math.abs(x0+x1-x2-x3), xa = xc-4*sx*(x1-x2), xb = sx*(x0-x1-x2+x3);
    var yc = -Math.abs(y0+y1-y2-y3), ya = yc-4*sy*(y1-y2), yb = sy*(y0-y1-y2+y3);
    var ab, ac, bc, cb, xx, xy, yy, dx, dy, ex, pxy, EP = 0.01;
                                                                                                /* check for curve restrains */
    /* slope P0-P1 == P2-P3    and  (P0-P3 == P1-P2      or  no slope change)  */
    assert((x1-x0)*(x2-x3) < EP && ((x3-x0)*(x1-x2) < EP || xb*xb < xa*xc+EP));
    assert((y1-y0)*(y2-y3) < EP && ((y3-y0)*(y1-y2) < EP || yb*yb < ya*yc+EP));

    if (xa == 0 && ya == 0)                                /* quadratic Bezier */
            return plotQuadBezierSeg(x0,y0, (3*x1-x0)>>1,(3*y1-y0)>>1, x3,y3);
    x1 = (x1-x0)*(x1-x0)+(y1-y0)*(y1-y0)+1;                    /* line lengths */
    x2 = (x2-x3)*(x2-x3)+(y2-y3)*(y2-y3)+1;

    do {                                                /* loop over both ends */
            ab = xa*yb-xb*ya; ac = xa*yc-xc*ya; bc = xb*yc-xc*yb;
            ex = ab*(ab+ac-3*bc)+ac*ac;       /* P0 part of self-intersection loop? */
            f = ex > 0 ? 1 : Math.floor(Math.sqrt(1+1024/x1));   /* calc resolution */
            ab *= f; ac *= f; bc *= f; ex *= f*f;            /* increase resolution */
            xy = 9*(ab+ac+bc)/8; cb = 8*(xa-ya);  /* init differences of 1st degree */
            dx = 27*(8*ab*(yb*yb-ya*yc)+ex*(ya+2*yb+yc))/64-ya*ya*(xy-ya);
            dy = 27*(8*ab*(xb*xb-xa*xc)-ex*(xa+2*xb+xc))/64-xa*xa*(xy+xa);
                                                                                        /* init differences of 2nd degree */
            xx = 3*(3*ab*(3*yb*yb-ya*ya-2*ya*yc)-ya*(3*ac*(ya+yb)+ya*cb))/4;
            yy = 3*(3*ab*(3*xb*xb-xa*xa-2*xa*xc)-xa*(3*ac*(xa+xb)+xa*cb))/4;
            xy = xa*ya*(6*ab+6*ac-3*bc+cb); ac = ya*ya; cb = xa*xa;
            xy = 3*(xy+9*f*(cb*yb*yc-xb*xc*ac)-18*xb*yb*ab)/8;

            if (ex < 0) {         /* negate values if inside self-intersection loop */
                dx = -dx; dy = -dy; xx = -xx; yy = -yy; xy = -xy; ac = -ac; cb = -cb;
            }                                     /* init differences of 3rd degree */
            ab = 6*ya*ac; ac = -6*xa*ac; bc = 6*ya*cb; cb = -6*xa*cb;
            dx += xy; ex = dx+dy; dy += xy;                    /* error of 1st step */
exit: 
            for (pxy = 0, fx = fy = f; x0 != x3 && y0 != y3; ) {
                setPixel(x0,y0);                                       /* plot curve */
                do {                                  /* move sub-steps of one pixel */
                        if (pxy == 0) if (dx > xy || dy < xy) break exit;    /* confusing */
                        if (pxy == 1) if (dx > 0 || dy < 0) break exit;         /* values */
                        y1 = 2*ex-dy;                    /* save value for test of y step */
                        if (2*ex >= dx) {                                   /* x sub-step */
                            fx--; ex += dx += xx; dy += xy += ac; yy += bc; xx += ab;
                        } else if (y1 > 0) break exit;
                        if (y1 <= 0) {                                      /* y sub-step */
                            fy--; ex += dy += yy; dx += xy += bc; xx += ac; yy += cb;
                        }
                } while (fx > 0 && fy > 0);                       /* pixel complete? */
                if (2*fx <= f) { x0 += sx; fx += f; }                      /* x step */
                if (2*fy <= f) { y0 += sy; fy += f; }                      /* y step */
                if (pxy == 0 && dx < 0 && dy > 0) pxy = 1;      /* pixel ahead valid */
            }
            xx = x0; x0 = x3; x3 = xx; sx = -sx; xb = -xb;             /* swap legs */
            yy = y0; y0 = y3; y3 = yy; sy = -sy; yb = -yb; x1 = x2;
    } while (leg--);                                          /* try other end */
    plotLine(x0,y0, x3,y3);       /* remaining part in case of cusp or crunode */
}

function plotCubicBezier(x0, y0, x1, y1, x2, y2, x3, y3)
{                                              /* plot any cubic Bezier curve */
    var n = 0, i = 0;
    var xc = x0+x1-x2-x3, xa = xc-4*(x1-x2);
    var xb = x0-x1-x2+x3, xd = xb+4*(x1+x2);
    var yc = y0+y1-y2-y3, ya = yc-4*(y1-y2);
    var yb = y0-y1-y2+y3, yd = yb+4*(y1+y2);
    var fx0 = x0, fx1, fx2, fx3, fy0 = y0, fy1, fy2, fy3;
    var t1 = xb*xb-xa*xc, t2, t = new Array(5);
                                                                /* sub-divide curve at gradient sign changes */
    if (xa == 0) {                                               /* horizontal */
            if (Math.abs(xc) < 2*Math.abs(xb)) t[n++] = xc/(2.0*xb);  /* one change */
    } else if (t1 > 0.0) {                                      /* two changes */
            t2 = Math.sqrt(t1);
            t1 = (xb-t2)/xa; if (Math.abs(t1) < 1.0) t[n++] = t1;
            t1 = (xb+t2)/xa; if (Math.abs(t1) < 1.0) t[n++] = t1;
    }
    t1 = yb*yb-ya*yc;
    if (ya == 0) {                                                 /* vertical */
            if (Math.abs(yc) < 2*Math.abs(yb)) t[n++] = yc/(2.0*yb);  /* one change */
    } else if (t1 > 0.0) {                                      /* two changes */
            t2 = Math.sqrt(t1);
            t1 = (yb-t2)/ya; if (Math.abs(t1) < 1.0) t[n++] = t1;
            t1 = (yb+t2)/ya; if (Math.abs(t1) < 1.0) t[n++] = t1;
    }
    for (i = 1; i < n; i++)                         /* bubble sort of 4 points */
            if ((t1 = t[i-1]) > t[i]) { t[i-1] = t[i]; t[i] = t1; i = 0; }

    t1 = -1.0; t[n] = 1.0;                                /* begin / end point */
    for (i = 0; i <= n; i++) {                 /* plot each segment separately */
            t2 = t[i];                                /* sub-divide at t[i-1], t[i] */
            fx1 = (t1*(t1*xb-2*xc)-t2*(t1*(t1*xa-2*xb)+xc)+xd)/8-fx0;
            fy1 = (t1*(t1*yb-2*yc)-t2*(t1*(t1*ya-2*yb)+yc)+yd)/8-fy0;
            fx2 = (t2*(t2*xb-2*xc)-t1*(t2*(t2*xa-2*xb)+xc)+xd)/8-fx0;
            fy2 = (t2*(t2*yb-2*yc)-t1*(t2*(t2*ya-2*yb)+yc)+yd)/8-fy0;
            fx0 -= fx3 = (t2*(t2*(3*xb-t2*xa)-3*xc)+xd)/8;
            fy0 -= fy3 = (t2*(t2*(3*yb-t2*ya)-3*yc)+yd)/8;
            x3 = Math.floor(fx3+0.5); y3 = Math.floor(fy3+0.5);     /* scale bounds */
            if (fx0 != 0.0) { fx1 *= fx0 = (x0-x3)/fx0; fx2 *= fx0; }
            if (fy0 != 0.0) { fy1 *= fy0 = (y0-y3)/fy0; fy2 *= fy0; }
            if (x0 != x3 || y0 != y3)                            /* segment t1 - t2 */
                plotCubicBezierSeg(x0,y0, x0+fx1,y0+fy1, x0+fx2,y0+fy2, x3,y3);
            x0 = x3; y0 = y3; fx0 = fx3; fy0 = fy3; t1 = t2;
    }
}

function plotLineAA(x0, y0, x1, y1)
{             /* draw a black (0) anti-aliased line on white (255) background */
    var dx = Math.abs(x1-x0), sx = x0 < x1 ? 1 : -1;
    var dy = Math.abs(y1-y0), sy = y0 < y1 ? 1 : -1;
    var err = dx-dy, e2, x2;                               /* error value e_xy */
    var ed = dx+dy == 0 ? 1 : Math.sqrt(dx*dx+dy*dy);

    for ( ; ; ){                                                 /* pixel loop */
            setPixelAA(x0,y0, 255*Math.abs(err-dx+dy)/ed);
            e2 = err; x2 = x0;
            if (2*e2 >= -dx) {                                            /* x step */
                if (x0 == x1) break;
                if (e2+dy < ed) setPixelAA(x0,y0+sy, 255*(e2+dy)/ed);
                err -= dy; x0 += sx;
            }
            if (2*e2 <= dy) {                                             /* y step */
                if (y0 == y1) break;
                if (dx-e2 < ed) setPixelAA(x2+sx,y0, 255*(dx-e2)/ed);
                err += dx; y0 += sy;
            }
    }
}

function plotCircleAA(xm, ym, r)
{                     /* draw a black anti-aliased circle on white background */
    var x = r, y = 0;            /* II. quadrant from bottom left to top right */
    var i, x2, e2, err = 2-2*r;                             /* error of 1.step */
    r = 1-err;
    for ( ; ; ) {
            i = 255*Math.abs(err+2*(x+y)-2)/r;          /* get blend value of pixel */
            setPixelAA(xm+x, ym-y, i);                             /*   I. Quadrant */
            setPixelAA(xm+y, ym+x, i);                             /*  II. Quadrant */
            setPixelAA(xm-x, ym+y, i);                             /* III. Quadrant */
            setPixelAA(xm-y, ym-x, i);                             /*  IV. Quadrant */
            if (x == 0) break;
            e2 = err; x2 = x;                                    /* remember values */
            if (err > y) {                                                /* x step */
                i = 255*(err+2*x-1)/r;                              /* outward pixel */
                if (i < 255) {
                        setPixelAA(xm+x, ym-y+1, i);
                        setPixelAA(xm+y-1, ym+x, i);
                        setPixelAA(xm-x, ym+y-1, i);
                        setPixelAA(xm-y+1, ym-x, i);
                }  
                err -= --x*2-1; 
            } 
            if (e2 <= x2--) {                                             /* y step */
                i = 255*(1-2*y-e2)/r;                                /* inward pixel */
                if (i < 255) {
                        setPixelAA(xm+x2, ym-y, i);
                        setPixelAA(xm+y, ym+x2, i);
                        setPixelAA(xm-x2, ym+y, i);
                        setPixelAA(xm-y, ym-x2, i);
                }  
                err -= --y*2-1; 
            } 
    }
}

function plotEllipseRectAA(x0, y0, x1, y1)
{        /* draw a black anti-aliased rectangular ellipse on white background */
    var a = Math.abs(x1-x0), b = Math.abs(y1-y0), b1 = b&1;        /* diameter */
    var dx = 4*(a-1)*b*b, dy = 4*(b1+1)*a*a;                /* error increment */
    var f, ed, i, err = b1*a*a-dx+dy;                       /* error of 1.step */

    if (a == 0 || b == 0) return plotLine(x0,y0, x1,y1);
    if (x0 > x1) { x0 = x1; x1 += a; }        /* if called with swapped points */
    if (y0 > y1) y0 = y1;                                  /* .. exchange them */
    y0 += (b+1)>>1; y1 = y0-b1;                              /* starting pixel */
    a = 8*a*a; b1 = 8*b*b;

    for (;;) {                        /* approximate ed=Math.sqrt(dx*dx+dy*dy) */
            i = Math.min(dx,dy); ed = Math.max(dx,dy);
            if (y0 == y1+1 && err > dy && a > b1) ed = 255*4/a;            /* x-tip */
            else ed = 255/(ed+2*ed*i*i/(4*ed*ed+i*i));             /* approximation */
            i = ed*Math.abs(err+dx-dy);         /* get intensity value by pixel err */
            setPixelAA(x0,y0, i); setPixelAA(x0,y1, i);
            setPixelAA(x1,y0, i); setPixelAA(x1,y1, i);

            if (f = 2*err+dy >= 0) {                  /* x step, remember condition */
                if (x0 >= x1) break;
                i = ed*(err+dx);
                if (i < 256) {
                        setPixelAA(x0,y0+1, i); setPixelAA(x0,y1-1, i);
                        setPixelAA(x1,y0+1, i); setPixelAA(x1,y1-1, i);
                }          /* do error increment later since values are still needed */
            }
            if (2*err <= dx) {                                            /* y step */
                i = ed*(dy-err);
                if (i < 256) {
                        setPixelAA(x0+1,y0, i); setPixelAA(x1-1,y0, i);
                        setPixelAA(x0+1,y1, i); setPixelAA(x1-1,y1, i);
                }
                y0++; y1--; err += dy += a;
            }
            if (f) { x0++; x1--; err -= dx -= b1; }            /* x error increment */
    }
    if (--x0 == x1++)                       /* too early stop of flat ellipses */
            while (y0-y1 < b) {
                i = 255*4*Math.abs(err+dx)/b1;           /* -> finish tip of ellipse */
                setPixelAA(x0,++y0, i); setPixelAA(x1,y0, i);
                setPixelAA(x0,--y1, i); setPixelAA(x1,y1, i);
                err += dy += a;
            }
}

function plotQuadBezierSegAA(x0, y0, x1, y1, x2, y2)
{                    /* draw an limited anti-aliased quadratic Bezier segment */
    var sx = x2-x1, sy = y2-y1;
    var xx = x0-x1, yy = y0-y1, xy;              /* relative values for checks */
    var dx, dy, err, ed, cur = xx*sy-yy*sx;                       /* curvature */

    assert(xx*sx <= 0 && yy*sy <= 0);      /* sign of gradient must not change */

    if (sx*sx+sy*sy > xx*xx+yy*yy) {                /* begin with shorter part */
            x2 = x0; x0 = sx+x1; y2 = y0; y0 = sy+y1; cur = -cur;     /* swap P0 P2 */
    }
    if (cur != 0)
    {                                                      /* no straight line */
            xx += sx; xx *= sx = x0 < x2 ? 1 : -1;              /* x step direction */
            yy += sy; yy *= sy = y0 < y2 ? 1 : -1;              /* y step direction */
            xy = 2*xx*yy; xx *= xx; yy *= yy;             /* differences 2nd degree */
            if (cur*sx*sy < 0) {                              /* negated curvature? */
                xx = -xx; yy = -yy; xy = -xy; cur = -cur;
            }
            dx = 4.0*sy*(x1-x0)*cur+xx-xy;                /* differences 1st degree */
            dy = 4.0*sx*(y0-y1)*cur+yy-xy;
            xx += xx; yy += yy; err = dx+dy+xy;                   /* error 1st step */
            do {
                cur = Math.min(dx+xy,-xy-dy);
                ed = Math.max(dx+xy,-xy-dy);           /* approximate error distance */
                ed += 2*ed*cur*cur/(4*ed*ed+cur*cur);
                setPixelAA(x0,y0, 255*Math.abs(err-dx-dy-xy)/ed);      /* plot curve */
                if (x0 == x2 || y0 == y2) break;     /* last pixel -> curve finished */
                x1 = x0; cur = dx-err; y1 = 2*err+dy < 0;
                if (2*err+dx > 0) {                                        /* x step */
                        if (err-dy < ed) setPixelAA(x0,y0+sy, 255*Math.abs(err-dy)/ed);
                        x0 += sx; dx -= xy; err += dy += yy;
                }
                if (y1) {                                                  /* y step */
                        if (cur < ed) setPixelAA(x1+sx,y0, 255*Math.abs(cur)/ed);
                        y0 += sy; dy -= xy; err += dx += xx;
                }
            } while (dy < dx);                  /* gradient negates -> close curves */
    }
    plotLineAA(x0,y0, x2,y2);                  /* plot remaining needle to end */
}

function plotQuadBezierAA(x0, y0, x1, y1, x2, y2)
{                             /* plot any anti-aliased quadratic Bezier curve */
    var x = x0-x1, y = y0-y1, t = x0-2*x1+x2, r;

    if (x*(x2-x1) > 0) {                              /* horizontal cut at P4? */
            if (y*(y2-y1) > 0)                           /* vertical cut at P6 too? */
                if (Math.abs((y0-2*y1+y2)/t*x) > Math.abs(y)) {      /* which first? */
                        x0 = x2; x2 = x+x1; y0 = y2; y2 = y+y1;            /* swap points */
                }                            /* now horizontal cut at P4 comes first */
            t = (x0-x1)/t;
            r = (1-t)*((1-t)*y0+2.0*t*y1)+t*t*y2;                       /* By(t=P4) */
            t = (x0*x2-x1*x1)*t/(x0-x1);                       /* gradient dP4/dx=0 */
            x = Math.floor(t+0.5); y = Math.floor(r+0.5);
            r = (y1-y0)*(t-x0)/(x1-x0)+y0;                  /* intersect P3 | P0 P1 */
            plotQuadBezierSegAA(x0,y0, x,Math.floor(r+0.5), x,y);
            r = (y1-y2)*(t-x2)/(x1-x2)+y2;                  /* intersect P4 | P1 P2 */
            x0 = x1 = x; y0 = y; y1 = Math.floor(r+0.5);        /* P0 = P4, P1 = P8 */
    }
    if ((y0-y1)*(y2-y1) > 0) {                          /* vertical cut at P6? */
            t = y0-2*y1+y2; t = (y0-y1)/t;
            r = (1-t)*((1-t)*x0+2.0*t*x1)+t*t*x2;                       /* Bx(t=P6) */
            t = (y0*y2-y1*y1)*t/(y0-y1);                       /* gradient dP6/dy=0 */
            x = Math.floor(r+0.5); y = Math.floor(t+0.5);
            r = (x1-x0)*(t-y0)/(y1-y0)+x0;                  /* intersect P6 | P0 P1 */
            plotQuadBezierSegAA(x0,y0, Math.floor(r+0.5),y, x,y);
            r = (x1-x2)*(t-y2)/(y1-y2)+x2;                  /* intersect P7 | P1 P2 */
            x0 = x; x1 = Math.floor(r+0.5); y0 = y1 = y;        /* P0 = P6, P1 = P7 */
    }
    plotQuadBezierSegAA(x0,y0, x1,y1, x2,y2);                /* remaining part */
}

function plotQuadRationalBezierSegAA(x0, y0, x1, y1, x2, y2, w)
{   /* draw an anti-aliased rational quadratic Bezier segment, squared weight */
    var sx = x2-x1, sy = y2-y1;                  /* relative values for checks */
    var dx = x0-x2, dy = y0-y2, xx = x0-x1, yy = y0-y1;
    var xy = xx*sy+yy*sx, cur = xx*sy-yy*sx, err, ed, f;          /* curvature */

    assert(xx*sx <= 0.0 && yy*sy <= 0.0);  /* sign of gradient must not change */

    if (cur != 0.0 && w > 0.0) {                           /* no straight line */
            if (sx*sx+sy*sy > xx*xx+yy*yy) {             /* begin with shorter part */
                x2 = x0; x0 -= dx; y2 = y0; y0 -= dy; cur = -cur;      /* swap P0 P2 */
            }
            xx = 2.0*(4.0*w*sx*xx+dx*dx);                 /* differences 2nd degree */
            yy = 2.0*(4.0*w*sy*yy+dy*dy);
            sx = x0 < x2 ? 1 : -1;                              /* x step direction */
            sy = y0 < y2 ? 1 : -1;                              /* y step direction */
            xy = -2.0*sx*sy*(2.0*w*xy+dx*dy);

            if (cur*sx*sy < 0) {                              /* negated curvature? */
                xx = -xx; yy = -yy; cur = -cur; xy = -xy;
            }
            dx = 4.0*w*(x1-x0)*sy*cur+xx/2.0+xy;          /* differences 1st degree */
            dy = 4.0*w*(y0-y1)*sx*cur+yy/2.0+xy;

            if (w < 0.5 && dy > dx) {              /* flat ellipse, algorithm fails */
                cur = (w+1.0)/2.0; w = Math.sqrt(w); xy = 1.0/(w+1.0);
                sx = Math.floor((x0+2.0*w*x1+x2)*xy/2.0+0.5);     /* subdivide curve */
                sy = Math.floor((y0+2.0*w*y1+y2)*xy/2.0+0.5);
                dx = Math.floor((w*x1+x0)*xy+0.5); dy = Math.floor((y1*w+y0)*xy+0.5);
                plotQuadRationalBezierSegAA(x0,y0, dx,dy, sx,sy, cur); /* plot apart */
                dx = Math.floor((w*x1+x2)*xy+0.5); dy = Math.floor((y1*w+y2)*xy+0.5);
                return plotQuadRationalBezierSegAA(sx,sy, dx,dy, x2,y2, cur);
            }
            err = dx+dy-xy;                                       /* error 1st step */
            do {                                                      /* pixel loop */
                cur = Math.min(dx-xy,xy-dy); ed = Math.max(dx-xy,xy-dy);
                ed += 2*ed*cur*cur/(4.*ed*ed+cur*cur); /* approximate error distance */
                x1 = 255*Math.abs(err-dx-dy+xy)/ed;/* get blend value by pixel error */
                if (x1 < 256) setPixelAA(x0,y0, x1);                   /* plot curve */
                if (f = 2*err+dy < 0) {                                    /* y step */
                        if (y0 == y2) return;             /* last pixel -> curve finished */
                        if (dx-err < ed) setPixelAA(x0+sx,y0, 255*Math.abs(dx-err)/ed);
                }
                if (2*err+dx > 0) {                                        /* x step */
                        if (x0 == x2) return;             /* last pixel -> curve finished */
                        if (err-dy < ed) setPixelAA(x0,y0+sy, 255*Math.abs(err-dy)/ed);
                        x0 += sx; dx += xy; err += dy += yy;
                }
                if (f) { y0 += sy; dy += xy; err += dx += xx; }            /* y step */
            } while (dy < dx);               /* gradient negates -> algorithm fails */
    }
    plotLineAA(x0,y0, x2,y2);                  /* plot remaining needle to end */
}

function plotQuadRationalBezierAA(x0, y0, x1, y1, x2, y2, w)
{                    /* plot any anti-aliased quadratic rational Bezier curve */
    var x = x0-2*x1+x2, y = y0-2*y1+y2;
    var xx = x0-x1, yy = y0-y1, ww, t, q;

    assert(w >= 0.0);

    if (xx*(x2-x1) > 0) {                             /* horizontal cut at P4? */
            if (yy*(y2-y1) > 0)                          /* vertical cut at P6 too? */
                if (Math.abs(xx*y) > Math.abs(yy*x)) {               /* which first? */
                        x0 = x2; x2 = xx+x1; y0 = y2; y2 = yy+y1;          /* swap points */
                }                            /* now horizontal cut at P4 comes first */
            if (x0 == x2 || w == 1.0) t = (x0-x1)/x;
            else {                                 /* non-rational or rational case */
                q = Math.sqrt(4.0*w*w*(x0-x1)*(x2-x1)+(x2-x0)*(x2-x0));
                if (x1 < x0) q = -q;
                t = (2.0*w*(x0-x1)-x0+x2+q)/(2.0*(1.0-w)*(x2-x0));        /* t at P4 */
            }
            q = 1.0/(2.0*t*(1.0-t)*(w-1.0)+1.0);                 /* sub-divide at t */
            xx = (t*t*(x0-2.0*w*x1+x2)+2.0*t*(w*x1-x0)+x0)*q;               /* = P4 */
            yy = (t*t*(y0-2.0*w*y1+y2)+2.0*t*(w*y1-y0)+y0)*q;
            ww = t*(w-1.0)+1.0; ww *= ww*q;                    /* squared weight P3 */
            w = ((1.0-t)*(w-1.0)+1.0)*Math.sqrt(q);                    /* weight P8 */
            x = Math.floor(xx+0.5); y = Math.floor(yy+0.5);                   /* P4 */
            yy = (xx-x0)*(y1-y0)/(x1-x0)+y0;                /* intersect P3 | P0 P1 */
            plotQuadRationalBezierSegAA(x0,y0, x,Math.floor(yy+0.5), x,y, ww);
            yy = (xx-x2)*(y1-y2)/(x1-x2)+y2;                /* intersect P4 | P1 P2 */
            y1 = Math.floor(yy+0.5); x0 = x1 = x; y0 = y;       /* P0 = P4, P1 = P8 */
    }
    if ((y0-y1)*(y2-y1) > 0) {                          /* vertical cut at P6? */
            if (y0 == y2 || w == 1.0) t = (y0-y1)/(y0-2.0*y1+y2);
            else {                                 /* non-rational or rational case */
                q = Math.sqrt(4.0*w*w*(y0-y1)*(y2-y1)+(y2-y0)*(y2-y0));
                if (y1 < y0) q = -q;
                t = (2.0*w*(y0-y1)-y0+y2+q)/(2.0*(1.0-w)*(y2-y0));        /* t at P6 */
            }
            q = 1.0/(2.0*t*(1.0-t)*(w-1.0)+1.0);                 /* sub-divide at t */
            xx = (t*t*(x0-2.0*w*x1+x2)+2.0*t*(w*x1-x0)+x0)*q;               /* = P6 */
            yy = (t*t*(y0-2.0*w*y1+y2)+2.0*t*(w*y1-y0)+y0)*q;
            ww = t*(w-1.0)+1.0; ww *= ww*q;                    /* squared weight P5 */
            w = ((1.0-t)*(w-1.0)+1.0)*Math.sqrt(q);                    /* weight P7 */
            x = Math.floor(xx+0.5); y = Math.floor(yy+0.5);                   /* P6 */
            xx = (x1-x0)*(yy-y0)/(y1-y0)+x0;                /* intersect P6 | P0 P1 */
            plotQuadRationalBezierSegAA(x0,y0, Math.floor(xx+0.5),y, x,y, ww);
            xx = (x1-x2)*(yy-y2)/(y1-y2)+x2;                /* intersect P7 | P1 P2 */
            x1 = Math.floor(xx+0.5); x0 = x; y0 = y1 = y;       /* P0 = P6, P1 = P7 */
    }
    plotQuadRationalBezierSegAA(x0,y0, x1,y1, x2,y2, w*w);   /* remaining part */
}

function plotRotatedEllipseAA(x, y, a, b, angle)
{                                   /* plot ellipse rotated by angle (radian) */
    var xd = a*a, yd = b*b;
    var s = Math.sin(angle), zd = (xd-yd)*s;               /* ellipse rotation */
    xd = Math.sqrt(xd-zd*s), yd = Math.sqrt(yd+zd*s);       /* surrounding rect*/
    a = Math.floor(xd+0.5); b = Math.floor(yd+0.5); zd = zd*a*b/(xd*yd);
    plotRotatedEllipseRectAA(x-a,y-b, x+a,y+b, (4*zd*Math.cos(angle)));
}

function plotRotatedEllipseRectAA(x0, y0, x1, y1, zd)
{                  /* rectangle enclosing the ellipse, integer rotation angle */
    var xd = x1-x0, yd = y1-y0, w = xd*yd;
    if (w != 0.0) w = (w-zd)/(w+w);                    /* squared weight of P1 */
    assert(w <= 1.0 && w >= 0.0);                /* limit angle to |zd|<=xd*yd */
    xd = Math.floor(xd*w+0.5); yd = Math.floor(yd*w+0.5);       /* snap to int */
    plotQuadRationalBezierSegAA(x0,y0+yd, x0,y0, x0+xd,y0, 1.0-w);
    plotQuadRationalBezierSegAA(x0,y0+yd, x0,y1, x1-xd,y1, w);
    plotQuadRationalBezierSegAA(x1,y1-yd, x1,y1, x1-xd,y1, 1.0-w);
    plotQuadRationalBezierSegAA(x1,y1-yd, x1,y0, x0+xd,y0, w);
}

function plotCubicBezierSegAA(x0, y0, x1, y1, x2, y2, x3, y3)
{                           /* plot limited anti-aliased cubic Bezier segment */
    var f, fx, fy, leg = 1;
    var sx = x0 < x3 ? 1 : -1, sy = y0 < y3 ? 1 : -1;        /* step direction */
    var xc = -Math.abs(x0+x1-x2-x3), xa = xc-4*sx*(x1-x2), xb = sx*(x0-x1-x2+x3);
    var yc = -Math.abs(y0+y1-y2-y3), ya = yc-4*sy*(y1-y2), yb = sy*(y0-y1-y2+y3);
    var ab, ac, bc, ba, xx, xy, yy, dx, dy, ex, px, py, ed, ip, EP = 0.01;
                                                                                                /* check for curve restrains */
    /* slope P0-P1 == P2-P3    and  (P0-P3 == P1-P2      or   no slope change) */
    assert((x1-x0)*(x2-x3) < EP && ((x3-x0)*(x1-x2) < EP || xb*xb < xa*xc+EP));
    assert((y1-y0)*(y2-y3) < EP && ((y3-y0)*(y1-y2) < EP || yb*yb < ya*yc+EP));

    if (xa == 0 && ya == 0)                                /* quadratic Bezier */
            return plotQuadBezierSegAA(x0,y0, (3*x1-x0)>>1,(3*y1-y0)>>1, x3,y3);
    x1 = (x1-x0)*(x1-x0)+(y1-y0)*(y1-y0)+1;                    /* line lengths */
    x2 = (x2-x3)*(x2-x3)+(y2-y3)*(y2-y3)+1;
exit:   
    do {                                                /* loop over both ends */
            ab = xa*yb-xb*ya; ac = xa*yc-xc*ya; bc = xb*yc-xc*yb;
            ip = 4*ab*bc-ac*ac;                   /* self intersection loop at all? */
            ex = ab*(ab+ac-3*bc)+ac*ac;       /* P0 part of self-intersection loop? */
            f = ex > 0 ? 1 : Math.floor(Math.sqrt(1+1024/x1));   /* calc resolution */
            ab *= f; ac *= f; bc *= f; ex *= f*f;            /* increase resolution */
            xy = 9*(ab+ac+bc)/8; ba = 8*(xa-ya);  /* init differences of 1st degree */
            dx = 27*(8*ab*(yb*yb-ya*yc)+ex*(ya+2*yb+yc))/64-ya*ya*(xy-ya);
            dy = 27*(8*ab*(xb*xb-xa*xc)-ex*(xa+2*xb+xc))/64-xa*xa*(xy+xa);
                                                                                        /* init differences of 2nd degree */
            xx = 3*(3*ab*(3*yb*yb-ya*ya-2*ya*yc)-ya*(3*ac*(ya+yb)+ya*ba))/4;
            yy = 3*(3*ab*(3*xb*xb-xa*xa-2*xa*xc)-xa*(3*ac*(xa+xb)+xa*ba))/4;
            xy = xa*ya*(6*ab+6*ac-3*bc+ba); ac = ya*ya; ba = xa*xa;
            xy = 3*(xy+9*f*(ba*yb*yc-xb*xc*ac)-18*xb*yb*ab)/8;

            if (ex < 0) {         /* negate values if inside self-intersection loop */
                dx = -dx; dy = -dy; xx = -xx; yy = -yy; xy = -xy; ac = -ac; ba = -ba;
            }                                     /* init differences of 3rd degree */
            ab = 6*ya*ac; ac = -6*xa*ac; bc = 6*ya*ba; ba = -6*xa*ba;
            dx += xy; ex = dx+dy; dy += xy;                    /* error of 1st step */
 loop:
        for (fx = fy = f; ; ) {
            if (x0 == x3 || y0 == y3) break exit;
                y1 = Math.min(Math.abs(xy-dx),Math.abs(dy-xy));
                ed = Math.max(Math.abs(xy-dx),Math.abs(dy-xy));   /* approximate err */
                ed = f*(ed+2*ed*y1*y1/(4*ed*ed+y1*y1));
                y1 = 255*Math.abs(ex-(f-fx+1)*dx-(f-fy+1)*dy+f*xy)/ed;
                if (y1 < 256) setPixelAA(x0, y0, y1);                  /* plot curve */
                px = Math.abs(ex-(f-fx+1)*dx+(fy-1)*dy);   /* pixel varensity x move */
                py = Math.abs(ex+(fx-1)*dx-(f-fy+1)*dy);   /* pixel varensity y move */
                y2 = y0;
                do {                                  /* move sub-steps of one pixel */
                        if (ip >= -EP)               /* intersection possible? -> check.. */
                            if (dx+xx > xy || dy+yy < xy) break loop;  /* two x or y steps */
                        y1 = 2*ex+dx;                    /* save value for test of y step */
                        if (2*ex+dy > 0) {                                  /* x sub-step */
                            fx--; ex += dx += xx; dy += xy += ac; yy += bc; xx += ab;
                        } else if (y1 > 0) break loop;                /* tiny nearly cusp */
                        if (y1 <= 0) {                                      /* y sub-step */
                            fy--; ex += dy += yy; dx += xy += bc; xx += ac; yy += ba;
                        }
                } while (fx > 0 && fy > 0);                       /* pixel complete? */
                if (2*fy <= f) {                           /* x+ anti-aliasing pixel */
                        if (py < ed) setPixelAA(x0+sx, y0, 255*py/ed);      /* plot curve */
                        y0 += sy; fy += f;                                      /* y step */
                }
                if (2*fx <= f) {                           /* y+ anti-aliasing pixel */
                        if (px < ed) setPixelAA(x0, y2+sy, 255*px/ed);      /* plot curve */
                        x0 += sx; fx += f;                                      /* x step */
                }
            }
            if (2*ex < dy && 2*fy <= f+2) {         /* round x+ approximation pixel */
                if (py < ed) setPixelAA(x0+sx, y0, 255*py/ed);         /* plot curve */
                y0 += sy;
            }
            if (2*ex > dx && 2*fx <= f+2) {         /* round y+ approximation pixel */
                if (px < ed) setPixelAA(x0, y2+sy, 255*px/ed);         /* plot curve */
                x0 += sx;
            }
            xx = x0; x0 = x3; x3 = xx; sx = -sx; xb = -xb;             /* swap legs */
            yy = y0; y0 = y3; y3 = yy; sy = -sy; yb = -yb; x1 = x2;
    } while (leg--);                                          /* try other end */
    plotLineAA(x0,y0, x3,y3);     /* remaining part in case of cusp or crunode */
}

function plotCubicBezierAA(x0, y0, x1, y1, x2, y2, x3, y3)
{                                              /* plot any cubic Bezier curve */
    var n = 0, i = 0;
    var xc = x0+x1-x2-x3, xa = xc-4*(x1-x2);
    var xb = x0-x1-x2+x3, xd = xb+4*(x1+x2);
    var yc = y0+y1-y2-y3, ya = yc-4*(y1-y2);
    var yb = y0-y1-y2+y3, yd = yb+4*(y1+y2);
    var fx0 = x0, fx1, fx2, fx3, fy0 = y0, fy1, fy2, fy3;
    var t1 = xb*xb-xa*xc, t2, t = new Array(5);
                                                                /* sub-divide curve at gradient sign changes */
    if (xa == 0) {                                               /* horizontal */
            if (Math.abs(xc) < 2*Math.abs(xb)) t[n++] = xc/(2.0*xb);  /* one change */
    } else if (t1 > 0.0) {                                      /* two changes */
            t2 = Math.sqrt(t1);
            t1 = (xb-t2)/xa; if (Math.abs(t1) < 1.0) t[n++] = t1;
            t1 = (xb+t2)/xa; if (Math.abs(t1) < 1.0) t[n++] = t1;
    }
    t1 = yb*yb-ya*yc;
    if (ya == 0) {                                                 /* vertical */
            if (Math.abs(yc) < 2*Math.abs(yb)) t[n++] = yc/(2.0*yb);  /* one change */
    } else if (t1 > 0.0) {                                      /* two changes */
            t2 = Math.sqrt(t1);
            t1 = (yb-t2)/ya; if (Math.abs(t1) < 1.0) t[n++] = t1;
            t1 = (yb+t2)/ya; if (Math.abs(t1) < 1.0) t[n++] = t1;
    }
    for (i = 1; i < n; i++)                         /* bubble sort of 4 points */
            if ((t1 = t[i-1]) > t[i]) { t[i-1] = t[i]; t[i] = t1; i = 0; }

    t1 = -1.0; t[n] = 1.0;                                /* begin / end point */
    for (i = 0; i <= n; i++) {                 /* plot each segment separately */
            t2 = t[i];                                /* sub-divide at t[i-1], t[i] */
            fx1 = (t1*(t1*xb-2*xc)-t2*(t1*(t1*xa-2*xb)+xc)+xd)/8-fx0;
            fy1 = (t1*(t1*yb-2*yc)-t2*(t1*(t1*ya-2*yb)+yc)+yd)/8-fy0;
            fx2 = (t2*(t2*xb-2*xc)-t1*(t2*(t2*xa-2*xb)+xc)+xd)/8-fx0;
            fy2 = (t2*(t2*yb-2*yc)-t1*(t2*(t2*ya-2*yb)+yc)+yd)/8-fy0;
            fx0 -= fx3 = (t2*(t2*(3*xb-t2*xa)-3*xc)+xd)/8;
            fy0 -= fy3 = (t2*(t2*(3*yb-t2*ya)-3*yc)+yd)/8;
            x3 = Math.floor(fx3+0.5); y3 = Math.floor(fy3+0.5);     /* scale bounds */
            if (fx0 != 0.0) { fx1 *= fx0 = (x0-x3)/fx0; fx2 *= fx0; }
            if (fy0 != 0.0) { fy1 *= fy0 = (y0-y3)/fy0; fy2 *= fy0; }
            if (x0 != x3 || y0 != y3)                            /* segment t1 - t2 */
                plotCubicBezierSegAA(x0,y0, x0+fx1,y0+fy1, x0+fx2,y0+fy2, x3,y3);
            x0 = x3; y0 = y3; fx0 = fx3; fy0 = fy3; t1 = t2;
    }
}

function plotLineWidth(x0, y0, x1, y1, th)
{                              /* plot an anti-aliased line of width th pixel */
    var dx = Math.abs(x1-x0), sx = x0 < x1 ? 1 : -1; 
    var dy = Math.abs(y1-y0), sy = y0 < y1 ? 1 : -1; 
    var err, e2 = Math.sqrt(dx*dx+dy*dy);                            /* length */

    if (th <= 1 || e2 == 0) return plotLineAA(x0,y0, x1,y1);         /* assert */
    dx *= 255/e2; dy *= 255/e2; th = 255*(th-1);               /* scale values */

    if (dx < dy) {                                               /* steep line */
            x1 = Math.round((e2+th/2)/dy);                          /* start offset */
            err = x1*dy-th/2;                  /* shift error value to offset width */
            for (x0 -= x1*sx; ; y0 += sy) {
                setPixelAA(x1 = x0, y0, err);                  /* aliasing pre-pixel */
                for (e2 = dy-err-th; e2+dy < 255; e2 += dy)  
                        setPixel(x1 += sx, y0);                      /* pixel on the line */
                setPixelAA(x1+sx, y0, e2);                    /* aliasing post-pixel */
                if (y0 == y1) break;
                err += dx;                                                 /* y-step */
                if (err > 255) { err -= dy; x0 += sx; }                    /* x-step */ 
            }
    } else {                                                      /* flat line */
            y1 = Math.round((e2+th/2)/dx);                          /* start offset */
            err = y1*dx-th/2;                  /* shift error value to offset width */
            for (y0 -= y1*sy; ; x0 += sx) {
                setPixelAA(x0, y1 = y0, err);                  /* aliasing pre-pixel */
                for (e2 = dx-err-th; e2+dx < 255; e2 += dx) 
                        setPixel(x0, y1 += sy);                      /* pixel on the line */
                setPixelAA(x0, y1+sy, e2);                    /* aliasing post-pixel */
                if (x0 == x1) break;
                err += dy;                                                 /* x-step */ 
                if (err > 255) { err -= dx; y0 += sy; }                    /* y-step */
            } 
    }
}

function plotEllipseRectWidth(x0, y0, x1, y1, th)
{               /* draw anti-aliased ellipse inside rectangle with thick line */
    var a = Math.abs(x1-x0), b = Math.abs(y1-y0), b1 = b&1;  /* outer diameter */
    var a2 = a-2*th, b2 = b-2*th;                            /* inner diameter */
    var dx = 4*(a-1)*b*b, dy = 4*(b1-1)*a*a;                /* error increment */
    var i = a+b2, err = b1*a*a, dx2, dy2, e2, ed; 
                                                                                                        /* thick line correction */
    if (th < 1.5) return plotEllipseRectAA(x0,y0, x1,y1);
    if ((th-1)*(2*b-th) > a*a) b2 = Math.sqrt(a*(b-a)*i*a2)/(a-th);       
    if ((th-1)*(2*a-th) > b*b) { a2 = Math.sqrt(b*(a-b)*i*b2)/(b-th); th = (a-a2)/2; }
    if (a == 0 || b == 0) return plotLine(x0,y0, x1,y1);
    if (x0 > x1) { x0 = x1; x1 += a; }        /* if called with swapped points */
    if (y0 > y1) y0 = y1;                                  /* .. exchange them */
    if (b2 <= 0) th = a;                                     /* filled ellipse */
    e2 = th-Math.floor(th); th = x0+th-e2;
    dx2 = 4*(a2+2*e2-1)*b2*b2; dy2 = 4*(b1-1)*a2*a2; e2 = dx2*e2;
    y0 += (b+1)>>1; y1 = y0-b1;                              /* starting pixel */
    a = 8*a*a; b1 = 8*b*b; a2 = 8*a2*a2; b2 = 8*b2*b2;
    
    do {          
            for (;;) {                           
                if (err < 0 || x0 > x1) { i = x0; break; }
                i = Math.min(dx,dy); ed = Math.max(dx,dy);
                if (y0 == y1+1 && 2*err > dx && a > b1) ed = a/4;           /* x-tip */
                else ed += 2*ed*i*i/(4*ed*ed+i*i+1)+1;/* approx ed=sqrt(dx*dx+dy*dy) */
                i = 255*err/ed;                             /* outside anti-aliasing */
                setPixelAA(x0,y0, i); setPixelAA(x0,y1, i);
                setPixelAA(x1,y0, i); setPixelAA(x1,y1, i);
                if (err+dy+a < dx) { i = x0+1; break; }
                x0++; x1--; err -= dx; dx -= b1;                /* x error increment */
            }
            for (; i < th && 2*i <= x0+x1; i++) {                /* fill line pixel */
                setPixel(i,y0); setPixel(x0+x1-i,y0); 
                setPixel(i,y1); setPixel(x0+x1-i,y1);
            }    
            while (e2 > 0 && x0+x1 >= 2*th) {               /* inside anti-aliasing */
                i = Math.min(dx2,dy2); ed = Math.max(dx2,dy2);
                if (y0 == y1+1 && 2*e2 > dx2 && a2 > b2) ed = a2/4;         /* x-tip */
                else  ed += 2*ed*i*i/(4*ed*ed+i*i);                 /* approximation */
                i = 255-255*e2/ed;             /* get intensity value by pixel error */
                setPixelAA(th,y0, i); setPixelAA(x0+x1-th,y0, i);
                setPixelAA(th,y1, i); setPixelAA(x0+x1-th,y1, i);
                if (e2+dy2+a2 < dx2) break; 
                th++; e2 -= dx2; dx2 -= b2;                     /* x error increment */
            }
            e2 += dy2 += a2;
            y0++; y1--; err += dy += a;                                   /* y step */
    } while (x0 < x1);
    
    if (y0-y1 <= b)             
    {
            if (err > dy+a) { y0--; y1++; err -= dy -= a; }
            for (; y0-y1 <= b; err += dy += a) { /* too early stop of flat ellipses */
                i = 255*4*err/b1;                        /* -> finish tip of ellipse */
                setPixelAA(x0,y0, i); setPixelAA(x1,y0++, i);
                setPixelAA(x0,y1, i); setPixelAA(x1,y1--, i);
            }
    }
}

function plotQuadRationalBezierWidthSeg(x0, y0, x1, y1, x2, y2, w, th)
{   /* plot a limited rational Bezier segment of thickness th, squared weight */
    var sx = x2-x1, sy = y2-y1;                  /* relative values for checks */
    var dx = x0-x2, dy = y0-y2, xx = x0-x1, yy = y0-y1;
    var xy = xx*sy+yy*sx, cur = xx*sy-yy*sx, err, e2, ed;         /* curvature */

    assert(xx*sx <= 0.0 && yy*sy <= 0.0);  /* sign of gradient must not change */

    if (cur != 0.0 && w > 0.0) {                           /* no straight line */
            if (sx*sx+sy*sy > xx*xx+yy*yy) {              /* begin with longer part */
                x2 = x0; x0 -= dx; y2 = y0; y0 -= dy; cur = -cur;      /* swap P0 P2 */
            }
            xx = 2.0*(4.0*w*sx*xx+dx*dx);                 /* differences 2nd degree */
            yy = 2.0*(4.0*w*sy*yy+dy*dy);
            sx = x0 < x2 ? 1 : -1;                              /* x step direction */
            sy = y0 < y2 ? 1 : -1;                              /* y step direction */
            xy = -2.0*sx*sy*(2.0*w*xy+dx*dy);

            if (cur*sx*sy < 0) {                              /* negated curvature? */
                xx = -xx; yy = -yy; cur = -cur; xy = -xy;
            }
            dx = 4.0*w*(x1-x0)*sy*cur+xx/2.0;             /* differences 1st degree */
            dy = 4.0*w*(y0-y1)*sx*cur+yy/2.0;

            if (w < 0.5 && (dx+xx <= 0 || dy+yy >= 0)) {/* flat ellipse, algo fails */
                cur = (w+1.0)/2.0; w = fsqrt(w); xy = 1.0/(w+1.0);
                sx = Math.floor((x0+2.0*w*x1+x2)*xy/2.0+0.5);    /* subdivide curve  */
                sy = Math.floor((y0+2.0*w*y1+y2)*xy/2.0+0.5);     /* plot separately */
                dx = Math.floor((w*x1+x0)*xy+0.5); dy = Math.floor((y1*w+y0)*xy+0.5);
                plotQuadRationalBezierWidthSeg(x0,y0, dx,dy, sx,sy, cur, th);
                dx = Math.floor((w*x1+x2)*xy+0.5); dy = Math.floor((y1*w+y2)*xy+0.5);
                return plotQuadRationalBezierWidthSeg(sx,sy, dx,dy, x2,y2, cur, th);
            }
            fail:
            for (err = 0; dy+2*yy < 0 && dx+2*xx > 0; ) /* loop of steep/flat curve */
                if (dx+dy+xy < 0) {                                   /* steep curve */
                        do {
                            ed = -dy-2*dy*dx*dx/(4.*dy*dy+dx*dx);      /* approximate sqrt */
                            w = (th-1)*ed;                             /* scale line width */
                            x1 = Math.floor((err-ed-w/2)/dy);              /* start offset */
                            e2 = err-x1*dy-w/2;                   /* error value at offset */
                            x1 = x0-x1*sx;                                  /* start point */
                            setPixelAA(x1, y0, 255*e2/ed);           /* aliasing pre-pixel */
                            for (e2 = -w-dy-e2; e2-dy < ed; e2 -= dy)
                                    setPixel(x1 += sx, y0);              /* pixel on thick line */
                            setPixelAA(x1+sx, y0, 255*e2/ed);       /* aliasing post-pixel */
                            if (y0 == y2) return;          /* last pixel -> curve finished */
                            y0 += sy; dy += xy; err += dx; dx += xx;             /* y step */
                            if (2*err+dy > 0) {                            /* e_x+e_xy > 0 */
                                    x0 += sx; dx += xy; err += dy; dy += yy;          /* x step */
                            }
                            if (x0 != x2 && (dx+2*xx <= 0 || dy+2*yy >= 0))
                                    if (Math.abs(y2-y0) > Math.abs(x2-x0)) break fail;
                                    else break;                             /* other curve near */
                        } while (dx+dy+xy < 0);                  /* gradient still steep? */
                                                                                    /* change from steep to flat curve */
                        for (cur = err-dy-w/2, y1 = y0; cur < ed; y1 += sy, cur += dx) {
                            for (e2 = cur, x1 = x0; e2-dy < ed; e2 -= dy)
                                    setPixel(x1 -= sx, y1);              /* pixel on thick line */
                            setPixelAA(x1-sx, y1, 255*e2/ed);       /* aliasing post-pixel */
                        }
                } else {                                               /* flat curve */
                        do {
                            ed = dx+2*dx*dy*dy/(4.*dx*dx+dy*dy);       /* approximate sqrt */
                            w = (th-1)*ed;                             /* scale line width */
                            y1 = Math.floor((err+ed+w/2)/dx);              /* start offset */
                            e2 = y1*dx-w/2-err;                   /* error value at offset */
                            y1 = y0-y1*sy;                                  /* start point */
                            setPixelAA(x0, y1, 255*e2/ed);           /* aliasing pre-pixel */
                            for (e2 = dx-e2-w; e2+dx < ed; e2 += dx)
                                    setPixel(x0, y1 += sy);              /* pixel on thick line */
                            setPixelAA(x0, y1+sy, 255*e2/ed);       /* aliasing post-pixel */
                            if (x0 == x2) return;          /* last pixel -> curve finished */
                            x0 += sx; dx += xy; err += dy; dy += yy;             /* x step */
                            if (2*err+dx < 0)  {                           /* e_y+e_xy < 0 */
                                    y0 += sy; dy += xy; err += dx; dx += xx;          /* y step */
                            }
                            if (y0 != y2 && (dx+2*xx <= 0 || dy+2*yy >= 0))
                                    if (Math.abs(y2-y0) <= Math.abs(x2-x0)) break fail;  
                                    else break;                             /* other curve near */
                        } while (dx+dy+xy >= 0);                  /* gradient still flat? */
                                                                                    /* change from flat to steep curve */ 
                        for (cur = -err+dx-w/2, x1 = x0; cur < ed; x1 += sx, cur -= dy) {
                            for (e2 = cur, y1 = y0; e2+dx < ed; e2 += dx)
                                    setPixel(x1, y1 -= sy);              /* pixel on thick line */
                            setPixelAA(x1, y1-sy, 255*e2/ed);       /* aliasing post-pixel */
                        }
                }
            }
    plotLineWidth(x0,y0, x2,y2, th);            /* confusing error values  */
}

function plotQuadRationalBezierWidth(x0, y0, x1, y1, x2, y2, w, th)
{                    /* plot any anti-aliased quadratic rational Bezier curve */
    var x = x0-2*x1+x2, y = y0-2*y1+y2;
    var xx = x0-x1, yy = y0-y1, ww, t, q;

    assert(w >= 0.0);

    if (xx*(x2-x1) > 0) {                             /* horizontal cut at P4? */
            if (yy*(y2-y1) > 0)                          /* vertical cut at P6 too? */
                if (Math.abs(xx*y) > Math.abs(yy*x)) {               /* which first? */
                        x0 = x2; x2 = xx+x1; y0 = y2; y2 = yy+y1;          /* swap points */
                }                            /* now horizontal cut at P4 comes first */
            if (x0 == x2 || w == 1.0) t = (x0-x1)/x;
            else {                                 /* non-rational or rational case */
                q = Math.sqrt(4.0*w*w*(x0-x1)*(x2-x1)+(x2-x0)*(x2-x0));
                if (x1 < x0) q = -q;
                t = (2.0*w*(x0-x1)-x0+x2+q)/(2.0*(1.0-w)*(x2-x0));        /* t at P4 */
            }
            q = 1.0/(2.0*t*(1.0-t)*(w-1.0)+1.0);                 /* sub-divide at t */
            xx = (t*t*(x0-2.0*w*x1+x2)+2.0*t*(w*x1-x0)+x0)*q;               /* = P4 */
            yy = (t*t*(y0-2.0*w*y1+y2)+2.0*t*(w*y1-y0)+y0)*q;
            ww = t*(w-1.0)+1.0; ww *= ww*q;                    /* squared weight P3 */
            w = ((1.0-t)*(w-1.0)+1.0)*Math.sqrt(q);                    /* weight P8 */
            x = Math.floor(xx+0.5); y = Math.floor(yy+0.5);                   /* P4 */
            yy = (xx-x0)*(y1-y0)/(x1-x0)+y0;                /* intersect P3 | P0 P1 */
            plotQuadRationalBezierWidthSeg(x0,y0, x,Math.floor(yy+0.5), x,y, ww, th);
            yy = (xx-x2)*(y1-y2)/(x1-x2)+y2;                /* intersect P4 | P1 P2 */
            y1 = Math.floor(yy+0.5); x0 = x1 = x; y0 = y;       /* P0 = P4, P1 = P8 */
    }
    if ((y0-y1)*(y2-y1) > 0) {                          /* vertical cut at P6? */
            if (y0 == y2 || w == 1.0) t = (y0-y1)/(y0-2.0*y1+y2);
            else {                                 /* non-rational or rational case */
                q = Math.sqrt(4.0*w*w*(y0-y1)*(y2-y1)+(y2-y0)*(y2-y0));
                if (y1 < y0) q = -q;
                t = (2.0*w*(y0-y1)-y0+y2+q)/(2.0*(1.0-w)*(y2-y0));        /* t at P6 */
            }
            q = 1.0/(2.0*t*(1.0-t)*(w-1.0)+1.0);                 /* sub-divide at t */
            xx = (t*t*(x0-2.0*w*x1+x2)+2.0*t*(w*x1-x0)+x0)*q;               /* = P6 */
            yy = (t*t*(y0-2.0*w*y1+y2)+2.0*t*(w*y1-y0)+y0)*q;
            ww = t*(w-1.0)+1.0; ww *= ww*q;                    /* squared weight P5 */
            w = ((1.0-t)*(w-1.0)+1.0)*Math.sqrt(q);                    /* weight P7 */
            x = Math.floor(xx+0.5); y = Math.floor(yy+0.5);                   /* P6 */
            xx = (x1-x0)*(yy-y0)/(y1-y0)+x0;                /* intersect P6 | P0 P1 */
            plotQuadRationalBezierWidthSeg(x0,y0, Math.floor(xx+0.5),y, x,y, ww, th);
            xx = (x1-x2)*(yy-y2)/(y1-y2)+x2;                /* intersect P7 | P1 P2 */
            x1 = Math.floor(xx+0.5); x0 = x; y0 = y1 = y;       /* P0 = P6, P1 = P7 */
    }
    plotQuadRationalBezierWidthSeg(x0,y0, x1,y1, x2,y2, w*w, th);  
}

function plotRotatedEllipseWidth(x, y, a, b, angle, th)
{                                   /* plot ellipse rotated by angle (radian) */
    var xd = a*a, yd = b*b;
    var s = Math.sin(angle), zd = (xd-yd)*s;               /* ellipse rotation */
    xd = Math.sqrt(xd-zd*s), yd = Math.sqrt(yd+zd*s);       /* surrounding rect*/
    a = Math.floor(xd+0.5); b = Math.floor(yd+0.5); zd = zd*a*b/(xd*yd);
    plotRotatedEllipseRectWidth(x-a,y-b, x+a,y+b, (4*zd*Math.cos(angle)), th);
}

function plotRotatedEllipseRectWidth(x0, y0, x1, y1, zd, th)
{                  /* rectangle enclosing the ellipse, integer rotation angle */
    var xd = x1-x0, yd = y1-y0, w = xd*yd;
    if (w != 0.0) w = (w-zd)/(w+w);                    /* squared weight of P1 */
    assert(w <= 1.0 && w >= 0.0);                /* limit angle to |zd|<=xd*yd */
    xd = Math.floor(xd*w+0.5); yd = Math.floor(yd*w+0.5);       /* snap to int */
    plotQuadRationalBezierWidthSeg(x0,y0+yd, x0,y0, x0+xd,y0, 1.0-w, th);
    plotQuadRationalBezierWidthSeg(x0,y0+yd, x0,y1, x1-xd,y1, w, th);
    plotQuadRationalBezierWidthSeg(x1,y1-yd, x1,y1, x1-xd,y1, 1.0-w, th);
    plotQuadRationalBezierWidthSeg(x1,y1-yd, x1,y0, x0+xd,y0, w, th);
}

function plotCubicBezierWidth(x0, y0, x1, y1, x2, y2, x3, y3, th)
{                                              /* plot any cubic Bezier curve */
    var n = 0, i = 0;
    var xc = x0+x1-x2-x3, xa = xc-4*(x1-x2);
    var xb = x0-x1-x2+x3, xd = xb+4*(x1+x2);
    var yc = y0+y1-y2-y3, ya = yc-4*(y1-y2);
    var yb = y0-y1-y2+y3, yd = yb+4*(y1+y2);
    var fx0 = x0, fx1, fx2, fx3, fy0 = y0, fy1, fy2, fy3;
    var t1 = xb*xb-xa*xc, t2, t = new Array(7);
                                                                /* sub-divide curve at gradient sign changes */
    if (xa == 0) {                                               /* horizontal */
            if (Math.abs(xc) < 2*Math.abs(xb)) t[n++] = xc/(2.0*xb);  /* one change */
    } else if (t1 > 0.0) {                                      /* two changes */
            t2 = Math.sqrt(t1);
            t1 = (xb-t2)/xa; if (Math.abs(t1) < 1.0) t[n++] = t1;
            t1 = (xb+t2)/xa; if (Math.abs(t1) < 1.0) t[n++] = t1;
    }
    t1 = yb*yb-ya*yc;
    if (ya == 0) {                                                 /* vertical */
            if (Math.abs(yc) < 2*Math.abs(yb)) t[n++] = yc/(2.0*yb);  /* one change */
    } else if (t1 > 0.0) {                                      /* two changes */
            t2 = Math.sqrt(t1);
            t1 = (yb-t2)/ya; if (Math.abs(t1) < 1.0) t[n++] = t1;
            t1 = (yb+t2)/ya; if (Math.abs(t1) < 1.0) t[n++] = t1;
    }
    t1 = 2*(xa*yb-xb*ya); t2 = xa*yc-xc*ya;      /* divide at inflection point */
    i = t2*t2-2*t1*(xb*yc-xc*yb);
    if (i > 0) {
            i = Math.sqrt(i);
            t[n] = (t2+i)/t1; if (Math.abs(t[n]) < 1.0) n++;
            t[n] = (t2-i)/t1; if (Math.abs(t[n]) < 1.0) n++;
    }
    for (i = 1; i < n; i++)                         /* bubble sort of 4 points */
            if ((t1 = t[i-1]) > t[i]) { t[i-1] = t[i]; t[i] = t1; i = 0; }

    t1 = -1.0; t[n] = 1.0;                               /* begin / end points */
    for (i = 0; i <= n; i++) {                 /* plot each segment separately */
            t2 = t[i];                                /* sub-divide at t[i-1], t[i] */
            fx1 = (t1*(t1*xb-2*xc)-t2*(t1*(t1*xa-2*xb)+xc)+xd)/8-fx0;
            fy1 = (t1*(t1*yb-2*yc)-t2*(t1*(t1*ya-2*yb)+yc)+yd)/8-fy0;
            fx2 = (t2*(t2*xb-2*xc)-t1*(t2*(t2*xa-2*xb)+xc)+xd)/8-fx0;
            fy2 = (t2*(t2*yb-2*yc)-t1*(t2*(t2*ya-2*yb)+yc)+yd)/8-fy0;
            fx0 -= fx3 = (t2*(t2*(3*xb-t2*xa)-3*xc)+xd)/8;
            fy0 -= fy3 = (t2*(t2*(3*yb-t2*ya)-3*yc)+yd)/8;
            x3 = Math.floor(fx3+0.5); y3 = Math.floor(fy3+0.5);     /* scale bounds */
            if (fx0 != 0.0) { fx1 *= fx0 = (x0-x3)/fx0; fx2 *= fx0; }
            if (fy0 != 0.0) { fy1 *= fy0 = (y0-y3)/fy0; fy2 *= fy0; }
            if (x0 != x3 || y0 != y3)                            /* segment t1 - t2 */
                plotCubicBezierSegWidth(x0,y0, x0+fx1,y0+fy1, x0+fx2,y0+fy2, x3,y3, th);
            x0 = x3; y0 = y3; fx0 = fx3; fy0 = fy3; t1 = t2;
    }
}

function plotCubicBezierSegWidth(x0,y0, x1,y1, x2,y2, x3,y3, th)
{                     /* split cubic Bezier segment in two quadratic segments */
    var x = Math.floor((x0+3*x1+3*x2+x3+4)/8), 
            y = Math.floor((y0+3*y1+3*y2+y3+4)/8);
    plotQuadRationalBezierWidthSeg(x0,y0, 
            Math.floor((x0+3*x1+2)/4),Math.floor((y0+3*y1+2)/4), x,y, 1,th);
    plotQuadRationalBezierWidthSeg(x,y, 
            Math.floor((3*x2+x3+2)/4),Math.floor((3*y2+y3+2)/4), x3,y3, 1,th);
}   