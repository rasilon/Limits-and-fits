var limits = [
//                                                                      a    b    c   d   e   f   g   h   m    n    p    r    s    t     u  v  x  y  z
    { "lower_limit": 0,    "upper_limit": 3,    "limits": [undefined, 0.8, 1.2, 2.0,  3,  4,  6, 10, 14, 25,  40,  60, 100, 140, 250,  400,  600, 1000, 1400] },
    { "lower_limit": 3,    "upper_limit": 6,    "limits": [undefined, 1.0, 1.5, 2.5,  4,  5,  8, 12, 18, 30,  48,  75, 120, 180, 300,  480,  750, 1200, 1800] },
    { "lower_limit": 6,    "upper_limit": 10,   "limits": [undefined, 1.0, 1.5, 2.5,  4,  6,  9, 15, 22, 36,  58,  90, 150, 220, 360,  580,  900, 1500, 2200] },
    { "lower_limit": 10,   "upper_limit": 18,   "limits": [undefined, 1.2, 2.0, 3.0,  5,  8, 11, 18, 27, 43,  70, 110, 180, 270, 430,  700, 1100, 1800, 2700] },
    { "lower_limit": 18,   "upper_limit": 30,   "limits": [undefined, 1.5, 2.5, 4.0,  6,  9, 13, 21, 33, 52,  84, 130, 210, 330, 520,  840, 1300, 2100, 3300] },
    { "lower_limit": 30,   "upper_limit": 50,   "limits": [undefined, 1.5, 2.5, 4.0,  7, 11, 16, 25, 39, 62, 100, 160, 250, 390, 620, 1000, 1600, 2500, 3900] },
    { "lower_limit": 50,   "upper_limit": 80,   "limits": [undefined, 2.0, 3.0, 5.0,  8, 12, 19, 30, 46, 74, 120, 190, 300, 460, 740, 1200, 1900, 3000, 4600] },
    { "lower_limit": 80,   "upper_limit": 120,  "limits": [undefined, 2.5, 4.0, 6.0, 10, 15, 22, 35, 54, 87, 140, 220, 350, 540, 870, 1400, 2200, 2500, 5400] }
];

var fits_decode =    ["a", "b", "c", "d", "e", "f", "g", "h", "m", "n", "p", "r", "s", "t", "u", "v", "x", "y", "z"]; // Ignore the complex ones for now.

// Encoding direction here, rather than signing the offset, so we can special case the specials when we get round to them
//                      a   b   c   d   e   f   g   h   m    n  p  r  s  t  u  v  x  y  z
var fits_direction = [ -1, -1, -1, -1, -1, -1, -1, -1,  1,   1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // 1 = MMC, -1 = LMC, 0 = Special
var fits = [                                             //  a    b    c   d   e   f  g  h    m   n   p   r   s   t   u   v   x   y   z
    { "lower_limit": 0,    "upper_limit": 3,    "fits":  [ 270, 140,  60, 20, 14,  6, 2, 0,   2,  4,  6, 10, 14, 14, 18, 18, 20, 20, 26 ] },
    { "lower_limit": 3,    "upper_limit": 6,    "fits":  [ 270, 140,  70, 30, 20, 10, 4, 0,   4,  8, 12, 15, 19, 19, 23, 23, 28, 28, 35 ] },
    { "lower_limit": 6,    "upper_limit": 10,   "fits":  [ 280, 150,  95, 40, 25, 13, 5, 0,   6, 10, 15, 19, 23, 23, 28, 28, 34, 34, 42 ] },
    { "lower_limit": 10,   "upper_limit": 18,   "fits":  [ 290, 150,  95, 50, 32, 16, 6, 0,   7, 12, 18, 23, 28, 28, 33, 33, 40, 40, 50 ] },
    { "lower_limit": 18,   "upper_limit": 30,   "fits":  [ 300, 160, 110, 65, 40, 20, 7, 0,   7, 12, 18, 23, 28, 28, 33, 39, 45, 45, 60 ] },
    { "lower_limit": 30,   "upper_limit": 40,   "fits":  [ 310, 170, 120, 80, 50, 25, 9, 0,   8, 15, 22, 28, 35, 35, 41, 47, 54, 63, 73 ] },
    { "lower_limit": 40,   "upper_limit": 50,   "fits":  [ 320, 180, 130, 80, 50, 25, 9, 0,   8, 15, 22, 28, 35, 41, 48, 55, 64, 75, 88 ] }
];

var tooling = [
    { "tool": "Lapping",                   "lower":  2, "upper":  5},
    { "tool": "Honing",                    "lower":  3, "upper":  5},
    { "tool": "Superfinishing",            "lower":  4, "upper":  6},
    { "tool": "Cylindrical grinding",      "lower":  4, "upper":  7},
    { "tool": "Diamond turning",           "lower":  4, "upper":  7},
    { "tool": "Plan grinding",             "lower":  5, "upper":  9},
    { "tool": "Broaching",                 "lower":  5, "upper":  9},
    { "tool": "Reaming",                   "lower":  5, "upper":  9},
    { "tool": "Boring/turning",            "lower":  6, "upper": 12},
    { "tool": "Sawing",                    "lower":  9, "upper": 11},
    { "tool": "Milling",                   "lower":  9, "upper": 13},
    { "tool": "Planing/shaping",           "lower": 10, "upper": 14},
    { "tool": "Extruding",                 "lower": 10, "upper": 13},
    { "tool": "Cold rolling/drawing",      "lower": 10, "upper": 14},
    { "tool": "Drilling",                  "lower": 11, "upper": 14},
    { "tool": "Die casting",               "lower": 12, "upper": 15},
    { "tool": "Forging",                   "lower": 13, "upper": 16},
    { "tool": "Sand casting",              "lower": 14, "upper": 16},
    { "tool": "Hot rolling/flame cutting", "lower": 14, "upper": 16}
];
