import * as THREE from 'three'

export function init_arena(scene: THREE.Scene, BLOOM_SCENE: number, config: {
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
	const geometry_edge_top = new THREE.BoxGeometry(config.arena_w, 1, 1);
	const geometry_edge_side = new THREE.BoxGeometry(1, 1, config.arena_h + 1);

	const material_edge = new THREE.MeshStandardMaterial( { color: 0xffffff } );

	const edge_top = new THREE.Mesh( geometry_edge_top, material_edge );
	const edge_bot = new THREE.Mesh( geometry_edge_top, material_edge );

	const edge_left = new THREE.Mesh( geometry_edge_side, material_edge );
	const edge_right = new THREE.Mesh( geometry_edge_side, material_edge );

	edge_top.position.z = - config.arena_h / 2;
	edge_bot.position.z = config.arena_h / 2;
	edge_left.position.x = - config.arena_w / 2;
	edge_right.position.x = config.arena_w / 2;
	scene.add( edge_top, edge_bot, edge_left, edge_right );

	var EdgeTopoutlineMaterial= new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
	const outline_geometry_edge_top = new THREE.BoxGeometry(config.arena_w + 1, 1.5, 1.5);
	var EdgeTopoutlineMesh = new THREE.Mesh( outline_geometry_edge_top, EdgeTopoutlineMaterial );
	EdgeTopoutlineMesh.position.z = edge_top.position.z;

	var EdgeBotoutlineMesh = new THREE.Mesh( outline_geometry_edge_top, EdgeTopoutlineMaterial );
	EdgeBotoutlineMesh.position.z = edge_bot.position.z;
	EdgeBotoutlineMesh.position.y -= 1

	var EdgeSideoutlineMaterial= new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
	const outline_geometry_edge_side = new THREE.BoxGeometry(1.5, 1.5, config.arena_h + 1.5);
	var EdgeLeftoutlineMesh = new THREE.Mesh( outline_geometry_edge_side, EdgeSideoutlineMaterial );
	EdgeLeftoutlineMesh.position.x = edge_left.position.x;

	var EdgeRightoutlineMesh = new THREE.Mesh( outline_geometry_edge_side, EdgeSideoutlineMaterial );
	EdgeRightoutlineMesh.position.x = edge_right.position.x;	

	EdgeTopoutlineMesh.layers.enable( BLOOM_SCENE );
	EdgeBotoutlineMesh.layers.enable( BLOOM_SCENE );
	EdgeLeftoutlineMesh.layers.enable( BLOOM_SCENE );
	EdgeRightoutlineMesh.layers.enable( BLOOM_SCENE );
	scene.add( EdgeTopoutlineMesh, EdgeBotoutlineMesh, EdgeLeftoutlineMesh, EdgeRightoutlineMesh );

	var arena_floor_geo = new THREE.PlaneGeometry(config.arena_w + 1, config.arena_h, 2, 2);
	var arena_floor_Material = new THREE.MeshBasicMaterial({
		color: 0x000000,
		transparent: true,
		opacity: 0.8,
		wireframe: false
	});

	var arena_floor = new THREE.Mesh(arena_floor_geo, arena_floor_Material);
	arena_floor.rotation.x -= Math.PI / 2;
	arena_floor.position.set(0, -1, 0);
	scene.add(arena_floor);

	let arena_s = {
		top : edge_top,
		bot : edge_bot,
		left : edge_left,
		right : edge_right
	}
	return (arena_s);
}