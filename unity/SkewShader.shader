Shader "Custom/SkewShader" {
	Properties {
		_Color ("Color", Color) = (1,1,1,1)
		_MainTex ("Albedo (RGB)", 2D) = "white" {}
		_Glossiness ("Smoothness", Range(0,1)) = 0.5
		_Metallic ("Metallic", Range(0,1)) = 0.0

		_Velocity ("Velocity", Vector) = (0,0,0,1)
		_VelocityDelta ("VelocityDelta", Vector) = (0,0,0,1)
		_Movement ("Movement", Vector) = (0,0,0,1)
		_TailOffset ("TailOffset", Vector) = (0,0,0,1)
	}
	SubShader {
		Tags {
			"RenderType"="Opaque"
		}
		LOD 200

		CGPROGRAM
		// Physically based Standard lighting model, and enable shadows on all light types
		#pragma surface surf Standard fullforwardshadows vertex:vert

		// Use shader model 3.0 target, to get nicer looking lighting
		#pragma target 3.0

		struct Input {
			float2 uv_MainTex;
		};

		half _Glossiness;
		half _Metallic;
		fixed4 _Color;

		// Add instancing support for this shader. You need to check 'Enable Instancing' on materials that use the shader.
		// See https://docs.unity3d.com/Manual/GPUInstancing.html for more information about instancing.
		// #pragma instancing_options assumeuniformscaling
		UNITY_INSTANCING_BUFFER_START(Props)
			// put more per-instance properties here
		UNITY_INSTANCING_BUFFER_END(Props)

		float4 _Velocity;
		float4 _VelocityDelta;
		float4 _Movement;
		float4 _TailOffset;

		void vert(inout appdata_full v) {
			float tailLength = length(_TailOffset);

			float skewX = 0, skewY = 0;
			float offX = 0, offY = 0;

			float4 o = normalize(_TailOffset);

			if(abs(o.x) < abs(o.y)){
				skewX = clamp(o.x / o.y, -1.0f, 1.0f);
				skewY = clamp(o.x / o.y, -1.0f, 1.0f);
			} else {
				skewX = clamp(o.y / o.x, -1.0f, 1.0f);
				skewY = clamp(o.y / o.x, -1.0f, 1.0f);
			}

			offX = clamp(abs(o.x) / abs(o.y) - 1.0f, 0.0f, 1.0f);
			offY = clamp(abs(o.y) / abs(o.x) - 1.0f, 0.0f, 1.0f);

			float squishAmount = clamp(tailLength - 1.0f, -1.0f, 1.0f);
			if(squishAmount < -0.5f) squishAmount = -1 - squishAmount;

			skewX *= squishAmount;
			skewY *= squishAmount;

			offX *= squishAmount;
			offY *= squishAmount;

			float4x4 modifier = float4x4(
				1 + offX, skewX, 0, 0,
				skewY, 1 + offY, 0, 0,
				0, 0, 1, 0, 
				0, 0, 0, 1
			);

			v.vertex = mul(modifier, v.vertex);
		}

		sampler2D _MainTex;
		void surf (Input IN, inout SurfaceOutputStandard o) {
			// Albedo comes from a texture tinted by color
			fixed4 c = tex2D (_MainTex, IN.uv_MainTex) * _Color;
			o.Albedo = c.rgb;
			// Metallic and smoothness come from slider variables
			o.Metallic = _Metallic;
			o.Smoothness = _Glossiness;
			o.Alpha = c.a;
		}
		ENDCG
	}
	FallBack "Diffuse"
}
