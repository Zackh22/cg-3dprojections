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
             
            //ORIGINAL:                                 CONFIRMED TO WORK
            // type: 'perspective',
            // prp: Vector3(44, 20, -16),
            // srp: Vector3(20, 20, -40),
            // vup: Vector3(0, 1, 0),
            // clip: [-19, 5, -10, 8, 12, 100]
            

            
            // head-on view                             CONFIRMED TO WORK
            // type: 'perspective',
            // prp: Vector3(10, 9, 0),
            // srp: Vector3(10, 9, -30),
            // vup: Vector3(0, 1, 0),
            // // left, right, bottom, top, near, far
            // clip: [-11, 11, -11, 11, 30, 100]
            

            
            // side view                                DOES NOT WORK - TODO: DEBUG
            // type: 'perspective',
            // prp: Vector3(38, 10, -45),               // works when PRP z-value > -20
            // srp: Vector3(20, 10, -45),
            // vup: Vector3(0, 1, 0),
            // // left, right, bottom, top, near, far
            // clip: [-16, 16, -15, 17, 18, 100]

            // side view - modified PRP                 CONFIRMED TO WORK
            // type: 'perspective',
            // prp: Vector3(38, 10, 0),
            // srp: Vector3(20, 10, -45),
            // vup: Vector3(0, 1, 0),
            // // left, right, bottom, top, near, far
            // clip: [-16, 16, -15, 17, 18, 100]

            // side view - modified                 CONFIRMED TO WORK
            // type: 'perspective',
            // prp: Vector3(38, 10, -15),
            // srp: Vector3(20, 10, -45),
            // vup: Vector3(0, 1, 0),
            // // left, right, bottom, top, near, far
            // clip: [-16, 16, -15, 17, 18, 100]

            // side view - modified
            type: 'parallel',
            prp: Vector3(0, 0, 0),
            srp: Vector3(20, 10, -45),
            vup: Vector3(0, 1, 0),
            // left, right, bottom, top, near, far
            clip: [-16, 16, -15, 17, 18, 100]

            
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
    //window.requestAnimationFrame(animate);
}

