import * as THREE from 'three'

var audiolist = [];
	// audiolist.unshift("../sounds/far-cry-3-blood-dragon-ost-power-core-track-07.mp3");
	// audiolist.unshift('../sounds/dryskill-burnout-dubstep-synthwave.mp3');
	// audiolist.unshift('../sounds/far-cry-3-blood-dragon-ost-omega-force-track-16.mp3');
	// audiolist.unshift('../sounds/far-cry-3-blood-dragon-ost-sloans-assault-track-10.mp3');
	// audiolist.unshift('./sounds/legend-of-zelda-theme-but-its-synthwave.mp3');
	// audiolist.unshift('../sounds/mdk-press-start-free-download.mp3');
	// audiolist.unshift('./sounds/miami-nights-1984-accelerated.mp3');
	// audiolist.unshift('./sounds/powercyan-plutocracy-ephixa-remix-synthwave-dubstep.mp3');
	// audiolist.unshift('../sounds/skrillex-bangarang-feat-sirah-official-music-video.mp3');
	// audiolist.unshift('../sounds/skrillex-first-of-the-year-equinox.mp3');
	// audiolist.unshift('../sounds/waterflame-blast-processing.mp3');
	// audiolist.unshift('../sounds/dirty-androids-midnight-lady.mp3');

	// audiolist.unshift('./sounds/main_song.mp3');
	// audiolist.unshift('./sounds/post-malone-swae-lee-sunflower-spider-man-into-the-spider-verse.mp3');

	audiolist[0] = './sounds/Ignite.mp3';
	audiolist[1] = './sounds/enemy.mp3';

export function init_audio(scene: THREE.Scene, BLOOM_SCENE: number, config: {
    arena_w: number;
    arena_w_2: number;
    arena_h: number;
    arena_h_2: number;
    arena_size: number;
    paddle_w: number;
    paddle_h: number;
    paddle_h_2: number;
})
{
	const fftSize = 32;

	const audioListener = new THREE.AudioListener();
	const audio = new THREE.Audio(audioListener);

	const audioLoader_0 = new THREE.AudioLoader();
	audioLoader_0.load(audiolist[0], (buffer: AudioBuffer) => {
		audio.setBuffer(buffer);
		audio.setLoop(true);
		audio.play();
	});

	const audioLoader_1 = new THREE.AudioLoader();
	audioLoader_1.load(audiolist[1], (buffer: AudioBuffer) => {
		audio.setBuffer(buffer);
		audio.setLoop(true);
		audio.pause();
	});

	// const audioLoader = new THREE.AudioLoader();
	// audioLoader.load(audiolist[Math.floor(Math.random() * audiolist.length)], (buffer: AudioBuffer) => {
	// 	audio.setBuffer(buffer);
	// 	audio.setLoop(true);
	// 	audio.play();
	// });

	const analyser = new THREE.AudioAnalyser(audio, fftSize);

	var data = analyser.getFrequencyData();
	var averageFreq = analyser.getAverageFrequency();

	var AudioMeshArray_Left = [];
	var AudioMeshArray_Right = [];
	var AudioMeshArray_outline_Left = [];
	var AudioMeshArray_outline_Right = [];
	const geometry_audio = new THREE.BoxGeometry(1, 1, 1);
	const material_audio = new THREE.MeshBasicMaterial( { color: 0x000000 } );

	const geometry_audio_outline = new THREE.BoxGeometry(1.2, 1.2, 1.2);

	var leftbar_loader = new THREE.TextureLoader();
	var leftbar_texture = leftbar_loader.load( 'textures/gradient_blue_pink.png' );

	const leftmaterial_audio_outline= new THREE.MeshPhongMaterial({
		side: THREE.BackSide,
		wireframe: false,
		emissive : 0xffffff,
		emissiveIntensity : 0.5,
		emissiveMap : leftbar_texture
	});

	for (let i = 0, len = data.length; i < len; i++)
	{
		AudioMeshArray_Left.unshift(new THREE.Mesh( geometry_audio, material_audio ));
		AudioMeshArray_Right.unshift(new THREE.Mesh( geometry_audio, material_audio ));
		AudioMeshArray_Left[0].position.z = i * 2.65 - 20;
		AudioMeshArray_Right[0].position.z = i * 2.65 - 20;
		AudioMeshArray_Left[0].position.x = - (config.arena_w / 2 + 2);
		AudioMeshArray_Right[0].position.x = config.arena_w / 2 + 2;
		AudioMeshArray_Left[0].position.y = -2;
		AudioMeshArray_Right[0].position.y = -2;

		AudioMeshArray_outline_Left.unshift(new THREE.Mesh( geometry_audio_outline, leftmaterial_audio_outline ));
		AudioMeshArray_outline_Right.unshift(new THREE.Mesh( geometry_audio_outline, leftmaterial_audio_outline ));
		AudioMeshArray_outline_Left[0].layers.enable( BLOOM_SCENE );
		AudioMeshArray_outline_Right[0].layers.enable( BLOOM_SCENE );
		AudioMeshArray_outline_Left[0].position.z = i * 2.65 - 20;
		AudioMeshArray_outline_Right[0].position.z = i * 2.65 - 20;
		AudioMeshArray_outline_Left[0].position.x =  - (config.arena_w / 2 + 2);
		AudioMeshArray_outline_Right[0].position.x =  config.arena_w / 2 + 2;
		AudioMeshArray_outline_Left[0].position.y = -2;
		AudioMeshArray_outline_Right[0].position.y = -2;

		scene.add( AudioMeshArray_Left[0], AudioMeshArray_Right[0], AudioMeshArray_outline_Left[0], AudioMeshArray_outline_Right[0]);
	}

	let	audio_s = {
		AudioMeshArray_L : AudioMeshArray_Left,
		AudioMeshArray_R : AudioMeshArray_Right,
		AudioMeshArray_OL : AudioMeshArray_outline_Left,
		AudioMeshArray_OR : AudioMeshArray_outline_Right,

		audioLoader: audioLoader_0,
		THREE_Audio: audio,

		analyser : analyser,
		avgFreq : averageFreq,
		FrqData : data,
		calc : 0,
		calc_2 : 0,

		lowerHalfArray : 0,
		lowerAvg : 0,
		lowerAvgFr : 0,
		lowerMidArray : 0,
		lowerMidAvg : 0,
		lowerMidAvgFr : 0,
		upperMidArray : 0,
		upperMidAvg : 0,
		upperMidAvgFr : 0,
		upperHalfArray : 0,
		upperAvg : 0,
		upperAvgFr : 0
	}
	return (audio_s);
}

export function updateCurrentSong(audio_s:any, SongToogle: boolean, Songname:string, change_track: boolean)
{
	if (change_track == true)
	{
		audio_s.THREE_Audio.stop();
		if (Songname == 'Zed Ignite')
		{
			audio_s.audioLoader.load(audiolist[0], (buffer: AudioBuffer) => {
				audio_s.THREE_Audio.setBuffer(buffer);
				audio_s.THREE_Audio.setLoop(true);
				audio_s.THREE_Audio.play();
			});
		}
		else
		{
			audio_s.audioLoader.load(audiolist[1], (buffer: AudioBuffer) => {
				audio_s.THREE_Audio.setBuffer(buffer);
				audio_s.THREE_Audio.setLoop(true);
				audio_s.THREE_Audio.play();
			});
		}
		return ;
	}
	else if (SongToogle == false)
		audio_s.THREE_Audio.pause();
	else
		audio_s.THREE_Audio.play();
}