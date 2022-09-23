let scene = null;
let camera = null;
let controls = null;
let testobj = null;
let testobj2 = null;

let followmode = 0;
let keymode = 0;
let beforekeymode = 0;

window.addEventListener('DOMContentLoaded', threejs);

async function threejs() {
    'use strict';

    let renderer = null;


    let effect = null;

    let model = [];

    let mixer = [];
    let clock = new THREE.Clock();
    let animations = [];
    let actions = [[], []];
    let beforenum = [0, 0];

    let texture = new THREE.TextureLoader().load("mikeneko.png")
    texture.flipY = false;





    function init() {
        // レンダラーを作成
        renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#canvas'),
            alpha: true,
            antialias: true
        });

        renderer.shadowMap.enabled = true;
        // ウィンドウサイズ設定
        let width = document.getElementById('main_canvas').getBoundingClientRect().width;
        let height = document.getElementById('main_canvas').getBoundingClientRect().height;
        renderer.setPixelRatio(1);
        renderer.setSize(width, height);
        console.log(window.devicePixelRatio);
        console.log(width + ", " + height);


        // シーンを作成
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87B8C0); // 背景色

        // カメラを作成
        // camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
        //new THREE.OrthographicCamera(左、右、上、下、近く、遠く );
        camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 12000);

        camera.position.set(0, 200, 0);
        // camera.lookAt(new THREE.Vector3(0, 0, 0))

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target = new THREE.Vector3(0, -100, 1);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        // controls.enableRotate = false;

        // Load GLTF or GLB
        const loader = new THREE.GLTFLoader();
        const url = 'cat.glb';

        //const texture = new THREE.TextureLoader().load('textures/land_ocean_ice_cloud_2048.jpg' );


        // window size
        const w_height = window.innerHeight;



        let num = 0;
        loader.load(url, loadcat);
        loader.load(url, loadcat);
        function loadcat(gltf) {
            console.log(num);
            model[num] = gltf.scene;
            animations = gltf.animations;
            // model.name = "model_with_cloth";
            model[num].scale.set(30.0, 30.0, 30.0);//モデルの大きさ
            model[num].position.set(num * 30, -90, 0);
            //モデルの回転
            // model[num].rotation.y = 600;
            model[num].rotation.x = -150;

            model[num].traverse((object) => { //モデルの構成要素をforEach的に走査
                if (object.isMesh) { //その構成要素がメッシュだったら
                    let parameters = { //toon materialを使うと簡単にトゥーンレンダリングっぽくなる。オプションは適当に。
                        transparent: true,
                        opacity: 1,
                        color: 0xffffff,
                    }
                    let newMat = new THREE.MeshToonMaterial(parameters);
                    object.material = newMat;
                    // object.material.outlineParameters = {
                    //     thickness: 0.1,
                    //     color: new THREE.Color( 0xff0000 ),
                    //     alpha: 1,
                    //     visible: true,
                    //     keepAlive: true
                    // }

                    object.material.receiveShadow = true;
                    object.material.castShadow = true;

                    object.material.map = texture;
                }
            });



            scene.add(model[num]);

            /*テスト用のcube
            var geometry = new THREE.BoxGeometry(12,12,12);
            var material = new THREE.MeshPhongMaterial( { color: '#ffffff' } );
            var cube = new THREE.Mesh( geometry, material );
            cube.position.set(0, 0, 0);
            scene.add( cube );            
            */

            // model["test"] = 100;

            if (animations && animations.length) {
                console.log(num)
                //Animation Mixerインスタンスを生成
                mixer.push(new THREE.AnimationMixer(model[num]));
                console.log(mixer)

                //全てのAnimation Clipに対して
                for (let i = 0; i < animations.length; i++) {
                    let animation = animations[i];

                    //Animation Actionを生成
                    actions[num][i] = mixer[num].clipAction(animation);

                    if (i == 1) {
                        //ループ設定（1回のみ）
                        actions[num][i].setLoop(THREE.LoopOnce);
                        //アニメーションの最後のフレームでアニメーションが終了
                        actions[num][i].clampWhenFinished = true;
                    }
                    else {
                        //ループ設定（1回のみ）
                        actions[num][i].setLoop(THREE.Loop);
                        //アニメーションの最後のフレームでアニメーションが終了
                        //actions[i].clampWhenFinished = true;
                    }
                    //アニメーションを再生
                }
            }
            num++;
        }
        renderer.gammaOutput = true;


        new THREE.TextureLoader().load(
            "background.png",
            //use texture as material Double Side
            texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.offset.x = 90 / (2 * Math.PI);
                texture.repeat.set(18, 16);
                let woodMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                });

                // Add Ground
                let groundMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(10, 10, 32),
                    woodMaterial
                );
                groundMesh.receiveShadow = true;

                //rotate
                groundMesh.rotation.x = Math.PI / 2;
                // groundMesh.scale.set(30.0, 30.0, 30.0);
                groundMesh.scale.set(200.0, 130.0, 30.0);
                groundMesh.position.set(30, -100, 0);
                scene.add(groundMesh);
            }
        );

        new THREE.TextureLoader().load(
            "kotatsu.png",
            //use texture as material Double Side
            texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                //texture.offset.x = 90/(2*Math.PI);
                let woodMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.99,
                });

                // Add Ground
                let groundMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(10, 10, 32),
                    woodMaterial
                );

                //rotate
                groundMesh.rotation.x = Math.PI / 2;
                groundMesh.rotation.y = Math.PI;
                groundMesh.scale.set(30.0, 30.0, 30.0);
                groundMesh.position.set(30, -99, 0);
                scene.add(groundMesh);
            }
        );

        // 平行光源
        const light = new THREE.DirectionalLight(0xFFFFFF);
        light.intensity = 0.4; // 光の強さ
        light.position.set(3, 10, 1);
        // light.castShadow = true;

        // light.shadow.camera.left = -500;
        // light.shadow.camera.right = 500;
        // light.shadow.camera.top = 500;
        // light.shadow.camera.bottom = -500;

        // light.shadow.mapSize.width = 2048;
        // light.shadow.mapSize.height = 2048;
        // シーンに追加
        scene.add(light);
        // let cameraHelper = new THREE.CameraHelper(light.shadow.camera);
        // scene.add(cameraHelper);

        //   renderer.shadowMap.renderReverseSided = false;
        //   renderer.shadowMap.renderSingleSided = false;
        //   light.shadow.bias = -0.0001


        //環境光源(アンビエントライト)：すべてを均等に照らす、影のない、全体を明るくするライト
        const ambient = new THREE.AmbientLight(0xf8f8ff, 0.7);
        scene.add(ambient); //シーンにアンビエントライトを追加

        effect = new THREE.OutlineEffect(renderer, { //アウトラインのやつ
            defaultThickness: 0.004,
            defaultColor: [0.1, 0.1, 0.1],
            defaultAlpha: 1,
            //defaultKeepAlive: true
        });


    }


    init()

    const stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    // 初回実行
    tick();


    function tick() {

        // if (model != null) {
        //     console.log(model);
        // }
        controls.update();
        effect.render(scene, camera);
        requestAnimationFrame(tick);

        TWEEN.update();

        let delta = clock.getDelta();
        userMove(testobj, delta);
        userMove(testobj2, delta);

        // if(mixer[0]){
        //     mixer[0].update(clock.getDelta());
        // }
        if (mixer[0]) {
            mixer[0].update(delta);
        }
        if (mixer[1]) {
            mixer[1].update(delta);
        }
        document.getElementById('info').innerHTML = JSON.stringify(renderer.info.render, '', '    ');

        // フレームレートを表示
        stats.update();
    }


    function setAction(catnum, afternum) {
        actions[catnum][beforenum[catnum]].fadeOut(1)
        actions[catnum][afternum].reset()
        actions[catnum][afternum].fadeIn(1)
        actions[catnum][afternum].play()
        beforenum[catnum] = afternum
    }


    document.getElementById("setaction01").addEventListener("click", function () {
        setAction(0, 0);
    }, false)
    document.getElementById("setaction02").addEventListener("click", function () {
        setAction(0, 1);
    }, false)
    document.getElementById("setaction03").addEventListener("click", function () {
        setAction(0, 2);
    }, false)
    document.getElementById("setaction04").addEventListener("click", function () {
        setAction(0, 3);
    }, false)
    document.getElementById("setaction05").addEventListener("click", function () {
        setAction(0, 4);
    }, false)
    document.getElementById("setaction06").addEventListener("click", function () {
        setAction(0, 5);
    }, false)

    document.getElementById("setaction11").addEventListener("click", function () {
        setAction(1, 0);
    }, false)
    document.getElementById("setaction12").addEventListener("click", function () {
        setAction(1, 1);
    }, false)
    document.getElementById("setaction13").addEventListener("click", function () {
        setAction(1, 2);
    }, false)
    document.getElementById("MoveStart").addEventListener("click", function () {
        new TWEEN.Tween(model[0].position)
            .to(
                {
                    x: 0,
                    // y: -100,
                    z: 400,
                },
                3000
            )
            // .easing(TWEEN.Easing.Sinusoidal.InOut)
            .repeat(Infinity)
            .start()
        // new TWEEN.Tween(model[0].rotation)
        //     .to(
        //         {
        //             // x: 0,
        //             y: 50,
        //             // z: 50,
        //         },
        //         6000
        //     )
        //     // .easing(TWEEN.Easing.Sinusoidal.InOut)
        //     .repeat(Infinity)
        //     .start()
    }, false)
}