// Main drawing code - use information contained in variable `scene`
function drawScene() {
    /*
    console.log(scene); // print the scene
    console.log(scene.models.length); // print the number of models
    console.log(scene.models);
    console.log(scene.models[0].vertices.length);
    */

    let sceneType = scene.view.type;
    let modelLength = scene.models.length;
    let prp = scene.view.prp;
    //console.log(prp);
    let srp = scene.view.srp;
    //console.log(srp);
    let vup = scene.view.vup;
    //console.log(vup);
    let clip = scene.view.clip;
    //console.log(clip);

    let width = view.width;
    let height = view.height;

    let window = new Matrix(4, 4);
    window.values = [[ ( width / 2 ), 0, 0, ( width / 2 )],
                    [ 0, ( height / 2 ), 0, ( height / 2 )],
                    [ 0, 0, 1, 0],
                    [ 0, 0, 0, 1]];
    
    // TODO: implement drawing here!
    // For each model, for each edge

    // ********** BEGIN TEST OF DRAWING HOUSE WITHOUT TRANSFORMATIONS OR CLIPPING **********
    /*
    for(let i = 0; i < scene.models.length; i++) { // going through models in scene
        for(let j = 0; j < scene.models[i].edges.length; j++) { // going through edge arrays
            for(let k = 1; k < scene.models[i].edges[j].length; k++) { // going through values in each edge array
                // assign two vertex indices
                let idx0 = scene.models[i].edges[j][k - 1];
                let idx1 = scene.models[i].edges[j][k];
                // assign two vertices using the indices
                let vert0 = scene.models[i].vertices[idx0];
                let vert1 = scene.models[i].vertices[idx1];
                // create a line between them to be clipped
                let lineToDraw = {pt0: vert0, pt1: vert1};
                console.log("line to draw: "); console.log(lineToDraw);
                console.log()
                drawLine(lineToDraw.pt0.x, lineToDraw.pt0.y, lineToDraw.pt1.x, lineToDraw.pt1.y);
            }
        }
    }
    */
    // ********** END TEST OF DRAWING HOUSE WITHOUT TRANSFORMATIONS OR CLIPPING **********

    

    let m, n; // declaring here to avoid scope issues - gets value based on sceneType;

    if(sceneType == "perspective") {
        // perspective
        console.log("PERSPECTIVE");

        // general perspective projection: Nper = Sperh * SHpar * R * T(-PRP)   (09 - 3D Projections Part 2 slide 23)
        m = mat4x4MPer();
        n = mat4x4Perspective(prp, srp, vup, clip);
    } else {
        // parallel or assumed parallel if not defined
        console.log("PARALLEL");

        m = mat4x4MPar();
        /*
        console.log("prp"); console.log(prp);
        console.log("srp"); console.log(srp);
        console.log("vup"); console.log(vup);
        console.log("clip"); console.log(clip);
        */
        n = mat4x4Parallel(prp, srp, vup, clip);
        if(n != null){
            console.log("n HAS VALUES: ", n, n.values);
        } else{
            console.log("n is NULL IGNORE EVERYTHING BELOW ME 4 NOW");
        }

        // general parallel projection: Npar = Spar * Tpar * SHpar * R * T(-PRP)    (09 - 3D Projections Part 2 slide 15)
    }

    //  * clip in 3D
    //  * project to 2D
    //  * draw line

    //console.log("LOOP RANGES: ");
    //console.log("number of models: (expect 1) "); console.log(scene.models.length); // confirmed
    //console.log("number of edge arrays: (expect 7) "); console.log(scene.models[0].edges.length); // confirmed

    

    for(let i = 0; i < scene.models.length; i++) { // loop through all models
        //console.log("model idx: "); console.log(i);

        let verts = [];
        for(let j = 0; j < scene.models[i].vertices.length; j++) { // loop through the vertices in the current model
            
            //verts.push( scene.models[i].vertices[j] );
            
            verts.push(Matrix.multiply([ n , scene.models[i].vertices[j] ]));
        }        

        for(let j = 0; j < scene.models[i].edges.length; j++) { // loop through all edge arrays
            //console.log(" edge array idx: "); console.log(j);
            //console.log("edge array: "); console.log(scene.models[i].edges[j]);
            for(let k = 1; k < scene.models[i].edges[j].length; k++) { // loop through vertex indices


                //console.log(" k value: "); console.log(scene.models[i].edges[j][k]);
                // assign two vertex indices
                let idx0 = scene.models[i].edges[j][k - 1];
                let idx1 = scene.models[i].edges[j][k];
                // assign two vertices using the indices
                //console.log("idxs:");console.log(idx0);console.log(idx1);
                let vert0 = verts[idx0];
                let vert1 = verts[idx1];
                //console.log("verts:");console.log(vert0);console.log(vert1);
                
                
                // create a line between them to be clipped
                let tempLine = {pt0: vert0, pt1: vert1};
                // clip the line based on view type
                if(sceneType == "perspective") {
                    var clippedLine = clipLinePerspective( tempLine, ( -1 * scene.view.clip[4] ) / scene.view.clip[5] );
                } else {
                    console.log("tempLine is: ")
                    console.log(tempLine);
                    var clippedLine = clipLineParallel( tempLine );
                }

                // draw the clipped line

                if (clippedLine != null) { // if line is null it was entirely out of view
                    var drawPt0 = Matrix.multiply([ window, m, clippedLine.pt0 ]);
                    var drawPt1 = Matrix.multiply([ window, m, clippedLine.pt1 ]);
                    
                    drawLine( ( drawPt0.x ), ( drawPt0.y ), ( drawPt1.x ), ( drawPt1.y ));
                }

                // TODO: figure out where to use the z-values from the clippedLine coordinates
            }
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
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (0.0 + FLOAT_EPSILON)) {
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
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (z_min + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLineParallel(line) {
    console.log("clipLinePar", line, line.pt0, line.pt0.values);
    let result = null;
    console.log(line);
    console.log(line.pt0);
    console.log(line.pt0.x);
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z);    
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodeParallel(p0);
    let out1 = outcodeParallel(p1);

    // left: x = -1, right: x = 1, bottom: y = -1, top: y = 1, far: z = -1, near: z = 0

    let done = false;

    // TODO: implement clipping here!
    let cyclesInLoop = 0;
    let newPt = null;
    let originalP0 = p0;
    let originalP1 = p1;


    while(!done) {
        console.log("START LOOP");
        console.log("Current p0: ", p0.values);
        console.log("Current p1: ", p1.values);
        console.log(out0, out1);
        console.log("BitwiseOR", out0 | out1);
        console.log("BitwiseAND", out0 & out1);
        if(cyclesInLoop == 10){
            console.log("Looped through", cyclesInLoop, "times");
            break;
        }
        if(out0 | out1 == 0) { // trivial accept
            console.log("Trivial Accept.");
            result = line;//{pt0: p0, pt1: p1}; // if both outcodes are zero the line is completely inside
            done = true;
            console.log("Total Cyles in loop:", cyclesInLoop);
        } else if(out0 & out1 != 0) { // trival reject
            result = null; // if the result of a bitwise and of the outcodes is not zero, the line is completely outside
            done = true;
            console.log("Trivial Reject");
        } else {
            // TODO: complete 3D line clipping algorithm for parallel
            console.log("In ELSE");
            var outcode, t, x, y, z = null;

            if (out0 != 0) {
                outcode = out0;
            } else {
                outcode = out1;
            }
            
            let x0 = p0.x;
            let x1 = p1.x;
            let y0 = p0.y;
            let y1 = p1.y;
            let z0 = p0.z;
            let z1 = p1.z;
            let deltaX = x1-x0;
            let deltaY = y1-y0;
            let deltaZ = z1-z0;

            if ((outcode & LEFT) != 0) { // clip to left edge
                t = ( 0 - x0 ) / ( deltaX );
                x = 0;
                y = y0 + t * ( deltaY );
                z = z0 + t * ( deltaZ );


            } else if ((outcode & RIGHT) != 0) { // clip to right edge
                t = ( view.width - x0 ) / ( deltaX );
                x = view.width;
                y = y0 + t * ( deltaY );
                z = z0 + t * ( deltaZ );
                
            } else if ((outcode & BOTTOM) != 0) { // clip to bottom edge
                t = ( view.width - x0 ) / ( deltaY );
                x = x0 + t * ( deltaX);
                y = 0;
                z = z0 + t * ( deltaZ );

            } else if ((outcode & TOP) != 0) { // clip to top edge
                t = ( view.width - x0 ) / ( deltaY );
                x = x0 + t * ( deltaX);
                y = view.height;
                z = z0 + t * ( deltaZ );
            //TODO: Find out if these two edges need to come back in.  
            } else if ((outcode & NEAR) != 0) { // clip to near edge
                t = ( view.width - x0 ) / ( deltaZ );
                x = x0 + t * ( deltaX);
                y = y0 + t * ( deltaY );
                z = z0 + t * ( deltaZ );
            } else if ((outcode & FAR) != 0) { // clip to far edge
                t = ( view.width - x0 ) / ( deltaZ );
                x = x0 + t * ( deltaX);
                y = y0 + t * ( deltaY );
                z = z0 + t * ( deltaZ );
            }

            // else if ((selectout & NEAR) != 0) { // clip to near edge
            //     t = ( view.width - x0 ) / ( deltaZ );
            //     x = x0 + t * ( deltaX);
            //     y = y0 + t * ( deltaY );
            //     z = z0 + t * ( deltaZ );
                
            // } else if ((selectout & FAR) != 0) { // clip to far edge
            //     t = ( view.width - x0 ) / ( deltaZ );
            //     x = x0 + t * ( deltaX);
            //     y = y0 + t * ( deltaY );
            //     z = z0 + t * ( deltaZ );
                
            // }
            //if (selectout === out0) {
            //newPt = Vector3(x, y, z);
            //console.log("p0", p0, p0.values);
            //console.log("p1", p1, p1.values);
            //console.log("newPt", newPt, newPt.values);
            
            
            //TODO: why would you change out0 if outcode and out0 are the same?
            //console.log("OUTCODE", outcode, "out0", out0, "out1", out1);
            //if (outcode === out0) {
            if(outcode == out0){
                //out0 = outcodeParallel(selectpt);
                p0.x = x;
                p0.y = y;
                p0.z = z;
                out0 = outcodeParallel(p0);
                //out0 = outcodeParallel(newPt);
                //console.log("out0", out0, "and p0 changed to newPt");
                
                //p0 = newPt;
                
                //console.log(p0.values);
            } else {
                //out1 = outcodeParallel(selectpt);
                //out1 = outcodeParallel(newPt);
                p1.x = x;
                p1.y = y;
                p1.z = z;
                out1 = outcodeParallel(p1);
                
                //p1 = newPt;
                
                //console.log("out1", out1, "and pt1 changed to newPt");
            }
            cyclesInLoop++;
            console.log("END OF LOOP");

            // use parametric line equations to compute intersections
            // test for planes x = 1, x = -1, y = 1, y = -1, z = 0, z = -1
            /*
            parametric 3d line equations:
            x(t) = x0 + t(x1 - x0)
            y(t) = y0 + t(y1 - y0)
            z(t) = z0 + t(z1 - z0)
            */

            line.pt0 = p0;
            line.pt1 = p1;
            result = line;

        }
    }
    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    //console.log("clipLinePer");
    //console.log(line);
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);

    let done = false;
    
    while(!done) {
        if(out0 | out1 == 0) {
            result = line; // trivial accept
            done = true;
            //break;
        } else if(out0 & out1 != 0) {
            result = null; // trivial reject
            done = true;
            //break;
        } else {
            // at least one endpoint is outside the view frustum
            var outcode, t, x , y, z = null;

            if (out0 != 0) {
                outcode = out0;
            } else {
                outcode = out1;
            }

            // declaring variables to avoid repetitive code
            let x0 = p0.x;
            let y0 = p0.y;
            let z0 = p0.z;
            let x1 = p1.x;
            let y1 = p1.y;
            let z1 = p1.z;
            let delX = x1 - x0;
            let delY = y1 - y0;
            let delZ = z1 - z0;

            if ((outcode & LEFT) != 0) { // clip to left edge

                t = (( -x0 + z0 ) / ( delX - delZ ));

            } else if ((outcode & RIGHT) != 0) { // clip to right edge

                t = (( x0 + z0 ) / ( -delX - delZ));

            } else if ((outcode & BOTTOM) != 0) { // clip to bottom edge

                t = (( -y0 + z0 ) / ( delY - delZ ));

            } else if ((outcode & TOP) != 0) { // clip to top edge

                t = (( y0 + z0 ) / ( -delY - delZ ));
                
            } else if ((outcode & NEAR) != 0) { // clip to near edge

                t = (( z0 - z_min ) / ( -delZ ));
                
            } else if ((outcode & FAR) != 0) { // clip to far edge

                t = (( -z0 - 1 ) / ( delZ ));

            }

            x = (( 1 - t ) * p0.x ) + ( t * p1.x );
            y = (( 1 - t ) * p0.y ) + ( t * p1.y );
            z = (( 1 - t ) * p0.z ) + ( t * p1.z );

            if (outcode === out0) { // if the point being clipped is p0, the selected outcode was out0

                p0.x = x;
                p0.y = y;
                p0.z = z;
                out0 = outcodePerspective(p0, z_min);

            } else { // otherwise the pt being clipped is p1 and the selected outcode was out1

                p1.x = x;
                p1.y = y;
                p1.z = z;
                out1 = outcodePerspective(p1, z_min);
                
            }

            line.pt0 = p0;
            line.pt1 = p1;
            result = line;

        }
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
