import * as THREE from 'three'

var lauch_end_fireworks = true;

function sleep(ms: number)	{
	return new Promise(resolve => setTimeout(resolve, ms));
	}

async function setFirework_pos(scene: THREE.Scene, fireworks:  THREE.Points, firework_geo: THREE.BufferGeometry,
	firework_m: THREE.PointsMaterial, size: number, x: number, y: number, z: number, elevation: number)
{
	var positions = fireworks.geometry.attributes.position.array;

	var x: number, y: number, z: number;
	var	currentIndex = 0;

	for (let j = 0; j < elevation; j++)
	{
		for ( let i = 0; i < size * 3; i ++ ) 
		{
			(positions as any)[ currentIndex++ ] = x;
			if (currentIndex == 1 && j > 1)
			{
				currentIndex++;
				(positions as any)[ currentIndex - 1 ] = y - 2;
			}
			else if (currentIndex == 4 && j > 3)
			{
				currentIndex++;
				(positions as any)[ currentIndex - 1 ] = y - 4;
			}
			else
				(positions as any)[ currentIndex++ ] = y;
			(positions as any)[ currentIndex++ ] = z;
		}
		y += 1;
		currentIndex = 0;
		fireworks.geometry.attributes.position.needsUpdate = true;
		await sleep(20 + j);
	}
	y -= 1;
	await sleep(20);
	(positions as any)[1] = y;
	(positions as any)[4] = y - 2;
	fireworks.geometry.attributes.position.needsUpdate = true;
	// await sleep(40 + elevation);
	(positions as any)[4] = y;
	fireworks.geometry.attributes.position.needsUpdate = true;

	let velocity_x = [];
	let velocity_y = [];
	let velocity_z = [];
	
	for ( let i = 0; i < size; i ++ ) 
	{
		velocity_x.unshift(Math.random() * (1 + 1) - 1);
		velocity_y.unshift(Math.random() * (1 + 1) - 1);
		velocity_z.unshift(Math.random() * (1 + 1) - 1);
	}
	var index = 0;
	currentIndex = 0;
	for (let j = 0; j < 100; j++)
	{
		for ( let i = 0; i < size * 3; i ++ ) 
		{
			(positions as any)[ currentIndex++ ] += velocity_x[index];
			(positions as any)[ currentIndex++ ] += velocity_y[index];
			(positions as any)[ currentIndex++ ] += velocity_z[index];
			index++;
			velocity_y[index] -= 0.03;
		}
		index = 0;
		currentIndex = 0;
		fireworks.geometry.attributes.position.needsUpdate = true;
		await sleep(25);
	}

	scene.remove( fireworks );
	firework_geo.dispose();
	firework_m.dispose();

}

export function launchFirework(scene: THREE.Scene, x: number, y: number, z: number, elevation: number, size: number, fireworks_color: THREE.ColorRepresentation)
{
	const firework_geo = new THREE.BufferGeometry();
	var firework_pos = new Float32Array( size * 3 );
	firework_geo.setAttribute( 'position', new THREE.BufferAttribute( firework_pos, 3 ) );
	const firework_m = new THREE.PointsMaterial( { color: fireworks_color } );

	const fireworks = new THREE.Points( firework_geo, firework_m );

	scene.add(fireworks);
	setFirework_pos(scene, fireworks, firework_geo, firework_m, size, x, y, z, elevation);
}

export async function ft_ending_fireworks(pos: any, color: any, ball_s: any, paddles_s: any, scene: any) {
	lauch_end_fireworks = true;
	while (ball_s.trainee_msh.length > 0) {
	  scene.remove(ball_s.trainee_msh[ball_s.trainee_msh.length - 1]);
	  ball_s.trainee_msh.pop();
	  await sleep(10);
	}
  
	if (pos == "left") color = paddles_s.left_col;
	else color = paddles_s.right_col;
  
	let rdX: number;
	let rdZ: number;
  
	while (lauch_end_fireworks == true)
	{
	  rdX = getRandomInt(-60, 60);
	  rdZ = getRandomInt(-30, 40);
	  launchFirework(scene, rdX, 0, rdZ, 20, 25, color);
	  await sleep(getRandomInt(1500, 2000));
	}
  };

  export function stop_ending_fireworks()
  {
	lauch_end_fireworks = false;
  };

  function getRandomInt(min: any, max: any) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
  }
  