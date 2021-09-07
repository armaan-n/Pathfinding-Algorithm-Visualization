async function astar(grid, visualGrid, startNode, endNode, ms) {
    let openedNodes = [];
    let closedNodes = [];

    let adjacentNodes = new Array(8);

    let current;

    openedNodes.push(startNode);

    while (openedNodes.length != 0) {

        // Set current to lowest f cost node
        current = openedNodes[0];

        // remove it
        openedNodes.splice(0, 1);

        // put it in closed array
        closedNodes.push(current);

        // end node found
        if (current == endNode) {
            await drawPath(visualGrid, endNode, startNode);
            return;
        }

        if (current != startNode) {
            visualGrid[current.getX][current.getY].style.backgroundColor = 'red';
        }

        adjacentNodes = getAdjacentNodes(current, grid);

        for (let i = 0; i < adjacentNodes.length; i++) {
            let node = adjacentNodes[i];

            if (node != null && !node.getIsWall && !closedNodes.includes(node)) {
                if ((node.getG > calcGCost(node, current)) || !openedNodes.includes(node)) {

                    // Set the parent
                    node.setParent(current);

                    // Set the gcost
                    node.setG(calcGCost(node, current));

                    // Set the hcost
                    node.setH(calcHCost(node, endNode));

                    // Set the fcost
                    node.setF(calcFCost(node));

                    if (!openedNodes.includes(node)) {
                        // put it in opened nodes
                        openedNodes.push(node);

                        // set colour to green
                        if (node != endNode) {
                            visualGrid[node.getX][node.getY].style.backgroundColor = 'green';
                        }
                    }

                    await sleep(ms);
                }
            }
        }

        openedNodes.sort(function (a, b) {
            return a.getF - b.getF || a.getH - b.getH;
        });
    }

    // no path found
}

async function dijkstra(grid, visualGrid, startNode, endNode, ms) {
    let temp = grid.flat();
    let openedNodes = [];
    let current;
    let adjacentNodes = [];

    for (let i = 0; i < temp.length; i++) {
        if ( !temp[i].getIsWall ) {
            openedNodes.push(temp[i]);
        }
    }
    
    grid[startNode.getX][startNode.getY].setDistance(0);

    while (openedNodes.length != 0) {
        // sort opened nodes by distance (acending)
        openedNodes.sort(function (a, b) {
            return a.getDistance - b.getDistance;
        });

        // set current node to the lowest distance node
        current = openedNodes[0];

        // remove it from the opened nodes array
        openedNodes.splice(0, 1);

        // end node found
        if (current == endNode) {
            drawPath(visualGrid, endNode, startNode);
            return;
        }

        if (current != startNode) {
            visualGrid[current.getX][current.getY].style.backgroundColor = 'red';
            await sleep(ms);
        }

        adjacentNodes = getAdjacentNodes(current, grid);

        for (let i = 0; i < adjacentNodes.length; i++) {
            let node = adjacentNodes[i];

            if (node != null && !node.getIsWall && openedNodes.includes(node)) {
                let newDist = calcDistance(node, current);

                if (newDist < node.distance) {
                    node.setDistance(newDist);
                    node.setParent(current);
                }

                if (node != endNode) {
                    visualGrid[node.getX][node.getY].style.backgroundColor = 'green';
                }
            }
        }
    }
}

async function breadthFirstSearch(grid, visualGrid, startNode, endNode, ms) {
    let queue = [];
    let current;
    let adjacentNodes = [];
    let k = grid[0].length * grid.length;
    let stops = 0;

    startNode.setDistance(0);

    queue.push(startNode);

    while (queue.length != 0) {
        let size = queue.length;

        for (let i = 1; i <= size; i++) {
            current = queue[0];
            queue.splice(0, 1);

            if (current == endNode) {
                drawPath(visualGrid, endNode, startNode);
                return;
            }

            if (current != startNode) {
                visualGrid[current.getX][current.getY].style.backgroundColor = 'red';
            }

            adjacentNodes = getAdjacentNodes(current, grid);

            for (let j = 0; j < adjacentNodes.length; j++) {
                let node = adjacentNodes[j];

                if (stops == k && node != endNode) {
                    return;
                }
    
                if (node != null && !node.getIsWall && calcDistance(node, current) < node.distance) {
                    queue.push(node);

                    node.setDistance(calcDistance(node, current));
                    node.setParent(current);
    
                    if (node != endNode) {
                        visualGrid[node.getX][node.getY].style.backgroundColor = 'green';
                    }
                    
                    await sleep(ms);
                }
            }
        }
        stops ++;
    }
}

