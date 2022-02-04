export function moveSun(SunMesh: any, IncreaseBrightness: any)
{
	if (SunMesh)
	{
		SunMesh.traverse( function ( child: any ) {
		if ( child.isMesh )
		{
			if (IncreaseBrightness == true)
			{
				child.material.emissiveIntensity += 0.002;
				if (child.material.emissiveIntensity >= 0.75)
					IncreaseBrightness = false;
			}
			else
			{
				child.material.emissiveIntensity -= 0.002;
				if (child.material.emissiveIntensity <= 0.25)
					IncreaseBrightness = true;
			}
		}
		} );
		return (IncreaseBrightness);
	}
}