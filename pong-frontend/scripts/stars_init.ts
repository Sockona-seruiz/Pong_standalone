import * as THREE from 'three'

export function init_stars(scene: THREE.Scene, config: any)
{
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
};