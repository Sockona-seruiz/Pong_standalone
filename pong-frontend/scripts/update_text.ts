import * as THREE from 'three'
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

var font_path = "../fonts/Retro_Stereo_Wide_Regular.json";

export function init_vs_text(scene, PI_s)
{
	var vs_fontloader = new FontLoader();	
	vs_fontloader.load(font_path,
	function ( font )
	{
		const color = 0xffffff;
		const matLite = new THREE.MeshBasicMaterial( {
			color: color,
			transparent: true,
			opacity: 0.4,
			side: THREE.DoubleSide
		} );

		var message = "VS";

		const shapes = font.generateShapes( message, 5 );

		const geometry = new THREE.ShapeGeometry( shapes );

		geometry.computeBoundingBox();

		const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

		geometry.translate( xMid, 0, 0 );

		// make shape ( N.B. edge view not visible )

		const vstext = new THREE.Mesh( geometry, matLite );
		vstext.position.set(0, 0, 35);
		vstext.rotation.x = -PI_s.M_PI_2;
		scene.add( vstext );
	} ); //end load function
};

var left_font = new FontLoader();
var right_font = new FontLoader();

var left_nick: THREE.Mesh;
var right_nick: THREE.Mesh;

let matLite_left = new THREE.MeshBasicMaterial( {
	color: 0x61e8fa,
	transparent: true,
	opacity: 0.4,
	side: THREE.DoubleSide
} );

const matLite_right = new THREE.MeshBasicMaterial( {
	color: 0xfc53bc,
	transparent: true,
	opacity: 0.4,
	side: THREE.DoubleSide
} );


export function change_names(scene, left_name, right_name, PI_s)
{
	left_font.load(font_path,
	function ( font )
	{
		const selectedObject = scene.getObjectByName("left_nick");
		if (selectedObject)
		{
		(selectedObject as any).geometry.dispose();
		(selectedObject as any).material.dispose();
		scene.remove(selectedObject);
		}
		const shapes = font.generateShapes( left_name, 5 );
		const geometry = new THREE.ShapeGeometry( shapes );
		geometry.computeBoundingBox();
		const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
		geometry.translate( xMid, 0, 0 );
		left_nick = new THREE.Mesh( geometry, matLite_left );
		left_nick.position.z = - 150;
		left_nick.name = "left_nick";
		left_nick.position.set(-40, 0, 35);
		left_nick.rotation.x = -PI_s.M_PI_2;
		scene.add( left_nick );
	} );

	right_font.load(font_path,
	function ( font )
	{
		const selectedObject = scene.getObjectByName("right_nick");
		if (selectedObject)
		{
		(selectedObject as any).geometry.dispose();
		(selectedObject as any).material.dispose();
		scene.remove(selectedObject);
		}
		const shapes = font.generateShapes( right_name, 5 );
		const geometry = new THREE.ShapeGeometry( shapes );
		geometry.computeBoundingBox();
		const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
		geometry.translate( xMid, 0, 0 );
		right_nick = new THREE.Mesh( geometry, matLite_right );
		right_nick.position.z = - 150;
		right_nick.name = "right_nick";
		right_nick.position.set(40, 0, 35);
		right_nick.rotation.x = -PI_s.M_PI_2;
		scene.add( right_nick );
	} );
};