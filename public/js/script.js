window.addEventListener('DOMContentLoaded', init);

async function init() {
    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#canvas'),
        alpha: true,
        antialias: true
    });

    renderer.shadowMap.enabled = true;
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
    const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 2000 );
    
    camera.position.set(0, 100, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, -200, 0);

    // Load GLTF or GLB
    const loader = new THREE.GLTFLoader();
    const url = 'test.glb';

    //const texture = new THREE.TextureLoader().load('textures/land_ocean_ice_cloud_2048.jpg' );


    // window size
    const w_height = window.innerHeight;

    let model=[];

    let mixer = [];
    let clock = new THREE.Clock();
    let animations = [];
    let actions = [[], []];
    let beforenum = [0,0];

    let texture = new THREE.TextureLoader().load("mikeneko.png")
    texture.flipY = false;
    num=0;
    console.log(num);
    loader.load(url,loadcat);
    console.log("0完了");
    loader.load(url,loadcat);
    console.log("1完了");
    function loadcat(gltf) {
        console.log(num);
        model[num] = gltf.scene;
        animations = gltf.animations;
        // model.name = "model_with_cloth";
        model[num].scale.set(30.0, 30.0, 30.0);//モデルの大きさ
        model[num].position.set(num*30, -100, 0);
        //モデルの回転
        model[num].rotation.y=600;
        model[num].rotation.x=150;

        model[num].traverse((object) => { //モデルの構成要素をforEach的に走査
            if(object.isMesh) { //その構成要素がメッシュだったら
                parameters = { //toon materialを使うと簡単にトゥーンレンダリングっぽくなる。オプションは適当に。
                    transparent:true,
                    opacity:1,
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

        if(animations && animations.length) {
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
            texture.offset.x = 90/(2*Math.PI);
            texture.repeat.set( 12, 10 );
            var woodMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
            });

            // Add Ground
            groundMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(10, 10, 32),
                woodMaterial
            );

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
          var woodMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.99,
          });

          // Add Ground
          groundMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10, 32),
            woodMaterial
          );

          //rotate
          groundMesh.rotation.x = Math.PI / 2;
          groundMesh.scale.set(30.0, 30.0, 30.0);
          groundMesh.position.set(30, -99, 0);
          scene.add(groundMesh);
        }
    );
    
    new THREE.TextureLoader().load(
        "user.png",
        //use texture as material Double Side
        texture => {
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              //texture.offset.x = 90/(2*Math.PI);
          var woodMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.99,
          });

          // Add Ground
          userMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10, 32),
            woodMaterial
          );

          //rotate
          userMesh.rotation.x = Math.PI / 2;
          userMesh.scale.set(30.0, 30.0, 30.0);
          userMesh.position.set(30, -99, 0);
          scene.add(userMesh);
        }
    );

    // 平行光源
    const light = new THREE.DirectionalLight(0xFFFFFF);
    light.intensity = 0.3; // 光の強さ
    light.position.set(3, 10, 1);
    // シーンに追加
    scene.add(light);


    //環境光源(アンビエントライト)：すべてを均等に照らす、影のない、全体を明るくするライト
    const ambient = new THREE.AmbientLight(0xf8f8ff, 0.7);
    scene.add(ambient); //シーンにアンビエントライトを追加

    effect = new THREE.OutlineEffect( renderer, { //アウトラインのやつ
        defaultThickness: 0.004,
        defaultColor: [0.1, 0.1, 0.1],
        defaultAlpha: 1,
        //defaultKeepAlive: true
    } );

    document.addEventListener('keypress', keypress_ivent);
    function keypress_ivent(e) {
        if(e.key === 'w'){
            //wキーが押された時の処理
            userMesh.rotation.y=600;
            userMesh.translateZ(10);
        }
        if(e.key === 's'){
            //sキーが押された時の処理
            userMesh.rotation.y=0;
            userMesh.translateZ(10);
        }
        if(e.key === 'a'){
            //aキーが押された時の処理
            userMesh.rotation.y=300;
            userMesh.translateZ(10);
        }
        if(e.key === 'd'){
            //dキーが押された時の処理
            userMesh.rotation.y=900;
            userMesh.translateZ(10);
        }
        return false; 
    }

    // 初回実行
    tick();

    function tick() {

        // if (model != null) {
        //     console.log(model);
        // }
        controls.update();
        effect.render(scene, camera);
        requestAnimationFrame(tick);

        delta = clock.getDelta()

        // if(mixer[0]){
        //     mixer[0].update(clock.getDelta());
        // }
        if(mixer[0]){
            mixer[0].update(delta);
        }
        if(mixer[1]){
            mixer[1].update(delta);
        }
    }
    
    function setAction(catnum, afternum)  {
        actions[catnum][beforenum[catnum]].fadeOut(1)
        actions[catnum][afternum].reset()
        actions[catnum][afternum].fadeIn(1)
        actions[catnum][afternum].play()
        beforenum[catnum] = afternum
    }


    document.getElementById("setaction01").addEventListener("click", function() {
        setAction(0,0);
    }, false)
    document.getElementById("setaction02").addEventListener("click", function() {
        setAction(0,1);
    }, false)
    document.getElementById("setaction03").addEventListener("click", function() {
        setAction(0,2);
    }, false)

    document.getElementById("setaction11").addEventListener("click", function() {
        setAction(1,0);
    }, false)
    document.getElementById("setaction12").addEventListener("click", function() {
        setAction(1,1);
    }, false)
    document.getElementById("setaction13").addEventListener("click", function() {
        setAction(1,2);
    }, false)
}