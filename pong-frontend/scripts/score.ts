import * as THREE from 'three'

var drawfct: any = [];

drawfct[0] = function draw0(crystaltab: any, left: boolean, score_s: {
    crystals: any[];
    ONmatleft: THREE.MeshBasicMaterial;
    ONmatright: THREE.MeshBasicMaterial;
    OFFmat: THREE.MeshBasicMaterial;
    LeftScore: number;
    RightScore: number;
})
{
	let ONcrystalmaterial;
	if (left == true)
		ONcrystalmaterial = score_s.ONmatleft;
	else
		ONcrystalmaterial = score_s.ONmatright;
	crystaltab[0].material = score_s.OFFmat;
	crystaltab[1].material = ONcrystalmaterial;
	crystaltab[2].material = ONcrystalmaterial;
	crystaltab[3].material = ONcrystalmaterial;
	crystaltab[4].material = ONcrystalmaterial;
	crystaltab[5].material = ONcrystalmaterial;
	crystaltab[6].material = ONcrystalmaterial;
}

drawfct[1] = function draw1(crystaltab: any, left: boolean, score_s: {
    crystals: any[];
    ONmatleft: THREE.MeshBasicMaterial;
    ONmatright: THREE.MeshBasicMaterial;
    OFFmat: THREE.MeshBasicMaterial;
    LeftScore: number;
    RightScore: number;
})
{
	let ONcrystalmaterial;
	if (left == true)
		ONcrystalmaterial = score_s.ONmatleft;
	else
		ONcrystalmaterial = score_s.ONmatright;
	crystaltab[0].material = score_s.OFFmat;
	crystaltab[1].material = score_s.OFFmat;
	crystaltab[2].material = ONcrystalmaterial;
	crystaltab[3].material = score_s.OFFmat;
	crystaltab[4].material = ONcrystalmaterial;
	crystaltab[5].material = score_s.OFFmat;
	crystaltab[6].material = score_s.OFFmat;
}

drawfct[2] = function draw2(crystaltab: any, left: boolean, score_s: {
    crystals: any[];
    ONmatleft: THREE.MeshBasicMaterial;
    ONmatright: THREE.MeshBasicMaterial;
    OFFmat: THREE.MeshBasicMaterial;
    LeftScore: number;
    RightScore: number;
})
{
	let ONcrystalmaterial;
	if (left == true)
		ONcrystalmaterial = score_s.ONmatleft;
	else
		ONcrystalmaterial = score_s.ONmatright;
	crystaltab[0].material = ONcrystalmaterial;
	crystaltab[1].material = ONcrystalmaterial;
	crystaltab[2].material = score_s.OFFmat;
	crystaltab[3].material = ONcrystalmaterial;
	crystaltab[4].material = ONcrystalmaterial;
	crystaltab[5].material = score_s.OFFmat;
	crystaltab[6].material = ONcrystalmaterial;
}

drawfct[3] = function draw3(crystaltab: any, left: boolean, score_s: {
    crystals: any[];
    ONmatleft: THREE.MeshBasicMaterial;
    ONmatright: THREE.MeshBasicMaterial;
    OFFmat: THREE.MeshBasicMaterial;
    LeftScore: number;
    RightScore: number;
})
{
	let ONcrystalmaterial;
	if (left == true)
		ONcrystalmaterial = score_s.ONmatleft;
	else
		ONcrystalmaterial = score_s.ONmatright;
	crystaltab[0].material = ONcrystalmaterial;
	crystaltab[1].material = ONcrystalmaterial;
	crystaltab[2].material = ONcrystalmaterial;
	crystaltab[3].material = score_s.OFFmat;
	crystaltab[4].material = ONcrystalmaterial;
	crystaltab[5].material = score_s.OFFmat;
	crystaltab[6].material = ONcrystalmaterial;
}

drawfct[4] = function draw4(crystaltab: any, left: boolean, score_s: {
    crystals: any[];
    ONmatleft: THREE.MeshBasicMaterial;
    ONmatright: THREE.MeshBasicMaterial;
    OFFmat: THREE.MeshBasicMaterial;
    LeftScore: number;
    RightScore: number;
})
{
	let ONcrystalmaterial;
	if (left == true)
		ONcrystalmaterial = score_s.ONmatleft;
	else
		ONcrystalmaterial = score_s.ONmatright;
	crystaltab[0].material = ONcrystalmaterial;
	crystaltab[1].material = score_s.OFFmat;
	crystaltab[2].material = ONcrystalmaterial;
	crystaltab[3].material = score_s.OFFmat;
	crystaltab[4].material = ONcrystalmaterial;
	crystaltab[5].material = ONcrystalmaterial;
	crystaltab[6].material = score_s.OFFmat;
}

drawfct[5] = function draw5(crystaltab: any, left: boolean, score_s: {
    crystals: any[];
    ONmatleft: THREE.MeshBasicMaterial;
    ONmatright: THREE.MeshBasicMaterial;
    OFFmat: THREE.MeshBasicMaterial;
    LeftScore: number;
    RightScore: number;
})
{
	let ONcrystalmaterial;
	if (left == true)
		ONcrystalmaterial = score_s.ONmatleft;
	else
		ONcrystalmaterial = score_s.ONmatright;
	crystaltab[0].material = ONcrystalmaterial;
	crystaltab[1].material = ONcrystalmaterial;
	crystaltab[2].material = ONcrystalmaterial;
	crystaltab[3].material = score_s.OFFmat;
	crystaltab[4].material = score_s.OFFmat;
	crystaltab[5].material = ONcrystalmaterial;
	crystaltab[6].material = ONcrystalmaterial;
}

