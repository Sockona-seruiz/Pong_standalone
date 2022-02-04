import * as THREE from 'three'

export function init_score(scene: THREE.Scene, config: {
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
	const x = 0, y = 0;

	const rightrithcrystal: any = [];

	const crystalshape = new THREE.Shape();

	crystalshape.moveTo( x + 5, y );
	crystalshape.lineTo(x + 5 - 0.5, y - 0.5);
	crystalshape.lineTo(x + 0.5, y - 0.5);
	crystalshape.lineTo(0, 0);

	const ONcrystalmaterialleft = new THREE.MeshBasicMaterial( { color: 0x42e7ff, side:THREE.DoubleSide } );
	const ONcrystalmaterialright = new THREE.MeshBasicMaterial( { color: 0xff5ec3, side:THREE.DoubleSide } );
	const OFFcrystalmaterial = new THREE.MeshBasicMaterial( { color: 0x040404, side:THREE.DoubleSide } );

	const crystalgeometry = new THREE.ShapeGeometry( crystalshape );
	const crystalmeshTop = new THREE.Mesh( crystalgeometry, OFFcrystalmaterial ) ;
	crystalmeshTop.position.set(0, 19.5, 10);
	rightrithcrystal.unshift(crystalmeshTop);

	const crystalmeshTopLeft = new THREE.Mesh( crystalgeometry, OFFcrystalmaterial ) ;
	crystalmeshTopLeft.rotation.z = Math.PI / 2;
	crystalmeshTopLeft.position.set(0, 14, 10);
	rightrithcrystal.unshift(crystalmeshTopLeft);

	const crystalmeshTopRight = new THREE.Mesh( crystalgeometry, OFFcrystalmaterial ) ;
	crystalmeshTopRight.rotation.z = -Math.PI / 2;
	crystalmeshTopRight.position.set(5, 19, 10);
	rightrithcrystal.unshift(crystalmeshTopRight);

	const crystalmeshBotLeft = new THREE.Mesh( crystalgeometry, OFFcrystalmaterial ) ;
	crystalmeshBotLeft.rotation.z = Math.PI / 2;
	crystalmeshBotLeft.position.set(0, 8, 10);
	rightrithcrystal.unshift(crystalmeshBotLeft);

	const crystalmeshBotRight = new THREE.Mesh( crystalgeometry, OFFcrystalmaterial ) ;
	crystalmeshBotRight.rotation.z = - Math.PI / 2;
	crystalmeshBotRight.position.set(5, 13, 10);
	rightrithcrystal.unshift(crystalmeshBotRight);

	const crystalmeshBot = new THREE.Mesh( crystalgeometry, OFFcrystalmaterial ) ;
	crystalmeshBot.rotation.z = Math.PI;
	crystalmeshBot.position.set(5, 7.5, 10);
	rightrithcrystal.unshift(crystalmeshBot);

	const midcrystalshape = new THREE.Shape();

	midcrystalshape.moveTo( x - 0.5, y - 0.5);
	midcrystalshape.lineTo(x, y);
	midcrystalshape.lineTo(x + 4, y);
	midcrystalshape.lineTo(x + 4.5, y - 0.5);
	midcrystalshape.lineTo(x + 4, y - 1);
	midcrystalshape.lineTo(x, y - 1);

	const midcrystalgeometry = new THREE.ShapeGeometry( midcrystalshape );
	const crystalmeshMid = new THREE.Mesh( midcrystalgeometry, OFFcrystalmaterial ) ;
	crystalmeshMid.position.set(0.5, 14, 10);
	rightrithcrystal.unshift(crystalmeshMid);

	var leftleftcrystal: any = [];
	var leftrightcrystal: any = [];
	var rightleftcrystal: any = [];

	for (let i = 0; i < rightrithcrystal.length; i++)
	{
		rightrithcrystal[i].position.x -= 2.5;
		leftleftcrystal[i] = rightrithcrystal[i].clone(rightrithcrystal[i], true);
		leftrightcrystal[i] = rightrithcrystal[i].clone(rightrithcrystal[i], true);
		rightleftcrystal[i] = rightrithcrystal[i].clone(rightrithcrystal[i], true);
		leftleftcrystal[i].position.x -= 26.5;
		leftrightcrystal[i].position.x -= 16.5;
		rightleftcrystal[i].position.x += 16.5;
		rightrithcrystal[i].position.x += 26.5;

		leftleftcrystal[i].position.z -= config.arena_h_2 + 10;
		leftrightcrystal[i].position.z -= config.arena_h_2 + 10;
		rightleftcrystal[i].position.z -= config.arena_h_2 + 10;
		rightrithcrystal[i].position.z -= config.arena_h_2 + 10;

		scene.add( leftleftcrystal[i], leftrightcrystal[i], rightleftcrystal[i], rightrithcrystal[i]);
	}

	var score_s = {
		crystals :[] as any,
		ONmatleft : ONcrystalmaterialleft,
		ONmatright : ONcrystalmaterialright,
		OFFmat : OFFcrystalmaterial,

		LeftScore : 0,
		RightScore : 0
	}

	score_s.crystals[0] = leftleftcrystal;
	score_s.crystals[1] = leftrightcrystal;
	score_s.crystals[2] = rightleftcrystal;
	score_s.crystals[3] = rightrithcrystal;
	return (score_s);
}