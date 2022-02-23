import * as THREE from 'three'

export function move_ball(scene: THREE.Scene, ball_s: any, positions: any, paddles_s: any, BLOOM_SCENE: number, PI_s: any)
{
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
};