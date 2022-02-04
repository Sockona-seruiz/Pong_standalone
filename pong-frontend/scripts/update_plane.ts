export function updateplane(plane_s: any, audio_s: any)
{
	plane_s.vertices = plane_s.plane.geometry.attributes.position.array;
	//Lower Average = les basses (aka les traits du centre)
	for(let i = 0; i < plane_s.plane.geometry.attributes.position.count; i++)
	{
		plane_s.vertices[ i * 3 + 2 ] = ((audio_s.upperAvgFr / 10) + (- audio_s.upperMidAvgFr / 16) + (- audio_s.lowerMidAvgFr / 14) + (audio_s.lowerAvgFr / 12)) * plane_s.plane_seed[i];
	}
	plane_s.plane.geometry.attributes.position.needsUpdate = true;
	plane_s.plane.geometry.verticesNeedUpdate = true;
	plane_s.plane.geometry.normalsNeedUpdate = true;
	plane_s.plane.geometry.computeVertexNormals();
}