class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.distance = Infinity;
        this.visited = false;
        this.gCost = 0;
        this.hCost = 0;

        // gcost + hcost
        this.fCost = 0;

        this.parentNode = self;

        this.isWall = false;
    }

    // get wall value
    get getIsWall() {
        return this.isWall;
    }

    // get X value
    get getX() {
        return this.x;
    }

    // get Y value
    get getY() {
        return this.y;
    }

    // get fcost
    get getF() {
        return this.fCost;
    }

    // get gcost
    get getG() {
        return this.gCost;
    }

    // get hcost
    get getH() {
        return this.hCost;
    }

    // get parent
    get getParent() {
        return this.parentNode;
    }

    // get distance
    get getDistance() {
        return this.distance;
    }

    // get visited
    get getVisited() {
        return this.visited;
    }

    // set wall value
    setWall(val) {
        this.isWall = val;
    }

    // set fcost
    setF(val) {
        this.fCost = val;
    }

    // set gcost
    setG(val) {
        this.gCost = val;
    }

    // set hcost
    setH(val) {
        this.hCost = val;
    }

    // set x
    setX(val) {
        this.x = val;
    }

    // set y
    setY(val) {
        this.y = val;
    }

    // set parent
    setParent(val) {
        this.parentNode = val;
    }

    // set distance
    setDistance(val) {
        this.distance = val;
    }

    // set distance
    setVisited(val) {
        this.visited = val;
    }
}

class Maze {
    constructor(w, h, bias, nodeGrid, visualGrid) {
        this.w = (isNaN(w) || w < 5 || w > 999 ? 20 : w);
        this.h = (isNaN(h) || h < 5 || h > 999 ? 20 : h);

        this.map = new Array();

        for (var mh = 0; mh < h; ++mh) { 
            this.map[mh] = new Array(); 
            for (var mw = 0; mw < w; ++mw) { 
                this.map[mh][mw] = { 
                    'n': 0, 
                    's': 0, 
                    'e': 0, 
                    'w': 0 }; 
            } 
        }

        var bias = (typeof bias == 'undefined' || (bias != 'ne' && bias != 'nw' && bias != 'sw' && bias != 'se') ? 'nw' : bias);

        this.build(bias, nodeGrid, visualGrid);
    }

    toGrid(nodeGrid, visualGrid) {
        var grid = new Array();
        for (var mh = 0; mh < (this.h * 2); mh++) { 
            grid[mh] = new Array(); 
            for (var mw = 0; mw < (this.w * 2); mw++) { 
                grid[mh][mw] = 0; 
            } 
        }

        for (var y = 0; y < this.h; y++) {
            var py = (y * 2) + 1;

            for (var x = 0; x < this.w; x++) {
                var px = (x * 2) + 1;

                grid[py][px] = 1;

                if (this.map[y][x]['n'] == 1) { 
                    grid[(py - 1)][px] = 1; 
                } if (this.map[y][x]['s'] == 1) { 
                    grid[(py + 1)][px] = 1; 
                } if (this.map[y][x]['e'] == 1) { 
                    grid[py][(px + 1)] = 1; 
                } if (this.map[y][x]['w'] == 1) {
                    grid[py][(px - 1)] = 1; 
                }
            }
        }

        this.gridMap = grid;
        this.gridW = grid.length;
        this.gridH = grid[0].length;

        console.log(this.gridMap);

        for (let i = 0; i < nodeGrid[0].length; i++) {
            for (let j = 0; j < nodeGrid.length; j++) {
                if(this.gridMap[i + 1][j + 1] == 1) {
                    visualGrid[j][i].style.backgroundColor = '#2e2e2e';
                    nodeGrid[j][i].setWall(true);
                }
            }
        }
    }

    build(dir, nodeGrid, visualGrid) {
        if (typeof dir == 'undefined' || (dir != 'nw' && dir != 'ne' && dir != 'sw' && dir != 'se')) { dir = 'se'; }

        var dirs = new Array();
        dirs.push(dir == 'ne' || dir == 'nw' ? 'n' : 's');
        dirs.push(dir == 'ne' || dir == 'se' ? 'e' : 'w');

        for (var y = 0; y < this.h; y++) {
            var trueY = (dir == 'nw' || dir == 'ne' ? this.h - (y + 1) : y);

            for (var x = 0; x < this.w; x++) {
                var trueX = (dir == 'nw' || dir == 'sw' ? this.w - (x + 1) : x);
                var m = 0;

                // If we're at the opposite corners for our movement, break!
                if (trueY == 0 && dirs[0] == 'n' && ((trueX == 0 && dirs[1] == 'w') || (trueX == (this.w - 1) && dirs[1] == 'e'))) { break; }
                if (trueY == (this.h - 1) && dirs[0] == 's' && ((trueX == 0 && dirs[1] == 'w') || (trueX == (this.w - 1) && dirs[1] == 'e'))) { break; }

                // If we're at an opposite border, move the only way we can...
                if (trueY == 0 && dirs[0] == 'n') { this.map[trueY][trueX][dirs[1]] = 1; this.map[trueY][(trueX + (dirs[1] == 'w' ? -1 : 1))][(dirs[1] == 'w' ? 'e' : 'w')] = 1; m = 1; }
                else if (trueY == (this.h - 1) && dirs[0] == 's') { this.map[trueY][trueX][dirs[1]] = 1; this.map[trueY][(trueX + (dirs[1] == 'w' ? -1 : 1))][(dirs[1] == 'w' ? 'e' : 'w')] = 1; m = 1; }
                else if (trueX == 0 && dirs[1] == 'w') { this.map[trueY][trueX][dirs[0]] = 1; this.map[(trueY + (dirs[0] == 'n' ? -1 : 1))][trueX][(dirs[0] == 'n' ? 's' : 'n')] = 1; m = 1; }
                else if (trueX == (this.w - 1) && dirs[1] == 'e') { this.map[trueY][trueX][dirs[0]] = 1; this.map[(trueY + (dirs[0] == 'n' ? -1 : 1))][trueX][(dirs[0] == 'n' ? 's' : 'n')] = 1; m = 1; }

                if (m == 0) {
                    var mov = dirs[Math.floor((Math.random() * 1000) % 2)];

                    if (mov == 'n') { 
                        this.map[trueY][trueX][mov] = 1; 
                        this.map[(trueY - 1)][trueX]['s'] = 1; 
                    } else if (mov == 's') { 
                        this.map[trueY][trueX][mov] = 1; 
                        this.map[(trueY + 1)][trueX]['n'] = 1; 
                    } else if (mov == 'w') { 
                        this.map[trueY][trueX][mov] = 1; 
                        this.map[trueY][(trueX - 1)]['e'] = 1; 
                    }else if (mov == 'e') { 
                        this.map[trueY][trueX][mov] = 1; 
                        this.map[trueY][(trueX + 1)]['w'] = 1; 
                    }
                }
            }
        }
        this.toGrid(nodeGrid, visualGrid);
    };
}