drawfct[6] = function draw6(crystaltab: any, left: boolean, score_s: {
    crystals: any[];
    ONmatleft: THREE.MeshBasicMaterial;
    ONmatright: THREE.MeshBasicMaterial;
    OFFmat: THREE.MeshBasicMaterial;
    LeftScore: number;
    RightScore: number;
})
{
	let ONcrystalmaterial;
	if (left == true)
		ONcrystalmaterial = score_s.ONmatleft;
	else
		ONcrystalmaterial = score_s.ONmatright;
	crystaltab[0].material = ONcrystalmaterial;
	crystaltab[1].material = ONcrystalmaterial;
	crystaltab[2].material = ONcrystalmaterial;
	crystaltab[3].material = ONcrystalmaterial;
	crystaltab[4].material = score_s.OFFmat;
	crystaltab[5].material = ONcrystalmaterial;
	crystaltab[6].material = ONcrystalmaterial;
}

drawfct[7] = function draw7(crystaltab: any, left: boolean, score_s: {
    crystals: any[];
    ONmatleft: THREE.MeshBasicMaterial;
    ONmatright: THREE.MeshBasicMaterial;
    OFFmat: THREE.MeshBasicMaterial;
    LeftScore: number;
    RightScore: number;
})
{
	let ONcrystalmaterial;
	if (left == true)
		ONcrystalmaterial = score_s.ONmatleft;
	else
		ONcrystalmaterial = score_s.ONmatright;
	crystaltab[0].material = score_s.OFFmat;
	crystaltab[1].material = score_s.OFFmat;
	crystaltab[2].material = ONcrystalmaterial;
	crystaltab[3].material = score_s.OFFmat;
	crystaltab[4].material = ONcrystalmaterial;
	crystaltab[5].material = score_s.OFFmat;;
	crystaltab[6].material = ONcrystalmaterial;
}

drawfct[8] = function draw8(crystaltab: any, left: boolean, score_s: {
    crystals: any[];
    ONmatleft: THREE.MeshBasicMaterial;
    ONmatright: THREE.MeshBasicMaterial;
    OFFmat: THREE.MeshBasicMaterial;
    LeftScore: number;
    RightScore: number;
})
{
	let ONcrystalmaterial;
	if (left == true)
		ONcrystalmaterial = score_s.ONmatleft;
	else
		ONcrystalmaterial = score_s.ONmatright;
	crystaltab[0].material = ONcrystalmaterial;
	crystaltab[1].material = ONcrystalmaterial;
	crystaltab[2].material = ONcrystalmaterial;
	crystaltab[3].material = ONcrystalmaterial;
	crystaltab[4].material = ONcrystalmaterial;
	crystaltab[5].material = ONcrystalmaterial;
	crystaltab[6].material = ONcrystalmaterial;
}

drawfct[9] = function draw9(crystaltab: any, left: boolean, score_s: {
    crystals: any[];
    ONmatleft: THREE.MeshBasicMaterial;
    ONmatright: THREE.MeshBasicMaterial;
    OFFmat: THREE.MeshBasicMaterial;
    LeftScore: number;
    RightScore: number;
})
{
	let ONcrystalmaterial;
	if (left == true)
		ONcrystalmaterial = score_s.ONmatleft;
	else
		ONcrystalmaterial = score_s.ONmatright;
	crystaltab[0].material = ONcrystalmaterial;
	crystaltab[1].material = ONcrystalmaterial;
	crystaltab[2].material = ONcrystalmaterial;
	crystaltab[3].material = score_s.OFFmat;
	crystaltab[4].material = ONcrystalmaterial;
	crystaltab[5].material = ONcrystalmaterial;
	crystaltab[6].material = ONcrystalmaterial;
}

export function updateScore(score_s: {
    crystals: any[];
    ONmatleft: THREE.MeshBasicMaterial;
    ONmatright: THREE.MeshBasicMaterial;
    OFFmat: THREE.MeshBasicMaterial;
    LeftScore: number;
    RightScore: number;
})
{
	if (score_s.LeftScore > 99)
		score_s.LeftScore = 99;
	if (score_s.RightScore > 99)
		score_s.RightScore = 99;
	let lscoreunite = score_s.LeftScore % 10;
	let rscoreunite = score_s.RightScore % 10;
	let lscoredizaine = (score_s.LeftScore - lscoreunite) / 10;
	let rscoredizaine = (score_s.RightScore - rscoreunite) / 10;
	
	drawfct[lscoredizaine](score_s.crystals[0], true, score_s);
	drawfct[lscoreunite](score_s.crystals[1], true, score_s);
	drawfct[rscoredizaine](score_s.crystals[2], false, score_s);
	drawfct[rscoreunite](score_s.crystals[3], false, score_s);
}
