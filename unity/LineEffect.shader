Shader "Hidden/LineEffect" {
	Properties {
		_MainTex ("Base (RGB)", 2D) = "white" {}
		_LineColor("Line Color", Color) = (0, 0, 0, 1)
		_BackgroundColor("Background Color", Color) = (0.5, 0.5, 0.5, 1)
		_Intensity ("Black & White blend", Range (0, 1)) = 0
	}
	SubShader {
		Pass {
			CGPROGRAM
			#pragma vertex vert_img
			#pragma fragment frag

			#include "UnityCG.cginc"

			uniform sampler2D _MainTex;
			uniform float4    _MainTex_TexelSize;
			uniform float _Intensity;

			uniform float4 _BackgroundColor;
			uniform float4 _LineColor;

			float4 frag(v2f_img i) : COLOR {
				float4 x = tex2D(_MainTex, i.uv);

				float4 q = _MainTex_TexelSize;

				float4 a = tex2D(_MainTex, i.uv + float2(-q.x, q.y));
				float4 b = tex2D(_MainTex, i.uv + float2(-q.x, -q.y));
				float4 c = tex2D(_MainTex, i.uv + float2(q.x, -q.y));
				float4 d = tex2D(_MainTex, i.uv + float2(q.x, q.y));

				float4 a2 = tex2D(_MainTex, i.uv + 2*float2(q.x, 0));
				float4 b2 = tex2D(_MainTex, i.uv + 2*float2(-q.x, 0));
				float4 c2 = tex2D(_MainTex, i.uv + 2*float2(0, q.y));
				float4 d2 = tex2D(_MainTex, i.uv + 2*float2(0, -q.y));

				float4 a3 = tex2D(_MainTex, i.uv + 3*float2(-q.x, q.y));
				float4 b3 = tex2D(_MainTex, i.uv + 3*float2(-q.x, -q.y));
				float4 c3 = tex2D(_MainTex, i.uv + 3*float2(q.x, -q.y));
				float4 d3 = tex2D(_MainTex, i.uv + 3*float2(q.x, q.y));

				float4 a4 = tex2D(_MainTex, i.uv + 4*float2(q.x, 0));
				float4 b4 = tex2D(_MainTex, i.uv + 4*float2(-q.x, 0));
				float4 c4 = tex2D(_MainTex, i.uv + 4*float2(0, q.y));
				float4 d4 = tex2D(_MainTex, i.uv + 4*float2(0, -q.y));

				float4 result;

				float alpha = x.a + 
					a.a + b.a + c.a + d.a +
					a2.a + b2.a + c2.a + d2.a +
					a3.a + b3.a + c3.a + d3.a +
					a4.a + b4.a + c4.a + d4.a;

				if(alpha < 1.0f){
					result.rgb = lerp(_BackgroundColor, _LineColor, alpha);
				} else if (8.0f < alpha) {
					result.rgb = lerp(_LineColor, _BackgroundColor, clamp(alpha - 8.0f, 0.0f, 1.0f));
				} else {
					result.rgb = _LineColor;
				}
				return result;
			}
			ENDCG
		}
	}
}