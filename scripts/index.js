const colInput = document.getElementById('cols');
const rowInput = document.getElementById('rows');

const gridSpace = document.getElementById('grid-space');
const nodeGrid = document.getElementById('grid');

const algoSelect = document.getElementById('algo-select');

const chooseStart = document.getElementById('choose-start');
const chooseDest = document.getElementById('choose-dest');

const runBtn = document.getElementById('run');
const clearAll = document.getElementById('clear');
const mazeGen = document.getElementById('maze-gen');

let startNodeSelected = false;
let destNodeSelected = false;

let mouseDown = false;

let cols = colInput.value;
let rows = rowInput.value;

let grid = new Array(cols);
let visualGrid = new Array(cols);

let startNode = null;
let destNode = null;

let gL;
let gW;

// Calculate the max # of columns
let maxCols = Math.floor(gridSpace.offsetWidth / (gridSpace.offsetHeight / 50));

window.addEventListener('resize', () => {
    if (gridSpace.offsetWidth / parseInt(colInput.value) <  gridSpace.offsetHeight / parseInt(rowInput.value)) {
        console.log("height bigger" + 'repeat(' + parseInt(rowInput.value) + ', ' + gridSpace.offsetWidth / parseInt(rowInput.value) + 'px)');
        nodeGrid.style.gridTemplateRows = 'repeat(' + parseInt(rowInput.value) + ', ' + gridSpace.offsetWidth / parseInt(colInput.value) + 'px)';
        nodeGrid.style.gridTemplateColumns = 'repeat(' + parseInt(colInput.value) + ', ' + gridSpace.offsetWidth / parseInt(colInput.value) + 'px)';
    } else {
        console.log("width bigger" + 'repeat(' + parseInt(colInput.value) + ', ' + gridSpace.offsetHeight / parseInt(colInput.value) + 'px)');
        nodeGrid.style.gridTemplateRows = 'repeat(' + parseInt(rowInput.value) + ', ' + gridSpace.offsetHeight / parseInt(rowInput.value) + 'px)';
        nodeGrid.style.gridTemplateColumns = 'repeat(' + parseInt(colInput.value) + ', ' + gridSpace.offsetHeight / parseInt(rowInput.value) + 'px)';
    }
});

chooseStart.addEventListener('click', () => {
    startNodeSelected = true;
});

chooseDest.addEventListener('click', () => {
    destNodeSelected = true;
});

runBtn.addEventListener('click', async () => {
    resetNodes(grid);

    clearColours(rowInput.value, colInput.value);

    disableButtons();

    switch(algoSelect.value) {
        case 'A Star':
            await astar(grid, visualGrid, startNode, destNode, 51 - document.getElementById('speed-slider').value);
          break;
        case 'Breadth':
            await breadthFirstSearch(grid, visualGrid, startNode, destNode, (51 - document.getElementById('speed-slider').value) / 2);
            break;
        case 'Depth':
            await depthFirstSearch(startNode.getX, startNode.getY, grid, visualGrid, startNode, destNode, 51 - document.getElementById('speed-slider').value);
            break;
        case 'Dijkstra':
            await dijkstra(grid, visualGrid, startNode, destNode, (51 - document.getElementById('speed-slider').value) / 10);
          break;
        case 'Greedy':
            await greedyBestFirstSearch(grid, visualGrid, startNode, destNode, (51 - document.getElementById('speed-slider').value) / 2);
            break;
    }

    enableButtons();
});

clearAll.addEventListener('click', () => {
    clearEverything(rowInput.value, colInput.value);
});

mazeGen.addEventListener('click', () => {
    if (rowInput.value % 2 != 0) {
        rowInput.value--;
    }

    if (colInput.value % 2 != 0) {
        colInput.value--;
    }

    initializeGrid(colInput.value, rowInput.value);

    clearEverything(rowInput.value, colInput.value);
    setDestNode(1, 1);
    setStartNode(grid.length - 1, grid[0].length - 1);

    maze = new Maze(Math.floor(grid.length / 2), Math.floor(grid[0].length / 2), 'nw', grid, visualGrid);
});

// When cols are changed
colInput.addEventListener('input', () => {
    cols = parseInt(colInput.value);

    initializeGrid(colInput.value, rowInput.value);
});

// When rows are changed
rowInput.addEventListener('input', () => {
    rows = parseInt(rowInput.value);

    initializeGrid(colInput.value, rowInput.value);
});

// Detect left mouse button being pressed down
document.body.onmousedown = function() {
    mouseDown = true;
}

document.body.onmouseup = function() {
    mouseDown = false;
}

colInput.max = maxCols;
colInput.value = maxCols;

initializeGrid(maxCols, rows);

