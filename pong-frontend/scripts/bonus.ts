import * as THREE from 'three'

export function init_bonus(scene: THREE.Scene, BLOOM_SCENE: number)
{
	const geometry_bonus = new THREE.BoxGeometry(1, 1, 1);
const bonus_m = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false} );
const bonus_mesh = new THREE.Mesh( geometry_bonus, bonus_m );
bonus_mesh.position.y = -50;

var BonusoutlineMaterial= new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
const geometry_bonus_out = new THREE.BoxGeometry(2,2,2);
var BonusoutlineMesh = new THREE.Mesh( geometry_bonus_out, BonusoutlineMaterial );
BonusoutlineMesh.position.x = bonus_mesh.position.x;
BonusoutlineMesh.position.y = bonus_mesh.position.y;
BonusoutlineMesh.position.z = bonus_mesh.position.z;

scene.add (bonus_mesh, BonusoutlineMesh);
BonusoutlineMesh.layers.enable( BLOOM_SCENE );

let bonus_s =
{
	bonus: bonus_mesh,
	bonus_outline: BonusoutlineMesh,
	bonus_type: 0
};

return (bonus_s);
}


export function spawn_bonus (infos: any, bonus_s :any)
{
	if (infos.isbonus < 5)
	{
		bonus_s.bonus_outline.material.color.setHex(0xff0000);
		bonus_s.bonus_type = 0;
	}
	else
	{
		bonus_s.bonus_outline.material.color.setHex(0x00ff00);
		bonus_s.bonus_type = 1;
	}
	bonus_s.bonus.position.y = 0.2;
	bonus_s.bonus.position.x = infos.bx;
	bonus_s.bonus.position.z = infos.bz;
	bonus_s.bonus_outline.position.y = 0.2;
	bonus_s.bonus_outline.position.x = infos.bx;
	bonus_s.bonus_outline.position.z = infos.bz;
}

export function bonus_taken (infos: any, bonus_s: any, paddles_s: any)
{
	console.log("BONUS TAKEN");
	bonus_s.bonus.position.y = -50;
	bonus_s.bonus_outline.position.y = -50;
	bonus_s.bonus_outline.material.color.setHex(0xfffff);
	if (infos.taker == 0)//Left took the bonus
	{
		if (bonus_s.bonus_type == 0)//Malus
		{
			paddles_s.bar_left.scale.set(1, 1, 0.5);
			paddles_s.bar_left_out.scale.set(1, 1, 0.5);
		}
		else
		{
			paddles_s.bar_left.scale.set(1, 1, 1.5);
			paddles_s.bar_left_out.scale.set(1, 1, 1.5);
		}		
		console.log("Left took the bonus");
	}
	else
	{
		if (bonus_s.bonus_type == 0)//Malus
		{
			paddles_s.bar_right.scale.set(1, 1, 0.5);
			paddles_s.bar_right_out.scale.set(1, 1, 0.5);
		}
		else
		{
			paddles_s.bar_right.scale.set(1, 1, 1.5);
			paddles_s.bar_right_out.scale.set(1, 1, 1.5);
		}		
		console.log("Right took the bonus");
	}
	bonus_s.bonus_outline.material.color.setHex(0x0000ff);
}

export function update_paddles_size(infos: any, paddles_s: any)
{
	if (infos.lp == 1)
	{
		paddles_s.bar_left.scale.set(1, 1, 1.5);
		paddles_s.bar_left_out.scale.set(1, 1, 1.5);
	}
	else if (infos.lp == -1)
	{
		paddles_s.bar_left.scale.set(1, 1, 0.5);
		paddles_s.bar_left_out.scale.set(1, 1, 0.5);
	}
	if (infos.rp == 1)
	{
		paddles_s.bar_right.scale.set(1, 1, 1.5);
		paddles_s.bar_right_out.scale.set(1, 1, 1.5);
	}
	else if (infos.rp == -1)
	{
		paddles_s.bar_right.scale.set(1, 1, 0.5);
		paddles_s.bar_right_out.scale.set(1, 1, 0.5);
	}
}