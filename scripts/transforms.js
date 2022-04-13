/*

3D Projections (to earn a C: 45 pts)

Implement perspective projection for 3D models: 35 pts - DONE
    Transform models into canonical view volume - DONE (Patrick 100%)
        Implement the matrix functions in transforms.js - DONE (Patrick 100%)
    Implement Cohen-Sutherland 3D line clipping - DONE (Patrick 90% and Zack 10%)
    Project onto view plane - DONE (Patrick 100%)
    Draw 2D lines - DONE (Patrick 60% and Zack 40%)
Implement camera movement to change the view of a scene: 10 pts
    A/D keys: translate the PRP and SRP along the u-axis - DONE (Patrick 100%)
    W/S keys: translate the PRP and SRP along the n-axis - DONE (Patrick 100%)

Additional features (to earn a B or A)

Implement parallel projection for 3D models: 5 pts - DONE
Follows same steps as perspective (Patrick and Zack)
    Transform models into canonical view volume - DONE (Patrick 100%)
    Implement Cohen-Sutherland 3D line clipping - DONE (Patrick 60% and Zack 40%)
    Project onto view plane - DONE (Patrick 100%)
    Draw 2D lines - DONE (Zack 100%)
Generate vertices and edges for common models: 5 pts
    Cube: defined by center point, width, height, and depth (1 pt) (Patrick 80% and Zack 20%) - DONE
    Cone: defined by center point of base, radius, height, and number of sides (1 pt) (Patrick 10% and Zack 90%) - DONE
    Cylinder: defined by center point, radius, height, and number of sides (1 pt) (Patrick 75% and Zack 25%) - DONE
    Sphere: defined by center point, radius, number of slices, and number of stacks (2 pts) (Patrick 40% Zack 60%) - DONE
Allow for models to have a rotation animation: 5 pts
    Can be about the x, y, or z axis (Patrick 10% and Zack 90%) - DONE
    Defined in terms of revolutions per second (Zack 100%) - DONE
Left/right arrow keys: rotate SRP around the v-axis with the PRP as the origin: 5 pts (Patrick 85% and Zack 15%) - DONE

*/

// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {
    /*
    PRP - projection reference point - used to calculate DOP
    SRP - scene reference point - center of scene
    VUP - view up vector
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
    let R = new Matrix(4,4);
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
    Mat4x4Translate(Tpar, 0, 0, near);
    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])
    let sperx = 2 / (right - left);
    let spery = 2 / (top - bottom);
    let sperz = (1 / far);
    let scale = new Matrix(4,4);
    Mat4x4Scale(scale, sperx, spery, sperz);

    // npar = shpar * tpar * shpar * R * T(-PRP)
    let transform = Matrix.multiply([scale, Tpar, shpar, R, translate]);
    return transform;
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {

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

    let R = new Matrix(4, 4);
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
    
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    let sperx = (2 * near) / ((right - left) * far);
    let spery = (2 * near) / ((top - bottom) * far);
    let sperz = (1 / far);
    // sper = [sperx 0 0 0; 0 spery 0 0; 0 0 sperz 0; 0 0 0 1]

    let scale = new Matrix(4,4);
    Mat4x4Scale(scale, sperx, spery, sperz);

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