// Generates grid nodes and resets arrays
function initializeGrid(cols, rows) {

    // Clear array
    grid = new Array(cols);
    visualGrid = new Array(cols);

    // Clear nodeGrid
    nodeGrid.innerHTML = '';

    // Set the number and size of rows and cols
    if (window.innerHeight > window.innerWidth) {
        console.log("cols", colInput.value, rowInput.value);
        nodeGrid.style.gridTemplateRows = 'repeat(' + rows + ', ' + gridSpace.offsetWidth / cols + 'px)';
        nodeGrid.style.gridTemplateColumns = 'repeat(' + cols + ', ' + gridSpace.offsetWidth / cols + 'px)';
    } else {
        console.log("rows", colInput.value, rowInput.value);
        nodeGrid.style.gridTemplateRows = 'repeat(' + rows + ', ' + gridSpace.offsetHeight / rows + 'px)';
        nodeGrid.style.gridTemplateColumns = 'repeat(' + cols + ', ' + gridSpace.offsetHeight / rows + 'px)';
    }
    
    // Sets every element of the array to another array
    for (let i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
        visualGrid[i] = new Array(rows);
    }

    // Generate nodes and assignthem to arrays
    for (let i = 0; i < rows; i++) {
        for (let j = cols - 1; j >= 0; j--) {
            const newNode = document.createElement('div');

            newNode.classList = 'node';

            grid[j][i] = new Node(j, i);
            visualGrid[j][i] = newNode;

            nodeGrid.appendChild(newNode);

            // When the node is hovered over, add/remove wall
            newNode.addEventListener('mouseover', () => {
                if (mouseDown) {
                    // If it's a start/end node
                    if (grid[j][i] == startNode || grid[j][i] == destNode) {
                    } else if (grid[j][i].getIsWall) {
                        // If wall make empty
                        newNode.style.backgroundColor = "#c9c9c9";
                        grid[j][i].setWall(!grid[j][i].getIsWall);
                        // If empty make wall
                    } else {
                        newNode.style.backgroundColor = "#2e2e2e";
                        grid[j][i].setWall(!grid[j][i].getIsWall);
                    }
                }
            });

            newNode.addEventListener('click', () => {

                // If start node was clicked
                if (startNodeSelected) {
                    if(grid[j][i] != destNode) {
                        setStartNode(j, i);

                        grid[j][i].setWall(false);
                        startNodeSelected = false;
                    }
                    
                } else if (destNodeSelected) {
                    if(grid[j][i] != startNode) {
                        setDestNode(j, i);

                        grid[j][i].setWall(false);
                        destNodeSelected = false;
                    }
                } else {
                    // If it's a start/end node
                    if (grid[j][i] == startNode || grid[j][i] == destNode) {
                        // If wall make empty
                    } else if (grid[j][i].getIsWall) {
                        newNode.style.backgroundColor = '#c9c9c9';
                        grid[j][i].setWall(!grid[j][i].getIsWall);
                        // If empty make wall
                    } else {
                        newNode.style.backgroundColor = '#2e2e2e';
                        grid[j][i].setWall(!grid[j][i].getIsWall);
                    } 
                }
            });
        }
    }

    // Set start and end nodes
    startNode = grid[0][0];
    visualGrid[0][0].style.backgroundColor = '#00d9ff';

    destNode = grid[cols - 1][rows - 1];
    visualGrid[cols - 1][rows - 1].style.backgroundColor = '#ffbb00';
}

function setStartNode(x, y) {
    visualGrid[startNode.getX][startNode.getY].style.backgroundColor = '#c9c9c9';

    grid[x][y].setWall(false);

    startNode = grid[x][y];
    visualGrid[x][y].style.backgroundColor = '#00d9ff';
}

function setDestNode(x, y) {
    visualGrid[destNode.getX][destNode.getY].style.backgroundColor = '#c9c9c9';

    grid[x][y].setWall(false);

    destNode = grid[x][y];
    visualGrid[x][y].style.backgroundColor = '#ffbb00';
}

// removes opened / closed nodes from grid
function clearColours(rows, cols) {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if(!grid[i][j].getIsWall && grid[i][j] != startNode && grid[i][j] != destNode) {
                visualGrid[i][j].style.backgroundColor = '#c9c9c9';
            }
        }
    }
}

// removes everything except start/dest node
function clearEverything(rows, cols) {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j] != startNode && grid[i][j] != destNode) {
                grid[i][j].setWall(false);
                visualGrid[i][j].style.backgroundColor = '#c9c9c9';
            }
        }
    }
}

function resetNodes(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            grid[i][j].setDistance(Infinity);
            grid[i][j].setF(0);
            grid[i][j].setG(0);
            grid[i][j].setH(0);
            grid[i][j].setParent(grid[i][j]);
            grid[i][j].setVisited(false);
        }
    }
}

function disableButtons() {
    chooseDest.disabled = true;
    chooseStart.disabled = true;
    runBtn.disabled = true;
    mazeGen.disabled = true;
    clearAll.disabled = true;
}

function enableButtons() {
    chooseDest.disabled = false;
    chooseStart.disabled = false;
    runBtn.disabled = false;
    mazeGen.disabled = false;
    clearAll.disabled = false;
}