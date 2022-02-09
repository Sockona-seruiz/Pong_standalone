import * as THREE from 'three';

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import TextSprite from "@seregpie/three.text-sprite";

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';

import { init_score } from "./score_init";
import { updateScore } from "./score";
import { init_paddles } from "./paddles_init";
import { init_ball } from "./ball_init";
import { init_arena } from "./arena_init";
import { init_audio } from "./audio_init";
import { updateCurrentSong } from './audio_init';
import { init_plane } from "./plane_init";
import { moveSun } from "./update_sun";
import { updateAudioVisualizer } from "./update_audio";
import { updateplane } from "./update_plane";
import { launchFirework } from "./fireworks";

import * as io from "socket.io-client";

console.log("Script is running");

let socket: any;

socket = io.connect("http://localhost:3000", { withCredentials: true });

socket.on("connect", () => {
  console.log("Successfully connected to the newsocket game ");
  //Waiting for another player to connect (enter matchmaking)
});

socket.on("disconnect", () => {
  console.log("Disconnected to newsocket game ");
});

// var token = localStorage.getItem("token");

const GameMode = localStorage.getItem("mode");
let UserId = localStorage.getItem("id");
const DuelId = localStorage.getItem("duel");
const username = localStorage.getItem("username");
console.log("mode : " + GameMode + " id : " + UserId + " duel : " + DuelId);

const user_to_watch = localStorage.getItem("user");
console.log(user_to_watch);

if (user_to_watch != null) UserId = localStorage.getItem("spect");

let buttons;
let default_buttons = {
	GameMode: 'Normal Game',
	SongToogle: true,
	Song: 'Zed Ignite',
	LaunchGame: false,
}

setupGui();

function setupGui() {

	buttons = {
		GameMode: 'Normal Game',
		SongToogle: true,
		Song: 'Zed Ignite',
		LaunchGame: false,
	};

	const gui = new GUI();
	gui.add( buttons, 'GameMode', [ 'Normal Game', 'Bonus Game' ] ).name( 'Game Mode' ).onChange( console.log("Gamemode") );
	gui.add( buttons, 'SongToogle' ).name( 'Toogle song' ).onChange( console.log("Song " + buttons.SongToogle) );
	gui.add( buttons, 'Song', ['Zed Ignite', 'Ennemi'] ).name('Select Song' ).onChange( console.log("Change sont to : " + buttons.song) );
	gui.add( buttons, 'LaunchGame' ).name( 'Launch Matchmaking' ).onChange( console.log("Launch Game") );

}



var config = {
  arena_w: 100,
  arena_w_2: 0,
  arena_h: 50,
  arena_h_2: 0,
  arena_size: 0,

  paddle_w: 1,
  paddle_h: 10,
  paddle_h_2: 0,
};

// if (GameMode == "1") //aka bonus game
// {
// 	config.arena_w = 110;
// 	config.paddle_h = 8;
// 	config.arena_h = 45;
// }

socket.on("test", (i: number) => {
  console.log("front sucesfully called");
});

// socket.on("change_mode", (i: number) =>
// {
// 	config.arena_w = 110;
// 	config.paddle_h = 8;
// 	config.arena_h = 45;

// 	arena_s.top.remove();
// 	arena_s.bot.remove();
// });

config.paddle_h_2 = config.paddle_h / 2;
config.arena_h_2 = config.arena_h / 2;
config.arena_w_2 = config.arena_w / 2;

var canResetCam = false;

//Camera =====
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 30;
camera.position.y = 43;
camera.rotation.x = -0.86;

//Render =====
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.001);

