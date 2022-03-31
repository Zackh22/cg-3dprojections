let view;
let ctx;
let scene;
let start_time;

const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

// Initialization function - called when web page loads
function init() {
    let w = 800;
    let h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',
            prp: Vector3(44, 20, -16),
            srp: Vector3(20, 20, -40),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ],
                matrix: new Matrix(4, 4)
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', onKeyDown, false);
    
    // start animation loop
    start_time = performance.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(animate);
}

// Animation loop - repeatedly calls rendering code
function animate(timestamp) {
    // step 1: calculate time (time since start)
    let time = timestamp - start_time;
    
    // step 2: transform models based on time
    // TODO: implement this!

    // step 3: draw scene
    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    // window.requestAnimationFrame(animate);
}

// Main drawing code - use information contained in variable `scene`
function drawScene() {
    console.log(scene);
    
    // TODO: implement drawing here!
    // For each model, for each edge
    for(var i = 0; i < scene.models.length; i++) { // loop through the models in the scene
        currentModel = scene.models[i];

        for(var j = 0; j < currentModel.edges.length; j++) { // loop through the edges in the current model
            currentEdge = currentModel.edges[j];

            //  * transform to canonical view volume

            let canonicalViewVolume;
            let mAndn;

            if(scene.type == 'perspective') {
                // perspective
                canonicalViewVolume = mat4x4Perspective(scene.prp, scene.srp, scene.vup, scene.clip);
                mAndn = Matrix.multiply([mat4x4MPer(), canonicalViewVolume]);
            } else {
                // parallel
                canonicalViewVolume = mat4x4Parallel(scene.prp, scene.srp, scene.vup, scene.clip);
                mAndn = Matrix.multiply([mat4x4MPar(), canonicalViewVolume]);

            }

            // convert pts to world view
            for (let i = 0; i < scene.models.vertices.length; i++) {
                let currentVertex = currentModel.vertices[i];
                let vertexMatrix = new Matrix(4, 1);
                vertexMatrix.values = [currentVertex.x, currentVertex.y, currentVertex.z, currentVertex.w];

            }

            //  * clip in 3D
            if(scene.type == 'perspective') {
                // perspective

            } else {
                // parallel

            }

            //  * project to 2D
            
            //  * draw line
        }
    }
}

