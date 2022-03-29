// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {

    /*
    PRP - projection reference point - used to calculate DOP
    SRP - scene reference point - center of scene
    VUP - view up vector
    */

    /*
    VRC calculations
        n: normalized (PRP - SRP)
        u: normalized (VUP X n-axis)
        v: n-axis X u-axis
    */

    let n = prp - srp;
    n = n.normalize();
    let u = vup.cross(n);
    u = u.normalize();
    let v = n.cross(u);

    /*
    Window calculations
        center of window: [(left + right) / 2 , (bottom + top) / 2]
        DOP: CW - PRP
    */

    /*
        Parallel projection:
            DOP is z-axis
            View-plane is z=0 plane
    */


    // 1. translate PRP to origin

    // T(-PRP) = [1 0 0 -PRPx; 0 1 0 -PRPy; 0 0 1 -PRPz; 0 0 0 1]

    let T = Vector4(0, 0, 0, 0);
    Mat4x4Translate(T, (-1 * prp.x), (-1 * prp.y), (-1 * prp.z));

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)

    // R = [u1 u2 u3 0; v1 v2 v3 0; n1 n2 n3 0; 0 0 0 1]
    let R = Vector4(0, 0, 0, 0);
    R.values = [[u.x, u.y, u.z, 0],
               [v.x, v.y, v.z, 0],
               [n.x, n.y, n.z, 0],
               [0, 0, 0, 1]];

    // 3. shear such that CW is on the z-axis

    // shxpar = -DOPx / DOPz
    let shxpar = 0;

    // shypar = -DOPy / DOPz
    let shypar = 0;

    // shpar = [1 0 shxpar 0; 0 1 shypar 0; 0 0 1 0; 0 0 0 1]
    let shpar = Vector4(0, 0, 0, 0);
    shpar.values = [[1, 0, shxpar, 0],
                   [0, 1, shypar, 0],
                   [0, 0, 1, 0],
                   [0, 0, 0, 1]];

    // 4. translate near clipping plane to origin

    // tpar = [1 0 0 0; 0 1 0 0; 0 0 1 near; 0 0 0 1]

    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])

    // sparx = 2 / (right - left)
    // spary = 2 / (top - bottom)
    // sparz = 1 / far
    // spar = [sparx 0 0 0; 0 spary 0 0; 0 0 sparz; 0; 0 0 0 1]

    // npar = shpar * tpar * shpar * R * T(-PRP)
    // clip
    // mpar

    // ...
    // let transform = Matrix.multiply([...]);
    // return transform;
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {

    /*
    PRP - projection reference point - position of camera (equivalent to COP)
    SRP - scene reference point - center of scene
    VUP - view up vector
    */

    /*
    VRC calculations
        n: normalized (PRP - SRP)
        u: normalized (VUP X n-axis)
        v: n-axis X u-axis
    */

    let n = prp - srp;
    n = n.normalize();
    let u = vup.cross(n);
    u = u.normalize();
    let v = n.cross(u);

    /*
    Window calculations
        center of window: [(left + right) / 2 , (bottom + top) / 2]
        DOP: CW - PRP
    */

    /*
        Perspective projection:
            PRP at origin
            View-plane parallel to XY-plane
    */

    // 1. translate PRP to origin

    // T(-PRP) = [1 0 0 -PRPx; 0 1 0 -PRPy; 0 0 1 -PRPz; 0 0 0 1]

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)

    // R = [u1 u2 u3 0; v1 v2 v3 0; n1 n2 n3 0; 0 0 0 1]

    // 3. shear such that CW is on the z-axis

    // shxpar = -DOPx / DOPz
    // shypar = -DOPy / DOPz
    // shpar = [1 0 shxpar 0; 0 1 shypar 0; 0 0 1 0; 0 0 0 1]
    
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])

    // sperx = (2 * near) / ((right - left) * far)
    // spery = (2 * near) / ((top - bottom) * far)
    // sperz = 1 / far
    // sper = [sperx 0 0 0; 0 spery 0 0; 0 0 sperz 0; 0 0 0 1]

    // general perspective projection
    // nper = sper * shpar * R * T(-PRP)
    // Clip
    // Mper

    // ...
    // let transform = Matrix.multiply([...]);
    // return transform;
}

// create a 4x4 matrix to project a parallel image on the z=0 plane
function mat4x4MPar() {
    // parallel - ignore z
    // xp = x
    // yp = y
    // zp = 0
    let mpar = new Matrix(4, 4);
    mpar.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 0, 0],
                     [0, 0, 0, 1]];
    return mpar;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    // general perspective projection
    // project to back
    // d = -1
    let mper = new Matrix(4, 4);
    mper.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, -1, 0]];
    return mper;
}



///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function Mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [[1, 0, 0, tx],
                     [0, 1, 0, ty],
                     [0, 0, 1, tz],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the scale matrix
function Mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [[sx, 0, 0, 0],
                     [0, sy, 0, 0],
                     [0, 0, sz, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function Mat4x4RotateX(mat4x4, theta) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, Math.cos(theta), -1 * Math.sin(theta), 0],
                     [0, Math.sin(theta), Math.cos(theta), 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function Mat4x4RotateY(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), 0, Math.sin(theta), 0],
                     [0, 1, 0, 0],
                     [-1 * Math.sin(theta), 0, Math.cos(theta), 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function Mat4x4RotateZ(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), -1 * Math.sin(theta), 0, 0],
                     [Math.sin(theta), Math.cos(theta), 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function Mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = [[1, 0, shx, 0],
                     [0, 1, shy, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}