//PostProcessing =====
const BLOOM_SCENE: number = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const params = {
  exposure: 1,
  bloomStrength: 2,
  bloomThreshold: 0,
  bloomRadius: 0,
  scene: "Scene with Glow",
};

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild(renderer.domElement);

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const finalPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture },
    },
    vertexShader: `			varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,
    fragmentShader: `			uniform sampler2D baseTexture;
		uniform sampler2D bloomTexture;
		varying vec2 vUv;
		void main() {
			gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
		}`,
    defines: {},
  }),
  "baseTexture"
);

finalPass.needsSwap = true;
const width = window.innerWidth;
const height = window.innerHeight;
bloomComposer.setSize(width / 2, height / 2);

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(finalPass);

//Orbit Control =====
const controls_mouse = new OrbitControls(camera, renderer.domElement);
controls_mouse.maxPolarAngle = Math.PI * 0.5;
controls_mouse.minDistance = 1;
controls_mouse.maxDistance = 1000;
//End of Orbit Control

//Window Resize =====
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (height > width) {
    camera.fov = 75 * (height / width);
    camera.aspect = 1;
  } else {
    camera.fov = 75;
    camera.aspect = width / height;
  }
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

  bloomComposer.setSize(width / 2, height / 2);
  finalComposer.setSize(width, height);
};

//Var Setup =====
var PI_s = {
  M_PI: Math.PI,
  M_2PI: 2 * Math.PI,
  M_PI_2: Math.PI / 2,
  M_3PI_2: 3 * (Math.PI / 2),
};

var Leftcol = 0x0ae0ff;
var Rightcol = 0xff13a5;

var audio_s = init_audio(scene, BLOOM_SCENE, config);

//Sun =====
var IncreaseBrightness: boolean = true;
var SunMesh: THREE.Group;
var gltfloader = new GLTFLoader().setPath("models/");

gltfloader.load("SunNew.gltf", function (gltf: any) {
  gltf.scene.traverse(function (child: any) {
    if (child instanceof THREE.Mesh) {
      child.material.emissiveIntensity = 0.3;
    }
  });
  SunMesh = gltf.scene;
  SunMesh.position.set(0, 11, -config.arena_h_2 - 3)
  scene.add(gltf.scene);
});

//Init fcts============================
var plane_s = init_plane(scene);

var score_s = init_score(scene, config);
updateScore(score_s);

let paddles_s = init_paddles(scene, Leftcol, Rightcol, BLOOM_SCENE, config);
let arena_s = init_arena(scene, BLOOM_SCENE, config);
let ball_s = init_ball(scene, BLOOM_SCENE);

//Keys =====
let controls = {
  UpArrow: false,
  DownArrow: false,
  Wkey: false,
  Skey: false,
};

const onKeyDown = function (event: any) {
  switch (event.code) {
    case "KeyW": {
      if (controls.Wkey == false) {
        if (controls.Skey == false) socket.emit("up_paddle");
        else socket.emit("stop_paddle");

        controls.Wkey = true;
      }
      break;
    }
    case "KeyS": {
      if (controls.Skey == false) {
        if (controls.Wkey == false) socket.emit("down_paddle");
        else socket.emit("stop_paddle");
        controls.Skey = true;
      }
      break;
    }
    case "ArrowUp":
      controls.UpArrow = true;
      break;
    case "ArrowDown":
      controls.DownArrow = true;
      break;
    case "Space":
      if (canResetCam == true) {
        controls_mouse.reset();
        camera.rotation.x = -0.86;
        controls_mouse.update();
      }
      canResetCam = false;
      break;
  }
};

const onKeyUp = function (event: any) {
  switch (event.code) {
    case "KeyW": {
      if (controls.Skey == false) socket.emit("stop_paddle");
      else socket.emit("down_paddle");
      controls.Wkey = false;
      break;
    }
    case "KeyS": {
      if (controls.Wkey == false) socket.emit("stop_paddle");
      else socket.emit("up_paddle");
      controls.Skey = false;
      break;
    }
    case "ArrowUp":
      controls.UpArrow = false;
      break;
    case "ArrowDown":
      controls.DownArrow = false;
      break;
  }
};

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

//Stars
const vertices = [];

for (let i = 0; i < 1000; i++) {
  const x = THREE.MathUtils.randFloatSpread(500);
  const y = THREE.MathUtils.randFloatSpread(500);
  const z = THREE.MathUtils.randFloatSpread(500);

  if (
    x < config.arena_w_2 + 10 &&
    x > -config.arena_w_2 - 10 &&
    y > -10 &&
    y < 60 &&
    z < config.arena_h_2 + 10 &&
    z > -config.arena_h_2 - 10
  )
    i--;
  else vertices.push(x, y, z);
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);

const material = new THREE.PointsMaterial({ color: 0x888888 });

const points = new THREE.Points(geometry, material);

scene.add(points);

// var Leftcol = 0x0ae0ff;
// var Rightcol = 0xff13a5;

//=========================User names
var vs_text = new TextSprite({
  text: "VS",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 5,
  color: "#ffffff",
});
vs_text.position.set(0, -5, 29);
scene.add(vs_text);

socket.emit("launch_game", {
  spec: user_to_watch,
  mode: GameMode,
  login: UserId,
  username: username,
  duel: DuelId,
  plx: -(config.arena_w / 2 - 5),
  prx: config.arena_w / 2 - 5,
  ph_2: config.paddle_h_2,
  at: -config.arena_h_2 + 1,
  ab: config.arena_h_2 - 1,
  al: -config.arena_w_2 + 1,
  ar: config.arena_w_2 - 1,
});

// Right_user.text = "";

socket.on("update_usernames", (names: any) => {
  let Left_user = new TextSprite({
    text: names.left_user,
    alignment: "left",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 5,
    color: "#61e8fa",
  });
  Left_user.position.set(-40, -5, 29);
  scene.add(Left_user);

  let Right_user = new TextSprite({
    text: names.right_user,
    alignment: "right",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 5,
    color: "#fc53bc",
  });
  Right_user.position.set(40, -5, 29);
  scene.add(Right_user);
});

socket.on("change_ball_color", (i: number) => {
  ball_s.after_reset = 0;
  if (i == 0) {
    (ball_s.trainee_msh[0] as any).material = ball_s.trainee_cmat;
    ball_s.trainee_wmat.color.setHex(paddles_s.left_col);
    (ball_s.trainee_msh[0] as any).material.color.setHex(paddles_s.left_col);
    ball_s.ball_outline.material.color.setHex(paddles_s.left_col);
    ball_s.light.color.setHex(paddles_s.left_col);
  } else {
    (ball_s.trainee_msh[0] as any).material = ball_s.trainee_cmat;
    ball_s.trainee_wmat.color.setHex(paddles_s.right_col);
    (ball_s.trainee_msh[0] as any).material.color.setHex(paddles_s.right_col);
    ball_s.ball_outline.material.color.setHex(paddles_s.right_col);
    ball_s.light.color.setHex(paddles_s.right_col);
  }
});

socket.on("update_positions", (positions: any) => {
  //Ball
  // console.log(positions.bpz + " test");
  ball_s.ball.position.x = positions.bpx;
  ball_s.ball.position.z = positions.bpz;
  ball_s.ball_outline.position.x = ball_s.ball.position.x;
  ball_s.ball_outline.position.z = ball_s.ball.position.z;
  ball_s.light.position.x = ball_s.ball.position.x;
  ball_s.light.position.z = ball_s.ball.position.z;

  //Paddles
  paddles_s.bar_right.position.z = positions.rpz;
  paddles_s.bar_right_out.position.z = paddles_s.bar_right.position.z;
  paddles_s.bar_left.position.z = positions.lpz;
  paddles_s.bar_left_out.position.z = paddles_s.bar_left.position.z;

  //Trainee
  ball_s.pos_history_x.unshift(ball_s.ball.position.x);
  ball_s.pos_history_z.unshift(ball_s.ball.position.z);
  ball_s.pos_history_x.pop();
  ball_s.pos_history_z.pop();

  if (ball_s.trainee_msh[ball_s.history_depth] != null) {
    scene.remove(ball_s.trainee_msh[ball_s.history_depth]);
    ball_s.trainee_msh.pop();
  }
  (ball_s.trainee as any) = new THREE.Shape();

  (ball_s.trainee as any).moveTo(
    ball_s.pos_history_x[0],
    ball_s.pos_history_z[0] - 0.5
  );
  (ball_s.trainee as any).lineTo(
    ball_s.pos_history_x[1],
    ball_s.pos_history_z[1] - 0.5
  );
  (ball_s.trainee as any).lineTo(
    ball_s.pos_history_x[1],
    ball_s.pos_history_z[1] + 0.5
  );
  (ball_s.trainee as any).lineTo(
    ball_s.pos_history_x[0],
    ball_s.pos_history_z[0] + 0.5
  );

  ball_s.old_trainee_pos_x = ball_s.pos_history_x[0 + 1];
  ball_s.old_trainee_pos_z = ball_s.pos_history_z[0 + 1] + 0.25;
  (ball_s.trainee_geo as any) = new THREE.ShapeGeometry(ball_s.trainee as any);

  if (ball_s.after_reset == 1) {
    ball_s.trainee_wmat.color.setHex(0xffffff);
    (ball_s.trainee_msh as any).unshift(
      new THREE.Mesh(ball_s.trainee_geo as any, ball_s.trainee_wmat)
    );
  } else
    (ball_s.trainee_msh as any).unshift(
      new THREE.Mesh(ball_s.trainee_geo as any, ball_s.trainee_cmat)
    );

  (ball_s.trainee_msh[0] as any).rotation.x += PI_s.M_PI_2;
  (ball_s.trainee_msh[0] as any).layers.enable(BLOOM_SCENE);
  scene.add(ball_s.trainee_msh[0]);
});

const geometry_bonus = new THREE.BoxGeometry(1, 1, 1);
const bonus_m = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false} );
const bonus_mesh = new THREE.Mesh( geometry_bonus, bonus_m );
bonus_mesh.position.y = -50;

var BonusoutlineMaterial= new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
const geometry_bonus_out = new THREE.BoxGeometry(2,2,2);
var BonusoutlineMesh = new THREE.Mesh( geometry_bonus_out, BonusoutlineMaterial );
BonusoutlineMesh.position.x = bonus_mesh.position.x;
BonusoutlineMesh.position.y = bonus_mesh.position.y;
BonusoutlineMesh.position.z = bonus_mesh.position.z;

scene.add (bonus_mesh, BonusoutlineMesh);
BonusoutlineMesh.layers.enable( BLOOM_SCENE );

let bonus_s =
{
	bonus: bonus_mesh,
	bonus_outline: BonusoutlineMesh,
	bonus_type: 0
};

socket.on("spawn_bonus", (infos: any) =>
{
	if (infos.isbonus < 5)
	{
		bonus_s.bonus_outline.material.color.setHex(0xff0000);
		bonus_s.bonus_type = 0;
	}
	else
	{
		bonus_s.bonus_outline.material.color.setHex(0x00ff00);
		bonus_s.bonus_type = 1;
	}
	bonus_s.bonus.position.y = 0.2;
	bonus_s.bonus.position.x = infos.bx;
	bonus_s.bonus.position.z = infos.bz;
	bonus_s.bonus_outline.position.y = 0.2;
	bonus_s.bonus_outline.position.x = infos.bx;
	bonus_s.bonus_outline.position.z = infos.bz;
});

socket.on("bonus_taken", (infos: any) =>
{
	console.log("BONUS TAKEN");
	bonus_s.bonus.position.y = -50;
	bonus_s.bonus_outline.position.y = -50;
	bonus_s.bonus_outline.material.color.setHex(0xfffff);
	if (infos.taker == 0)//Left took the bonus
	{
		if (bonus_s.bonus_type == 0)//Malus
		{
			paddles_s.bar_left.scale.set(1, 1, 0.5);
			paddles_s.bar_left_out.scale.set(1, 1, 0.5);
		}
		else
		{
			paddles_s.bar_left.scale.set(1, 1, 1.5);
			paddles_s.bar_left_out.scale.set(1, 1, 1.5);
		}		
		console.log("Left took the bonus");
	}
	else
	{
		if (bonus_s.bonus_type == 0)//Malus
		{
			paddles_s.bar_right.scale.set(1, 1, 0.5);
			paddles_s.bar_right_out.scale.set(1, 1, 0.5);
		}
		else
		{
			paddles_s.bar_right.scale.set(1, 1, 1.5);
			paddles_s.bar_right_out.scale.set(1, 1, 1.5);
		}		
		console.log("Right took the bonus");
	}
	bonus_s.bonus_outline.material.color.setHex(0x0000ff);
});

socket.on("update_paddles_size", (infos: any) =>
{
	if (infos.lp == 1)
	{
		paddles_s.bar_left.scale.set(1, 1, 1.5);
		paddles_s.bar_left_out.scale.set(1, 1, 1.5);
	}
	else if (infos.lp == -1)
	{
		paddles_s.bar_left.scale.set(1, 1, 0.5);
		paddles_s.bar_left_out.scale.set(1, 1, 0.5);
	}
	if (infos.rp == 1)
	{
		paddles_s.bar_right.scale.set(1, 1, 1.5);
		paddles_s.bar_right_out.scale.set(1, 1, 1.5);
	}
	else if (infos.rp == -1)
	{
		paddles_s.bar_right.scale.set(1, 1, 0.5);
		paddles_s.bar_right_out.scale.set(1, 1, 0.5);
	}
});

socket.on("update_score", (scores: any) => {
  score_s.LeftScore = scores.ls;
  score_s.RightScore = scores.rs;
  updateScore(score_s);
  launchFirework(
    scene,
    ball_s.ball.position.x + 1,
    0,
    ball_s.ball.position.z,
    20,
    25,
    ball_s.ball_outline.material.color
  );

  ball_s.ball_outline.material.color.setHex(0xffffff);
  ball_s.light.color.setHex(0xffffff);
  ball_s.pos_history_x.unshift(0);
  ball_s.pos_history_z.unshift(0);
  ball_s.pos_history_x.pop();
  ball_s.pos_history_z.pop();

  paddles_s.bar_left.scale.set(1, 1, 1);
  paddles_s.bar_left_out.scale.set(1, 1, 1);
  paddles_s.bar_right.scale.set(1, 1, 1);
  paddles_s.bar_right_out.scale.set(1, 1, 1);

  ball_s.after_reset = 1;
});

socket.on("User_disconected", (name: string) => {
  let deco_text = new TextSprite({
    text: name + " left the match...",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 5,
    color: "#ffffff"
  });
  deco_text.position.set(0, +10, 0);
  scene.add(deco_text);
});

socket.on("End_of_match", (winner: any) => {
  let winner_text = new TextSprite({
    text: winner.name + " won the match !",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 5,
    color: "#ffffff"
  });
  winner_text.position.set(0, +10, 0);
  scene.add(winner_text);

  ft_ending_fireworks(winner.pos, winner.color);
});

async function ft_ending_fireworks(pos: any, color: any) {
  while (ball_s.trainee_msh.length > 0) {
    scene.remove(ball_s.trainee_msh[ball_s.trainee_msh.length - 1]);
    ball_s.trainee_msh.pop();
    await sleep(10);
  }

  if (pos == "left") color = paddles_s.left_col;
  else color = paddles_s.right_col;

  let rdX: number;
  let rdZ: number;

  while (1) {
    rdX = getRandomInt(-60, 60);
    rdZ = getRandomInt(-30, 40);
    launchFirework(scene, rdX, 0, rdZ, 20, 25, color);
    await sleep(getRandomInt(1500, 2000));
  }
}

//The render loop ======
const animate = function () {

	if (buttons.SongToogle != default_buttons.SongToogle || buttons.Song != default_buttons.Song)
	{
		let change_track =  false;
		if (buttons.Song != default_buttons.Song)
			change_track = true;
		default_buttons.SongToogle = buttons.SongToogle;
		default_buttons.Song = buttons.Song;
		console.log("Update Song");
		updateCurrentSong(audio_s, buttons.SongToogle, buttons.Song, change_track);
	}

  canResetCam = true;
  requestAnimationFrame(animate);

  updateAudioVisualizer(audio_s);
  IncreaseBrightness = moveSun(SunMesh, IncreaseBrightness);
  updateplane(plane_s, audio_s);

  bloomComposer.render();
  finalComposer.render();
};

animate();

function getRandomInt(min: any, max: any) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
