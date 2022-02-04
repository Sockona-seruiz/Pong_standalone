import * as THREE from 'three'

export function init_ball(scene: THREE.Scene, BLOOM_SCENE: number)
{
	const geometry_ball = new THREE.BoxGeometry(1, 1, 1);
	const ball_m = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false} );
	const ball_mesh = new THREE.Mesh( geometry_ball, ball_m );

	var BalloutlineMaterial= new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
	var BalloutlineMesh = new THREE.Mesh( geometry_ball, BalloutlineMaterial );
	BalloutlineMesh.position.x = ball_mesh.position.x;
	BalloutlineMesh.position.y = ball_mesh.position.y;
	BalloutlineMesh.position.z = ball_mesh.position.z;
	BalloutlineMesh.scale.multiplyScalar(1.2);

	scene.add (ball_mesh, BalloutlineMesh);
	BalloutlineMesh.layers.enable( BLOOM_SCENE );

	const BallLight = new THREE.PointLight(0xffffff, 5, 10);
	BallLight.intensity = (0.5);
	BallLight.position.set(0, 4, 0);
	scene.add(BallLight);

	const trainee_c_mat = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide,
	});

	const trainee_w_mat = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide,
	});
	

	let ball_s =
	{
		ball : ball_mesh,
		ball_outline : BalloutlineMesh,
		light : BallLight,
		BallAngle : Math.PI,
		trainee_cmat : trainee_c_mat,	
		trainee_wmat : trainee_w_mat,

		history_depth : 42,
		pos_history_x : [0,0],
		pos_history_z : [0,0],
		trainee : null,
		trainee_geo : null,
		trainee_msh : [],
		old_trainee_pos_x : 0,
		old_trainee_pos_z : 0,

		BaseSpeed : 0.5,
		Speed : 0.5,
		SpeedIncrease : 0.02,
		SpeedLimit : 1.4,

		LeftHit : 0,
		RightHit : 0,

		after_reset : 0
	}
	return (ball_s);
}