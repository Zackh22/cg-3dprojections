// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {

    // TODO: ZACK - debug / finish parallel projection

    //console.log("IN mat4x4Parallel");
    //console.log(prp);
    //console.log(srp);
    //console.log(vup);
    //console.log(clip);

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

    // clip(left, right, bottom, top, near, far)
    let left = clip[0];
    let right = clip[1];
    let bottom = clip[2];
    let top = clip[3];
    let near = clip[4];
    let far = clip[5];

    // Window calculations
    //     center of window: [(left + right) / 2 , (bottom + top) / 2]
    var cow = new Vector3((left + right) / 2, (bottom + top) / 2, -near);
    //     DOP: CW - PRP, but prp is 0,0,0 in VRC
    var dop = cow;


    // 1. translate PRP to origin

    // T(-PRP) = [1 0 0 -PRPx; 0 1 0 -PRPy; 0 0 1 -PRPz; 0 0 0 1]

    let neg_prp = new Vector3(-1 * prp.x, -1 * prp.y, -1 * prp.z);
    let translate = new Matrix(4, 4);
    mat4x4Identity(translate);
    Mat4x4Translate(translate, neg_prp.x, neg_prp.y, neg_prp.z);

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    // R = [u1 u2 u3 0; v1 v2 v3 0; n1 n2 n3 0; 0 0 0 1]

    // VRC calculations
    //    n: normalized (PRP - SRP)
    //    u: normalized (VUP X n-axis)
    //    v: n-axis X u-axis

    let n = prp.subtract(srp);
    n.normalize();
    let u = vup.cross(n);
    u.normalize();
    let v = n.cross(u);

    let R = Vector4(0, 0, 0, 0);
    R.values = [[u.x, u.y, u.z, 0],
                [v.x, v.y, v.z, 0],
                [n.x, n.y, n.z, 1],
                [0, 0, 0, 1]];

    // 3. shear such that CW is on the z-axis

    // shxpar = -DOPx / DOPz
    let shxpar = -1 * dop.x / dop.z;

    // shypar = -DOPy / DOPz
    let shypar = -1 * dop.y / dop.z;

    // shpar = [1 0 shxpar 0; 0 1 shypar 0; 0 0 1 0; 0 0 0 1]
    let shpar = new Matrix(4, 4);
    mat4x4Identity(shpar);
    Mat4x4ShearXY(shpar, shxpar, shypar);

    // 4. translate near clipping plane to origin

    let Tpar = new Matrix(4, 4);
    Tpar.value = [[1, 0, 0, 0],
                  [0, 1, 0, 0],
                  [0, 0, 1, near],
                  [0, 0, 0, 1]];
    

    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])

    let sperx = 2 / (right - left);
    let spery = 2 / (top - bottom);
    let sperz = (1 / far);
    // sper = [sperx 0 0 0; 0 spery 0 0; 0 0 sperz 0; 0 0 0 1]

    let scale = new Matrix(4,4);
    Mat4x4Scale(scale, sperx, spery, sperz);

    // npar = shpar * tpar * shpar * R * T(-PRP)

    let transform = Matrix.multiply([scale, Tpar, shpar, R, translate]);
    return transform;
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    //console.log("IN FUNCTION mat4x4Perspective");
    //console.log(prp);
    //console.log(srp);
    //console.log(vup);
    //console.log(clip);

    // clip(left, right, bottom, top, near, far)
    let left = clip[0];
    let right = clip[1];
    let bottom = clip[2];
    let top = clip[3];
    let near = clip[4];
    let far = clip[5];

    
    // PRP - projection reference point - position of camera (equivalent to COP)
    // SRP - scene reference point - center of scene
    // VUP - view up vector


    // Window calculations
    //     center of window: [(left + right) / 2 , (bottom + top) / 2]
    var cow = new Vector3((left + right) / 2, (bottom + top) / 2, -near);
    //     DOP: CW - PRP, but prp is 0,0,0 in VRC
    var dop = cow;

    // 1. translate PRP to origin
    //console.log("STEP 1");
    // T(-PRP) = [1 0 0 -PRPx; 0 1 0 -PRPy; 0 0 1 -PRPz; 0 0 0 1]
    //let tprp = Mat4x4Translate(mper, (-1 * prp.x), (-1 * prp.y), (-1 * prp.z));
    let neg_prp = new Vector3(-1 * prp.x, -1 * prp.y, -1 * prp.z);
    let translate = new Matrix(4, 4);
    mat4x4Identity(translate);
    Mat4x4Translate(translate, neg_prp.x, neg_prp.y, neg_prp.z);

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    //console.log("STEP 2");
    // R = [u1 u2 u3 0; v1 v2 v3 0; n1 n2 n3 0; 0 0 0 1]

    // VRC calculations
    //    n: normalized (PRP - SRP)
    //    u: normalized (VUP X n-axis)
    //    v: n-axis X u-axis

    let n = prp.subtract(srp);
    n.normalize();
    let u = vup.cross(n);
    u.normalize();
    let v = n.cross(u);

    let R = new Matrix(4, 4);
    R.values = [[u.x, u.y, u.z, 0],
                [v.x, v.y, v.z, 0],
                [n.x, n.y, n.z, 1],
                [0, 0, 0, 1]];

    // 3. shear such that CW is on the z-axis
    //console.log("STEP 3");
    // shxpar = -DOPx / DOPz
    let shxpar = -1 * dop.x / dop.z;
    // shypar = -DOPy / DOPz
    let shypar = -1 * dop.y / dop.z;
    // shpar = [1 0 shxpar 0; 0 1 shypar 0; 0 0 1 0; 0 0 0 1]
    let shpar = new Matrix(4, 4);
    mat4x4Identity(shpar);
    Mat4x4ShearXY(shpar, shxpar, shypar);
    
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    //console.log("STEP 4");
    let sperx = (2 * near) / ((right - left) * far);
    let spery = (2 * near) / ((top - bottom) * far);
    let sperz = (1 / far);
    // sper = [sperx 0 0 0; 0 spery 0 0; 0 0 sperz 0; 0 0 0 1]

    let scale = new Matrix(4,4);
    Mat4x4Scale(scale, sperx, spery, sperz);

    //console.log("calculate final transform matrix:");
    //console.log(scale);
    //console.log(shpar);
    //console.log(R);
    //console.log(translate);
    let transform = Matrix.multiply([scale, shpar, R, translate]);

    return transform;
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