// Get outcode for vertex (parallel view volume)
function outcodeParallel(vertex) {
    let outcode = 0;
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (1.0 + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (-1.0 - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (1.0 + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.x > (0.0 + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Get outcode for vertex (perspective view volume)
function outcodePerspective(vertex, z_min) {
    let outcode = 0;
    if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.x > (z_min + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLineParallel(line) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodeParallel(p0);
    let out1 = outcodeParallel(p1);
    let t, selectpt, selectout, done = false;

    // TODO: implement clipping here!
    while(!done) {
        if(out0 | out1 === 0) { // trivial accept
            result = {pt0: p0, pt1: p1}; // if both outcodes are zero the line is completely inside
            done = true;
        } else if(out0 & out1 != 0) { // trival reject
            result = null; // if the result of a bitwise and of the outcodes is not zero, the line is completely outside
            done = true;
        } else {
            // TODO: complete 3D line clipping algorithm for parallel
            // at least one endpoint is outside the view frustum
            var outcode;
            if (out0 != 0) {
                selectpt = p0;
                selectout = out0;
            } else {
                selectpt = p1;
                selectout = out1;
            }
            /*
            let x0 = pt0.x;
            let x1 = pt1.x;
            let y0 = pt0.y;
            let y1 = pt1.y;
            let z0 = pt0.z;
            let z1 = pt1.z;
            let deltaX = x1-x0;
            let deltaY = y1-y0;
            let deltaZ = z1-z0;
            let t; */

            if ((selectout & LEFT) != 0) { // clip to left edge
                // t = (view_xmin - x0)/ deltaX
                t = (0 - p0.x) / (p1.x - p0.x);
                selectpt.y = p0.y + t * (p1.y - p0.y);
                selectpt.x = 0;
                selectpt.z = p0.z + t * (p1.z - p0.z);


            } else if ((selectout & RIGHT) != 0) { // clip to right edge
                // t = (view_xmax - x0)/deltaX
                t = (view.width - p0.x) / (p1.x - p0.x);
                selectpt.y = p0.y + t * (p1.y - p0.y);
                selectpt.x = view.width;
                selectpt.z = p0.z + t * (p1.z - p0.z);

            } else if ((selectout & BOTTOM) != 0) { // clip to bottom edge
                // t = (view_ymin - y0)/deltaY
                t = (0 - p0.y) / (p1.y - p0.y);
                selectpt.x = p0.x + t * (p1.x - p0.x);
                selectpt.y = 0;
                selectpt.z = p0.z + t * (p1.z - p0.z);

            } else if ((selectout & TOP) != 0) { // clip to top edge
                // t = (view_ymax - y0)/deltaY
                t = (view.height - p0.y) / (p1.y - p0.y);
                selectpt.x = p0.x + t * (p1.x - p0.x);
                selectpt.y = view.height;
                selectpt.z = p0.z + t * (p1.z - p0.z);
                
            } else if ((selectout & NEAR) != 0) { // clip to near edge
                t = (0 - p0.z) / (p1.z - p0.z);
                selectpt.x = p0.x + t * (p1.x - p0.x);
                selectpt.y = p0.y + t * (p1.y - p0.y);
                selectpt.z = 0;
                
            } else if ((selectout & FAR) != 0) { // clip to far edge
                t = (-1 - p0.z) / (p1.z - p0.z);
                selectpt.x = p0.x + t * (p1.x - p0.x);
                selectpt.y = p0.y + t * (p1.y - p0.y);
                selectpt.z = -1;
                
            }
            if (selectout === out0) {
                out0 = outcodeParallel(selectpt);
            } else {
                out1 = outcodeParallel(selectpt);
            }

            // use parametric line equations to compute intersections
            // test for planes x = 1, x = -1, y = 1, y = -1, z = 0, z = -1
            /*
            parametric 3d line equations:
            x(t) = x0 + t(x1 - x0)
            y(t) = y0 + t(y1 - y0)
            z(t) = z0 + t(z1 - z0)
            */

            

        }
    }
    
    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);
    
    // TODO: implement clipping here!

    if(out0 | out1 == 0) {
        result = line;
    } // trivial accept
    if(out0 & out1 != 0) {
        result = null;
    } // trivial reject
    else {
        /*
        parametric 3d line equations:
        x(t) = x0 + t(x1 - x0)
        y(t) = y0 + t(y1 - y0)
        z(t) = z0 + t(z1 - z0)
        */
       let x0 = pt0.x;
       let x1 = pt1.x;
       let y0 = pt0.y;
       let y1 = pt1.y;
       let z0 = pt0.z;
       let z1 = pt1.z;
       let delx = x1 - x0;
       let dely = y1 - y0;
       let delz = z1 - z0;
       let tLeft = (-x0 + z0) / (delx - delz);
       let tBottom = (-1 * y0 + z0) / (dely - delz);
       let tNear = (z0 - z_min) / (-1 * delz);
       let tRight = (x0 + z0) / (-1 * delx - delz);
       let tTop = (y0 + z0) / (-1 * dely - delz);
       let tFar = (-1 * z0 - 1) / (delz);

       // TODO: complete 3D line clipping algorithm for perspective
    }
    
    return result;
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            break;
        case 65: // A key
            console.log("A");
            break;
        case 68: // D key
            console.log("D");
            break;
        case 83: // S key
            console.log("S");
            break;
        case 87: // W key
            console.log("W");
            break;
    }
}

///////////////////////////////////////////////////////////////////////////
// No need to edit functions beyond this point
///////////////////////////////////////////////////////////////////////////

// Called when user selects a new scene JSON file
function loadNewScene() {
    let scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    let reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);
        scene.view.srp = Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
            scene.models[i].matrix = new Matrix(4, 4);
        }
    };
    reader.readAsText(scene_file.files[0], 'UTF-8');
}

// Draw black 2D line with red endpoints 
function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
