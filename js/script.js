window.addEventListener('DOMContentLoaded', init);

function init() {
    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#canvas'),
        alpha: true,
        antialias: true
    });

    renderer.shadowMap.enabled = true
    // ウィンドウサイズ設定
    width = document.getElementById('main_canvas').getBoundingClientRect().width;
    height = document.getElementById('main_canvas').getBoundingClientRect().height;
    renderer.setPixelRatio(1);
    renderer.setSize(width, height);
    console.log(window.devicePixelRatio);
    console.log(width + ", " + height);


    // シーンを作成
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x87B8C0 ); // 背景色

    // カメラを作成
    //camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    //new THREE.OrthographicCamera(左、右、上、下、近く、遠く );
    const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
    
    camera.position.set(200, -100, 500);
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, -200, 0);

    // Load GLTF or GLB
    const loader = new THREE.GLTFLoader();
    const url = 'test.glb';

    //const texture = new THREE.TextureLoader().load('textures/land_ocean_ice_cloud_2048.jpg' );


    // window size
    const w_height = window.innerHeight;

    let model = null;


    let mixer;
    let clock = new THREE.Clock();
    let animations = []
    let actions = []
    let beforenum = 0;

    let texture = new THREE.TextureLoader().load("mikeneko.png")
    texture.flipY = false;

    loader.load(
        url,
        function (gltf) {
            model = gltf.scene;
            animations = gltf.animations;
            // model.name = "model_with_cloth";
            model.scale.set(100.0, 100.0, 100.0);
            model.position.set(0, (w_height / 3 * -1), 0);

            model.traverse((object) => { //モデルの構成要素をforEach的に走査
                if(object.isMesh) { //その構成要素がメッシュだったら
                    parameters = {　//toon materialを使うと簡単にトゥーンレンダリングっぽくなる。オプションは適当に。
                        transparent:true,
                        opacity:1,
                        color: 0xffffff,
                        shininess: 0.1
                    }
                    let newMat = new THREE.MeshToonMaterial(parameters);
                    object.material = newMat
                    // object.material.outlineParameters = {
                    //     thickness: 0.1,
                    //     color: new THREE.Color( 0xff0000 ),
                    //     alpha: 10,
                    //     visible: true,
                    //     keepAlive: true
                    // }
                      

                    object.material.receiveShadow = true;
                    object.material.castShadow = true;

                    object.material.map = texture;

                    
            }
            });

            
            
            scene.add(model);

            

            // model["test"] = 100;

            if(animations && animations.length) {
 
                //Animation Mixerインスタンスを生成
                mixer = new THREE.AnimationMixer(model);
         
                //全てのAnimation Clipに対して
                for (let i = 0; i < animations.length; i++) {
                    let animation = animations[i];
         
                    //Animation Actionを生成
                    actions[i] = mixer.clipAction(animation);
         
                    if (i == 1) {
                        //ループ設定（1回のみ）
                        actions[i].setLoop(THREE.LoopOnce);
                                
                        //アニメーションの最後のフレームでアニメーションが終了
                        actions[i].clampWhenFinished = true;
                    }
                    else {
                            //ループ設定（1回のみ）
                        actions[i].setLoop(THREE.Loop);
            
                        //アニメーションの最後のフレームでアニメーションが終了
                        //actions[i].clampWhenFinished = true;
                    }
                    
         
                    //アニメーションを再生
                }
                
            }
        },
        function (error) {
            console.log('An error happened');
            console.log(error);
        }
    );
    renderer.gammaOutput = true;


    // 平行光源
    const light = new THREE.DirectionalLight(0xFFFFFF);
    light.intensity = 0.8; // 光の強さ
    light.position.set(3, 10, 1);
    // シーンに追加
    scene.add(light);


    //環境光源(アンビエントライト)：すべてを均等に照らす、影のない、全体を明るくするライト
    const ambient = new THREE.AmbientLight(0xf8f8ff, 0.6);
    scene.add(ambient); //シーンにアンビエントライトを追加

    effect = new THREE.OutlineEffect( renderer, { //アウトラインのやつ
        defaultThickness: 0.004,
        defaultColor: [0.1, 0.1, 0.1],
        defaultAlpha: 1,
        //defaultKeepAlive: true
    } );

    // 初回実行
    tick();

    function tick() {

        // if (model != null) {
        //     console.log(model);
        // }
        controls.update();
        effect.render(scene, camera);
        requestAnimationFrame(tick);

        if(mixer){
            mixer.update(clock.getDelta());
        }
    }
    
    function setAction(afternum)  {
        actions[beforenum].fadeOut(1)
        actions[afternum].reset()
        actions[afternum].fadeIn(1)
        actions[afternum].play()
        beforenum = afternum
    }

    document.getElementById("setaction1").addEventListener("click", function() {
        setAction(0);
    }, false)
    document.getElementById("setaction2").addEventListener("click", function() {
        setAction(1);
    }, false)
    document.getElementById("setaction3").addEventListener("click", function() {
        setAction(2);
    }, false)
}



