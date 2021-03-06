import * as THREE from 'three';

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// @ts-ignore
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';

import { init_score } from "./score_init";
import { updateScore, update_scores } from "./score";
import { init_paddles } from "./paddles_init";
import { init_ball } from "./ball_init";
import { init_arena } from "./arena_init";
import { init_audio } from "./audio_init";
import { updateCurrentSong } from './audio_init';
import { move_ball } from './update_ball';
import { init_plane } from "./plane_init";
import { moveSun } from "./update_sun";
import { updateAudioVisualizer } from "./update_audio";
import { updateplane } from "./update_plane";
import { ft_ending_fireworks, launchFirework, stop_ending_fireworks } from "./fireworks";

import * as io from "socket.io-client";
import { change_names, init_vs_text, update_leave_message } from './update_text';
import { init_stars } from './stars_init';
import { init_bonus, spawn_bonus } from './bonus';
import { bonus_taken } from './bonus';
import { update_paddles_size } from './bonus';

let socket: any;

socket = io.connect("http://localhost:3000", { withCredentials: true });

socket.on("connect", () => {
//   console.log("Successfully connected to the newsocket game ");
});

socket.on("disconnect", () => {
//   console.log("Disconnected to newsocket game ");
});

var user_to_watch = "";

//Used to create the arena MUST be changed in back to in order to be accurate
//Went like this to avoid having no render if back is off
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

config.paddle_h_2 = config.paddle_h / 2;
config.arena_h_2 = config.arena_h / 2;
config.arena_w_2 = config.arena_w / 2;

var users_in_game: string [];
users_in_game = [];

socket.on("send_user_list", (users: any) => {
	let i: number = 0;
	if (users != null)
	{
			clear_select(document.getElementById("spectate-select"));
			add_to_select(document.getElementById("spectate-select"), "", "--Please choose someone to spectate--");
			while (users[i])
			{
				// console.log("users : " + users[i]);
				add_to_select(document.getElementById("spectate-select"), users[i], users[i]);
				users_in_game.push(users[i]);
				i++;
			}
			if (i == 0)
				users_in_game = [];
	}
	else
		users_in_game = [];
});

//Struct used to save user nickname and desired gamemode
let buttons = {
	Nickname: "user",
	GameMode: 'Normal Game',
};

//Buttons setup / clic functions
var join_spec_buttons: any = document.getElementById("launch_spec");

var join_normal_match: any = document.getElementById("Normal_Match");
var join_bonus_match: any = document.getElementById("Bonus_Match");
var leave_match: any = document.getElementById("Leave_Matchmaking");

var leave_spec: any = document.getElementById("Leave_spec_Btn");

join_spec_buttons.addEventListener('click', launch_spectate, false);

join_normal_match.addEventListener('click', launch_normal_matchmaking, false);
join_bonus_match.addEventListener('click', launch_bonus_matchmaking, false);
leave_match.addEventListener('click', leave_matchmaking, false);
leave_spec.addEventListener('click', leave_spectate, false);

function launch_spectate()
{
	var SpecSelect: any = document.getElementById("spectate-select");
	var spec_nickname = SpecSelect.options[SpecSelect.selectedIndex].text;

	if (SpecSelect.options[SpecSelect.selectedIndex].value != "")
	{
		// console.log("You are willing to watch " + spec_nickname);
		user_to_watch = spec_nickname;
		Launch_Game(buttons);
		(document.getElementById("Leave_spec_Btn")as any).style.display = 'block';
	}
}

function leave_spectate()
{
	(document.getElementById("Leave_spec_Btn")as any).style.display = 'none';
	show_ui();

	socket.emit("leave_spec", user_to_watch);

	user_to_watch = "";
}

function add_to_select(selectobject: any, value: string, id: string)
{
	var option = document.createElement('option');
	option.value = value;
	option.innerText = id;

	selectobject.appendChild(option);
};

function check_nickname()
{
	const nickname = (document.getElementById('nickname')as any).value;
	// console.log(nickname);
	
	let i: number = 0;

	while (users_in_game[i])
	{
		if (nickname == users_in_game[i])
		{
			// console.log("Nickname Allready Taken...");
			return ("");
		}
		i++;
	}
	return (nickname);
};

function show_ui()
{
	(document.getElementById("Ui")as any).style.display = 'inline-block';
};

function clear_select(selectobject: any)
{
	selectobject.selectedIndex = 0;
	var j, L = selectobject.options.length - 1;
	for(j = L; j >= 0; j--) {
		selectobject.remove(j);
	}
};

function launch_normal_matchmaking()
{
	if ((document.getElementById("Normal_Match")as any).style.cursor == 'not-allowed')
		return;
	const nickname = check_nickname();
	if (nickname == "")
	{
		// console.log("Game won't launch");
		(document.getElementById('nickname')as any).placeholder = "Nickname already taken";
		(document.getElementById('nickname')as any).value = "";
		return ;
	}
	buttons.GameMode = "Normal Game";
	buttons.Nickname = nickname;
	Launch_Game(buttons);
};

