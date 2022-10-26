/*
 * robot.js
 * 
 * Tarea 3 GPC.
 * 
 * @autor: Joaquin Farias
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from '../lib/OrbitControls.module.js';
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables estandar
let renderer, scene, camera, cameraControl, minicamera;
var L = 55;
var ar = window.innerWidth / window.innerHeight;

var cilindro, cilindro2, cilindro3, cilindro4;
var rectangulo, rectangulo1, rectangulo2, rectangulo3, rectangulo4;
var esfera, pinza1, pinza2, garra1, garra2, floor;
var pinza, robot, arm, forearm, baseRobot, pinza1_1, pinza1_2;
var pivotPoint1, pivotPoint2;
var gui, sub;
var upPressed = false;
var downPressed = false;
var leftPressed = false;
var rightPressed = false;

// Acciones
init();
loadScene();
startGUI();
render();

function init()
{
     // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;
    document.getElementById('container').appendChild( renderer.domElement );

    // Instanciar el nodo raiz de la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);

    // Instanciar la camara con orbir controls
    camera = new THREE.PerspectiveCamera( 75, ar, 0.1, 2000 );
    camera.position.set(0.5, 500, 500);
    camera.lookAt(0,0,0);

    cameraControl = new OrbitControls(camera, renderer.domElement);
    cameraControl.target.set(0,0,0);
    cameraControl.noKeys = true;
    cameraControl.minDistance = 50;
    cameraControl.maxDistance = 900;

    // Camaras ortograficas
    if (ar < 1) {
        minicamera = new THREE.OrthographicCamera(-L * ar, L * ar, L, -L, 10, 1000);
    } else {
        minicamera = new THREE.OrthographicCamera(-L, L, L * ar, -L * ar, 10, 1000);
    }
    minicamera.position.set(0, L * 5.5, 0);
    minicamera.up = new THREE.Vector3(-1,0,0);
    minicamera.lookAt(0, 0, 0);

    camera.add(minicamera);
    scene.add(minicamera)
    scene.add(camera);

    //Luces
    var luzAmbiente = new THREE.AmbientLight(0x222222);
    scene.add(luzAmbiente);
    
    var luzDireccional = new THREE.DirectionalLight('green', 0.5);
    luzDireccional.position.set(-1,1,-1);
    scene.add(luzDireccional);

    var luzFocal = new THREE.SpotLight('white', 0.6);
    luzFocal.position.set(250, 500, 250);
    luzFocal.target.position.set(400,1600,400);
    luzFocal.angle = Math.PI/4;
    luzFocal.penumbra = 1;
    luzFocal.shadow.camera.near = 100;
    luzFocal.shadow.camera.far = 2500;
    luzFocal.shadow.camera.fov = 60;
    luzFocal.castShadow = true;
    scene.add(luzFocal);
    // scene.add(new THREE.CameraHelper(luzFocal.shadow.camera));

    // Eventos
    window.addEventListener('resize', updateAspectRatio);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
}

function loadScene()
{
    // Cargar la escena con objetos
    // const material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
    // const material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});

    // texturas
    var path = "images/";
    var texSuelo = new THREE.TextureLoader().load(path + "piso_metal.jpg");
    var matSuelo = new THREE.MeshLambertMaterial({color:'white', map:texSuelo, side:THREE.DoubleSide, wireframe:false});
    var paredes = [path + "posx.jpg", path + "negx.jpg", path + "posy.jpg", path + "negy.jpg", path + "posz.jpg", path + "negz.jpg"];
    var mapaEntorno = new THREE.CubeTextureLoader().load(paredes);
    var texRobot = new THREE.TextureLoader().load(path + "robot.jpg");
    var matEsfera = new THREE.MeshPhongMaterial({color:'white', specular:0x99BBFF,shininess:50, envMap: mapaEntorno, side:THREE.DoubleSide, wireframe:false});
    var matRobot = new THREE.MeshLambertMaterial({color:'white', wireframe: false, side: THREE.DoubleSide, map: texRobot});
    var texPinza = new THREE.TextureLoader().load(path + "opalo.jpg");
    var matPinza = new THREE.MeshPhongMaterial({color:'white', wireframe: false, side: THREE.DoubleSide, map: texPinza});
    
    // crear suelo de 1000x1000
    var geometry_floor = new THREE.PlaneGeometry(1000,1000,100,100);
    floor = new THREE.Mesh(geometry_floor, matSuelo);
    floor.rotation.x = -Math.PI/2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    floor.castShadow = true;
    scene.add(floor);
    
    // crea un cilindro
    var geometry = new THREE.CylinderGeometry(50,50,18,32);
    cilindro = new THREE.Mesh(geometry, matPinza);
    cilindro.position.y = 18/2;
    cilindro.receiveShadow = true;
    cilindro.castShadow = true;
    // scene.add(cilindro);   

    // crea cilindro rotado 
    var geometry = new THREE.CylinderGeometry(20,20,15,32);
    cilindro2 = new THREE.Mesh(geometry, matRobot);
    cilindro2.rotation.x = Math.PI/2;
    cilindro2.position.y = 18/2 + 15/2;
    cilindro2.position.z = 0;
    cilindro2.receiveShadow = true;
    cilindro2.castShadow = true;
    // scene.add(cilindro2);

    // crea rectangulo sobre cilindro rotado
    var geometry = new THREE.BoxGeometry(18,120,12);
    rectangulo = new THREE.Mesh(geometry, matRobot);
    rectangulo.position.y = 18/2 + 15/2 + 120/2;
    rectangulo.position.z = 0;
    rectangulo.receiveShadow = true;
    rectangulo.castShadow = true;
    // scene.add(rectangulo);

    // crea esfera sobre rectangulo
    var geometry = new THREE.SphereGeometry(20,32,32);
    esfera = new THREE.Mesh(geometry, matEsfera);
    esfera.position.y = 18/2 + 15/2 + 120 + 10;
    esfera.position.z = 0;
    esfera.receiveShadow = true;
    esfera.castShadow = true;
    // scene.add(esfera);

    // crea cilindro dentro de la esfera
    var geometry = new THREE.CylinderGeometry(22,22,6,32);
    cilindro3 = new THREE.Mesh(geometry, matRobot);
    cilindro3.position.y = 18/2 + 15/2 + 120 + 10;
    cilindro3.position.z = 0;
    cilindro3.receiveShadow = true;
    cilindro3.castShadow = true;
    // scene.add(cilindro3);

    // crea 4 rectangulos sobre cilindro dentro de la esfera
    var geometry = new THREE.BoxGeometry(4,80,4);
    rectangulo1 = new THREE.Mesh(geometry, matRobot);
    rectangulo1.position.y = 18/2 + 15/2 + 120 + 10 + 80/2;
    rectangulo1.position.z = 10;
    rectangulo1.position.x = 10;
    rectangulo1.receiveShadow = true;
    rectangulo1.castShadow = true;
    // scene.add(rectangulo1);

    rectangulo2 = new THREE.Mesh(geometry, matRobot);
    rectangulo2.position.y = 18/2 + 15/2 + 120 + 10 + 80/2;
    rectangulo2.position.z = -10;
    rectangulo2.position.x = 10;
    rectangulo2.receiveShadow = true;
    rectangulo2.castShadow = true;
    // scene.add(rectangulo2);

    rectangulo3 = new THREE.Mesh(geometry, matRobot);
    rectangulo3.position.y = 18/2 + 15/2 + 120 + 10 + 80/2;
    rectangulo3.position.z = 10;
    rectangulo3.position.x = -10;
    rectangulo3.receiveShadow = true;
    rectangulo3.castShadow = true;
    // scene.add(rectangulo3);

    rectangulo4 = new THREE.Mesh(geometry, matRobot);
    rectangulo4.position.y = 18/2 + 15/2 + 120 + 10 + 80/2;
    rectangulo4.position.z = -10;
    rectangulo4.position.x = -10;
    rectangulo4.receiveShadow = true;
    rectangulo4.castShadow = true;
    // scene.add(rectangulo4);

    // crea cilindro sobre rectangulos
    var geometry = new THREE.CylinderGeometry(15,15,40,32);
    cilindro4 = new THREE.Mesh(geometry, matRobot);
    cilindro4.rotation.x = Math.PI/2;
    cilindro4.position.y = 18/2 + 15/2 + 120 + 10 + 80 + 15/2;
    cilindro4.position.z = 0;
    cilindro4.position.x = 0;
    cilindro4.receiveShadow = true;
    cilindro4.castShadow = true;
    // scene.add(cilindro4);

    // crea dos pinzas sobre cilindro
    var geometry = new THREE.BoxGeometry(20,19,2);
    const pinzas_y = 18/2 + 15/2 + 120 + 10 + 80 + 15/2;
    const pinzas_z = 14/2;
    const pinzas_x = 10;
    pinza1 = new THREE.Mesh(geometry, matPinza);
    pinza1.position.y = pinzas_y;
    pinza1.position.z = pinzas_z;
    pinza1.position.x = pinzas_x;
    pinza1.receiveShadow = true;
    pinza1.castShadow = true;
    // scene.add(pinza1);

    pinza2 = new THREE.Mesh(geometry, matPinza);
    pinza2.position.y = pinzas_y;
    pinza2.position.z = -pinzas_z;
    pinza2.position.x = pinzas_x;
    pinza2.receiveShadow = true;
    pinza2.castShadow = true;
    // scene.add(pinza2);

    // crea cuadrado sobre pinzas con buffergeometry
    var geometry = new THREE.BufferGeometry();
    // vertices de un cuadrado
    var vertice1 = new THREE.Vector3(10,1,9);
    var vertice2 = new THREE.Vector3(18,1,5);
    
    var vertices = new Float32Array( [
        // izquierda
        -vertice1.x, -vertice1.y, vertice1.z, // 0
        vertice2.x, -vertice2.y, vertice2.z, // 1
        vertice2.x, -vertice2.y, -vertice2.z, // 2

        vertice2.x, -vertice2.y, -vertice2.z, // 2
        -vertice1.x, -vertice1.y, -vertice1.z-1, // 3
        -vertice1.x, -vertice1.y, vertice1.z, // 0

        // atras
        -vertice1.x, -vertice1.y, vertice1.z, // 0
        -vertice1.x, -vertice1.y, -vertice1.z-1, // 3
        -vertice1.x, vertice1.y, vertice1.z, // 4

        -vertice1.x, vertice1.y, vertice1.z, // 4
        -vertice1.x, -vertice1.y, -vertice1.z-1, // 3
        -vertice1.x, vertice1.y, -vertice1.z-1, // 7

        // abajo 
        -vertice1.x, -vertice1.y, vertice1.z, // 0
        -vertice1.x, vertice1.y, vertice1.z, // 4
        vertice2.x, -vertice2.y, vertice2.z, // 1

        vertice2.x, vertice2.y, vertice2.z, // 5
        vertice2.x, -vertice2.y, vertice2.z, // 1
        -vertice1.x, vertice1.y, vertice1.z, // 4

        // derecha
        -vertice1.x, vertice1.y, vertice1.z, // 4 
        vertice2.x, vertice2.y, vertice2.z, // 5
        -vertice1.x, vertice1.y, -vertice1.z-1, // 7

        vertice2.x, vertice2.y, -vertice2.z, // 6
        -vertice1.x, vertice1.y, -vertice1.z-1, // 7
        vertice2.x, vertice2.y, vertice2.z, // 5

        // arriba
        -vertice1.x, -vertice1.y, -vertice1.z, // 3
        -vertice1.x, vertice1.y, -vertice1.z-1,  // 7
        vertice2.x, -vertice2.y, -vertice2.z,  // 2

        vertice2.x, vertice2.y, -vertice2.z, // 6
        vertice2.x, -vertice2.y, -vertice2.z, // 2
        -vertice1.x, vertice1.y, -vertice1.z-1,  // 7

        // adelante
        vertice2.x, -vertice2.y, vertice2.z, // 1
        vertice2.x, -vertice2.y, -vertice2.z, // 2
        vertice2.x, vertice2.y, vertice2.z, // 5

        vertice2.x, vertice2.y, -vertice2.z, // 6
        vertice2.x, vertice2.y, vertice2.z, // 5
        vertice2.x, -vertice2.y, -vertice2.z, // 2
    ] );
    // normales de vertices
    var indices= [
        0,1,4, 4,5,0, 1,10,7, 7,4,1, 6,7,10, 10,11,6, 6,11,0, 0,5,6, 7,6,5, 5,4,7, 0,1,10, 10,11,0,
        1,2,3, 3,4,1, 2,9,8, 8,3,2, 7,8,9, 9,10,7, 8,7,4, 4,3,8, 2,1,10, 10,9,2
    ];

    geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ) );
    // geometry.setIndex(indices);
    geometry.computeVertexNormals();

    garra1 = new THREE.Mesh(geometry, matPinza);
    garra1.position.y = pinzas_y + 19/2 - 10;
    garra1.position.z = pinzas_z;
    garra1.position.x = pinzas_x + 20;
    garra1.rotation.x = Math.PI/2;
    garra1.receiveShadow = true;
    garra1.castShadow = true;
    // scene.add(garra1);

    garra2 = new THREE.Mesh(geometry, matPinza);
    garra2.position.y = pinzas_y + 19/2 - 10;
    garra2.position.z = -pinzas_z;
    garra2.position.x = pinzas_x + 20;
    garra2.rotation.x = Math.PI/2;
    garra2.receiveShadow = true;
    garra2.castShadow = true;
    // scene.add(garra2);
    
    robot = new THREE.Object3D();

    pivotPoint1 = new THREE.Object3D();
    pivotPoint1.position.set(0,230,0);
    pivotPoint1.castShadow = true;
    pivotPoint1.receiveShadow = true;
    scene.add( pivotPoint1 );
    
    pinza = new THREE.Object3D();
    pinza.add(cilindro4);
    pinza1_1 = new THREE.Object3D();
    pinza1_1.add(pinza1);
    pinza1_1.add(garra1);
    pinza1_2 = new THREE.Object3D();
    pinza1_2.add(pinza2);
    pinza1_2.add(garra2);
    pinza.add(cilindro4);
    pinza.add(pinza1_1);
    pinza.add(pinza1_2);
    pinza.receiveShadow = true;
    pinza.castShadow = true;

    pivotPoint1.add(pinza);
    pinza.position.set(0,-235,0);
    
    pivotPoint2 = new THREE.Object3D();
    pivotPoint2.position.set(0,130,0);
    pivotPoint2.castShadow = true;
    pivotPoint2.receiveShadow = true;
    scene.add( pivotPoint2 );

    forearm = new THREE.Object3D();
    forearm.add(pivotPoint1)
    forearm.add(cilindro3)
    forearm.add(esfera);
    forearm.add(rectangulo1);
    forearm.add(rectangulo2);
    forearm.add(rectangulo3);
    forearm.add(rectangulo4);

    pivotPoint2.add(forearm);
    forearm.receiveShadow = true;
    forearm.castShadow = true;
    forearm.position.set(0,-145,0);
    
    arm = new THREE.Object3D();
    arm.add(rectangulo);
    arm.add(pivotPoint2);
    
    baseRobot = new THREE.Object3D();
    baseRobot.receiveShadow = true;
    baseRobot.castShadow = true;
    baseRobot.add(arm);
    baseRobot.add(cilindro);
    baseRobot.add(cilindro2);

    robot.add(baseRobot);
    robot.receiveShadow = true;
    robot.castShadow = true;
    scene.add(robot);

    // crear material para fondo
    var paredes = [];
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"posx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"negx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"posy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"negy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"posz.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"negz.jpg")}) );
    var materialArray = paredes;
    var skyboxGeo = new THREE.BoxGeometry( 1000, 1000, 1000 );
    var skybox = new THREE.Mesh( skyboxGeo, materialArray );
    scene.add( skybox );
}

function startGUI(){
    //Construye la interfaz de usuario
    var effectControl = {
        rotateBase: baseRobot.rotation.y * 180/Math.PI,
        rotatearm: arm.rotation.z * 180/Math.PI,
        rotateforearmY: forearm.rotation.y * 180/Math.PI,
        rotateforearmZ: forearm.rotation.z * 180/Math.PI,
        rotatePinza: pinza.rotation.y * 180/Math.PI,
        movPinzas: 0,
        alambres: false,
        startAnimation: animate,
    };
    
    gui = new GUI({autoPlace: true, width: 500});

    sub = gui.addFolder("Robot Controls");
    sub.add(effectControl, "rotateBase", -180.0, 180.0).name("Rotate Base").onChange(function(value){
      baseRobot.rotation.y = effectControl.rotateBase * (Math.PI/180);
    });
    sub.add(effectControl, "rotatearm", -45.0, 45.0).name("Rotate arm").onChange(function(value){
      arm.rotation.z = effectControl.rotatearm * (Math.PI/180);
    });
    sub.add(effectControl, "rotateforearmY", -180.0, 180.0).name("Rotate forearm eje Y").onChange(function(value){
      forearm.rotation.y = effectControl.rotateforearmY * (Math.PI/180);
    });
    sub.add(effectControl, "rotateforearmZ", -90.0, 90.0).name("Rotate forearm eje Z").onChange(function(value){
      pivotPoint2.rotation.z = effectControl.rotateforearmZ * (Math.PI/180);
    });
    sub.add(effectControl, "rotatePinza", -40.0, 220.0).name("Rotate Pinza").onChange(function(value){
      pivotPoint1.rotation.z = effectControl.rotatePinza * (Math.PI/180);
    });
    sub.add(effectControl, "movPinzas", 0, 15.0, 0.5).name("Open and close Pinzas").onChange(function(value){
        pinza1_1.position.z = -2 + effectControl.movPinzas;
        pinza1_2.position.z = 2 - effectControl.movPinzas;
    });
    sub.add(effectControl, "alambres").name("Wireframe").onChange(function(value){
        if (effectControl.alambres){
            cilindro.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            cilindro2.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            cilindro3.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            cilindro4.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            esfera.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            rectangulo.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            rectangulo1.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            rectangulo2.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            rectangulo3.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            rectangulo4.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            pinza1.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            pinza2.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            garra1.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            garra2.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
            floor.material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
        } else {
            cilindro.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
            cilindro2.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
            cilindro3.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
            cilindro4.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
            esfera.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
            rectangulo.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
            rectangulo1.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
            rectangulo2.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
            rectangulo3.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
            rectangulo4.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false}); 
            pinza1.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
            pinza2.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
            garra1.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false, side: THREE.DoubleSide});
            garra2.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false, side: THREE.DoubleSide});
            floor.material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
        }
    });
    sub.add(effectControl, "startAnimation").name("Start Animation")
}

function animate(){

    var tween0 = new TWEEN.Tween(baseRobot.rotation).
    to({y: -1.0}, 1000).interpolation( TWEEN.Interpolation.Linear ).
    easing(TWEEN.Easing.Linear.None).delay(4).start();

    var tween1 = new TWEEN.Tween(arm.rotation).
    to({z: -0.8}, 2000).
    easing(TWEEN.Easing.Linear.None).delay(4).start();

    var tween3 = new TWEEN.Tween(pivotPoint2.rotation).
    to({z: -0.5}, 3000).
    easing(TWEEN.Easing.Linear.None).delay(4).start();

    var tween5 = new TWEEN.Tween(pinza1_1.position).
    to({z: -5.0}, 4000).
    easing(TWEEN.Easing.Linear.None).delay(4).start();

    var tween6 = new TWEEN.Tween(pinza1_2.position).
    to({z: 5.0}, 4000).
    easing(TWEEN.Easing.Linear.None).delay(4).start();
    
}

function updateAspectRatio() {
    // Update camera's aspectRatio

    // Adjust canvas size
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Perspective camera
    camera.aspect = ar;

    // Perspective mini camera
    var insetWidth = window.innerWidth / 4;
    var insetHeight = window.innerHeight / 4;
    minicamera.aspect = insetWidth / insetHeight;

    camera.updateProjectionMatrix();
    minicamera.updateProjectionMatrix();
}

function keyDown(event) {
    // Detect x-axis movement
    if (event.keyCode == 37 || event.keyCode == 65) {
        upPressed = true;
    }
    else if (event.keyCode == 39 || event.keyCode == 68) {
        downPressed = true;
    }
    // Detect z-axis movement
    if (event.keyCode == 38 || event.keyCode == 65) {
        leftPressed = true;
    }
    else if (event.keyCode == 40 || event.keyCode == 65) {
        rightPressed = true;
    }
}

function keyUp(event) {
    // Detect x-axis movement
    if (event.keyCode == 37 || event.keyCode == 65) {
        upPressed = false;
    }
    if (event.keyCode == 39 || event.keyCode == 68) {
        downPressed = false;
    }
    // Detect z-axis movement
    if (event.keyCode == 38 || event.keyCode == 65) {
        leftPressed = false;
    }
    if (event.keyCode == 40 || event.keyCode == 65) {
        rightPressed = false;
    }
}

function update() {
    if (leftPressed) {
        if (robot.position.z - 5 > -500) {
            console.log("Moving left " + robot.position.z);
            robot.position.z -= 5;
        }
    }
    if (rightPressed)  {
        if (robot.position.z + 5 < 500) {
            robot.position.z += 5;
        }
    }
    if (upPressed)  {
        if (robot.position.x - 5 > -500) {
            robot.position.x -= 5;
        }
    }
    if (downPressed) {
        if (robot.position.x + 5 < 500) {
            robot.position.x += 5;
        }
    }

    TWEEN.update();

	// Control de camra
    cameraControl.update();
}

function render(){
    requestAnimationFrame (render);
    update();

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    renderer.clearDepth();

    var aspectRatio = window.innerWidth / window.innerHeight;
    var side;
    if (aspectRatio > 1) {
        side = window.innerHeight / 4;
    } else {
        side = window.innerWidth / 4;
    }
    renderer.setScissorTest(true);
    renderer.setViewport(0, window.innerHeight-side, side, side);
    renderer.setScissor(0, window.innerHeight-side, side, side);
    renderer.render(scene, minicamera);
    renderer.setScissorTest(false);
}
