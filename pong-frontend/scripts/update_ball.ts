import * as THREE from 'three'

import { updateScore } from './score';
import { resetParams } from './reset_params';
import { launchFirework } from './fireworks';

export function moveBall(ball_s: any, paddles_s: any, arena_s: any, score_s: any, scene: THREE.Scene, PI_s: any, config: any, BLOOM_SCENE: number)
{
	var PosDiff = 0;

	ball_s.pos_history_x.unshift(ball_s.ball.position.x);
	ball_s.pos_history_z.unshift(ball_s.ball.position.z);
	ball_s.pos_history_x.pop();
	ball_s.pos_history_z.pop();

	if (ball_s.trainee_msh[ball_s.history_depth] != null)
	{
		scene.remove(ball_s.trainee_msh[ball_s.history_depth]);
		ball_s.trainee_msh.pop();
	}
	ball_s.trainee = new THREE.Shape();

	ball_s.trainee.moveTo(ball_s.pos_history_x[0], ball_s.pos_history_z[0] - 0.5);
	ball_s.trainee.lineTo(ball_s.pos_history_x[1], ball_s.pos_history_z[1] - 0.5);
	ball_s.trainee.lineTo(ball_s.pos_history_x[1], ball_s.pos_history_z[1] + 0.5);
	ball_s.trainee.lineTo(ball_s.pos_history_x[0], ball_s.pos_history_z[0] + 0.5);

	ball_s.old_trainee_pos_x = ball_s.pos_history_x[0 + 1];
	ball_s.old_trainee_pos_z = ball_s.pos_history_z[0 + 1] + 0.25;
	ball_s.trainee_geo = new THREE.ShapeGeometry(ball_s.trainee);

	if (ball_s.LeftHit == 0 && ball_s.RightHit == 0)
	{
		ball_s.trainee_wmat.color.setHex(0xffffff);
		ball_s.trainee_msh.unshift (new THREE.Mesh(ball_s.trainee_geo, ball_s.trainee_wmat));
	}
	else
		ball_s.trainee_msh.unshift (new THREE.Mesh(ball_s.trainee_geo, ball_s.trainee_cmat));

	ball_s.trainee_msh[0].rotation.x += PI_s.M_PI_2;
	ball_s.trainee_msh[0].layers.enable( BLOOM_SCENE );
	scene.add(ball_s.trainee_msh[0]);
	
	//Changement de position de la balle
	ball_s.ball.position.x += Math.cos(ball_s.BallAngle) * ball_s.Speed;
	ball_s.ball.position.z += (Math.sin(ball_s.BallAngle) * -1) * ball_s.Speed;
	ball_s.ball_outline.position.x = ball_s.ball.position.x;
	ball_s.ball_outline.position.z = ball_s.ball.position.z;
	ball_s.light.position.x = ball_s.ball.position.x;
	ball_s.light.position.z = ball_s.ball.position.z;
	
	//  Est dans la barre de gauche en X                 (est dans la barre en Y)
	//Une barre fait 8 de hauteur

	//Hit left bar
	if (ball_s.ball.position.x >= paddles_s.bar_left.position.x - 1 && ball_s.ball.position.x <= paddles_s.bar_left.position.x + 1 && (ball_s.ball.position.z - 0.5 <= paddles_s.bar_left.position.z + config.paddle_h_2 && ball_s.ball.position.z + 0.5 >= paddles_s.bar_left.position.z - config.paddle_h_2))
	{
		if (ball_s.LeftHit == 0)
		{
			ball_s.LeftHit = 1;
			PosDiff = ball_s.ball.position.z - paddles_s.bar_left.position.z;

			ball_s.BallAngle = Math.PI - ball_s.BallAngle;
			if (ball_s.BallAngle > PI_s.M_2PI)
				ball_s.BallAngle -= PI_s.M_2PI;
			else if (ball_s.BallAngle < 0)
				ball_s.BallAngle += PI_s.M_2PI;
			if (ball_s.BallAngle - (PosDiff/30) < PI_s.M_PI_2 || ball_s.BallAngle - (PosDiff/30) > PI_s.M_3PI_2)
				ball_s.BallAngle -= PosDiff/30;

			if (ball_s.BallAngle > PI_s.M_PI_2 - 0.15 && ball_s.BallAngle < PI_s.M_3PI_2 - 0.5)
				ball_s.BallAngle = PI_s.M_PI_2 - 0.15
			else if (ball_s.BallAngle < PI_s.M_3PI_2 + 0.15 && ball_s.BallAngle > PI_s.M_PI_2 + 0.5)
				ball_s.BallAngle = PI_s.M_3PI_2 + 0.15

			if (ball_s.Speed < ball_s.SpeedLimit)
				ball_s.Speed += ball_s.SpeedIncrease;

			ball_s.trainee_msh[0].material = ball_s.trainee_cmat;
			ball_s.trainee_wmat.color.setHex(paddles_s.left_col);
			ball_s.trainee_msh[0].material.color.setHex(paddles_s.left_col);
			ball_s.ball_outline.material.color.setHex(paddles_s.left_col);
			ball_s.light.color.setHex(paddles_s.left_col);
		}
		ball_s.RightHit = 0;
	}

	//Hit right bar
	if (ball_s.ball.position.x >= paddles_s.bar_right.position.x - 1 && ball_s.ball.position.x <= paddles_s.bar_right.position.x + 1 && (ball_s.ball.position.z - 0.5 <= paddles_s.bar_right.position.z + config.paddle_h_2 && ball_s.ball.position.z + 0.5 >= paddles_s.bar_right.position.z - config.paddle_h_2))
	{
		if (ball_s.RightHit == 0)
		{
		ball_s.RightHit = 1;
		PosDiff = ball_s.ball.position.z - paddles_s.bar_right.position.z;

		ball_s.BallAngle = PI_s.M_PI - ball_s.BallAngle;
		if (ball_s.BallAngle > PI_s.M_2PI)
			ball_s.BallAngle -= PI_s.M_2PI;
		else if (ball_s.BallAngle < 0)
			ball_s.BallAngle += PI_s.M_2PI;
		if (ball_s.BallAngle + (PosDiff/30) > PI_s.M_PI_2 && ball_s.BallAngle + (PosDiff/30) < PI_s.M_3PI_2)
			ball_s.BallAngle += PosDiff/30;

		if (ball_s.BallAngle < PI_s.M_PI_2 + 0.15)
			ball_s.BallAngle = PI_s.M_PI_2 + 0.15;
		else if (ball_s.BallAngle > PI_s.M_3PI_2 - 0.15)
			ball_s.BallAngle = PI_s.M_3PI_2 - 0.15;

		if (ball_s.Speed < ball_s.SpeedLimit)
			ball_s.Speed += ball_s.SpeedIncrease;

		ball_s.trainee_msh[0].material = ball_s.trainee_cmat;
		ball_s.trainee_wmat.color.setHex(paddles_s.right_col);
		ball_s.trainee_msh[0].material.color.setHex(paddles_s.right_col);
		ball_s.ball_outline.material.color.setHex(paddles_s.right_col);
		ball_s.light.color.setHex(paddles_s.right_col);
		}
		ball_s.LeftHit = 0;
	}

	//Top and bot hit conditions
	if (ball_s.ball.position.z <= arena_s.top.position.z + 1 || ball_s.ball.position.z >= arena_s.bot.position.z - 1)
	{
		ball_s.BallAngle = PI_s.M_2PI - ball_s.BallAngle;
		if (ball_s.BallAngle > PI_s.M_2PI)
			ball_s.BallAngle -= PI_s.M_2PI;
		else if (ball_s.BallAngle < 0)
			ball_s.BallAngle += PI_s.M_2PI;
	}

	//Goal conditions
	if (ball_s.ball.position.x <= arena_s.left.position.x + 1)
	{
		score_s.RightScore += 1;
		updateScore(score_s);
		launchFirework(scene, ball_s.ball.position.x + 1,0,ball_s.ball.position.z, 20, 25, ball_s.ball_outline.material.color);
		resetParams(ball_s, paddles_s, 0);
	}

	if (ball_s.ball.position.x >= arena_s.right.position.x - 1)
	{
		score_s.LeftScore += 1;
		updateScore(score_s);
		launchFirework(scene, ball_s.ball.position.x - 1,0,ball_s.ball.position.z, 20, 25, ball_s.ball_outline.material.color);
		resetParams(ball_s, paddles_s, 1);
	}
}