function launch_bonus_matchmaking()
{
	if ((document.getElementById("Bonus_Match")as any).style.cursor == 'not-allowed')
		return;
	const nickname = check_nickname();
	if (nickname == "")
	{
		// console.log("Game won't launch");
		(document.getElementById('nickname')as any).placeholder = "Nickname allready taken";
		(document.getElementById('nickname')as any).value = "";
		return ;
	}
	buttons.GameMode = "Bonus Game";
	buttons.Nickname = nickname;
	Launch_Game(buttons);
};

function leave_matchmaking()
{
	socket.emit('QuitMactchmaking');
};

var canResetCam = false;

//Camera =====
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 34;
camera.position.y = 50;
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

//GUI SETUP=====================
const song_btn =
{
	song_toogle: true,
	song: 'Flyday Chinatown',
	old_song: 'Flyday Chinatown'
}

const gui = new GUI();

gui.add( song_btn, 'song', ['Flyday Chinatown', 'Soda City Funk'] ).name('Select Song' );
gui.add( song_btn, 'song_toogle' ).name( 'Toogle song' );

//Toggle song / change song trigger
gui.onChange( () =>
{
	// console.log(song_btn.song_toogle);    // object that was modified
	// console.log(song_btn.song);  // string, name of property
	if (song_btn.song != song_btn.old_song)
	{
		updateCurrentSong(audio_s, song_btn.song_toogle, song_btn.song, true);
		song_btn.old_song = song_btn.song;
	}
	else
		updateCurrentSong(audio_s, song_btn.song_toogle, song_btn.song, false);
} );

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
init_vs_text(scene, PI_s);
init_stars(scene, config);
let bonus_s = init_bonus(scene, BLOOM_SCENE);

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

//Tells back that player wants to launch a game
function Launch_Game(buttons: any)
{
	socket.emit("launch_game", {
	  spec: user_to_watch,
	  mode: buttons.GameMode,
	  nickname: buttons.Nickname,
	  duel: null, //Not used in standalone version
	  plx: -(config.arena_w / 2 - 5),
	  prx: config.arena_w / 2 - 5,
	  ph_2: config.paddle_h_2,
	  at: -config.arena_h_2 + 1,
	  ab: config.arena_h_2 - 1,
	  al: -config.arena_w_2 + 1,
	  ar: config.arena_w_2 - 1,
	});
};

socket.on("update_usernames", (names: any) => {
	stop_ending_fireworks();
	change_names(scene, names.left_user, names.right_user, PI_s);
	update_leave_message(scene, "", PI_s, -1);
	bonus_s.bonus.position.y = -50;
	bonus_s.bonus_outline.position.y = -50;
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
  move_ball(scene, ball_s, positions, paddles_s, BLOOM_SCENE, PI_s);
});

socket.on("hide_ui", (infos: any) =>
{
	(document.getElementById("Ui")as any).style.display = 'none';
});

socket.on("show_ui", (infos: any) =>
{
	(document.getElementById("Ui")as any).style.display = 'inline-block';
});

socket.on("hide_loader", (infos: any) =>
{
	// console.log("hide loader");

	(document.getElementById("Normal_Match") as any).style.cursor = 'default';
	(document.getElementById("Normal_Match")as any).style.opacity = '1';
	(document.getElementById("Bonus_Match")as any).style.cursor = 'default';
	(document.getElementById("Bonus_Match")as any).style.opacity = '1';

	(document.getElementById("leave_match")as any).style.display = 'none';
});

socket.on("show_loader", (infos: any) =>
{
	// console.log("show loader");

	(document.getElementById("Normal_Match")as any).style.cursor = 'not-allowed';
	(document.getElementById("Normal_Match")as any).style.opacity = '0.6';
	(document.getElementById("Bonus_Match")as any).style.cursor = 'not-allowed';
	(document.getElementById("Bonus_Match")as any).style.opacity = '0.6';

	(document.getElementById("leave_match")as any).style.display = 'inline-block';
});

socket.on("spawn_bonus", (infos: any) =>
{
	spawn_bonus (infos, bonus_s);
});

socket.on("bonus_taken", (infos: any) =>
{
	bonus_taken (infos, bonus_s, paddles_s);
});

socket.on("update_paddles_size", (infos: any) =>
{
	update_paddles_size(infos, paddles_s);
});

socket.on("update_score", (scores: any) => {
	update_scores(scores, score_s, scene, ball_s, paddles_s);
});

socket.on("User_disconected", (name: string) => {
  update_leave_message(scene, name, PI_s, 0);
  show_ui();
});

socket.on("End_of_match", (winner: any) => {
  update_leave_message(scene, winner.name, PI_s, 1);

  show_ui();
  ft_ending_fireworks(winner.pos, winner.color, ball_s, paddles_s, scene);
});

//The render loop ======
const animate = function () {
  canResetCam = true;
  requestAnimationFrame(animate);

  updateAudioVisualizer(audio_s);
  IncreaseBrightness = moveSun(SunMesh, IncreaseBrightness);
  updateplane(plane_s, audio_s);

  bloomComposer.render();
  finalComposer.render();
};

animate();

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
