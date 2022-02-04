import * as THREE from 'three'

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
	// const firework_v = [];

	// firework_v.push(x, y, z);
	const firework_geo = new THREE.BufferGeometry();
	var firework_pos = new Float32Array( size * 3 );
	firework_geo.setAttribute( 'position', new THREE.BufferAttribute( firework_pos, 3 ) );
	const firework_m = new THREE.PointsMaterial( { color: fireworks_color } );

	const fireworks = new THREE.Points( firework_geo, firework_m );

	scene.add(fireworks);
	setFirework_pos(scene, fireworks, firework_geo, firework_m, size, x, y, z, elevation);


	// while (fireworks[0].position.x < x + 20)
	// 	fireworks[0].position.x += 0.05;
}