function addUser(url) {
    let userMesh;
    new THREE.TextureLoader().load(
        url,
        //use texture as material Double Side
        texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            //texture.offset.x = 90/(2*Math.PI);
            let woodMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
            });

            // Add Ground
            userMesh = new THREE.Mesh(
                new THREE.CircleGeometry(30, 25),
                woodMaterial
            );

            //rotate
            userMesh.rotation.x = Math.PI / 2;
            userMesh.rotation.y = Math.PI;
            userMesh.position.set(30, -50, 0);
            scene.add(userMesh);

            testobj = userMesh;
        }
    );
    new THREE.TextureLoader().load(
        url,
        //use texture as material Double Side
        texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            //texture.offset.x = 90/(2*Math.PI);
            let woodMaterial = new THREE.MeshPhongMaterial({
                color: 0x000000,
            });

            // Add Ground
            userMesh = new THREE.Mesh(
                new THREE.CircleGeometry(32, 26),
                // new THREE.CylinderGeometry(32, 32, 10, 10),
                woodMaterial
            );

            userMesh.castShadow = true;
            userMesh.receiveShadow = true;

            //rotate
            userMesh.rotation.x = Math.PI / 2;
            userMesh.rotation.y = Math.PI;
            userMesh.position.set(30, -60, 0);
            scene.add(userMesh);

            testobj2 = userMesh;
        }
    );
}

