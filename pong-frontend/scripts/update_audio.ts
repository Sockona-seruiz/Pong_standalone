function avg(arr: any)
{
	var total = arr.reduce(function(sum: any, b: any) { return sum + b; });
	return (total / arr.length);
}

export function updateAudioVisualizer(audio_s: any)
{
	audio_s.FrqData = audio_s.analyser.getFrequencyData();
	audio_s.avgFreq = audio_s.analyser.getAverageFrequency();
	audio_s.lowerHalfArray = audio_s.FrqData.slice(0, (audio_s.FrqData.length/4) - 1);
	audio_s.lowerAvg = avg(audio_s.lowerHalfArray);
	audio_s.lowerAvgFr = audio_s.lowerAvg / audio_s.lowerHalfArray.length;
	audio_s.lowerMidArray = audio_s.FrqData.slice((audio_s.FrqData.length/4) - 1, (2 * audio_s.FrqData.length/4) - 1);
	audio_s.lowerMidAvg = avg(audio_s.lowerMidArray);
	audio_s.lowerMidAvgFr = audio_s.lowerMidAvg / audio_s.lowerMidArray.length;
	audio_s.upperMidArray = audio_s.FrqData.slice((2 * audio_s.FrqData.length/4) - 1, (3 * audio_s.FrqData.length/4) - 1);
	audio_s.upperMidAvg = avg(audio_s.upperMidArray);
	audio_s.upperMidAvgFr = audio_s.upperMidAvg / audio_s.upperMidArray.length;
	audio_s.upperHalfArray = audio_s.FrqData.slice( (3 * audio_s.FrqData.length/4) - 1, audio_s.FrqData.length - 1);
	audio_s.upperAvg = avg(audio_s.upperHalfArray);
	audio_s.upperAvgFr = audio_s.upperAvg / audio_s.upperHalfArray.length;

	let j = 0;
	for (let i = audio_s.FrqData.length - 1, len = 0; i >= len; i--)
	{
		audio_s.calc =  audio_s.avgFreq / 120 + audio_s.FrqData[j] / 40;
		audio_s.calc_2 = audio_s.calc / 2;
		audio_s.AudioMeshArray_L[i].scale.set(1, audio_s.calc, 1);
		audio_s.AudioMeshArray_L[i].position.y = audio_s.calc_2;
		audio_s.AudioMeshArray_R[i].scale.set(1, audio_s.calc, 1);
		audio_s.AudioMeshArray_R[i].position.y = audio_s.calc_2;
		audio_s.AudioMeshArray_OL[i].scale.set(1, audio_s.calc, 1);
		audio_s.AudioMeshArray_OL[i].position.y = audio_s.calc_2;
		audio_s.AudioMeshArray_OR[i].scale.set(1, audio_s.calc, 1);
		audio_s.AudioMeshArray_OR[i].position.y = audio_s.calc_2;
		j++;
	}
}