async function depthFirstSearch(sx, sy, grid, visualGrid, startNode, endNode, ms) {
    let adjacentNodes = getAdjacentNodes(startNode, grid);

    startNode.setVisited(true);

    if (startNode == endNode) {
        await drawPath(visualGrid, endNode, new Node(sx, sy));
        return true;
    }

    if (sx != startNode.getX || sy != startNode.getY) {
        visualGrid[startNode.getX][startNode.getY].style.backgroundColor = 'red';
        await sleep(ms);
    }

    for (let i = 0; i < adjacentNodes.length; i++) {
        if (adjacentNodes[i] != null && !adjacentNodes[i].getIsWall && !adjacentNodes[i].getVisited) {
            adjacentNodes[i].setParent(startNode);
            if (await depthFirstSearch(sx, sy, grid, visualGrid, adjacentNodes[i], endNode, ms)) {
                return true;
            }
        }
    }

    return;
}

async function greedyBestFirstSearch(grid, visualGrid, startNode, endNode, ms) {
    let queue = [];
    let current;
    let adjacentNodes = [];
    let k = grid[0].length * grid.length;
    let stops = 0;

    startNode.setDistance(0);

    queue.push(startNode);

    while (queue.length != 0) {
        let size = queue.length

        for (let i = 1; i <= size; i++) {
            queue.sort(function (a, b) {
                return calcHCost(a, endNode) - calcHCost(b, endNode);
            });

            current = queue[0];
            queue.splice(0, 1);

            if (current == endNode) {
                drawPath(visualGrid, endNode, startNode);
                return;
            }

            if (current != startNode) {
                visualGrid[current.getX][current.getY].style.backgroundColor = 'red';
                await sleep(ms);
            }

            adjacentNodes = getAdjacentNodes(current, grid);

            for (let j = 0; j < adjacentNodes.length; j++) {
                let node = adjacentNodes[j];

                if (stops == k && node != endNode) {
                    return;
                }
    
                if (node != null && !node.getIsWall && calcDistance(node, current) < node.distance) {
                    queue.push(node);

                    node.setDistance(calcDistance(node, current));
                    node.setParent(current);
    
                    if (node != endNode) {
                        visualGrid[node.getX][node.getY].style.backgroundColor = 'green';
                    }
                    
                    await sleep(ms);
                }
            }
        }
        stops ++;
    }
}

// Recusively draw the path
async function drawPath(visualGrid, endNode, startNode) {
    if (endNode.getParent.getX == startNode.getX && endNode.getParent.getY == startNode.getY) {
        return;
    }

    visualGrid[endNode.getParent.getX][endNode.getParent.getY].style.backgroundColor = 'yellow';
    await sleep(7);
    await drawPath(visualGrid, endNode.getParent, startNode);
}

// get adjactent nodes
function getAdjacentNodes(current, grid) {
    let adjacentNodes = new Array(8);

    // Set all adjacent nodes
    if (current.getX - 1 >= 0) {
        adjacentNodes[1] = grid[current.getX - 1][current.getY];

        if (current.getY - 1 >= 0) {
            adjacentNodes[2] = grid[current.getX - 1][current.getY - 1];
        } else {
            adjacentNodes[2] = null;
        }

        if (current.getY + 1 < grid[0].length) {
            adjacentNodes[0] = grid[current.getX - 1][current.getY + 1];
        } else {
            adjacentNodes[0] = null;
        }

    } else {
        adjacentNodes[0] = null;
        adjacentNodes[1] = null;
        adjacentNodes[2] = null;
    }

    if (current.getX + 1 < grid.length) {
        adjacentNodes[6] = grid[current.getX + 1][current.getY];

        if (current.getY - 1 >= 0) {
            adjacentNodes[7] = grid[current.getX + 1][current.getY - 1];
        } else {
            adjacentNodes[7] = null;
        }

        if (current.getY + 1 < grid[0].length) {
            adjacentNodes[5] = grid[current.getX + 1][current.getY + 1];
        } else {
            adjacentNodes[5] = null;
        }

    } else {
        adjacentNodes[5] = null;
        adjacentNodes[6] = null;
        adjacentNodes[7] = null;
    }

    if (current.getY + 1 < grid[0].length) {
        adjacentNodes[3] = grid[current.getX][current.getY + 1];
    } else {
        adjacentNodes[3] = null;
    }

    if (current.getY - 1 >= 0) {
        adjacentNodes[4] = grid[current.getX][current.getY - 1];
    } else {
        adjacentNodes[4] = null;
    }

    return adjacentNodes;
}

// calulate fcost
function calcFCost(node) {
    return node.getG + node.getH;
}

function calcHCost(node, endNode) {
    let temp = 0;
    
    temp += 14 * Math.min(Math.abs(node.getY - endNode.getY), Math.abs(node.getX - endNode.getX));
    temp += 10 * Math.abs(Math.abs(node.getY - endNode.getY) - Math.abs(node.getX - endNode.getX));

    return temp;
}

function calcGCost(node, parent) {
    if (node.getY != parent.getY && node.getX != parent.getX) {
        return parent.getG + 14;
    } else {
        return parent.getG + 10;
    }
}

function calcDistance(node, parent) {
    if (node.getY != parent.getY && node.getX != parent.getX) {
        return parent.getDistance + 14;
    } else {
        return parent.getDistance + 10;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

