using UnityEngine;
using System.Collections;

[ExecuteInEditMode]
public class LineEffect : MonoBehaviour {

	public float intensity;
	public Color line;
	public Color background;

	public Shader shader;
	private Material material;

	// Creates a private material used to the effect
	void Awake ()
	{
		Shader effect = Shader.Find ("Hidden/LineEffect");
		material = new Material(shader);
	}

	// Postprocess the image
	void OnRenderImage (RenderTexture source, RenderTexture destination)
	{
		if (material == null) {
			material = new Material(shader);
		}
		if (intensity == 0)
		{
			Graphics.Blit (source, destination);
			return;
		}

		material.SetFloat("_Intensity", intensity);
		material.SetColor("_LineColor", line);
		material.SetColor("_BackgroundColor", background);

		Graphics.Blit (source, destination, material);
	}
}