let key = {}
function keyDownHandler(e) {
    key[e.code] = true;
} function keyUpHandler(e) {
    key[e.code] = false;
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

document.getElementById('canvas').addEventListener('pointerdown', function (event) {
    followmode = 0;
})
document.getElementById('canvas').addEventListener('touchstart', function (event) {
    followmode = 0;
})

function userMove(obj, frameTime) {
    let speed = 500;
    if (key["KeyW"]) {
        obj.position.z += speed * frameTime;
        keymode = 1;
        followmode = 1;

    }
    if (key["KeyS"]) {
        obj.position.z -= speed * frameTime;
        keymode = 1;
        followmode = 1;

    }
    if (key["KeyA"]) {
        obj.position.x += speed * frameTime;
        keymode = 1;
        followmode = 1;

    }
    if (key["KeyD"]) {
        obj.position.x -= speed * frameTime;
        keymode = 1;
        followmode = 1;
    }
    if (!(key["KeyW"] || key["KeyS"] || key["KeyA"] || key["KeyD"])) {
        keymode = 0;
    }
    tweencamera(obj);
}

const lerp = (x, y, p) => {
    return x + (y - x) * p;
};

function tweencamera(obj) {
    if (keymode != beforekeymode) {
        followmode = 2;
    }
    if (followmode == 2) {
        if (Math.abs(camera.position.x - lerp(camera.position.x, obj.position.x, 0.02)) < 0.05 && Math.abs(camera.position.z - lerp(camera.position.z, obj.position.z, 0.02)) < 0.05) {
            followmode = 0;
        }
    }
    if (followmode >= 1) {
        camera.position.x = lerp(camera.position.x, obj.position.x, 0.02);
        camera.position.z = lerp(camera.position.z, obj.position.z, 0.02);
        controls.target.x = camera.position.x;
        controls.target.z = camera.position.z + 10;
    }





    // if (followmode == 0) {
    //     followmode = 1;

    //     new TWEEN.Tween({
    //         x: camera.position.x,
    //         z: camera.position.z,
    //     })
    //         .to(
    //             obj.position,
    //             1000
    //         )
    //         .onUpdate(function (object) {
    //             camera.position.x = object.x;
    //             camera.position.z = object.z;
    //             controls.target.x = object.x;
    //             controls.target.z = object.z + 10;
    //         })
    //         .onComplete(function () {
    //             followmode = 2;
    //         })
    //         // .easing(TWEEN.Easing.Sinusoidal.InOut)
    //         .start();
    // }
    // else if (followmode == 1) {

    // }
    // else {
    //     camera.position.x = obj.position.x;
    //     camera.position.z = obj.position.z;
    //     controls.target.x = obj.position.x;
    //     controls.target.z = obj.position.z + 10;
    // }



    // if (tweencamstart == false) {
    //     tweencamstart = true;
    //     console.log(tweencamstart)
    //     let testcamerapos = camera.position

    //     let tweenobj = new TWEEN.Tween(camerapos)
    //         .to(
    //             obj.position,
    //             1000
    //         )
    //         .onUpdate(function (object) {
    //             camera.position.x = object.x;
    //             camera.position.z = object.z;
    //             controls.target.x = object.x;
    //             controls.target.z = object.z + 2;
    //         })
    //         .onComplete(function () {
    //             tweencamstart = false
    //             console.log(tweencamstart)
    //         })
    //     // .easing(TWEEN.Easing.Sinusoidal.InOut)
    //     tweenobj.start();
    //     // new TWEEN.Tween(controls.target)
    //     //     .to(
    //     //         {
    //     //             x: obj.position.x,
    //     //             // y: -100,
    //     //             z: obj.position.z +5,
    //     //         },
    //     //         1000
    //     //     )
    //     //     .onComplete(function () {
    //     //         tweencamstart = false
    //     //         console.log(tweencamstart)
    //     //     })
    //     //     .easing(TWEEN.Easing.Sinusoidal.InOut)
    //     //     .start()
    // }
    // else {

    // }
}

function userColor(color) {
    if (userColor == 0) {
        testobj2.material = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
        });
    }
    if (userColor == 1) {
        testobj2.material = new THREE.MeshBasicMaterial({
            color: 0x000000,
        });
    }
}

document.getElementById("fixcamera").addEventListener("click", function () {
    new TWEEN.Tween(camera.position)
        .to(
            {
                x: testobj.position.x,
                // y: -100,
                z: testobj.position.z,
            },
            1000
        )
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .start()
    new TWEEN.Tween(controls.target)
        .to(
            {
                x: testobj.position.x,
                // y: -100,
                z: testobj.position.z + 5,
            },
            1000
        )
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .start()
    // new TWEEN.Tween(camera.position)
    //     .to(
    //         {
    //             x: testobj.position.x,
    //             // y: -100,
    //             z: testobj.position.z,
    //         },
    //         1000
    //     )
    //     .easing(TWEEN.Easing.Sinusoidal.InOut)
    //     .start()
    // new TWEEN.Tween(controls.target)
    //     .to(
    //         {
    //             x: testobj.position.x,
    //             // y: -100,
    //             z: testobj.position.z +5,
    //         },
    //         1000
    //     )
    //     .easing(TWEEN.Easing.Sinusoidal.InOut)
    //     .start()
})