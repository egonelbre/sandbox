using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityStandardAssets.CrossPlatformInput;

public class PlayerController : MonoBehaviour
{
	[SerializeField] private float MaxSpeed = 10f;
	// The fastest the player can travel in the x axis.
	[SerializeField] private float JumpForce = 400f;

	[SerializeField] private float AnimationTension = 100f;
	[SerializeField] private float AnimationDampening = 0.85f;

	[SerializeField] GameObject Tail;

	private Rigidbody2D rigidbody;
	private Material movementMaterial;

	private Vector3 lastPosition = Vector3.zero;
	private Vector3 lastVelocity = Vector3.zero;

	private Vector3 tailPosition = Vector3.zero;
	private Vector3 tailVelocity = Vector3.zero;

	void Start ()
	{
		rigidbody = GetComponent<Rigidbody2D> ();
		movementMaterial = GetComponent<Renderer> ().material;

		tailPosition = transform.position;
	}

	void FixedUpdate ()
	{
		float move = CrossPlatformInputManager.GetAxis ("Horizontal");
		rigidbody.velocity = new Vector2 (move * MaxSpeed, rigidbody.velocity.y);
		if (CrossPlatformInputManager.GetButtonDown ("Jump")) {
			rigidbody.AddForce (new Vector2 (0f, JumpForce));
		}

		Vector3 tailDelta = transform.position - tailPosition;
		float distance = tailDelta.magnitude;
		float strength = distance * AnimationTension;

		Vector3 force = tailDelta * strength;// / (distance + 1f);
		tailVelocity += force * Time.fixedDeltaTime;
		tailVelocity *= AnimationDampening;
		tailPosition += tailVelocity * Time.fixedDeltaTime;

		Tail.transform.position = tailPosition;

		movementMaterial.SetVector ("_TailOffset", tailPosition - transform.position);
	}

	void OnDrawGizmos ()
	{
		UnityEngine.Gizmos.color = Color.red;
		UnityEngine.Gizmos.DrawRay (transform.position, tailPosition - transform.position);
		UnityEngine.Gizmos.DrawSphere (tailPosition, 0.2f);
	}

	void Update ()
	{
		
	}
}
