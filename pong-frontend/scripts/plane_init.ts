import * as THREE from 'three'

export function init_plane(scene: THREE.Scene)
{
	var Floorcol = 0x8108ff;
	var M_PI_2 = Math.PI / 2;
	var planeGeometry = new THREE.PlaneGeometry(600, 300, 40, 20);
	var planeMaterial = new THREE.MeshPhongMaterial({
		color: Floorcol,
		side: THREE.DoubleSide,
		wireframe: true,
		emissive : Floorcol,
		emissiveIntensity : 2.5,
	});
	var UnderplaneGeometry = new THREE.PlaneGeometry(700, 350, 2, 2);

    var loader = new THREE.TextureLoader();
    var texture = loader.load( 'textures/gradient_blue_pink.png' );

	var UnderplaneMaterial = new THREE.MeshPhongMaterial({
		side: THREE.DoubleSide,
		wireframe: false,
		emissive : Floorcol,
		emissiveIntensity : 0.085,
		emissiveMap : texture
    });
  
	var plane_msh = new THREE.Mesh(planeGeometry, planeMaterial);
    var Underplane_msh = new THREE.Mesh(UnderplaneGeometry, UnderplaneMaterial);
	plane_msh.rotation.x += M_PI_2;
	Underplane_msh.rotation.x += M_PI_2;
	plane_msh.position.set(0, -10, -100);
	Underplane_msh.position.set(0, -18, -100);
	scene.add(plane_msh, Underplane_msh);

	var plane_seed_rd = [];
	for(let i = 0; i < plane_msh.geometry.attributes.position.count; i++){
		plane_seed_rd.unshift(Math.random() * (1 + 1) - 1);
	}

	let plane_s = {
		plane : plane_msh,
		under_plane : Underplane_msh,
		plane_seed : plane_seed_rd,

		vertices : 0
	}
	return (plane_s);
}
