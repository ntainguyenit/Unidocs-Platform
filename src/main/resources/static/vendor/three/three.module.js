/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */import{Matrix3 as we,Vector2 as pt,Color as qe,mergeUniforms as gt,Vector3 as He,Mesh as Ot,BoxGeometry as _a,ShaderMaterial as qt,BackSide as _t,cloneUniforms as Ga,Matrix4 as Kt,ColorManagement as $e,SRGBTransfer as We,PlaneGeometry as Ha,FrontSide as Qt,getUnlitUniformColorSpace as ui,IntType as Va,warn as Ge,HalfFloatType as Pt,UnsignedByteType as At,FloatType as It,RGBAFormat as yt,Plane as fi,WebGLRenderTarget as Ct,CubeTexture as Wa,NoBlending as Yt,LinearMipmapLinearFilter as Bt,LinearFilter as xt,CubeCamera as va,floorPowerOfTwo as ho,CubeReflectionMapping as oa,CubeRefractionMapping as Jt,LinearSRGBColorSpace as za,EquirectangularReflectionMapping as Sa,EquirectangularRefractionMapping as Ea,warnOnce as pi,Uint32BufferAttribute as mi,Uint16BufferAttribute as hi,error as Ke,DataArrayTexture as ka,Vector4 as mt,BufferGeometry as Xa,Float32BufferAttribute as qa,RawShaderMaterial as gi,OrthographicCamera as _i,DepthTexture as ea,DepthStencilFormat as Gt,UnsignedInt248Type as jt,NoToneMapping as Dt,CustomToneMapping as Ka,NeutralToneMapping as Ya,AgXToneMapping as ja,ACESFilmicToneMapping as Za,CineonToneMapping as $a,ReinhardToneMapping as Qa,LinearToneMapping as Ja,Data3DTexture as vi,AlwaysCompare as er,Texture as Si,CubeDepthTexture as tr,GLSL3 as ar,VSMShadowMap as ta,PCFShadowMap as sa,AddOperation as Ei,MixOperation as Mi,MultiplyOperation as Ti,LinearTransfer as rr,UniformsUtils as xi,DoubleSide as Nt,NormalBlending as la,TangentSpaceNormalMap as ir,ObjectSpaceNormalMap as Ri,Layers as Ai,RGFormat as Zt,RG11_EAC_Format as Ma,RED_GREEN_RGTC2_Format as Ta,MeshDepthMaterial as Ci,MeshDistanceMaterial as bi,BufferAttribute as Li,PCFSoftShadowMap as Pi,DepthFormat as aa,NearestFilter as Ht,UnsignedIntType as Vt,GreaterEqualCompare as nr,LessEqualCompare as or,Frustum as sr,LessEqualDepth as lr,ReverseSubtractEquation as Di,SubtractEquation as Ni,AddEquation as ra,OneMinusConstantAlphaFactor as Ui,ConstantAlphaFactor as wi,OneMinusConstantColorFactor as Ii,ConstantColorFactor as yi,OneMinusDstAlphaFactor as Fi,OneMinusDstColorFactor as Oi,OneMinusSrcAlphaFactor as Bi,OneMinusSrcColorFactor as Gi,DstAlphaFactor as Hi,DstColorFactor as Vi,SrcAlphaSaturateFactor as Wi,SrcAlphaFactor as zi,SrcColorFactor as ki,OneFactor as Xi,ZeroFactor as qi,NotEqualDepth as Ki,GreaterDepth as Yi,GreaterEqualDepth as ji,EqualDepth as Zi,LessDepth as $i,AlwaysDepth as Qi,NeverDepth as Ji,CullFaceNone as en,CullFaceBack as cr,CullFaceFront as tn,CustomBlending as an,MultiplyBlending as dr,SubtractiveBlending as ur,AdditiveBlending as fr,ReversedDepthFuncs as go,MinEquation as rn,MaxEquation as nn,MirroredRepeatWrapping as on,ClampToEdgeWrapping as xa,RepeatWrapping as sn,LinearMipmapNearestFilter as Ra,NearestMipmapLinearFilter as ca,NearestMipmapNearestFilter as ln,NotEqualCompare as cn,GreaterCompare as dn,EqualCompare as un,LessCompare as fn,NeverCompare as pn,NoColorSpace as $t,getByteLength as mn,UnsignedShortType as da,createElementNS as _o,UnsignedShort4444Type as pr,UnsignedShort5551Type as mr,UnsignedInt5999Type as hn,UnsignedInt101111Type as gn,ByteType as _n,ShortType as vn,AlphaFormat as Sn,RGBFormat as En,RedFormat as Mn,RedIntegerFormat as hr,RGIntegerFormat as gr,RGBAIntegerFormat as _r,RGB_S3TC_DXT1_Format as Aa,RGBA_S3TC_DXT1_Format as Ca,RGBA_S3TC_DXT3_Format as ba,RGBA_S3TC_DXT5_Format as La,RGB_PVRTC_4BPPV1_Format as vr,RGB_PVRTC_2BPPV1_Format as Sr,RGBA_PVRTC_4BPPV1_Format as Er,RGBA_PVRTC_2BPPV1_Format as Mr,RGB_ETC1_Format as Tr,RGB_ETC2_Format as xr,RGBA_ETC2_EAC_Format as Rr,R11_EAC_Format as Ar,SIGNED_R11_EAC_Format as Cr,SIGNED_RG11_EAC_Format as br,RGBA_ASTC_4x4_Format as Lr,RGBA_ASTC_5x4_Format as Pr,RGBA_ASTC_5x5_Format as Dr,RGBA_ASTC_6x5_Format as Nr,RGBA_ASTC_6x6_Format as Ur,RGBA_ASTC_8x5_Format as wr,RGBA_ASTC_8x6_Format as Ir,RGBA_ASTC_8x8_Format as yr,RGBA_ASTC_10x5_Format as Fr,RGBA_ASTC_10x6_Format as Or,RGBA_ASTC_10x8_Format as Br,RGBA_ASTC_10x10_Format as Gr,RGBA_ASTC_12x10_Format as Hr,RGBA_ASTC_12x12_Format as Vr,RGBA_BPTC_Format as Wr,RGB_BPTC_SIGNED_Format as zr,RGB_BPTC_UNSIGNED_Format as kr,RED_RGTC1_Format as Xr,SIGNED_RED_RGTC1_Format as qr,SIGNED_RED_GREEN_RGTC2_Format as Kr,ExternalTexture as Yr,EventDispatcher as Tn,PerspectiveCamera as Pa,ArrayCamera as xn,WebXRController as Da,RAD2DEG as vo,DataTexture as Rn,createCanvasElement as An,SRGBColorSpace as Cn,REVISION as bn,log as jr,FrustumArray as Ln,WebGLCoordinateSystem as Zr,probeAsync as So}from"./three.core.js";export{AdditiveAnimationBlendMode,AlwaysStencilFunc,AmbientLight,AnimationAction,AnimationClip,AnimationLoader,AnimationMixer,AnimationObjectGroup,AnimationUtils,ArcCurve,ArrowHelper,AttachedBindMode,Audio,AudioAnalyser,AudioContext,AudioListener,AudioLoader,AxesHelper,BasicDepthPacking,BasicShadowMap,BatchedMesh,BezierInterpolant,Bone,BooleanKeyframeTrack,Box2,Box3,Box3Helper,BoxHelper,BufferGeometryLoader,Cache,Camera,CameraHelper,CanvasTexture,CapsuleGeometry,CatmullRomCurve3,CircleGeometry,Clock,ColorKeyframeTrack,Compatibility,CompressedArrayTexture,CompressedCubeTexture,CompressedTexture,CompressedTextureLoader,ConeGeometry,Controls,CubeTextureLoader,CubicBezierCurve,CubicBezierCurve3,CubicInterpolant,CullFaceFrontBack,Curve,CurvePath,CylinderGeometry,Cylindrical,DataTextureLoader,DataUtils,DecrementStencilOp,DecrementWrapStencilOp,DefaultLoadingManager,DetachedBindMode,DirectionalLight,DirectionalLightHelper,DiscreteInterpolant,DodecahedronGeometry,DynamicCopyUsage,DynamicDrawUsage,DynamicReadUsage,EdgesGeometry,EllipseCurve,EqualStencilFunc,Euler,ExtrudeGeometry,FileLoader,Float16BufferAttribute,Fog,FogExp2,FramebufferTexture,GLBufferAttribute,GLSL1,GreaterEqualStencilFunc,GreaterStencilFunc,GridHelper,Group,HTMLTexture,HemisphereLight,HemisphereLightHelper,IcosahedronGeometry,ImageBitmapLoader,ImageLoader,ImageUtils,IncrementStencilOp,IncrementWrapStencilOp,InstancedBufferAttribute,InstancedBufferGeometry,InstancedInterleavedBuffer,InstancedMesh,Int16BufferAttribute,Int32BufferAttribute,Int8BufferAttribute,InterleavedBuffer,InterleavedBufferAttribute,Interpolant,InterpolateBezier,InterpolateDiscrete,InterpolateLinear,InterpolateSmooth,InterpolationSamplingMode,InterpolationSamplingType,InvertStencilOp,KeepStencilOp,KeyframeTrack,LOD,LatheGeometry,LessEqualStencilFunc,LessStencilFunc,Light,LightProbe,LightShadow,Line,Line3,LineBasicMaterial,LineCurve,LineCurve3,LineDashedMaterial,LineLoop,LineSegments,LinearInterpolant,LinearMipMapLinearFilter,LinearMipMapNearestFilter,Loader,LoaderUtils,LoadingManager,LoopOnce,LoopPingPong,LoopRepeat,MOUSE,Material,MaterialBlending,MaterialLoader,MathUtils,Matrix2,MeshBasicMaterial,MeshLambertMaterial,MeshMatcapMaterial,MeshNormalMaterial,MeshPhongMaterial,MeshPhysicalMaterial,MeshStandardMaterial,MeshToonMaterial,NearestMipMapLinearFilter,NearestMipMapNearestFilter,NeverStencilFunc,NoNormalPacking,NormalAnimationBlendMode,NormalGAPacking,NormalRGPacking,NotEqualStencilFunc,NumberKeyframeTrack,Object3D,ObjectLoader,OctahedronGeometry,Path,PlaneHelper,PointLight,PointLightHelper,Points,PointsMaterial,PolarGridHelper,PolyhedronGeometry,PositionalAudio,PropertyBinding,PropertyMixer,QuadraticBezierCurve,QuadraticBezierCurve3,Quaternion,QuaternionKeyframeTrack,QuaternionLinearInterpolant,RGBADepthPacking,RGBDepthPacking,RGBIntegerFormat,RGDepthPacking,Ray,Raycaster,RectAreaLight,RenderObjectRefreshType,RenderTarget,RenderTarget3D,ReplaceStencilOp,RingGeometry,Scene,ShadowMaterial,Shape,ShapeGeometry,ShapePath,ShapeUtils,Skeleton,SkeletonHelper,SkinnedMesh,Source,Sphere,SphereGeometry,Spherical,SphericalHarmonics3,SplineCurve,SpotLight,SpotLightHelper,Sprite,SpriteMaterial,StaticCopyUsage,StaticDrawUsage,StaticReadUsage,StereoCamera,StreamCopyUsage,StreamDrawUsage,StreamReadUsage,StringKeyframeTrack,TOUCH,TetrahedronGeometry,TextureLoader,TextureSource,TextureUtils,Timer,TimestampQuery,TorusGeometry,TorusKnotGeometry,Triangle,TriangleFanDrawMode,TriangleStripDrawMode,TrianglesDrawMode,TubeGeometry,UVMapping,Uint8BufferAttribute,Uint8ClampedBufferAttribute,Uniform,UniformsGroup,VectorKeyframeTrack,VideoFrameTexture,VideoTexture,WebGL3DRenderTarget,WebGLArrayRenderTarget,WebGPUCoordinateSystem,WireframeGeometry,WrapAroundEnding,ZeroCurvatureEnding,ZeroSlopeEnding,ZeroStencilOp,getConsoleFunction,setConsoleFunction}from"./three.core.js";function Pn(){let e=null,a=!1,t=null,r=null;function c(l,f){r=e.requestAnimationFrame(c),t(l,f)}return{start:function(){a!==!0&&t!==null&&e!==null&&(r=e.requestAnimationFrame(c),a=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),a=!1},setAnimationLoop:function(l){t=l},setContext:function(l){e=l}}}function Eo(e){const a=new WeakMap;function t(g,y){const L=g.array,V=g.usage,O=L.byteLength,v=e.createBuffer();e.bindBuffer(y,v),e.bufferData(y,L,V),g.onUploadCallback();let T;if(L instanceof Float32Array)T=e.FLOAT;else if(typeof Float16Array<"u"&&L instanceof Float16Array)T=e.HALF_FLOAT;else if(L instanceof Uint16Array)g.isFloat16BufferAttribute?T=e.HALF_FLOAT:T=e.UNSIGNED_SHORT;else if(L instanceof Int16Array)T=e.SHORT;else if(L instanceof Uint32Array)T=e.UNSIGNED_INT;else if(L instanceof Int32Array)T=e.INT;else if(L instanceof Int8Array)T=e.BYTE;else if(L instanceof Uint8Array)T=e.UNSIGNED_BYTE;else if(L instanceof Uint8ClampedArray)T=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+L);return{buffer:v,type:T,bytesPerElement:L.BYTES_PER_ELEMENT,version:g.version,size:O}}function r(g,y,L){const V=y.array,O=y.updateRanges;if(e.bindBuffer(L,g),O.length===0)e.bufferSubData(L,0,V);else{O.sort((T,D)=>T.start-D.start);let v=0;for(let T=1;T<O.length;T++){const D=O[v],B=O[T];B.start<=D.start+D.count+1?D.count=Math.max(D.count,B.start+B.count-D.start):(++v,O[v]=B)}O.length=v+1;for(let T=0,D=O.length;T<D;T++){const B=O[T];e.bufferSubData(L,B.start*V.BYTES_PER_ELEMENT,V,B.start,B.count)}y.clearUpdateRanges()}y.onUploadCallback()}function c(g){return g.isInterleavedBufferAttribute&&(g=g.data),a.get(g)}function l(g){g.isInterleavedBufferAttribute&&(g=g.data);const y=a.get(g);y&&(e.deleteBuffer(y.buffer),a.delete(g))}function f(g,y){if(g.isInterleavedBufferAttribute&&(g=g.data),g.isGLBufferAttribute){const V=a.get(g);(!V||V.version<g.version)&&a.set(g,{buffer:g.buffer,type:g.type,bytesPerElement:g.elementSize,version:g.version});return}const L=a.get(g);if(L===void 0)a.set(g,t(g,y));else if(L.version<g.version){if(L.size!==g.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(L.buffer,g,y),L.version=g.version}}return{get:c,remove:l,update:f}}var Mo=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,To=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,xo=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Ro=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ao=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Co=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,bo=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Lo=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Po=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Do=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,No=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Uo=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,wo=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Io=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,yo=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Fo=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Oo=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Bo=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Go=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ho=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Vo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Wo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,zo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,ko=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Xo=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,qo=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ko=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Yo=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,jo=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Zo="gl_FragColor = linearToOutputTexel( gl_FragColor );",$o=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Qo=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Jo=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,es=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ts=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,as=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,rs=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,is=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ns=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,os=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ss=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,ls=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,cs=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ds=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,us=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,fs=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,ps=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ms=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,hs=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,gs=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,_s=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,vs=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ss=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Es=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ms=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ts=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,xs=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Rs=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,As=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Cs=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,bs=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ls=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ps=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Ds=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ns=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Us=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ws=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Is=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ys=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fs=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Os=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Bs=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Gs=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Hs=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Vs=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ws=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,zs=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,ks=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Xs=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,qs=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ks=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Ys=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,js=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Zs=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,$s=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Qs=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Js=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,el=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,tl=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,al=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,rl=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,il=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,nl=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,ol=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,sl=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,ll=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,cl=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,dl=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,ul=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,fl=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,pl=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,ml=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,hl=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,gl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,_l=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,vl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Sl=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const El=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ml=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,xl=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Rl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Al=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cl=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,bl=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Ll=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Pl=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Dl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Nl=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ul=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,wl=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Il=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,yl=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fl=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ol=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bl=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Gl=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hl=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Vl=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Wl=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zl=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kl=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Xl=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ql=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kl=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yl=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,jl=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Zl=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$l=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ql=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Jl=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Le={alphahash_fragment:Mo,alphahash_pars_fragment:To,alphamap_fragment:xo,alphamap_pars_fragment:Ro,alphatest_fragment:Ao,alphatest_pars_fragment:Co,aomap_fragment:bo,aomap_pars_fragment:Lo,batching_pars_vertex:Po,batching_vertex:Do,begin_vertex:No,beginnormal_vertex:Uo,bsdfs:wo,iridescence_fragment:Io,bumpmap_pars_fragment:yo,clipping_planes_fragment:Fo,clipping_planes_pars_fragment:Oo,clipping_planes_pars_vertex:Bo,clipping_planes_vertex:Go,color_fragment:Ho,color_pars_fragment:Vo,color_pars_vertex:Wo,color_vertex:zo,common:ko,defaultnormal_vertex:Xo,displacementmap_pars_vertex:qo,displacementmap_vertex:Ko,emissivemap_fragment:Yo,emissivemap_pars_fragment:jo,colorspace_fragment:Zo,colorspace_pars_fragment:$o,envmap_fragment:Qo,envmap_common_pars_fragment:Jo,envmap_pars_fragment:es,envmap_pars_vertex:ts,envmap_physical_pars_fragment:fs,envmap_vertex:as,fog_vertex:rs,fog_pars_vertex:is,fog_fragment:ns,fog_pars_fragment:os,gradientmap_pars_fragment:ss,lightmap_pars_fragment:ls,lights_lambert_fragment:cs,lights_lambert_pars_fragment:ds,lights_pars_begin:us,lights_toon_fragment:ps,lights_toon_pars_fragment:ms,lights_phong_fragment:hs,lights_phong_pars_fragment:gs,lights_physical_fragment:_s,lights_physical_pars_fragment:vs,lights_fragment_begin:Ss,lights_fragment_maps:Es,lights_fragment_end:Ms,lightprobes_pars_fragment:Ts,logdepthbuf_fragment:xs,logdepthbuf_pars_fragment:Rs,logdepthbuf_pars_vertex:As,logdepthbuf_vertex:Cs,map_fragment:bs,map_pars_fragment:Ls,map_particle_fragment:Ps,map_particle_pars_fragment:Ds,metalnessmap_fragment:Ns,metalnessmap_pars_fragment:Us,morphinstance_vertex:ws,morphcolor_vertex:Is,morphnormal_vertex:ys,morphtarget_pars_vertex:Fs,morphtarget_vertex:Os,normal_fragment_begin:Bs,normal_fragment_maps:Gs,normal_pars_fragment:Hs,normal_pars_vertex:Vs,normal_vertex:Ws,normalmap_pars_fragment:zs,clearcoat_normal_fragment_begin:ks,clearcoat_normal_fragment_maps:Xs,clearcoat_pars_fragment:qs,iridescence_pars_fragment:Ks,opaque_fragment:Ys,packing:js,premultiplied_alpha_fragment:Zs,project_vertex:$s,dithering_fragment:Qs,dithering_pars_fragment:Js,roughnessmap_fragment:el,roughnessmap_pars_fragment:tl,shadowmap_pars_fragment:al,shadowmap_pars_vertex:rl,shadowmap_vertex:il,shadowmask_pars_fragment:nl,skinbase_vertex:ol,skinning_pars_vertex:sl,skinning_vertex:ll,skinnormal_vertex:cl,specularmap_fragment:dl,specularmap_pars_fragment:ul,tonemapping_fragment:fl,tonemapping_pars_fragment:pl,transmission_fragment:ml,transmission_pars_fragment:hl,uv_pars_fragment:gl,uv_pars_vertex:_l,uv_vertex:vl,worldpos_vertex:Sl,background_vert:El,background_frag:Ml,backgroundCube_vert:Tl,backgroundCube_frag:xl,cube_vert:Rl,cube_frag:Al,depth_vert:Cl,depth_frag:bl,distance_vert:Ll,distance_frag:Pl,equirect_vert:Dl,equirect_frag:Nl,linedashed_vert:Ul,linedashed_frag:wl,meshbasic_vert:Il,meshbasic_frag:yl,meshlambert_vert:Fl,meshlambert_frag:Ol,meshmatcap_vert:Bl,meshmatcap_frag:Gl,meshnormal_vert:Hl,meshnormal_frag:Vl,meshphong_vert:Wl,meshphong_frag:zl,meshphysical_vert:kl,meshphysical_frag:Xl,meshtoon_vert:ql,meshtoon_frag:Kl,points_vert:Yl,points_frag:jl,shadow_vert:Zl,shadow_frag:$l,sprite_vert:Ql,sprite_frag:Jl},ue={common:{diffuse:{value:new qe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new we},alphaMap:{value:null},alphaMapTransform:{value:new we},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new we}},envmap:{envMap:{value:null},envMapRotation:{value:new we},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new we}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new we}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new we},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new we},normalScale:{value:new pt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new we},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new we}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new we}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new we}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new qe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new qe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new we},alphaTest:{value:0},uvTransform:{value:new we}},sprite:{diffuse:{value:new qe(16777215)},opacity:{value:1},center:{value:new pt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new we},alphaMap:{value:null},alphaMapTransform:{value:new we},alphaTest:{value:0}}},bt={basic:{uniforms:gt([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.fog]),vertexShader:Le.meshbasic_vert,fragmentShader:Le.meshbasic_frag},lambert:{uniforms:gt([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new qe(0)},envMapIntensity:{value:1}}]),vertexShader:Le.meshlambert_vert,fragmentShader:Le.meshlambert_frag},phong:{uniforms:gt([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new qe(0)},specular:{value:new qe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Le.meshphong_vert,fragmentShader:Le.meshphong_frag},standard:{uniforms:gt([ue.common,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.roughnessmap,ue.metalnessmap,ue.fog,ue.lights,{emissive:{value:new qe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Le.meshphysical_vert,fragmentShader:Le.meshphysical_frag},toon:{uniforms:gt([ue.common,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.gradientmap,ue.fog,ue.lights,{emissive:{value:new qe(0)}}]),vertexShader:Le.meshtoon_vert,fragmentShader:Le.meshtoon_frag},matcap:{uniforms:gt([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,{matcap:{value:null}}]),vertexShader:Le.meshmatcap_vert,fragmentShader:Le.meshmatcap_frag},points:{uniforms:gt([ue.points,ue.fog]),vertexShader:Le.points_vert,fragmentShader:Le.points_frag},dashed:{uniforms:gt([ue.common,ue.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Le.linedashed_vert,fragmentShader:Le.linedashed_frag},depth:{uniforms:gt([ue.common,ue.displacementmap]),vertexShader:Le.depth_vert,fragmentShader:Le.depth_frag},normal:{uniforms:gt([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,{opacity:{value:1}}]),vertexShader:Le.meshnormal_vert,fragmentShader:Le.meshnormal_frag},sprite:{uniforms:gt([ue.sprite,ue.fog]),vertexShader:Le.sprite_vert,fragmentShader:Le.sprite_frag},background:{uniforms:{uvTransform:{value:new we},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Le.background_vert,fragmentShader:Le.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new we}},vertexShader:Le.backgroundCube_vert,fragmentShader:Le.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Le.cube_vert,fragmentShader:Le.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Le.equirect_vert,fragmentShader:Le.equirect_frag},distance:{uniforms:gt([ue.common,ue.displacementmap,{referencePosition:{value:new He},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Le.distance_vert,fragmentShader:Le.distance_frag},shadow:{uniforms:gt([ue.lights,ue.fog,{color:{value:new qe(0)},opacity:{value:1}}]),vertexShader:Le.shadow_vert,fragmentShader:Le.shadow_frag}};bt.physical={uniforms:gt([bt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new we},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new we},clearcoatNormalScale:{value:new pt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new we},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new we},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new we},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new we},sheen:{value:0},sheenColor:{value:new qe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new we},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new we},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new we},transmissionSamplerSize:{value:new pt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new we},attenuationDistance:{value:0},attenuationColor:{value:new qe(0)},specularColor:{value:new qe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new we},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new we},anisotropyVector:{value:new pt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new we}}]),vertexShader:Le.meshphysical_vert,fragmentShader:Le.meshphysical_frag};const Na={r:0,b:0,g:0},ec=new Kt,Dn=new we;Dn.set(-1,0,0,0,1,0,0,0,1);function tc(e,a,t,r,c,l){const f=new qe(0);let g=c===!0?0:1,y,L,V=null,O=0,v=null;function T(_){let N=_.isScene===!0?_.background:null;if(N&&N.isTexture){const S=_.backgroundBlurriness>0;N=a.get(N,S)}return N}function D(_){let N=!1;const S=T(_);S===null?d(f,g):S&&S.isColor&&(d(S,1),N=!0);const b=e.xr.getEnvironmentBlendMode();b==="additive"?t.buffers.color.setClear(0,0,0,1,l):b==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,l),(e.autoClear||N)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function B(_,N){const S=T(N);S&&S.isCubeTexture?(L===void 0&&(L=new Ot(new _a(1,1,1),new qt({name:"BackgroundCubeMaterial",uniforms:Ga(bt.backgroundCube.uniforms),vertexShader:bt.backgroundCube.vertexShader,fragmentShader:bt.backgroundCube.fragmentShader,side:_t,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),L.geometry.deleteAttribute("normal"),L.geometry.deleteAttribute("uv"),L.onBeforeRender=function(b,x,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(L.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(L)),L.material.uniforms.envMap.value=S,L.material.uniforms.backgroundBlurriness.value=N.backgroundBlurriness,L.material.uniforms.backgroundIntensity.value=N.backgroundIntensity,L.material.uniforms.backgroundRotation.value.setFromMatrix4(ec.makeRotationFromEuler(N.backgroundRotation)).transpose(),S.isRenderTargetTexture===!1&&L.material.uniforms.backgroundRotation.value.premultiply(Dn),L.material.toneMapped=$e.getTransfer(S.colorSpace)!==We,(V!==S||O!==S.version||v!==e.toneMapping)&&(L.material.needsUpdate=!0,V=S,O=S.version,v=e.toneMapping),L.layers.enableAll(),_.unshift(L,L.geometry,L.material,0,0,null)):S&&S.isTexture&&(y===void 0&&(y=new Ot(new Ha(2,2),new qt({name:"BackgroundMaterial",uniforms:Ga(bt.background.uniforms),vertexShader:bt.background.vertexShader,fragmentShader:bt.background.fragmentShader,side:Qt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),y.geometry.deleteAttribute("normal"),Object.defineProperty(y.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(y)),y.material.uniforms.t2D.value=S,y.material.uniforms.backgroundIntensity.value=N.backgroundIntensity,y.material.toneMapped=$e.getTransfer(S.colorSpace)!==We,S.matrixAutoUpdate===!0&&S.updateMatrix(),y.material.uniforms.uvTransform.value.copy(S.matrix),(V!==S||O!==S.version||v!==e.toneMapping)&&(y.material.needsUpdate=!0,V=S,O=S.version,v=e.toneMapping),y.layers.enableAll(),_.unshift(y,y.geometry,y.material,0,0,null))}function d(_,N){_.getRGB(Na,ui(e)),t.buffers.color.setClear(Na.r,Na.g,Na.b,N,l)}function s(){L!==void 0&&(L.geometry.dispose(),L.material.dispose(),L=void 0),y!==void 0&&(y.geometry.dispose(),y.material.dispose(),y=void 0)}return{getClearColor:function(){return f},setClearColor:function(_,N=1){f.set(_),g=N,d(f,g)},getClearAlpha:function(){return g},setClearAlpha:function(_){g=_,d(f,g)},render:D,addToRenderList:B,dispose:s}}function ac(e,a){const t=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},c=v(null);let l=c,f=!1;function g(F,z,k,R,Q){let Y=!1;const H=O(F,R,k,z);l!==H&&(l=H,L(l.object)),Y=T(F,R,k,Q),Y&&D(F,R,k,Q),Q!==null&&a.update(Q,e.ELEMENT_ARRAY_BUFFER),(Y||f)&&(f=!1,S(F,z,k,R),Q!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,a.get(Q).buffer))}function y(){return e.createVertexArray()}function L(F){return e.bindVertexArray(F)}function V(F){return e.deleteVertexArray(F)}function O(F,z,k,R){const Q=R.wireframe===!0;let Y=r[z.id];Y===void 0&&(Y={},r[z.id]=Y);const H=F.isInstancedMesh===!0?F.id:0;let ae=Y[H];ae===void 0&&(ae={},Y[H]=ae);let X=ae[k.id];X===void 0&&(X={},ae[k.id]=X);let Z=X[Q];return Z===void 0&&(Z=v(y()),X[Q]=Z),Z}function v(F){const z=[],k=[],R=[];for(let Q=0;Q<t;Q++)z[Q]=0,k[Q]=0,R[Q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:k,attributeDivisors:R,object:F,attributes:{},index:null}}function T(F,z,k,R){const Q=l.attributes,Y=z.attributes;let H=0;const ae=k.getAttributes();for(const X in ae)if(ae[X].location>=0){const Z=Q[X];let re=Y[X];if(re===void 0&&(X==="instanceMatrix"&&F.instanceMatrix&&(re=F.instanceMatrix),X==="instanceColor"&&F.instanceColor&&(re=F.instanceColor)),Z===void 0||Z.attribute!==re||re&&Z.data!==re.data)return!0;H++}return l.attributesNum!==H||l.index!==R}function D(F,z,k,R){const Q={},Y=z.attributes;let H=0;const ae=k.getAttributes();for(const X in ae)if(ae[X].location>=0){let Z=Y[X];Z===void 0&&(X==="instanceMatrix"&&F.instanceMatrix&&(Z=F.instanceMatrix),X==="instanceColor"&&F.instanceColor&&(Z=F.instanceColor));const re={};re.attribute=Z,Z&&Z.data&&(re.data=Z.data),Q[X]=re,H++}l.attributes=Q,l.attributesNum=H,l.index=R}function B(){const F=l.newAttributes;for(let z=0,k=F.length;z<k;z++)F[z]=0}function d(F){s(F,0)}function s(F,z){const k=l.newAttributes,R=l.enabledAttributes,Q=l.attributeDivisors;k[F]=1,R[F]===0&&(e.enableVertexAttribArray(F),R[F]=1),Q[F]!==z&&(e.vertexAttribDivisor(F,z),Q[F]=z)}function _(){const F=l.newAttributes,z=l.enabledAttributes;for(let k=0,R=z.length;k<R;k++)z[k]!==F[k]&&(e.disableVertexAttribArray(k),z[k]=0)}function N(F,z,k,R,Q,Y,H){H===!0?e.vertexAttribIPointer(F,z,k,Q,Y):e.vertexAttribPointer(F,z,k,R,Q,Y)}function S(F,z,k,R){B();const Q=R.attributes,Y=k.getAttributes(),H=z.defaultAttributeValues;for(const ae in Y){const X=Y[ae];if(X.location>=0){let Z=Q[ae];if(Z===void 0&&(ae==="instanceMatrix"&&F.instanceMatrix&&(Z=F.instanceMatrix),ae==="instanceColor"&&F.instanceColor&&(Z=F.instanceColor)),Z!==void 0){const re=Z.normalized,Pe=Z.itemSize,Ue=a.get(Z);if(Ue===void 0)continue;const W=Ue.buffer,fe=Ue.type,Se=Ue.bytesPerElement,Ce=fe===e.INT||fe===e.UNSIGNED_INT||Z.gpuType===Va;if(Z.isInterleavedBufferAttribute){const ge=Z.data,xe=ge.isInterleavedBuffer===!0?ge.stride:ge.itemSize,Qe=Z.offset;if(ge.isInstancedInterleavedBuffer||ge.isInstancedBufferAttribute){for(let De=0;De<X.locationSize;De++)s(X.location+De,ge.meshPerAttribute);F.isInstancedMesh!==!0&&R._maxInstanceCount===void 0&&(R._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let De=0;De<X.locationSize;De++)d(X.location+De);e.bindBuffer(e.ARRAY_BUFFER,W);for(let De=0;De<X.locationSize;De++)N(X.location+De,Pe/X.locationSize,fe,re,xe*Se,(Qe+Pe/X.locationSize*De)*Se,Ce)}else{if(Z.isInstancedBufferAttribute){for(let ge=0;ge<X.locationSize;ge++)s(X.location+ge,Z.meshPerAttribute);F.isInstancedMesh!==!0&&R._maxInstanceCount===void 0&&(R._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let ge=0;ge<X.locationSize;ge++)d(X.location+ge);e.bindBuffer(e.ARRAY_BUFFER,W);for(let ge=0;ge<X.locationSize;ge++)N(X.location+ge,Pe/X.locationSize,fe,re,Pe*Se,Pe/X.locationSize*ge*Se,Ce)}}else if(H!==void 0){const re=H[ae];if(re!==void 0)switch(re.length){case 2:e.vertexAttrib2fv(X.location,re);break;case 3:e.vertexAttrib3fv(X.location,re);break;case 4:e.vertexAttrib4fv(X.location,re);break;default:e.vertexAttrib1fv(X.location,re)}}}}_()}function b(){K();for(const F in r){const z=r[F];for(const k in z){const R=z[k];for(const Q in R){const Y=R[Q];for(const H in Y)V(Y[H].object),delete Y[H];delete R[Q]}}delete r[F]}}function x(F){if(r[F.id]===void 0)return;const z=r[F.id];for(const k in z){const R=z[k];for(const Q in R){const Y=R[Q];for(const H in Y)V(Y[H].object),delete Y[H];delete R[Q]}}delete r[F.id]}function n(F){for(const z in r){const k=r[z];for(const R in k){const Q=k[R];if(Q[F.id]===void 0)continue;const Y=Q[F.id];for(const H in Y)V(Y[H].object),delete Y[H];delete Q[F.id]}}}function p(F){for(const z in r){const k=r[z],R=F.isInstancedMesh===!0?F.id:0,Q=k[R];if(Q!==void 0){for(const Y in Q){const H=Q[Y];for(const ae in H)V(H[ae].object),delete H[ae];delete Q[Y]}delete k[R],Object.keys(k).length===0&&delete r[z]}}}function K(){U(),f=!0,l!==c&&(l=c,L(l.object))}function U(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:g,reset:K,resetDefaultState:U,dispose:b,releaseStatesOfGeometry:x,releaseStatesOfObject:p,releaseStatesOfProgram:n,initAttributes:B,enableAttribute:d,disableUnusedAttributes:_}}function rc(e,a,t){let r;function c(y){r=y}function l(y,L){e.drawArrays(r,y,L),t.update(L,r,1)}function f(y,L,V){V!==0&&(e.drawArraysInstanced(r,y,L,V),t.update(L,r,V))}function g(y,L,V){if(V===0)return;a.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,y,0,L,0,V);let O=0;for(let v=0;v<V;v++)O+=L[v];t.update(O,r,1)}this.setMode=c,this.render=l,this.renderInstances=f,this.renderMultiDraw=g}function ic(e,a,t,r){let c;function l(){if(c!==void 0)return c;if(a.has("EXT_texture_filter_anisotropic")===!0){const n=a.get("EXT_texture_filter_anisotropic");c=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else c=0;return c}function f(n){return!(n!==yt&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function g(n){const p=n===Pt&&(a.has("EXT_color_buffer_half_float")||a.has("EXT_color_buffer_float"));return!(n!==At&&n!==It&&!p&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function y(n){if(n==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";n="mediump"}return n==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let L=t.precision!==void 0?t.precision:"highp";const V=y(L);V!==L&&(Ge("WebGLRenderer:",L,"not supported, using",V,"instead."),L=V);const O=t.reversedDepthBuffer===!0&&a.has("EXT_clip_control"),v=t.logarithmicDepthBuffer===!0&&O===!1;t.reversedDepthBuffer===!0&&O===!1&&Ge("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&O===!0&&Ge("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const T=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),D=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),B=e.getParameter(e.MAX_TEXTURE_SIZE),d=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),s=e.getParameter(e.MAX_VERTEX_ATTRIBS),_=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),N=e.getParameter(e.MAX_VARYING_VECTORS),S=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),b=e.getParameter(e.MAX_SAMPLES),x=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:l,getMaxPrecision:y,textureFormatReadable:f,textureTypeReadable:g,precision:L,logarithmicDepthBuffer:v,reversedDepthBuffer:O,maxTextures:T,maxVertexTextures:D,maxTextureSize:B,maxCubemapSize:d,maxAttributes:s,maxVertexUniforms:_,maxVaryings:N,maxFragmentUniforms:S,maxSamples:b,samples:x}}function nc(e){const a=this;let t=null,r=0,c=!1,l=!1;const f=new fi,g=new we,y={value:null,needsUpdate:!1};this.uniform=y,this.numPlanes=0,this.numIntersection=0,this.init=function(O,v){const T=O.length!==0||v||r!==0||c;return c=v,r=O.length,T},this.beginShadows=function(){l=!0,V(null)},this.endShadows=function(){l=!1},this.setGlobalState=function(O,v){t=V(O,v,0)},this.setState=function(O,v,T){const D=O.clippingPlanes,B=O.clipIntersection,d=O.clipShadows,s=e.get(O);if(!c||D===null||D.length===0||l&&!d)l?V(null):L();else{const _=l?0:r,N=_*4;let S=s.clippingState||null;y.value=S,S=V(D,v,N,T);for(let b=0;b!==N;++b)S[b]=t[b];s.clippingState=S,this.numIntersection=B?this.numPlanes:0,this.numPlanes+=_}};function L(){y.value!==t&&(y.value=t,y.needsUpdate=r>0),a.numPlanes=r,a.numIntersection=0}function V(O,v,T,D){const B=O!==null?O.length:0;let d=null;if(B!==0){if(d=y.value,D!==!0||d===null){const s=T+B*4,_=v.matrixWorldInverse;g.getNormalMatrix(_),(d===null||d.length<s)&&(d=new Float32Array(s));for(let N=0,S=T;N!==B;++N,S+=4)f.copy(O[N]).applyMatrix4(_,g),f.normal.toArray(d,S),d[S+3]=f.constant}y.value=d,y.needsUpdate=!0}return a.numPlanes=B,a.numIntersection=0,d}}class Ua extends Ct{constructor(a=1,t={}){super(a,a,t),this.isWebGLCubeRenderTarget=!0;const r={width:a,height:a,depth:1},c=[r,r,r,r,r,r];this.texture=new Wa(c),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(a,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},c=new _a(5,5,5),l=new qt({name:"CubemapFromEquirect",uniforms:Ga(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:_t,blending:Yt});l.uniforms.tEquirect.value=t;const f=new Ot(c,l),g=t.minFilter;return t.minFilter===Bt&&(t.minFilter=xt),new va(1,10,this).update(a,f),t.minFilter=g,f.geometry.dispose(),f.material.dispose(),this}clear(a,t=!0,r=!0,c=!0){const l=a.getRenderTarget();for(let f=0;f<6;f++)a.setRenderTarget(this,f),a.clear(t,r,c);a.setRenderTarget(l)}}const Nn=256,oc=3,sc=20,Un=256,wn=16,lc=3,cc=new He,dc=new qe;class ma{constructor(a){this._renderer=a,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new va(1,10,null),this._boxMesh=new Ot(new _a(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(a,t=0,r=.1,c=100,l={}){const{size:f=256,position:g=cc}=l,y=this._renderer;this._setSize(f);const L=this._allocateTarget(),V=this._getSourceTarget(!0);t>0&&(V.texture.mipmapsAutoUpdate=!1);const O=y.autoClear,v=y.autoClearColor,T=y.autoClearDepth,D=y.autoClearStencil,B=a.background;y.autoClear=!0,y.autoClearColor=!0,y.autoClearDepth=!0,y.autoClearStencil=!0,B===null&&(a.background=y.getClearColor(dc));const d=new va(r,c,V);return d.position.copy(g),d.update(y,a),y.autoClear=O,y.autoClearColor=v,y.autoClearDepth=T,y.autoClearStencil=D,a.background=B,t>0&&(V.texture.mipmapsAutoUpdate=!0,this._blur(L,t)),this._applyPMREM(L),L}fromEquirectangular(a,t=null){return this._fromTexture(a,t)}fromCubemap(a,t=null){return this._fromTexture(a,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Fn(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=yn(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(a,t){return t>0?1-Math.sqrt(1-a/t):0}_setSize(a){this._cubeSize=Math.max(Nn,ho(a))}_fromTexture(a,t){a.mapping===oa||a.mapping===Jt?this._setSize(a.image.length===0?Nn:a.image[0].width||a.image[0].image.width):this._setSize(a.image.width/4);const r=t||this._allocateTarget();return this._textureToCubemap(a),this._applyPMREM(r),r}_allocateTarget(){const a=this._cubeSize,t=In(a,!1,!1),r=Math.log2(a)-oc;for(let c=0;c<=r;c++)t.texture.mipmaps.push({width:a>>c,height:a>>c});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(a=!1){const t=this._cubeSize,r=this._sourceTarget;return(r===null||r.width!==t||a&&r.depthBuffer===!1)&&(r!==null&&r.dispose(),this._sourceTarget=In(t,!0,a)),this._sourceTarget}_compileMaterial(a){this._boxMesh.material=a,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(a,t,r){const c=this._boxMesh,l=this._cubeCamera;c.material=r,l.renderTarget=a,l.activeMipmapLevel=t;const f=a.width>>t;a.viewport.set(0,0,f,f),l.update(this._renderer,c),a.viewport.set(0,0,a.width,a.height)}_textureToCubemap(a){let t;a.mapping===oa||a.mapping===Jt?(this._cubemapMaterial===null&&(this._cubemapMaterial=Fn()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=a.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=yn()),t=this._equirectMaterial),t.uniforms.envMap.value=a,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(a){this._ggxMaterial===null&&(this._ggxMaterial=uc(),this._integrationMaterial=fc());const t=this._cubeSize,r=a.texture.mipmaps.length-1,c=this._ggxMaterial.uniforms;c.envMap.value=this._sourceTarget.texture;const l=this._integrationMaterial.uniforms;l.envMap.value=this._sourceTarget.texture,l.sourceLod.value=Math.log2(t/wn);for(let f=0;f<=r;f++){const g=ma.lodToRoughness(f,r);if(f>r-lc)l.roughness.value=g,this._renderCube(a,f,this._integrationMaterial);else{const y=g>0?Math.log2(t)+.5*Math.log2(6/(Un*Math.pow(g,4)))+.5:0;c.roughness.value=g,c.lodBias.value=y,this._renderCube(a,f,this._ggxMaterial)}}}_blur(a,t){this._blurMaterial===null&&(this._blurMaterial=pc());const r=this._blurMaterial,c=r.uniforms,l=this._sourceTarget;c.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,c.envMap.value=l.texture,this._renderCube(a,0,r),c.envMap.value=a.texture,this._renderCube(l,0,r)}}function In(e,a,t){return new Ua(e,{minFilter:Bt,generateMipmaps:a,type:Pt,colorSpace:za,depthBuffer:t})}function ua(e,a,t){return new qt({name:e,uniforms:a,vertexShader:Le.cube_vert,fragmentShader:t,side:_t,blending:Yt,depthTest:!1,depthWrite:!1})}function uc(){return ua("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Un}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function fc(){return ua("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:wn}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function pc(){return ua("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${sc}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function yn(){return ua("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function Fn(){return ua("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function mc(e){let a=new WeakMap,t=new WeakMap,r=null;function c(v,T=!1){return v==null?null:T?f(v):l(v)}function l(v){if(v&&v.isTexture){const T=v.mapping;if(T===Sa||T===Ea)if(a.has(v)){const D=a.get(v).texture;return g(D,v.mapping)}else{const D=v.image;if(D&&D.height>0){const B=new Ua(D.height);return B.fromEquirectangularTexture(e,v),a.set(v,B),v.addEventListener("dispose",L),g(B.texture,v.mapping)}else return null}}return v}function f(v){if(v&&v.isTexture&&v.isPMREMTexture!==!0){const T=v.mapping,D=T===Sa||T===Ea,B=T===oa||T===Jt;if(D||B){let d=t.get(v);const s=d!==void 0?d.texture.pmremVersion:0;if(v.isRenderTargetTexture&&v.pmremVersion!==s)return r===null&&(r=new ma(e)),d=D?r.fromEquirectangular(v,d):r.fromCubemap(v,d),d.texture.pmremVersion=v.pmremVersion,t.set(v,d),d.texture;if(d!==void 0)return d.texture;{const _=v.image;return D&&_&&_.height>0||B&&_&&y(_)?(r===null&&(r=new ma(e)),d=D?r.fromEquirectangular(v):r.fromCubemap(v),d.texture.pmremVersion=v.pmremVersion,t.set(v,d),v.addEventListener("dispose",V),d.texture):null}}}return v}function g(v,T){return T===Sa?v.mapping=oa:T===Ea&&(v.mapping=Jt),v}function y(v){let T=0;const D=6;for(let B=0;B<D;B++)v[B]!==void 0&&T++;return T===D}function L(v){const T=v.target;T.removeEventListener("dispose",L);const D=a.get(T);D!==void 0&&(a.delete(T),D.dispose())}function V(v){const T=v.target;T.removeEventListener("dispose",V);const D=t.get(T);D!==void 0&&(t.delete(T),D.dispose())}function O(){a=new WeakMap,t=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:c,dispose:O}}function hc(e){const a={};function t(r){if(a[r]!==void 0)return a[r];const c=e.getExtension(r);return a[r]=c,c}return{has:function(r){return t(r)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(r){const c=t(r);return c===null&&pi("WebGLRenderer: "+r+" extension not supported."),c}}}function gc(e,a,t,r){const c={},l=new WeakMap,f=new FinalizationRegistry(D=>delete c[D]);function g(D){y(D.target)}function y(D){D.index!==null&&a.remove(D.index);for(const d in D.attributes)a.remove(D.attributes[d]);D.removeEventListener("dispose",g),delete c[D.id],f.unregister(D);const B=l.get(D);B&&(a.remove(B),l.delete(D)),r.releaseStatesOfGeometry(D),D.isInstancedBufferGeometry===!0&&delete D._maxInstanceCount,t.memory.geometries--}function L(D,B){return c[B.id]!==void 0||(B.addEventListener("dispose",g),c[B.id]=new WeakRef(B),f.register(B,B.id,B),t.memory.geometries++),B}function V(D){const B=D.attributes;for(const d in B)a.update(B[d],e.ARRAY_BUFFER)}function O(D){const B=D.index,d=D.attributes.position;let s=0;if(d===void 0)return;const _=B!==null?B.array.length:d.array.length/3-1,N=d.count>=65535?mi:hi,S=new N(Math.ceil(_/3)*6,1),b=S.array;if(B!==null){const n=B.array;s=B.version;for(let p=0,K=0;p<_;p+=3){const U=n[p+0],F=n[p+1],z=n[p+2];b[K++]=U,b[K++]=F,b[K++]=F,b[K++]=z,b[K++]=z,b[K++]=U}}else{s=d.version;for(let n=0,p=0;n<_;n+=3){const K=n+0,U=n+1,F=n+2;b[p++]=K,b[p++]=U,b[p++]=U,b[p++]=F,b[p++]=F,b[p++]=K}}S.version=s;const x=l.get(D);x&&a.remove(x),l.set(D,S)}function v(D){const B=l.get(D);if(B){const d=D.index;d!==null&&B.version<d.version&&O(D)}else O(D);return l.get(D)}function T(){for(const D in c){const B=c[D].deref();B!==void 0&&y(B)}}return{get:L,update:V,getWireframeAttribute:v,dispose:T}}function _c(e,a,t){let r;function c(O){r=O}let l,f;function g(O){l=O.type,f=O.bytesPerElement}function y(O,v){e.drawElements(r,v,l,O*f),t.update(v,r,1)}function L(O,v,T){T!==0&&(e.drawElementsInstanced(r,v,l,O*f,T),t.update(v,r,T))}function V(O,v,T){if(T===0)return;a.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,v,0,l,O,0,T);let D=0;for(let B=0;B<T;B++)D+=v[B];t.update(D,r,1)}this.setMode=c,this.setIndex=g,this.render=y,this.renderInstances=L,this.renderMultiDraw=V}function vc(e){const a={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function r(l,f,g){switch(t.calls++,f){case e.TRIANGLES:t.triangles+=g*(l/3);break;case e.LINES:t.lines+=g*(l/2);break;case e.LINE_STRIP:t.lines+=g*(l-1);break;case e.LINE_LOOP:t.lines+=g*l;break;case e.POINTS:t.points+=g*l;break;default:Ke("WebGLInfo: Unknown draw mode:",f);break}}function c(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:a,render:t,programs:null,autoReset:!0,reset:c,update:r}}function Sc(e,a,t){const r=new WeakMap,c=new mt;function l(f,g,y){const L=f.morphTargetInfluences,V=g.morphAttributes.position||g.morphAttributes.normal||g.morphAttributes.color,O=V!==void 0?V.length:0;let v=r.get(g);if(v===void 0||v.count!==O){let T=function(){p.dispose(),r.delete(g),g.removeEventListener("dispose",T)};v!==void 0&&v.texture.dispose();const D=g.morphAttributes.position!==void 0,B=g.morphAttributes.normal!==void 0,d=g.morphAttributes.color!==void 0,s=g.morphAttributes.position||[],_=g.morphAttributes.normal||[],N=g.morphAttributes.color||[];let S=0;D===!0&&(S=1),B===!0&&(S=2),d===!0&&(S=3);let b=g.attributes.position.count*S,x=1;b>a.maxTextureSize&&(x=Math.ceil(b/a.maxTextureSize),b=a.maxTextureSize);const n=new Float32Array(b*x*4*O),p=new ka(n,b,x,O);p.type=It,p.needsUpdate=!0;const K=S*4;for(let U=0;U<O;U++){const F=s[U],z=_[U],k=N[U],R=b*x*4*U;for(let Q=0;Q<F.count;Q++){const Y=Q*K;D===!0&&(c.fromBufferAttribute(F,Q),n[R+Y+0]=c.x,n[R+Y+1]=c.y,n[R+Y+2]=c.z,n[R+Y+3]=0),B===!0&&(c.fromBufferAttribute(z,Q),n[R+Y+4]=c.x,n[R+Y+5]=c.y,n[R+Y+6]=c.z,n[R+Y+7]=0),d===!0&&(c.fromBufferAttribute(k,Q),n[R+Y+8]=c.x,n[R+Y+9]=c.y,n[R+Y+10]=c.z,n[R+Y+11]=k.itemSize===4?c.w:1)}}v={count:O,texture:p,size:new pt(b,x)},r.set(g,v),g.addEventListener("dispose",T)}if(f.isInstancedMesh===!0&&f.morphTexture!==null)y.getUniforms().setValue(e,"morphTexture",f.morphTexture,t);else{let T=0;for(let B=0;B<L.length;B++)T+=L[B];const D=g.morphTargetsRelative?1:1-T;y.getUniforms().setValue(e,"morphTargetBaseInfluence",D),y.getUniforms().setValue(e,"morphTargetInfluences",L)}y.getUniforms().setValue(e,"morphTargetsTexture",v.texture,t),y.getUniforms().setValue(e,"morphTargetsTextureSize",v.size)}return{update:l}}function Ec(e,a,t,r,c){let l=new WeakMap;function f(L){const V=c.render.frame,O=L.geometry,v=a.get(L,O);if(l.get(v)!==V&&(a.update(v),l.set(v,V)),L.isInstancedMesh&&(L.hasEventListener("dispose",y)===!1&&L.addEventListener("dispose",y),l.get(L)!==V&&(t.update(L.instanceMatrix,e.ARRAY_BUFFER),L.instanceColor!==null&&t.update(L.instanceColor,e.ARRAY_BUFFER),l.set(L,V))),L.isSkinnedMesh){const T=L.skeleton;l.get(T)!==V&&(T.update(),l.set(T,V))}return v}function g(){l=new WeakMap}function y(L){const V=L.target;V.removeEventListener("dispose",y),r.releaseStatesOfObject(V),t.remove(V.instanceMatrix),V.instanceColor!==null&&t.remove(V.instanceColor)}return{update:f,dispose:g}}const Mc={[Ja]:"LINEAR_TONE_MAPPING",[Qa]:"REINHARD_TONE_MAPPING",[$a]:"CINEON_TONE_MAPPING",[Za]:"ACES_FILMIC_TONE_MAPPING",[ja]:"AGX_TONE_MAPPING",[Ya]:"NEUTRAL_TONE_MAPPING",[Ka]:"CUSTOM_TONE_MAPPING"};function Tc(e,a,t,r,c,l){const f=new Ct(a,t,{type:e,depthBuffer:c,stencilBuffer:l,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let g=null,y=null,L=null;const V=new Xa;V.setAttribute("position",new qa([-1,3,0,-1,-1,0,3,-1,0],3)),V.setAttribute("uv",new qa([0,2,0,0,2,0],2));const O=new gi({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),v=new Ot(V,O),T=new _i(-1,1,1,-1,0,1);let D=null,B=null,d=!1,s,_=null,N=[],S=!1;this.setSize=function(b,x){f.setSize(b,x),g!==null&&g.setSize(b,x),y!==null&&y.setSize(b,x);for(let n=0;n<N.length;n++){const p=N[n];p.setSize&&p.setSize(b,x)}},this.setEffects=function(b){N=b,S=N.length>0&&N[0].isRenderPass===!0;const x=f.width,n=f.height;N.length>0&&g===null&&(g=new Ct(x,n,{type:Pt,depthBuffer:!1,stencilBuffer:!1}),y=new Ct(x,n,{type:Pt,depthBuffer:!1,stencilBuffer:!1}));const p=c===!0&&N.some(K=>K.needsDepthTexture===!0);p!==(f.depthTexture!==null)&&(p===!0&&L===null&&(L=new ea(x,n),l===!0&&(L.format=Gt,L.type=jt)),f.dispose(),f.depthTexture=p?L:null,f.resolveDepthBuffer=p,f.storeMultisampledDepthBuffer=p);for(let K=0;K<N.length;K++){const U=N[K];U.setSize&&U.setSize(x,n),p&&U.needsDepthTexture===!0&&U.setDepthTexture&&U.setDepthTexture(L)}},this.begin=function(b,x){if(d||b.toneMapping===Dt&&N.length===0)return!1;if(_=x,x!==null){const n=x.width,p=x.height;(f.width!==n||f.height!==p)&&this.setSize(n,p)}return S===!1&&b.setRenderTarget(f),s=b.toneMapping,b.toneMapping=Dt,!0},this.hasRenderPass=function(){return S},this.end=function(b,x){b.toneMapping=s,d=!0;let n=f,p=g;for(let K=0;K<N.length;K++){const U=N[K];U.enabled!==!1&&(U.render(b,p,n,x),U.needsSwap!==!1&&(n=p,p=p===g?y:g))}if(D!==b.outputColorSpace||B!==b.toneMapping){D=b.outputColorSpace,B=b.toneMapping,O.defines={},$e.getTransfer(D)===We&&(O.defines.SRGB_TRANSFER="");const K=Mc[B];K&&(O.defines[K]=""),O.needsUpdate=!0}O.uniforms.tDiffuse.value=n.texture,b.setRenderTarget(_),b.render(v,T),_=null,d=!1},this.isCompositing=function(){return d},this.dispose=function(){f.dispose(),g!==null&&g.dispose(),y!==null&&y.dispose(),V.dispose(),O.dispose()}}const On=new Si,Bn=new ea(1,1),Gn=new tr(1),Hn=new ka,Vn=new vi,Wn=new Wa,zn=[],kn=[],Xn=new Float32Array(16),qn=new Float32Array(9),Kn=new Float32Array(4);function ia(e,a,t){const r=e[0];if(r<=0||r>0)return e;const c=a*t;let l=zn[c];if(l===void 0&&(l=new Float32Array(c),zn[c]=l),a!==0){r.toArray(l,0);for(let f=1,g=0;f!==a;++f)g+=t,e[f].toArray(l,g)}return l}function nt(e,a){if(e.length!==a.length)return!1;for(let t=0,r=e.length;t<r;t++)if(e[t]!==a[t])return!1;return!0}function ot(e,a){for(let t=0,r=a.length;t<r;t++)e[t]=a[t]}function wa(e,a){let t=kn[a];t===void 0&&(t=new Int32Array(a),kn[a]=t);for(let r=0;r!==a;++r)t[r]=e.allocateTextureUnit();return t}function xc(e,a){const t=this.cache;t[0]!==a&&(e.uniform1f(this.addr,a),t[0]=a)}function Rc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y)&&(e.uniform2f(this.addr,a.x,a.y),t[0]=a.x,t[1]=a.y);else{if(nt(t,a))return;e.uniform2fv(this.addr,a),ot(t,a)}}function Ac(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z)&&(e.uniform3f(this.addr,a.x,a.y,a.z),t[0]=a.x,t[1]=a.y,t[2]=a.z);else if(a.r!==void 0)(t[0]!==a.r||t[1]!==a.g||t[2]!==a.b)&&(e.uniform3f(this.addr,a.r,a.g,a.b),t[0]=a.r,t[1]=a.g,t[2]=a.b);else{if(nt(t,a))return;e.uniform3fv(this.addr,a),ot(t,a)}}function Cc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z||t[3]!==a.w)&&(e.uniform4f(this.addr,a.x,a.y,a.z,a.w),t[0]=a.x,t[1]=a.y,t[2]=a.z,t[3]=a.w);else{if(nt(t,a))return;e.uniform4fv(this.addr,a),ot(t,a)}}function bc(e,a){const t=this.cache,r=a.elements;if(r===void 0){if(nt(t,a))return;e.uniformMatrix2fv(this.addr,!1,a),ot(t,a)}else{if(nt(t,r))return;Kn.set(r),e.uniformMatrix2fv(this.addr,!1,Kn),ot(t,r)}}function Lc(e,a){const t=this.cache,r=a.elements;if(r===void 0){if(nt(t,a))return;e.uniformMatrix3fv(this.addr,!1,a),ot(t,a)}else{if(nt(t,r))return;qn.set(r),e.uniformMatrix3fv(this.addr,!1,qn),ot(t,r)}}function Pc(e,a){const t=this.cache,r=a.elements;if(r===void 0){if(nt(t,a))return;e.uniformMatrix4fv(this.addr,!1,a),ot(t,a)}else{if(nt(t,r))return;Xn.set(r),e.uniformMatrix4fv(this.addr,!1,Xn),ot(t,r)}}function Dc(e,a){const t=this.cache;t[0]!==a&&(e.uniform1i(this.addr,a),t[0]=a)}function Nc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y)&&(e.uniform2i(this.addr,a.x,a.y),t[0]=a.x,t[1]=a.y);else{if(nt(t,a))return;e.uniform2iv(this.addr,a),ot(t,a)}}function Uc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z)&&(e.uniform3i(this.addr,a.x,a.y,a.z),t[0]=a.x,t[1]=a.y,t[2]=a.z);else{if(nt(t,a))return;e.uniform3iv(this.addr,a),ot(t,a)}}function wc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z||t[3]!==a.w)&&(e.uniform4i(this.addr,a.x,a.y,a.z,a.w),t[0]=a.x,t[1]=a.y,t[2]=a.z,t[3]=a.w);else{if(nt(t,a))return;e.uniform4iv(this.addr,a),ot(t,a)}}function Ic(e,a){const t=this.cache;t[0]!==a&&(e.uniform1ui(this.addr,a),t[0]=a)}function yc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y)&&(e.uniform2ui(this.addr,a.x,a.y),t[0]=a.x,t[1]=a.y);else{if(nt(t,a))return;e.uniform2uiv(this.addr,a),ot(t,a)}}function Fc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z)&&(e.uniform3ui(this.addr,a.x,a.y,a.z),t[0]=a.x,t[1]=a.y,t[2]=a.z);else{if(nt(t,a))return;e.uniform3uiv(this.addr,a),ot(t,a)}}function Oc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z||t[3]!==a.w)&&(e.uniform4ui(this.addr,a.x,a.y,a.z,a.w),t[0]=a.x,t[1]=a.y,t[2]=a.z,t[3]=a.w);else{if(nt(t,a))return;e.uniform4uiv(this.addr,a),ot(t,a)}}function Ia(e){return e.version===0&&(e.compareFunction=er,e.needsUpdate=!0),e}function Bc(e,a,t){const r=this.cache,c=t.allocateTextureUnit();r[0]!==c&&(e.uniform1i(this.addr,c),r[0]=c);let l;this.type===e.SAMPLER_2D_SHADOW?l=Ia(Bn):l=On,t.setTexture2D(a||l,c)}function Gc(e,a,t){const r=this.cache,c=t.allocateTextureUnit();r[0]!==c&&(e.uniform1i(this.addr,c),r[0]=c),t.setTexture3D(a||Vn,c)}function Hc(e,a,t){const r=this.cache,c=t.allocateTextureUnit();r[0]!==c&&(e.uniform1i(this.addr,c),r[0]=c);let l;this.type===e.SAMPLER_CUBE_SHADOW?l=Ia(Gn):l=Wn,t.setTextureCube(a||l,c)}function Vc(e,a,t){const r=this.cache,c=t.allocateTextureUnit();r[0]!==c&&(e.uniform1i(this.addr,c),r[0]=c),t.setTexture2DArray(a||Hn,c)}function Wc(e){switch(e){case 5126:return xc;case 35664:return Rc;case 35665:return Ac;case 35666:return Cc;case 35674:return bc;case 35675:return Lc;case 35676:return Pc;case 5124:case 35670:return Dc;case 35667:case 35671:return Nc;case 35668:case 35672:return Uc;case 35669:case 35673:return wc;case 5125:return Ic;case 36294:return yc;case 36295:return Fc;case 36296:return Oc;case 35678:case 36198:case 36298:case 36306:case 35682:return Bc;case 35679:case 36299:case 36307:return Gc;case 35680:case 36300:case 36308:case 36293:return Hc;case 36289:case 36303:case 36311:case 36292:return Vc}}function zc(e,a){e.uniform1fv(this.addr,a)}function kc(e,a){const t=ia(a,this.size,2);e.uniform2fv(this.addr,t)}function Xc(e,a){const t=ia(a,this.size,3);e.uniform3fv(this.addr,t)}function qc(e,a){const t=ia(a,this.size,4);e.uniform4fv(this.addr,t)}function Kc(e,a){const t=ia(a,this.size,4);e.uniformMatrix2fv(this.addr,!1,t)}function Yc(e,a){const t=ia(a,this.size,9);e.uniformMatrix3fv(this.addr,!1,t)}function jc(e,a){const t=ia(a,this.size,16);e.uniformMatrix4fv(this.addr,!1,t)}function Zc(e,a){e.uniform1iv(this.addr,a)}function $c(e,a){e.uniform2iv(this.addr,a)}function Qc(e,a){e.uniform3iv(this.addr,a)}function Jc(e,a){e.uniform4iv(this.addr,a)}function ed(e,a){e.uniform1uiv(this.addr,a)}function td(e,a){e.uniform2uiv(this.addr,a)}function ad(e,a){e.uniform3uiv(this.addr,a)}function rd(e,a){e.uniform4uiv(this.addr,a)}function id(e,a,t){const r=this.cache,c=a.length,l=wa(t,c);nt(r,l)||(e.uniform1iv(this.addr,l),ot(r,l));let f;this.type===e.SAMPLER_2D_SHADOW?f=Ia(Bn):f=On;for(let g=0;g!==c;++g)t.setTexture2D(a[g]||f,l[g])}function nd(e,a,t){const r=this.cache,c=a.length,l=wa(t,c);nt(r,l)||(e.uniform1iv(this.addr,l),ot(r,l));for(let f=0;f!==c;++f)t.setTexture3D(a[f]||Vn,l[f])}function od(e,a,t){const r=this.cache,c=a.length,l=wa(t,c);nt(r,l)||(e.uniform1iv(this.addr,l),ot(r,l));let f;this.type===e.SAMPLER_CUBE_SHADOW?f=Ia(Gn):f=Wn;for(let g=0;g!==c;++g)t.setTextureCube(a[g]||f,l[g])}function sd(e,a,t){const r=this.cache,c=a.length,l=wa(t,c);nt(r,l)||(e.uniform1iv(this.addr,l),ot(r,l));for(let f=0;f!==c;++f)t.setTexture2DArray(a[f]||Hn,l[f])}function ld(e){switch(e){case 5126:return zc;case 35664:return kc;case 35665:return Xc;case 35666:return qc;case 35674:return Kc;case 35675:return Yc;case 35676:return jc;case 5124:case 35670:return Zc;case 35667:case 35671:return $c;case 35668:case 35672:return Qc;case 35669:case 35673:return Jc;case 5125:return ed;case 36294:return td;case 36295:return ad;case 36296:return rd;case 35678:case 36198:case 36298:case 36306:case 35682:return id;case 35679:case 36299:case 36307:return nd;case 35680:case 36300:case 36308:case 36293:return od;case 36289:case 36303:case 36311:case 36292:return sd}}class cd{constructor(a,t,r){this.id=a,this.addr=r,this.cache=[],this.type=t.type,this.setValue=Wc(t.type)}}class dd{constructor(a,t,r){this.id=a,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ld(t.type)}}class ud{constructor(a){this.id=a,this.seq=[],this.map={}}setValue(a,t,r){const c=this.seq;for(let l=0,f=c.length;l!==f;++l){const g=c[l];g.setValue(a,t[g.id],r)}}}const $r=/(\w+)(\])?(\[|\.)?/g;function Yn(e,a){e.seq.push(a),e.map[a.id]=a}function fd(e,a,t){const r=e.name,c=r.length;for($r.lastIndex=0;;){const l=$r.exec(r),f=$r.lastIndex;let g=l[1];const y=l[2]==="]",L=l[3];if(y&&(g=g|0),L===void 0||L==="["&&f+2===c){Yn(t,L===void 0?new cd(g,e,a):new dd(g,e,a));break}else{let V=t.map[g];V===void 0&&(V=new ud(g),Yn(t,V)),t=V}}}class ya{constructor(a,t){this.seq=[],this.map={};const r=a.getProgramParameter(t,a.ACTIVE_UNIFORMS);for(let f=0;f<r;++f){const g=a.getActiveUniform(t,f),y=a.getUniformLocation(t,g.name);fd(g,y,this)}const c=[],l=[];for(const f of this.seq)f.type===a.SAMPLER_2D_SHADOW||f.type===a.SAMPLER_CUBE_SHADOW||f.type===a.SAMPLER_2D_ARRAY_SHADOW?c.push(f):l.push(f);c.length>0&&(this.seq=c.concat(l))}setValue(a,t,r,c){const l=this.map[t];l!==void 0&&l.setValue(a,r,c)}setOptional(a,t,r){const c=t[r];c!==void 0&&this.setValue(a,r,c)}static upload(a,t,r,c){for(let l=0,f=t.length;l!==f;++l){const g=t[l],y=r[g.id];y.needsUpdate!==!1&&g.setValue(a,y.value,c)}}static seqWithValue(a,t){const r=[];for(let c=0,l=a.length;c!==l;++c){const f=a[c];f.id in t&&r.push(f)}return r}}function jn(e,a,t){const r=e.createShader(a);return e.shaderSource(r,t),e.compileShader(r),r}const pd=37297;let md=0;function hd(e,a){const t=e.split(`
`),r=[],c=Math.max(a-6,0),l=Math.min(a+6,t.length);for(let f=c;f<l;f++){const g=f+1;r.push(`${g===a?">":" "} ${g}: ${t[f]}`)}return r.join(`
`)}const Zn=new we;function gd(e){$e._getMatrix(Zn,$e.workingColorSpace,e);const a=`mat3( ${Zn.elements.map(t=>t.toFixed(4))} )`;switch($e.getTransfer(e)){case rr:return[a,"LinearTransferOETF"];case We:return[a,"sRGBTransferOETF"];default:return Ge("WebGLProgram: Unsupported color space: ",e),[a,"LinearTransferOETF"]}}function $n(e,a,t){const r=e.getShaderParameter(a,e.COMPILE_STATUS),c=(e.getShaderInfoLog(a)||"").trim();if(r&&c==="")return"";const l=/ERROR: 0:(\d+)/.exec(c);if(l){const f=parseInt(l[1]);return t.toUpperCase()+`

`+c+`

`+hd(e.getShaderSource(a),f)}else return c}function _d(e,a){const t=gd(a);return[`vec4 ${e}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const vd={[Ja]:"Linear",[Qa]:"Reinhard",[$a]:"Cineon",[Za]:"ACESFilmic",[ja]:"AgX",[Ya]:"Neutral",[Ka]:"Custom"};function Sd(e,a){const t=vd[a];return t===void 0?(Ge("WebGLProgram: Unsupported toneMapping:",a),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Fa=new He;function Ed(){$e.getLuminanceCoefficients(Fa);const e=Fa.x.toFixed(4),a=Fa.y.toFixed(4),t=Fa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${a}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Md(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(fa).join(`
`)}function Td(e){const a=[];for(const t in e){const r=e[t];r!==!1&&a.push("#define "+t+" "+r)}return a.join(`
`)}function xd(e,a){const t={},r=e.getProgramParameter(a,e.ACTIVE_ATTRIBUTES);for(let c=0;c<r;c++){const l=e.getActiveAttrib(a,c),f=l.name;let g=1;l.type===e.FLOAT_MAT2&&(g=2),l.type===e.FLOAT_MAT3&&(g=3),l.type===e.FLOAT_MAT4&&(g=4),t[f]={type:l.type,location:e.getAttribLocation(a,f),locationSize:g}}return t}function fa(e){return e!==""}function Qn(e,a){const t=a.numSpotLightShadows+a.numSpotLightMaps-a.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,a.numSunLights).replace(/NUM_DIR_LIGHTS/g,a.numDirLights).replace(/NUM_SPOT_LIGHTS/g,a.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,a.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,a.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,a.numPointLights).replace(/NUM_HEMI_LIGHTS/g,a.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,a.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,a.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,a.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,a.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,a.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,a.numLightProbeGrids)}function Jn(e,a){return e.replace(/NUM_CLIPPING_PLANES/g,a.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,a.numClippingPlanes-a.numClipIntersection)}const Rd=/^[ \t]*#include +<([\w\d./]+)>/gm;function Qr(e){return e.replace(Rd,Ad)}function Ad(e,a){const t=Le[a];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+a+">");return Qr(t)}const Cd=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function eo(e){return e.replace(Cd,bd)}function bd(e,a,t,r){let c="";for(let l=parseInt(a);l<parseInt(t);l++)c+=r.replace(/\[\s*i\s*\]/g,"[ "+l+" ]").replace(/UNROLLED_LOOP_INDEX/g,l);return c}function to(e){let a=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?a+=`
#define HIGH_PRECISION`:e.precision==="mediump"?a+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(a+=`
#define LOW_PRECISION`),a}const Ld={[sa]:"SHADOWMAP_TYPE_PCF",[ta]:"SHADOWMAP_TYPE_VSM"};function Pd(e){return Ld[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Dd={[Jt]:"ENVMAP_MODE_REFRACTION"};function Nd(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":Dd[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Ud={[Ti]:"ENVMAP_BLENDING_MULTIPLY",[Mi]:"ENVMAP_BLENDING_MIX",[Ei]:"ENVMAP_BLENDING_ADD"};function wd(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":Ud[e.combine]||"ENVMAP_BLENDING_NONE"}function Id(e,a,t,r){const c=e.getContext(),l=t.defines;let f=t.vertexShader,g=t.fragmentShader;const y=Pd(t),L=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",V=Nd(t),O=wd(t),v=Md(t),T=Td(l),D=c.createProgram();let B,d,s=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(B=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T].filter(fa).join(`
`),B.length>0&&(B+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T].filter(fa).join(`
`),d.length>0&&(d+=`
`)):(B=[to(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+V:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+y:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(fa).join(`
`),d=[to(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,T,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+L:"",t.envMap?"#define "+V:"",t.envMap?"#define "+O:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+y:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Dt?"#define TONE_MAPPING":"",t.toneMapping!==Dt?Le.tonemapping_pars_fragment:"",t.toneMapping!==Dt?Sd("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Le.colorspace_pars_fragment,_d("linearToOutputTexel",t.outputColorSpace),Ed(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(fa).join(`
`)),f=Qr(f),f=Qn(f,t),f=Jn(f,t),g=Qr(g),g=Qn(g,t),g=Jn(g,t),f=eo(f),g=eo(g),t.isRawShaderMaterial!==!0&&(s=`#version 300 es
`,B=[v,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+B,d=["#define varying in",t.glslVersion===ar?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ar?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const _=s+B+f,N=s+d+g,S=jn(c,c.VERTEX_SHADER,_),b=jn(c,c.FRAGMENT_SHADER,N);c.attachShader(D,S),c.attachShader(D,b),t.index0AttributeName!==void 0?c.bindAttribLocation(D,0,t.index0AttributeName):t.hasPositionAttribute===!0&&c.bindAttribLocation(D,0,"position"),c.linkProgram(D);function x(U){if(e.debug.checkShaderErrors){const F=c.getProgramInfoLog(D)||"",z=c.getShaderInfoLog(S)||"",k=c.getShaderInfoLog(b)||"",R=F.trim(),Q=z.trim(),Y=k.trim();let H=!0,ae=!0;if(c.getProgramParameter(D,c.LINK_STATUS)===!1)if(H=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(c,D,S,b);else{const X=$n(c,S,"vertex"),Z=$n(c,b,"fragment");Ke("WebGLProgram: Shader Error "+c.getError()+" - VALIDATE_STATUS "+c.getProgramParameter(D,c.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+R+`
`+X+`
`+Z)}else R!==""?Ge("WebGLProgram: Program Info Log:",R):(Q===""||Y==="")&&(ae=!1);ae&&(U.diagnostics={runnable:H,programLog:R,vertexShader:{log:Q,prefix:B},fragmentShader:{log:Y,prefix:d}})}c.deleteShader(S),c.deleteShader(b),n=new ya(c,D),p=xd(c,D)}let n;this.getUniforms=function(){return n===void 0&&x(this),n};let p;this.getAttributes=function(){return p===void 0&&x(this),p};let K=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return K===!1&&(K=c.getProgramParameter(D,pd)),K},this.destroy=function(){r.releaseStatesOfProgram(this),c.deleteProgram(D),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=md++,this.cacheKey=a,this.usedTimes=1,this.program=D,this.vertexShader=S,this.fragmentShader=b,this}let yd=0;class Fd{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(a,t,r){const c=this._getShaderCacheForMaterial(a);return c.has(t)===!1&&(c.add(t),t.usedTimes++),c.has(r)===!1&&(c.add(r),r.usedTimes++),this}remove(a){const t=this.materialCache.get(a);for(const r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(a),this}getVertexShaderStage(a){return this._getShaderStage(a.vertexShader)}getFragmentShaderStage(a){return this._getShaderStage(a.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(a){const t=this.materialCache;let r=t.get(a);return r===void 0&&(r=new Set,t.set(a,r)),r}_getShaderStage(a){const t=this.shaderCache;let r=t.get(a);return r===void 0&&(r=new Od(a),t.set(a,r)),r}}class Od{constructor(a){this.id=yd++,this.code=a,this.usedTimes=0}}function Bd(e){return e===Zt||e===Ma||e===Ta}function Gd(e,a,t,r,c,l){const f=new Ai,g=new Fd,y=new Set,L=[],V=new Map,O=r.logarithmicDepthBuffer,v={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function T(n){return y.add(n),n===0?"uv":`uv${n}`}function D(n,p,K,U,F,z){const k=U.fog,R=F.geometry,Q=n.isMeshStandardMaterial||n.isMeshLambertMaterial||n.isMeshPhongMaterial?U.environment:null,Y=n.isMeshStandardMaterial||n.isMeshLambertMaterial&&!n.envMap||n.isMeshPhongMaterial&&!n.envMap,H=a.get(n.envMap||Q,Y),ae=v[n.type];let X=r.precision;n.precision!==null&&(X=r.getMaxPrecision(n.precision),X!==n.precision&&Ge("WebGLProgram.getParameters:",n.precision,"not supported, using",X,"instead."));const Z=R.morphAttributes.position||R.morphAttributes.normal||R.morphAttributes.color,re=Z!==void 0?Z.length:0;let Pe=0;R.morphAttributes.position!==void 0&&(Pe=1),R.morphAttributes.normal!==void 0&&(Pe=2),R.morphAttributes.color!==void 0&&(Pe=3);let Ue,W,fe,Se;if(ae){const me=bt[ae];Ue=me.vertexShader,W=me.fragmentShader}else{Ue=n.vertexShader,W=n.fragmentShader;const me=g.getVertexShaderStage(n),ke=g.getFragmentShaderStage(n);g.update(n,me,ke),fe=me.id,Se=ke.id}const Ce=e.getRenderTarget(),ge=e.state.buffers.depth.getReversed(),xe=F.isInstancedMesh===!0,Qe=F.isBatchedMesh===!0,De=!!n.map,ye=!!n.matcap,at=!!H,lt=at&&H.isPMREMTexture===!0,vt=!!n.aoMap,rt=!!n.lightMap,ht=!!n.bumpMap&&n.wireframe===!1,Je=!!n.normalMap,Lt=!!n.displacementMap,st=!!n.emissiveMap,St=!!n.metalnessMap,Et=!!n.roughnessMap,Mt=n.anisotropy>0,E=n.clearcoat>0,Tt=n.diffuseRoughness>0,Ye=n.dispersion>0,je=n.retroreflectivity>0,ie=n.iridescence>0,it=n.sheen>0,Re=n.transmission>0,be=Mt&&!!n.anisotropyMap,u=E&&!!n.clearcoatMap,i=E&&!!n.clearcoatNormalMap,P=E&&!!n.clearcoatRoughnessMap,$=Tt&&!!n.diffuseRoughnessMap,G=ie&&!!n.iridescenceMap,ce=ie&&!!n.iridescenceThicknessMap,ne=it&&!!n.sheenColorMap,M=it&&!!n.sheenRoughnessMap,q=!!n.specularMap,pe=!!n.specularColorMap,m=!!n.specularIntensityMap,I=Re&&!!n.transmissionMap,j=Re&&!!n.thicknessMap,ee=!!n.gradientMap,oe=!!n.alphaMap,te=n.alphaTest>0,Me=!!n.alphaHash,se=!!n.extensions;let ve=Dt;n.toneMapped&&(Ce===null||Ce.isXRRenderTarget===!0)&&(ve=e.toneMapping);const Ae=lt?H.isCompressedCubeTexture?H.image[0].mipmaps:H.mipmaps:null,Ie={shaderID:ae,shaderType:n.type,shaderName:n.name,vertexShader:Ue,fragmentShader:W,defines:n.defines,customVertexShaderID:fe,customFragmentShaderID:Se,isRawShaderMaterial:n.isRawShaderMaterial===!0,glslVersion:n.glslVersion,precision:X,batching:Qe,batchingColor:Qe&&F._colorsTexture!==null,instancing:xe,instancingColor:xe&&F.instanceColor!==null,instancingMorph:xe&&F.morphTexture!==null,outputColorSpace:Ce===null?e.outputColorSpace:Ce.isXRRenderTarget===!0?Ce.texture.colorSpace:$e.workingColorSpace,alphaToCoverage:!!n.alphaToCoverage,map:De,matcap:ye,envMap:at,envMapMode:at&&H.mapping,envMapPMREM:lt,envMapMaxLod:lt?Ae.length-1:null,envMapSize:lt?Ae[0].width:null,aoMap:vt,lightMap:rt,bumpMap:ht,normalMap:Je,displacementMap:Lt,emissiveMap:st,normalMapObjectSpace:Je&&n.normalMapType===Ri,normalMapTangentSpace:Je&&n.normalMapType===ir,packedNormalMap:Je&&n.normalMapType===ir&&Bd(n.normalMap.format),metalnessMap:St,roughnessMap:Et,anisotropy:Mt,anisotropyMap:be,clearcoat:E,clearcoatMap:u,clearcoatNormalMap:i,clearcoatRoughnessMap:P,diffuseRoughness:Tt,diffuseRoughnessMap:$,dispersion:Ye,retroreflection:je,iridescence:ie,iridescenceMap:G,iridescenceThicknessMap:ce,sheen:it,sheenColorMap:ne,sheenRoughnessMap:M,specularMap:q,specularColorMap:pe,specularIntensityMap:m,transmission:Re,transmissionMap:I,thicknessMap:j,gradientMap:ee,opaque:n.transparent===!1&&n.blending===la&&n.alphaToCoverage===!1,alphaMap:oe,alphaTest:te,alphaHash:Me,combine:n.combine,mapUv:De&&T(n.map.channel),aoMapUv:vt&&T(n.aoMap.channel),lightMapUv:rt&&T(n.lightMap.channel),bumpMapUv:ht&&T(n.bumpMap.channel),normalMapUv:Je&&T(n.normalMap.channel),displacementMapUv:Lt&&T(n.displacementMap.channel),emissiveMapUv:st&&T(n.emissiveMap.channel),metalnessMapUv:St&&T(n.metalnessMap.channel),roughnessMapUv:Et&&T(n.roughnessMap.channel),anisotropyMapUv:be&&T(n.anisotropyMap.channel),clearcoatMapUv:u&&T(n.clearcoatMap.channel),clearcoatNormalMapUv:i&&T(n.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:P&&T(n.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:$&&T(n.diffuseRoughnessMap.channel),iridescenceMapUv:G&&T(n.iridescenceMap.channel),iridescenceThicknessMapUv:ce&&T(n.iridescenceThicknessMap.channel),sheenColorMapUv:ne&&T(n.sheenColorMap.channel),sheenRoughnessMapUv:M&&T(n.sheenRoughnessMap.channel),specularMapUv:q&&T(n.specularMap.channel),specularColorMapUv:pe&&T(n.specularColorMap.channel),specularIntensityMapUv:m&&T(n.specularIntensityMap.channel),transmissionMapUv:I&&T(n.transmissionMap.channel),thicknessMapUv:j&&T(n.thicknessMap.channel),alphaMapUv:oe&&T(n.alphaMap.channel),vertexTangents:!!R.attributes.tangent&&(Je||Mt),vertexNormals:!!R.attributes.normal,vertexColors:n.vertexColors,vertexAlphas:n.vertexColors===!0&&!!R.attributes.color&&R.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!R.attributes.uv&&(De||oe),fog:!!k,useFog:n.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:n.wireframe===!1&&(n.flatShading===!0||R.attributes.normal===void 0&&Je===!1&&(n.isMeshLambertMaterial||n.isMeshPhongMaterial||n.isMeshStandardMaterial||n.isMeshPhysicalMaterial)),sizeAttenuation:n.sizeAttenuation===!0,logarithmicDepthBuffer:O,reversedDepthBuffer:ge,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:R.attributes.position!==void 0,morphTargets:R.morphAttributes.position!==void 0,morphNormals:R.morphAttributes.normal!==void 0,morphColors:R.morphAttributes.color!==void 0,morphTargetsCount:re,morphTextureStride:Pe,numSunLights:p.sun.length,numDirLights:p.directional.length,numPointLights:p.point.length,numSpotLights:p.spot.length,numSpotLightMaps:p.spotLightMap.length,numRectAreaLights:p.rectArea.length,numHemiLights:p.hemi.length,numSunLightShadows:p.sunShadowMap.length,numDirLightShadows:p.directionalShadowMap.length,numPointLightShadows:p.pointShadowMap.length,numSpotLightShadows:p.spotShadowMap.length,numSpotLightShadowsWithMaps:p.numSpotLightShadowsWithMaps,numLightProbes:p.numLightProbes,numLightProbeGrids:z.filter(me=>me.texture!==null).length,numClippingPlanes:l.numPlanes,numClipIntersection:l.numIntersection,dithering:n.dithering,shadowMapEnabled:e.shadowMap.enabled&&K.length>0,shadowMapType:e.shadowMap.type,toneMapping:ve,decodeVideoTexture:De&&n.map.isVideoTexture===!0&&$e.getTransfer(n.map.colorSpace)===We,decodeVideoTextureEmissive:st&&n.emissiveMap.isVideoTexture===!0&&$e.getTransfer(n.emissiveMap.colorSpace)===We,premultipliedAlpha:n.premultipliedAlpha,doubleSided:n.side===Nt,flipSided:n.side===_t,useDepthPacking:n.depthPacking>=0,depthPacking:n.depthPacking||0,index0AttributeName:n.index0AttributeName,extensionClipCullDistance:se&&n.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(se&&n.extensions.multiDraw===!0||Qe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:n.customProgramCacheKey()};return Ie.vertexUv1s=y.has(1),Ie.vertexUv2s=y.has(2),Ie.vertexUv3s=y.has(3),y.clear(),Ie}function B(n){const p=[];if(n.shaderID?p.push(n.shaderID):(p.push(n.customVertexShaderID),p.push(n.customFragmentShaderID)),n.defines!==void 0)for(const K in n.defines)p.push(K),p.push(n.defines[K]);return n.isRawShaderMaterial===!1&&(d(p,n),s(p,n),p.push(e.outputColorSpace)),p.push(n.customProgramCacheKey),p.join()}function d(n,p){n.push(p.precision),n.push(p.outputColorSpace),n.push(p.envMapMode),n.push(p.envMapPMREM),n.push(p.envMapMaxLod),n.push(p.envMapSize),n.push(p.mapUv),n.push(p.alphaMapUv),n.push(p.lightMapUv),n.push(p.aoMapUv),n.push(p.bumpMapUv),n.push(p.normalMapUv),n.push(p.displacementMapUv),n.push(p.emissiveMapUv),n.push(p.metalnessMapUv),n.push(p.roughnessMapUv),n.push(p.anisotropyMapUv),n.push(p.clearcoatMapUv),n.push(p.clearcoatNormalMapUv),n.push(p.clearcoatRoughnessMapUv),n.push(p.diffuseRoughnessMapUv),n.push(p.iridescenceMapUv),n.push(p.iridescenceThicknessMapUv),n.push(p.sheenColorMapUv),n.push(p.sheenRoughnessMapUv),n.push(p.specularMapUv),n.push(p.specularColorMapUv),n.push(p.specularIntensityMapUv),n.push(p.transmissionMapUv),n.push(p.thicknessMapUv),n.push(p.combine),n.push(p.fogExp2),n.push(p.sizeAttenuation),n.push(p.morphTargetsCount),n.push(p.numSunLights),n.push(p.numDirLights),n.push(p.numPointLights),n.push(p.numSpotLights),n.push(p.numSpotLightMaps),n.push(p.numHemiLights),n.push(p.numRectAreaLights),n.push(p.numSunLightShadows),n.push(p.numDirLightShadows),n.push(p.numPointLightShadows),n.push(p.numSpotLightShadows),n.push(p.numSpotLightShadowsWithMaps),n.push(p.numLightProbes),n.push(p.numLightProbeGrids),n.push(p.shadowMapType),n.push(p.toneMapping),n.push(p.numClippingPlanes),n.push(p.numClipIntersection),n.push(p.depthPacking)}function s(n,p){f.disableAll(),p.instancing&&f.enable(0),p.instancingColor&&f.enable(1),p.instancingMorph&&f.enable(2),p.matcap&&f.enable(3),p.envMap&&f.enable(4),p.normalMapObjectSpace&&f.enable(5),p.normalMapTangentSpace&&f.enable(6),p.clearcoat&&f.enable(7),p.iridescence&&f.enable(8),p.alphaTest&&f.enable(9),p.vertexColors&&f.enable(10),p.vertexAlphas&&f.enable(11),p.vertexUv1s&&f.enable(12),p.vertexUv2s&&f.enable(13),p.vertexUv3s&&f.enable(14),p.vertexTangents&&f.enable(15),p.anisotropy&&f.enable(16),p.alphaHash&&f.enable(17),p.batching&&f.enable(18),p.dispersion&&f.enable(19),p.retroreflection&&f.enable(24),p.diffuseRoughness&&f.enable(25),p.batchingColor&&f.enable(20),p.gradientMap&&f.enable(21),p.packedNormalMap&&f.enable(22),p.vertexNormals&&f.enable(23),n.push(f.mask),f.disableAll(),p.fog&&f.enable(0),p.useFog&&f.enable(1),p.flatShading&&f.enable(2),p.logarithmicDepthBuffer&&f.enable(3),p.reversedDepthBuffer&&f.enable(4),p.skinning&&f.enable(5),p.morphTargets&&f.enable(6),p.morphNormals&&f.enable(7),p.morphColors&&f.enable(8),p.premultipliedAlpha&&f.enable(9),p.shadowMapEnabled&&f.enable(10),p.doubleSided&&f.enable(11),p.flipSided&&f.enable(12),p.useDepthPacking&&f.enable(13),p.dithering&&f.enable(14),p.transmission&&f.enable(15),p.sheen&&f.enable(16),p.opaque&&f.enable(17),p.pointsUvs&&f.enable(18),p.decodeVideoTexture&&f.enable(19),p.decodeVideoTextureEmissive&&f.enable(20),p.alphaToCoverage&&f.enable(21),p.numLightProbeGrids>0&&f.enable(22),p.hasPositionAttribute&&f.enable(23),n.push(f.mask)}function _(n){const p=v[n.type];let K;if(p){const U=bt[p];K=xi.clone(U.uniforms)}else K=n.uniforms;return K}function N(n,p){let K=V.get(p);return K!==void 0?++K.usedTimes:(K=new Id(e,p,n,c),L.push(K),V.set(p,K)),K}function S(n){if(--n.usedTimes===0){const p=L.indexOf(n);L[p]=L[L.length-1],L.pop(),V.delete(n.cacheKey),n.destroy()}}function b(n){g.remove(n)}function x(){g.dispose()}return{getParameters:D,getProgramCacheKey:B,getUniforms:_,acquireProgram:N,releaseProgram:S,releaseShaderCache:b,programs:L,dispose:x}}function Hd(){let e=new WeakMap;function a(f){return e.has(f)}function t(f){let g=e.get(f);return g===void 0&&(g={},e.set(f,g)),g}function r(f){e.delete(f)}function c(f,g,y){e.get(f)[g]=y}function l(){e=new WeakMap}return{has:a,get:t,remove:r,update:c,dispose:l}}function Vd(e,a){return e.groupOrder!==a.groupOrder?e.groupOrder-a.groupOrder:e.renderOrder!==a.renderOrder?e.renderOrder-a.renderOrder:e.material.id!==a.material.id?e.material.id-a.material.id:e.materialVariant!==a.materialVariant?e.materialVariant-a.materialVariant:e.z!==a.z?e.z-a.z:e.id-a.id}function ao(e,a){return e.groupOrder!==a.groupOrder?e.groupOrder-a.groupOrder:e.renderOrder!==a.renderOrder?e.renderOrder-a.renderOrder:e.z!==a.z?a.z-e.z:e.id-a.id}function ro(){const e=[];let a=0;const t=[],r=[],c=[];function l(){a=0,t.length=0,r.length=0,c.length=0}function f(v){let T=0;return v.isInstancedMesh&&(T+=2),v.isSkinnedMesh&&(T+=1),T}function g(v,T,D,B,d,s){let _=e[a];return _===void 0?(_={id:v.id,object:v,geometry:T,material:D,materialVariant:f(v),groupOrder:B,renderOrder:v.renderOrder,z:d,group:s},e[a]=_):(_.id=v.id,_.object=v,_.geometry=T,_.material=D,_.materialVariant=f(v),_.groupOrder=B,_.renderOrder=v.renderOrder,_.z=d,_.group=s),a++,_}function y(v,T,D,B,d,s,_){_.reversedDepth===!0&&(d=-d);const N=g(v,T,D,B,d,s);D.transmission>0?r.push(N):D.transparent===!0?c.push(N):t.push(N)}function L(v,T,D,B,d,s){const _=g(v,T,D,B,d,s);D.transmission>0?r.unshift(_):D.transparent===!0?c.unshift(_):t.unshift(_)}function V(v,T){t.length>1&&t.sort(v||Vd),r.length>1&&r.sort(T||ao),c.length>1&&c.sort(T||ao)}function O(){for(let v=a,T=e.length;v<T;v++){const D=e[v];if(D.id===null)break;D.id=null,D.object=null,D.geometry=null,D.material=null,D.group=null}}return{opaque:t,transmissive:r,transparent:c,init:l,push:y,unshift:L,finish:O,sort:V}}function Wd(){let e=new WeakMap;function a(r,c){const l=e.get(r);let f;return l===void 0?(f=new ro,e.set(r,[f])):c>=l.length?(f=new ro,l.push(f)):f=l[c],f}function t(){e=new WeakMap}return{get:a,dispose:t}}function zd(){const e={};return{get:function(a){if(e[a.id]!==void 0)return e[a.id];let t;switch(a.type){case"SunLight":case"DirectionalLight":t={direction:new He,color:new qe};break;case"SpotLight":t={position:new He,direction:new He,color:new qe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new He,color:new qe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new He,skyColor:new qe,groundColor:new qe};break;case"RectAreaLight":t={color:new qe,position:new He,halfWidth:new He,halfHeight:new He};break}return e[a.id]=t,t}}}function kd(){const e={};return{get:function(a){if(e[a.id]!==void 0)return e[a.id];let t;switch(a.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[a.id]=t,t}}}let Xd=0;function qd(e,a){return(a.castShadow?2:0)-(e.castShadow?2:0)+(a.map?1:0)-(e.map?1:0)}function Kd(e){const a=new zd,t=kd(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let L=0;L<9;L++)r.probe.push(new He);const c=new He,l=new Kt,f=new Kt;function g(L){let V=0,O=0,v=0;for(let z=0;z<9;z++)r.probe[z].set(0,0,0);let T=0,D=0,B=0,d=0,s=0,_=0,N=0,S=0,b=0,x=0,n=0,p=0,K=0,U=0;L.sort(qd);for(let z=0,k=L.length;z<k;z++){const R=L[z],Q=R.color,Y=R.intensity,H=R.distance;let ae=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===Zt?ae=R.shadow.map.texture:ae=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)V+=Q.r*Y,O+=Q.g*Y,v+=Q.b*Y;else if(R.isLightProbe){for(let X=0;X<9;X++)r.probe[X].addScaledVector(R.sh.coefficients[X],Y);U++}else if(R.isSunLight){const X=a.get(R);if(X.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const Z=R.shadow,re=t.get(R);re.shadowIntensity=Z.intensity,re.shadowBias=Z.bias,re.shadowNormalBias=Z.normalBias,re.shadowRadius=Z.radius,re.shadowMapSize.copy(Z.mapSize).multiply(Z.getFrameExtents()),r.sunShadow[D]=re,r.sunShadowMap[D]=ae;const Pe=Z.getViewportCount();for(let Ue=0;Ue<Pe;Ue++)r.sunShadowMatrix[B+Ue]=Z.getMatrix(Ue),r.sunShadowCascade[B+Ue]=Z._cascadeData[Ue];B+=Pe,D++}r.sun[T]=X,T++}else if(R.isDirectionalLight){const X=a.get(R);if(X.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const Z=R.shadow,re=t.get(R);re.shadowIntensity=Z.intensity,re.shadowBias=Z.bias,re.shadowNormalBias=Z.normalBias,re.shadowRadius=Z.radius,re.shadowMapSize=Z.mapSize,r.directionalShadow[d]=re,r.directionalShadowMap[d]=ae,r.directionalShadowMatrix[d]=R.shadow.matrix,b++}r.directional[d]=X,d++}else if(R.isSpotLight){const X=a.get(R);X.position.setFromMatrixPosition(R.matrixWorld),X.color.copy(Q).multiplyScalar(Y),X.distance=H,X.coneCos=Math.cos(R.angle),X.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),X.decay=R.decay,r.spot[_]=X;const Z=R.shadow;if(R.map&&(r.spotLightMap[p]=R.map,p++,Z.updateMatrices(R),R.castShadow&&K++),r.spotLightMatrix[_]=Z.matrix,R.castShadow){const re=t.get(R);re.shadowIntensity=Z.intensity,re.shadowBias=Z.bias,re.shadowNormalBias=Z.normalBias,re.shadowRadius=Z.radius,re.shadowMapSize=Z.mapSize,r.spotShadow[_]=re,r.spotShadowMap[_]=ae,n++}_++}else if(R.isRectAreaLight){const X=a.get(R);X.color.copy(Q).multiplyScalar(Y),X.halfWidth.set(R.width*.5,0,0),X.halfHeight.set(0,R.height*.5,0),r.rectArea[N]=X,N++}else if(R.isPointLight){const X=a.get(R);if(X.color.copy(R.color).multiplyScalar(R.intensity),X.distance=R.distance,X.decay=R.decay,R.castShadow){const Z=R.shadow,re=t.get(R);re.shadowIntensity=Z.intensity,re.shadowBias=Z.bias,re.shadowNormalBias=Z.normalBias,re.shadowRadius=Z.radius,re.shadowMapSize=Z.mapSize,re.shadowCameraNear=Z.camera.near,re.shadowCameraFar=Z.camera.far,r.pointShadow[s]=re,r.pointShadowMap[s]=ae,r.pointShadowMatrix[s]=R.shadow.matrix,x++}r.point[s]=X,s++}else if(R.isHemisphereLight){const X=a.get(R);X.skyColor.copy(R.color).multiplyScalar(Y),X.groundColor.copy(R.groundColor).multiplyScalar(Y),r.hemi[S]=X,S++}}N>0&&(e.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=ue.LTC_FLOAT_1,r.rectAreaLTC2=ue.LTC_FLOAT_2):(r.rectAreaLTC1=ue.LTC_HALF_1,r.rectAreaLTC2=ue.LTC_HALF_2)),r.ambient[0]=V,r.ambient[1]=O,r.ambient[2]=v;const F=r.hash;(F.sunLength!==T||F.directionalLength!==d||F.pointLength!==s||F.spotLength!==_||F.rectAreaLength!==N||F.hemiLength!==S||F.numSunShadows!==D||F.numDirectionalShadows!==b||F.numPointShadows!==x||F.numSpotShadows!==n||F.numSpotMaps!==p||F.numLightProbes!==U)&&(r.sun.length=T,r.directional.length=d,r.spot.length=_,r.rectArea.length=N,r.point.length=s,r.hemi.length=S,r.sunShadow.length=D,r.sunShadowMap.length=D,r.sunShadowMatrix.length=B,r.sunShadowCascade.length=B,r.directionalShadow.length=b,r.directionalShadowMap.length=b,r.directionalShadowMatrix.length=b,r.pointShadow.length=x,r.pointShadowMap.length=x,r.pointShadowMatrix.length=x,r.spotShadow.length=n,r.spotShadowMap.length=n,r.spotLightMatrix.length=n+p-K,r.spotLightMap.length=p,r.numSpotLightShadowsWithMaps=K,r.numLightProbes=U,F.sunLength=T,F.directionalLength=d,F.pointLength=s,F.spotLength=_,F.rectAreaLength=N,F.hemiLength=S,F.numSunShadows=D,F.numDirectionalShadows=b,F.numPointShadows=x,F.numSpotShadows=n,F.numSpotMaps=p,F.numLightProbes=U,r.version=Xd++)}function y(L,V){let O=0,v=0,T=0,D=0,B=0,d=0;const s=V.matrixWorldInverse;for(let _=0,N=L.length;_<N;_++){const S=L[_];if(S.isSunLight){const b=r.sun[O];b.direction.setFromMatrixPosition(S.matrixWorld),b.direction.transformDirection(s),O++}else if(S.isDirectionalLight){const b=r.directional[v];b.direction.setFromMatrixPosition(S.matrixWorld),c.setFromMatrixPosition(S.target.matrixWorld),b.direction.sub(c),b.direction.transformDirection(s),v++}else if(S.isSpotLight){const b=r.spot[D];b.position.setFromMatrixPosition(S.matrixWorld),b.position.applyMatrix4(s),b.direction.setFromMatrixPosition(S.matrixWorld),c.setFromMatrixPosition(S.target.matrixWorld),b.direction.sub(c),b.direction.transformDirection(s),D++}else if(S.isRectAreaLight){const b=r.rectArea[B];b.position.setFromMatrixPosition(S.matrixWorld),b.position.applyMatrix4(s),f.identity(),l.copy(S.matrixWorld),l.premultiply(s),f.extractRotation(l),b.halfWidth.set(S.width*.5,0,0),b.halfHeight.set(0,S.height*.5,0),b.halfWidth.applyMatrix4(f),b.halfHeight.applyMatrix4(f),B++}else if(S.isPointLight){const b=r.point[T];b.position.setFromMatrixPosition(S.matrixWorld),b.position.applyMatrix4(s),T++}else if(S.isHemisphereLight){const b=r.hemi[d];b.direction.setFromMatrixPosition(S.matrixWorld),b.direction.transformDirection(s),d++}}}return{setup:g,setupView:y,state:r}}function io(e){const a=new Kd(e),t=[],r=[],c=[];function l(O){V.camera=O,t.length=0,r.length=0,c.length=0}function f(O){O.isLightProbeGrid?c.push(O):t.push(O)}function g(O){r.push(O)}function y(){a.setup(t),c.sort((O,v)=>O.priority-v.priority||O.id-v.id)}function L(O){a.setupView(t,O)}const V={lightsArray:t,shadowsArray:r,lightProbeGridArray:c,camera:null,lights:a,transmissionRenderTarget:{},textureUnits:0};return{init:l,state:V,setupLights:y,setupLightsView:L,pushLight:f,pushShadow:g}}function Yd(e){let a=new WeakMap;function t(c,l=0){const f=a.get(c);let g;return f===void 0?(g=new io(e),a.set(c,[g])):l>=f.length?(g=new io(e),f.push(g)):g=f[l],g}function r(){a=new WeakMap}return{get:t,dispose:r}}const jd=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Zd=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,$d=[new He(1,0,0),new He(-1,0,0),new He(0,1,0),new He(0,-1,0),new He(0,0,1),new He(0,0,-1)],Qd=[new He(0,-1,0),new He(0,-1,0),new He(0,0,1),new He(0,0,-1),new He(0,-1,0),new He(0,-1,0)],no=new Kt,pa=new He,Jr=new He;function Jd(e,a,t){let r=new sr;const c=new pt,l=new pt,f=new mt,g=new Ci,y=new bi,L={},V=t.maxTextureSize,O={[Qt]:_t,[_t]:Qt,[Nt]:Nt},v=new qt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pt},radius:{value:4}},vertexShader:jd,fragmentShader:Zd}),T=v.clone();T.defines.HORIZONTAL_PASS=1;const D=new Xa;D.setAttribute("position",new Li(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const B=new Ot(D,v),d=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=sa;let s=this.type;this.render=function(x,n,p){if(d.enabled===!1||d.autoUpdate===!1&&d.needsUpdate===!1||x.length===0)return;this.type===Pi&&(Ge("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=sa);const K=e.getRenderTarget(),U=e.getActiveCubeFace(),F=e.getActiveMipmapLevel(),z=e.state;z.setBlending(Yt),z.buffers.depth.getReversed()===!0?z.buffers.color.setClear(0,0,0,0):z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);const k=s!==this.type;k&&n.traverse(function(R){R.material&&(Array.isArray(R.material)?R.material.forEach(Q=>Q.needsUpdate=!0):R.material.needsUpdate=!0)});for(let R=0,Q=x.length;R<Q;R++){const Y=x[R],H=Y.shadow;if(H===void 0){Ge("WebGLShadowMap:",Y,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;c.copy(H.mapSize);const ae=H.getFrameExtents();c.multiply(ae),l.copy(H.mapSize),(c.x>V||c.y>V)&&(c.x>V&&(l.x=Math.floor(V/ae.x),c.x=l.x*ae.x,H.mapSize.x=l.x),c.y>V&&(l.y=Math.floor(V/ae.y),c.y=l.y*ae.y,H.mapSize.y=l.y));const X=e.state.buffers.depth.getReversed();if(H.camera._reversedDepth=X,H.map===null||k===!0){if(H.map!==null&&(H.map.depthTexture!==null&&(H.map.depthTexture.dispose(),H.map.depthTexture=null),H.map.dispose()),this.type===ta){if(Y.isPointLight){Ge("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}H.map=new Ct(c.x,c.y,{format:Zt,type:Pt,minFilter:xt,magFilter:xt,generateMipmaps:!1}),H.map.texture.name=Y.name+".shadowMap",H.map.depthTexture=new ea(c.x,c.y,It),H.map.depthTexture.name=Y.name+".shadowMapDepth",H.map.depthTexture.format=aa,H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=Ht,H.map.depthTexture.magFilter=Ht}else Y.isPointLight?(H.map=new Ua(c.x),H.map.depthTexture=new tr(c.x,Vt)):(H.map=new Ct(c.x,c.y),H.map.depthTexture=new ea(c.x,c.y,Vt)),H.map.depthTexture.name=Y.name+".shadowMap",H.map.depthTexture.format=aa,this.type===sa?(H.map.depthTexture.compareFunction=X?nr:or,H.map.depthTexture.minFilter=xt,H.map.depthTexture.magFilter=xt):(H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=Ht,H.map.depthTexture.magFilter=Ht);H.camera.updateProjectionMatrix()}H.map.isWebGLCubeRenderTarget!==!0&&(H.map.width!==c.x||H.map.height!==c.y)&&H.map.setSize(c.x,c.y);const Z=H.map.isWebGLCubeRenderTarget?6:H.getViewportCount();Y.isPointLight!==!0&&H.updateMatrices(Y,p);const re=(H.camera.layers.mask&4294967294)!==0?H.camera.layers:p.layers;for(let Pe=0;Pe<Z;Pe++){const Ue=H.getCamera(Pe);if(Y.isPointLight){const W=H.camera,fe=H.matrix,Se=Y.distance||W.far;Se!==W.far&&(W.far=Se,W.updateProjectionMatrix()),pa.setFromMatrixPosition(Y.matrixWorld),W.position.copy(pa),Jr.copy(W.position),Jr.add($d[Pe]),W.up.copy(Qd[Pe]),W.lookAt(Jr),W.updateMatrixWorld(),fe.makeTranslation(-pa.x,-pa.y,-pa.z),no.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),H._frustum.setFromProjectionMatrix(no,W.coordinateSystem,W.reversedDepth)}if(H.map.isWebGLCubeRenderTarget)e.setRenderTarget(H.map,Pe),e.clear();else{Pe===0&&(e.setRenderTarget(H.map),e.clear());const W=H.getViewport(Pe);f.set(l.x*W.x,l.y*W.y,l.x*W.z,l.y*W.w),z.viewport(f)}r=H.getFrustum(Pe),S(n,p,Ue,Y,re,this.type)}H.isPointLightShadow!==!0&&this.type===ta&&_(H,p),H.needsUpdate=!1}s=this.type,d.needsUpdate=!1,e.setRenderTarget(K,U,F)};function _(x,n){const p=a.update(B);v.defines.VSM_SAMPLES!==x.blurSamples&&(v.defines.VSM_SAMPLES=x.blurSamples,T.defines.VSM_SAMPLES=x.blurSamples,v.needsUpdate=!0,T.needsUpdate=!0),x.mapPass===null?x.mapPass=new Ct(c.x,c.y,{format:Zt,type:Pt}):(x.mapPass.width!==x.map.width||x.mapPass.height!==x.map.height)&&x.mapPass.setSize(x.map.width,x.map.height),v.uniforms.shadow_pass.value=x.map.depthTexture,v.uniforms.resolution.value.set(x.map.width,x.map.height),v.uniforms.radius.value=x.radius,e.setRenderTarget(x.mapPass),e.clear(),e.renderBufferDirect(n,null,p,v,B,null),T.uniforms.shadow_pass.value=x.mapPass.texture,T.uniforms.resolution.value.set(x.map.width,x.map.height),T.uniforms.radius.value=x.radius,e.setRenderTarget(x.map),e.clear(),e.renderBufferDirect(n,null,p,T,B,null)}function N(x,n,p,K){let U=null;const F=p.isPointLight===!0?x.customDistanceMaterial:x.customDepthMaterial;if(F!==void 0)U=F;else if(U=p.isPointLight===!0?y:g,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){const z=U.uuid,k=n.uuid;let R=L[z];R===void 0&&(R={},L[z]=R);let Q=R[k];Q===void 0&&(Q=U.clone(),R[k]=Q,n.addEventListener("dispose",b)),U=Q}if(U.visible=n.visible,U.wireframe=n.wireframe,K===ta?U.side=n.shadowSide!==null?n.shadowSide:n.side:U.side=n.shadowSide!==null?n.shadowSide:O[n.side],U.alphaMap=n.alphaMap,U.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,U.map=n.map,U.clipShadows=n.clipShadows,U.clippingPlanes=n.clippingPlanes,U.clipIntersection=n.clipIntersection,U.displacementMap=n.displacementMap,U.displacementScale=n.displacementScale,U.displacementBias=n.displacementBias,U.wireframeLinewidth=n.wireframeLinewidth,U.linewidth=n.linewidth,p.isPointLight===!0&&U.isMeshDistanceMaterial===!0){const z=e.properties.get(U);z.light=p}return U}function S(x,n,p,K,U,F){if(x.visible===!1)return;if(x.layers.test(U)&&(x.isMesh||x.isLine||x.isPoints)&&(x.castShadow||x.receiveShadow&&F===ta)&&(!x.frustumCulled||x.intersectsFrustum(r))){x.modelViewMatrix.multiplyMatrices(p.matrixWorldInverse,x.matrixWorld);const k=a.update(x),R=x.material;if(Array.isArray(R)){const Q=k.groups;for(let Y=0,H=Q.length;Y<H;Y++){const ae=Q[Y],X=R[ae.materialIndex];if(X&&X.visible){const Z=N(x,X,K,F);x.onBeforeShadow(e,x,n,p,k,Z,ae),e.renderBufferDirect(p,null,k,Z,x,ae),x.onAfterShadow(e,x,n,p,k,Z,ae)}}}else if(R.visible){const Q=N(x,R,K,F);x.onBeforeShadow(e,x,n,p,k,Q,null),e.renderBufferDirect(p,null,k,Q,x,null),x.onAfterShadow(e,x,n,p,k,Q,null)}}const z=x.children;for(let k=0,R=z.length;k<R;k++)S(z[k],n,p,K,U,F)}function b(x){x.target.removeEventListener("dispose",b);for(const n in L){const p=L[n],K=x.target.uuid;K in p&&(p[K].dispose(),delete p[K])}}}function eu(e,a){function t(){let m=!1;const I=new mt;let j=null;const ee=new mt(0,0,0,0);return{setMask:function(oe){j!==oe&&!m&&(e.colorMask(oe,oe,oe,oe),j=oe)},setLocked:function(oe){m=oe},setClear:function(oe,te,Me,se,ve){ve===!0&&(oe*=se,te*=se,Me*=se),I.set(oe,te,Me,se),ee.equals(I)===!1&&(e.clearColor(oe,te,Me,se),ee.copy(I))},reset:function(){m=!1,j=null,ee.set(-1,0,0,0)}}}function r(){let m=!1,I=!1,j=null,ee=null,oe=null;return{setReversed:function(te){if(I!==te){const Me=a.get("EXT_clip_control");te?Me.clipControlEXT(Me.LOWER_LEFT_EXT,Me.ZERO_TO_ONE_EXT):Me.clipControlEXT(Me.LOWER_LEFT_EXT,Me.NEGATIVE_ONE_TO_ONE_EXT),I=te;const se=oe;oe=null,this.setClear(se)}},getReversed:function(){return I},setTest:function(te){te?ge(e.DEPTH_TEST):xe(e.DEPTH_TEST)},setMask:function(te){j!==te&&!m&&(e.depthMask(te),j=te)},setFunc:function(te){if(I&&(te=go[te]),ee!==te){switch(te){case Ji:e.depthFunc(e.NEVER);break;case Qi:e.depthFunc(e.ALWAYS);break;case $i:e.depthFunc(e.LESS);break;case lr:e.depthFunc(e.LEQUAL);break;case Zi:e.depthFunc(e.EQUAL);break;case ji:e.depthFunc(e.GEQUAL);break;case Yi:e.depthFunc(e.GREATER);break;case Ki:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}ee=te}},setLocked:function(te){m=te},setClear:function(te){oe!==te&&(oe=te,I&&(te=1-te),e.clearDepth(te))},reset:function(){m=!1,j=null,ee=null,oe=null,I=!1}}}function c(){let m=!1,I=null,j=null,ee=null,oe=null,te=null,Me=null,se=null,ve=null;return{setTest:function(Ae){m||(Ae?ge(e.STENCIL_TEST):xe(e.STENCIL_TEST))},setMask:function(Ae){I!==Ae&&!m&&(e.stencilMask(Ae),I=Ae)},setFunc:function(Ae,Ie,me){(j!==Ae||ee!==Ie||oe!==me)&&(e.stencilFunc(Ae,Ie,me),j=Ae,ee=Ie,oe=me)},setOp:function(Ae,Ie,me){(te!==Ae||Me!==Ie||se!==me)&&(e.stencilOp(Ae,Ie,me),te=Ae,Me=Ie,se=me)},setLocked:function(Ae){m=Ae},setClear:function(Ae){ve!==Ae&&(e.clearStencil(Ae),ve=Ae)},reset:function(){m=!1,I=null,j=null,ee=null,oe=null,te=null,Me=null,se=null,ve=null}}}const l=new t,f=new r,g=new c;let y={};const L=new WeakMap;let V={},O={},v={},T=new WeakMap,D=[],B=null,d=!1,s=null,_=null,N=null,S=null,b=null,x=null,n=null,p=new qe(0,0,0),K=0,U=!1,F=null,z=null,k=null,R=null,Q=null;const Y=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,ae=0;const X=e.getParameter(e.VERSION);X.indexOf("WebGL")!==-1?(ae=parseFloat(/^WebGL (\d)/.exec(X)[1]),H=ae>=1):X.indexOf("OpenGL ES")!==-1&&(ae=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),H=ae>=2);let Z=null,re={};const Pe=e.getParameter(e.SCISSOR_BOX),Ue=e.getParameter(e.VIEWPORT),W=new mt().fromArray(Pe),fe=new mt().fromArray(Ue);function Se(m,I,j,ee){const oe=new Uint8Array(4),te=e.createTexture();e.bindTexture(m,te),e.texParameteri(m,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(m,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let Me=0;Me<j;Me++)m===e.TEXTURE_3D||m===e.TEXTURE_2D_ARRAY?e.texImage3D(I,0,e.RGBA,1,1,ee,0,e.RGBA,e.UNSIGNED_BYTE,oe):e.texImage2D(I+Me,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,oe);return te}const Ce={};Ce[e.TEXTURE_2D]=Se(e.TEXTURE_2D,e.TEXTURE_2D,1),Ce[e.TEXTURE_CUBE_MAP]=Se(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ce[e.TEXTURE_2D_ARRAY]=Se(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),Ce[e.TEXTURE_3D]=Se(e.TEXTURE_3D,e.TEXTURE_3D,1,1),l.setClear(0,0,0,1),f.setClear(1),g.setClear(0),ge(e.DEPTH_TEST),f.setFunc(lr),ht(!1),Je(cr),ge(e.CULL_FACE),vt(Yt);function ge(m){V[m]!==!0&&(e.enable(m),V[m]=!0)}function xe(m){V[m]!==!1&&(e.disable(m),V[m]=!1)}function Qe(m,I){return v[m]!==I?(e.bindFramebuffer(m,I),v[m]=I,m===e.DRAW_FRAMEBUFFER&&(v[e.FRAMEBUFFER]=I),m===e.FRAMEBUFFER&&(v[e.DRAW_FRAMEBUFFER]=I),!0):!1}function De(m,I){let j=D,ee=!1;if(m){j=T.get(I),j===void 0&&(j=[],T.set(I,j));const oe=m.textures;if(j.length!==oe.length||j[0]!==e.COLOR_ATTACHMENT0){for(let te=0,Me=oe.length;te<Me;te++)j[te]=e.COLOR_ATTACHMENT0+te;j.length=oe.length,ee=!0}}else j[0]!==e.BACK&&(j[0]=e.BACK,ee=!0);ee&&e.drawBuffers(j)}function ye(m){return B!==m?(e.useProgram(m),B=m,!0):!1}const at={[ra]:e.FUNC_ADD,[Ni]:e.FUNC_SUBTRACT,[Di]:e.FUNC_REVERSE_SUBTRACT};at[rn]=e.MIN,at[nn]=e.MAX;const lt={[qi]:e.ZERO,[Xi]:e.ONE,[ki]:e.SRC_COLOR,[zi]:e.SRC_ALPHA,[Wi]:e.SRC_ALPHA_SATURATE,[Vi]:e.DST_COLOR,[Hi]:e.DST_ALPHA,[Gi]:e.ONE_MINUS_SRC_COLOR,[Bi]:e.ONE_MINUS_SRC_ALPHA,[Oi]:e.ONE_MINUS_DST_COLOR,[Fi]:e.ONE_MINUS_DST_ALPHA,[yi]:e.CONSTANT_COLOR,[Ii]:e.ONE_MINUS_CONSTANT_COLOR,[wi]:e.CONSTANT_ALPHA,[Ui]:e.ONE_MINUS_CONSTANT_ALPHA};function vt(m,I,j,ee,oe,te,Me,se,ve,Ae){if(m===Yt){d===!0&&(xe(e.BLEND),d=!1);return}if(d===!1&&(ge(e.BLEND),d=!0),m!==an){if(m!==s||Ae!==U){if((_!==ra||b!==ra)&&(e.blendEquation(e.FUNC_ADD),_=ra,b=ra),Ae)switch(m){case la:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case fr:e.blendFunc(e.ONE,e.ONE);break;case ur:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case dr:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Ke("WebGLState: Invalid blending: ",m);break}else switch(m){case la:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case fr:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case ur:Ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case dr:Ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ke("WebGLState: Invalid blending: ",m);break}N=null,S=null,x=null,n=null,p.set(0,0,0),K=0,s=m,U=Ae}return}oe=oe||I,te=te||j,Me=Me||ee,(I!==_||oe!==b)&&(e.blendEquationSeparate(at[I],at[oe]),_=I,b=oe),(j!==N||ee!==S||te!==x||Me!==n)&&(e.blendFuncSeparate(lt[j],lt[ee],lt[te],lt[Me]),N=j,S=ee,x=te,n=Me),(se.equals(p)===!1||ve!==K)&&(e.blendColor(se.r,se.g,se.b,ve),p.copy(se),K=ve),s=m,U=!1}function rt(m,I){m.side===Nt?xe(e.CULL_FACE):ge(e.CULL_FACE);let j=m.side===_t;I&&(j=!j),ht(j),m.blending===la&&m.transparent===!1?vt(Yt):vt(m.blending,m.blendEquation,m.blendSrc,m.blendDst,m.blendEquationAlpha,m.blendSrcAlpha,m.blendDstAlpha,m.blendColor,m.blendAlpha,m.premultipliedAlpha),f.setFunc(m.depthFunc),f.setTest(m.depthTest),f.setMask(m.depthWrite),l.setMask(m.colorWrite);const ee=m.stencilWrite;g.setTest(ee),ee&&(g.setMask(m.stencilWriteMask),g.setFunc(m.stencilFunc,m.stencilRef,m.stencilFuncMask),g.setOp(m.stencilFail,m.stencilZFail,m.stencilZPass)),st(m.polygonOffset,m.polygonOffsetFactor,m.polygonOffsetUnits),m.alphaToCoverage===!0?ge(e.SAMPLE_ALPHA_TO_COVERAGE):xe(e.SAMPLE_ALPHA_TO_COVERAGE)}function ht(m){F!==m&&(m?e.frontFace(e.CW):e.frontFace(e.CCW),F=m)}function Je(m){m!==en?(ge(e.CULL_FACE),m!==z&&(m===cr?e.cullFace(e.BACK):m===tn?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):xe(e.CULL_FACE),z=m}function Lt(m){m!==k&&(H&&e.lineWidth(m),k=m)}function st(m,I,j){m?(ge(e.POLYGON_OFFSET_FILL),(R!==I||Q!==j)&&(R=I,Q=j,f.getReversed()&&(I=-I,j=-j),e.polygonOffset(I,j))):xe(e.POLYGON_OFFSET_FILL)}function St(m){m?ge(e.SCISSOR_TEST):xe(e.SCISSOR_TEST)}function Et(m){m===void 0&&(m=e.TEXTURE0+Y-1),Z!==m&&(e.activeTexture(m),Z=m)}function Mt(m,I,j){j===void 0&&(Z===null?j=e.TEXTURE0+Y-1:j=Z);let ee=re[j];ee===void 0&&(ee={type:void 0,texture:void 0},re[j]=ee),(ee.type!==m||ee.texture!==I)&&(Z!==j&&(e.activeTexture(j),Z=j),e.bindTexture(m,I||Ce[m]),ee.type=m,ee.texture=I)}function E(){const m=re[Z];m!==void 0&&m.type!==void 0&&(e.bindTexture(m.type,null),m.type=void 0,m.texture=void 0)}function Tt(){try{e.compressedTexImage2D(...arguments)}catch(m){Ke("WebGLState:",m)}}function Ye(){try{e.compressedTexImage3D(...arguments)}catch(m){Ke("WebGLState:",m)}}function je(){try{e.texSubImage2D(...arguments)}catch(m){Ke("WebGLState:",m)}}function ie(){try{e.texSubImage3D(...arguments)}catch(m){Ke("WebGLState:",m)}}function it(){try{e.compressedTexSubImage2D(...arguments)}catch(m){Ke("WebGLState:",m)}}function Re(){try{e.compressedTexSubImage3D(...arguments)}catch(m){Ke("WebGLState:",m)}}function be(){try{e.texStorage2D(...arguments)}catch(m){Ke("WebGLState:",m)}}function u(){try{e.texStorage3D(...arguments)}catch(m){Ke("WebGLState:",m)}}function i(){try{e.texImage2D(...arguments)}catch(m){Ke("WebGLState:",m)}}function P(){try{e.texImage3D(...arguments)}catch(m){Ke("WebGLState:",m)}}function $(m){return O[m]!==void 0?O[m]:e.getParameter(m)}function G(m,I){O[m]!==I&&(e.pixelStorei(m,I),O[m]=I)}function ce(m){W.equals(m)===!1&&(e.scissor(m.x,m.y,m.z,m.w),W.copy(m))}function ne(m){fe.equals(m)===!1&&(e.viewport(m.x,m.y,m.z,m.w),fe.copy(m))}function M(m,I){let j=L.get(I);j===void 0&&(j=new WeakMap,L.set(I,j));let ee=j.get(m);ee===void 0&&(ee=e.getUniformBlockIndex(I,m.name),e.uniformBlockBinding(I,ee,ee),j.set(m,ee))}function q(m,I,j){const ee=L.get(I).get(m);y[ee]!==j&&(e.bindBufferBase(e.UNIFORM_BUFFER,ee,j),y[ee]=j)}function pe(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),f.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),V={},O={},Z=null,re={},v={},y={},T=new WeakMap,D=[],B=null,d=!1,s=null,_=null,N=null,S=null,b=null,x=null,n=null,p=new qe(0,0,0),K=0,U=!1,F=null,z=null,k=null,R=null,Q=null,W.set(0,0,e.canvas.width,e.canvas.height),fe.set(0,0,e.canvas.width,e.canvas.height),l.reset(),f.reset(),g.reset()}return{buffers:{color:l,depth:f,stencil:g},enable:ge,disable:xe,bindFramebuffer:Qe,drawBuffers:De,useProgram:ye,setBlending:vt,setMaterial:rt,setFlipSided:ht,setCullFace:Je,setLineWidth:Lt,setPolygonOffset:st,setScissorTest:St,activeTexture:Et,bindTexture:Mt,unbindTexture:E,compressedTexImage2D:Tt,compressedTexImage3D:Ye,texImage2D:i,texImage3D:P,pixelStorei:G,getParameter:$,updateUBOMapping:M,uniformBlockBinding:q,texStorage2D:be,texStorage3D:u,texSubImage2D:je,texSubImage3D:ie,compressedTexSubImage2D:it,compressedTexSubImage3D:Re,scissor:ce,viewport:ne,reset:pe}}function tu(e,a,t,r,c,l,f){const g=a.has("WEBGL_multisampled_render_to_texture")?a.get("WEBGL_multisampled_render_to_texture"):null,y=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),L=new pt,V=new WeakMap,O=new Set;let v;const T=new WeakMap,D=new Set,B=new FinalizationRegistry(u=>D.delete(u));let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function s(u,i){return d?new OffscreenCanvas(u,i):_o("canvas")}function _(u,i,P){let $=1;const G=be(u);if((G.width>P||G.height>P)&&($=P/Math.max(G.width,G.height)),$<1)if(typeof HTMLImageElement<"u"&&u instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&u instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&u instanceof ImageBitmap||typeof VideoFrame<"u"&&u instanceof VideoFrame){const ce=Math.floor($*G.width),ne=Math.floor($*G.height);v===void 0&&(v=s(ce,ne));const M=i?s(ce,ne):v;return M.width=ce,M.height=ne,M.getContext("2d").drawImage(u,0,0,ce,ne),Ge("WebGLRenderer: Texture has been resized from ("+G.width+"x"+G.height+") to ("+ce+"x"+ne+")."),M}else return"data"in u&&Ge("WebGLRenderer: Image in DataTexture is too big ("+G.width+"x"+G.height+")."),u;return u}function N(u){return u.generateMipmaps}function S(u){e.generateMipmap(u)}function b(u){return u.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:u.isWebGL3DRenderTarget?e.TEXTURE_3D:u.isWebGLArrayRenderTarget||u.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function x(u,i,P,$,G,ce=!1){if(u!==null){if(e[u]!==void 0)return e[u];Ge("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+u+"'")}let ne;$&&(ne=a.get("EXT_texture_norm16"),ne||Ge("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let M=i;if(i===e.RED&&(P===e.FLOAT&&(M=e.R32F),P===e.HALF_FLOAT&&(M=e.R16F),P===e.UNSIGNED_BYTE&&(M=e.R8),P===e.UNSIGNED_SHORT&&ne&&(M=ne.R16_EXT),P===e.SHORT&&ne&&(M=ne.R16_SNORM_EXT)),i===e.RED_INTEGER&&(P===e.UNSIGNED_BYTE&&(M=e.R8UI),P===e.UNSIGNED_SHORT&&(M=e.R16UI),P===e.UNSIGNED_INT&&(M=e.R32UI),P===e.BYTE&&(M=e.R8I),P===e.SHORT&&(M=e.R16I),P===e.INT&&(M=e.R32I)),i===e.RG&&(P===e.FLOAT&&(M=e.RG32F),P===e.HALF_FLOAT&&(M=e.RG16F),P===e.UNSIGNED_BYTE&&(M=e.RG8),P===e.UNSIGNED_SHORT&&ne&&(M=ne.RG16_EXT),P===e.SHORT&&ne&&(M=ne.RG16_SNORM_EXT)),i===e.RG_INTEGER&&(P===e.UNSIGNED_BYTE&&(M=e.RG8UI),P===e.UNSIGNED_SHORT&&(M=e.RG16UI),P===e.UNSIGNED_INT&&(M=e.RG32UI),P===e.BYTE&&(M=e.RG8I),P===e.SHORT&&(M=e.RG16I),P===e.INT&&(M=e.RG32I)),i===e.RGB_INTEGER&&(P===e.UNSIGNED_BYTE&&(M=e.RGB8UI),P===e.UNSIGNED_SHORT&&(M=e.RGB16UI),P===e.UNSIGNED_INT&&(M=e.RGB32UI),P===e.BYTE&&(M=e.RGB8I),P===e.SHORT&&(M=e.RGB16I),P===e.INT&&(M=e.RGB32I)),i===e.RGBA_INTEGER&&(P===e.UNSIGNED_BYTE&&(M=e.RGBA8UI),P===e.UNSIGNED_SHORT&&(M=e.RGBA16UI),P===e.UNSIGNED_INT&&(M=e.RGBA32UI),P===e.BYTE&&(M=e.RGBA8I),P===e.SHORT&&(M=e.RGBA16I),P===e.INT&&(M=e.RGBA32I)),i===e.RGB&&(P===e.UNSIGNED_SHORT&&ne&&(M=ne.RGB16_EXT),P===e.SHORT&&ne&&(M=ne.RGB16_SNORM_EXT),P===e.UNSIGNED_INT_5_9_9_9_REV&&(M=e.RGB9_E5),P===e.UNSIGNED_INT_10F_11F_11F_REV&&(M=e.R11F_G11F_B10F)),i===e.RGBA){const q=ce?rr:$e.getTransfer(G);P===e.FLOAT&&(M=e.RGBA32F),P===e.HALF_FLOAT&&(M=e.RGBA16F),P===e.UNSIGNED_BYTE&&(M=q===We?e.SRGB8_ALPHA8:e.RGBA8),P===e.UNSIGNED_SHORT&&ne&&(M=ne.RGBA16_EXT),P===e.SHORT&&ne&&(M=ne.RGBA16_SNORM_EXT),P===e.UNSIGNED_SHORT_4_4_4_4&&(M=e.RGBA4),P===e.UNSIGNED_SHORT_5_5_5_1&&(M=e.RGB5_A1)}return(M===e.R16F||M===e.R32F||M===e.RG16F||M===e.RG32F||M===e.RGBA16F||M===e.RGBA32F)&&a.get("EXT_color_buffer_float"),M}function n(u,i){let P;return u?i===null||i===Vt||i===jt?P=e.DEPTH24_STENCIL8:i===It?P=e.DEPTH32F_STENCIL8:i===da&&(P=e.DEPTH24_STENCIL8,Ge("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):i===null||i===Vt||i===jt?P=e.DEPTH_COMPONENT24:i===It?P=e.DEPTH_COMPONENT32F:i===da&&(P=e.DEPTH_COMPONENT16),P}function p(u,i){return N(u)===!0||u.isFramebufferTexture&&u.minFilter!==Ht&&u.minFilter!==xt?Math.log2(Math.max(i.width,i.height))+1:u.mipmaps.length>0?u.mipmaps.length:u.isCompressedTexture&&Array.isArray(u.image)?i.mipmaps.length:1}function K(u){const i=new WeakRef(u);r.get(u).__ref=i,D.add(i),B.register(u,i,i)}function U(u){const i=r.get(u).__ref;i!==void 0&&(D.delete(i),B.unregister(i))}function F(u){k(u.target)}function z(u){R(u.target)}function k(u){u.removeEventListener("dispose",F),U(u),Y(u),u.isVideoTexture&&V.delete(u),u.isHTMLTexture&&O.delete(u)}function R(u){u.removeEventListener("dispose",z),U(u),ae(u)}function Q(){for(const u of D){const i=u.deref();i!==void 0&&(i.isRenderTarget===!0?R(i):k(i))}D.clear(),O.clear()}function Y(u){const i=r.get(u);if(i.__webglInit===void 0)return;const P=u.source,$=T.get(P);if($){const G=$[i.__cacheKey];G.usedTimes--,G.usedTimes===0&&H(u),Object.keys($).length===0&&T.delete(P)}r.remove(u)}function H(u){const i=r.get(u);e.deleteTexture(i.__webglTexture);const P=u.source,$=T.get(P);delete $[i.__cacheKey],f.memory.textures--}function ae(u){const i=r.get(u);i.__depthDisposeCallback&&i.__depthDisposeCallback();const P=u.depthTexture;if(P&&P.renderTarget===u&&k(P),u.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(i.__webglFramebuffer[G]))for(let ce=0;ce<i.__webglFramebuffer[G].length;ce++)e.deleteFramebuffer(i.__webglFramebuffer[G][ce]);else e.deleteFramebuffer(i.__webglFramebuffer[G]);i.__webglDepthbuffer&&e.deleteRenderbuffer(i.__webglDepthbuffer[G])}else{if(Array.isArray(i.__webglFramebuffer))for(let G=0;G<i.__webglFramebuffer.length;G++)e.deleteFramebuffer(i.__webglFramebuffer[G]);else e.deleteFramebuffer(i.__webglFramebuffer);if(i.__webglDepthbuffer&&e.deleteRenderbuffer(i.__webglDepthbuffer),i.__webglMultisampledFramebuffer&&e.deleteFramebuffer(i.__webglMultisampledFramebuffer),i.__webglColorRenderbuffer)for(let G=0;G<i.__webglColorRenderbuffer.length;G++)i.__webglColorRenderbuffer[G]&&e.deleteRenderbuffer(i.__webglColorRenderbuffer[G]);i.__webglDepthRenderbuffer&&e.deleteRenderbuffer(i.__webglDepthRenderbuffer)}const $=u.textures;for(let G=0,ce=$.length;G<ce;G++){const ne=r.get($[G]);ne.__webglTexture&&(e.deleteTexture(ne.__webglTexture),f.memory.textures--),r.remove($[G])}r.remove(u)}let X=0;function Z(){X=0}function re(){return X}function Pe(u){X=u}function Ue(){const u=X;return u>=c.maxTextures&&Ge("WebGLTextures: Trying to use "+(u+1)+" texture units while this GPU supports only "+c.maxTextures),X+=1,u}function W(u){const i=[];return i.push(u.wrapS),i.push(u.wrapT),i.push(u.wrapR||0),i.push(u.magFilter),i.push(u.minFilter),i.push(u.anisotropy),i.push(u.internalFormat),i.push(u.format),i.push(u.type),i.push(u.generateMipmaps),i.push(u.mipmapsAutoUpdate),i.push(u.premultiplyAlpha),i.push(u.flipY),i.push(u.unpackAlignment),i.push(u.colorSpace),i.join()}function fe(u,i){const P=r.get(u);if(u.isVideoTexture&&it(u),u.isRenderTargetTexture===!1&&u.isExternalTexture!==!0&&u.version>0&&P.__version!==u.version){const $=u.image;if($===null)Ge("WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)Ge("WebGLRenderer: Texture marked for update but image is incomplete");else{rt(P,u,i);return}}else u.isExternalTexture&&(P.__webglTexture=u.sourceTexture?u.sourceTexture:null);t.bindTexture(e.TEXTURE_2D,P.__webglTexture,e.TEXTURE0+i)}function Se(u,i){const P=r.get(u);if(u.isRenderTargetTexture===!1&&u.version>0&&P.__version!==u.version){rt(P,u,i);return}else u.isExternalTexture&&(P.__webglTexture=u.sourceTexture?u.sourceTexture:null);t.bindTexture(e.TEXTURE_2D_ARRAY,P.__webglTexture,e.TEXTURE0+i)}function Ce(u,i){const P=r.get(u);if(u.isRenderTargetTexture===!1&&u.version>0&&P.__version!==u.version){rt(P,u,i);return}t.bindTexture(e.TEXTURE_3D,P.__webglTexture,e.TEXTURE0+i)}function ge(u,i){const P=r.get(u);if(u.version>0&&P.__version!==u.version){ht(P,u,i);return}t.bindTexture(e.TEXTURE_CUBE_MAP,P.__webglTexture,e.TEXTURE0+i)}const xe={[sn]:e.REPEAT,[xa]:e.CLAMP_TO_EDGE,[on]:e.MIRRORED_REPEAT},Qe={[Ht]:e.NEAREST,[ln]:e.NEAREST_MIPMAP_NEAREST,[ca]:e.NEAREST_MIPMAP_LINEAR,[xt]:e.LINEAR,[Ra]:e.LINEAR_MIPMAP_NEAREST,[Bt]:e.LINEAR_MIPMAP_LINEAR},De={[pn]:e.NEVER,[er]:e.ALWAYS,[fn]:e.LESS,[or]:e.LEQUAL,[un]:e.EQUAL,[nr]:e.GEQUAL,[dn]:e.GREATER,[cn]:e.NOTEQUAL};function ye(u,i){if(i.type===It&&a.has("OES_texture_float_linear")===!1&&(i.magFilter===xt||i.magFilter===Ra||i.magFilter===ca||i.magFilter===Bt||i.minFilter===xt||i.minFilter===Ra||i.minFilter===ca||i.minFilter===Bt)&&Ge("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(u,e.TEXTURE_WRAP_S,xe[i.wrapS]),e.texParameteri(u,e.TEXTURE_WRAP_T,xe[i.wrapT]),(u===e.TEXTURE_3D||u===e.TEXTURE_2D_ARRAY)&&e.texParameteri(u,e.TEXTURE_WRAP_R,xe[i.wrapR]),e.texParameteri(u,e.TEXTURE_MAG_FILTER,Qe[i.magFilter]),e.texParameteri(u,e.TEXTURE_MIN_FILTER,Qe[i.minFilter]),i.compareFunction&&(e.texParameteri(u,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(u,e.TEXTURE_COMPARE_FUNC,De[i.compareFunction])),a.has("EXT_texture_filter_anisotropic")===!0){if(i.magFilter===Ht||i.minFilter!==ca&&i.minFilter!==Bt||i.type===It&&a.has("OES_texture_float_linear")===!1)return;if(i.anisotropy>1||r.get(i).__currentAnisotropy){const P=a.get("EXT_texture_filter_anisotropic");e.texParameterf(u,P.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(i.anisotropy,c.getMaxAnisotropy())),r.get(i).__currentAnisotropy=i.anisotropy}}}function at(u,i){let P=!1;u.__webglInit===void 0&&(u.__webglInit=!0,i.addEventListener("dispose",F),K(i));const $=i.source;let G=T.get($);G===void 0&&(G={},T.set($,G));const ce=W(i);if(ce!==u.__cacheKey){G[ce]===void 0&&(G[ce]={texture:e.createTexture(),usedTimes:0},f.memory.textures++,P=!0),G[ce].usedTimes++;const ne=G[u.__cacheKey];ne!==void 0&&(G[u.__cacheKey].usedTimes--,ne.usedTimes===0&&H(i)),u.__cacheKey=ce,u.__webglTexture=G[ce].texture}return P}function lt(u,i,P){return Math.floor(Math.floor(u/P)/i)}function vt(u,i,P,$){const G=u.updateRanges;if(G.length===0)t.texSubImage2D(e.TEXTURE_2D,0,0,0,i.width,i.height,P,$,i.data);else{G.sort((pe,m)=>pe.start-m.start);let ce=0;for(let pe=1;pe<G.length;pe++){const m=G[ce],I=G[pe],j=m.start+m.count,ee=lt(I.start,i.width,4),oe=lt(m.start,i.width,4);I.start<=j+1&&ee===oe&&lt(I.start+I.count-1,i.width,4)===ee?m.count=Math.max(m.count,I.start+I.count-m.start):(++ce,G[ce]=I)}G.length=ce+1;const ne=t.getParameter(e.UNPACK_ROW_LENGTH),M=t.getParameter(e.UNPACK_SKIP_PIXELS),q=t.getParameter(e.UNPACK_SKIP_ROWS);t.pixelStorei(e.UNPACK_ROW_LENGTH,i.width);for(let pe=0,m=G.length;pe<m;pe++){const I=G[pe],j=Math.floor(I.start/4),ee=Math.ceil(I.count/4),oe=j%i.width,te=Math.floor(j/i.width),Me=ee;t.pixelStorei(e.UNPACK_SKIP_PIXELS,oe),t.pixelStorei(e.UNPACK_SKIP_ROWS,te),t.texSubImage2D(e.TEXTURE_2D,0,oe,te,Me,1,P,$,i.data)}u.clearUpdateRanges(),t.pixelStorei(e.UNPACK_ROW_LENGTH,ne),t.pixelStorei(e.UNPACK_SKIP_PIXELS,M),t.pixelStorei(e.UNPACK_SKIP_ROWS,q)}}function rt(u,i,P){let $=e.TEXTURE_2D;(i.isDataArrayTexture||i.isCompressedArrayTexture)&&($=e.TEXTURE_2D_ARRAY),i.isData3DTexture&&($=e.TEXTURE_3D);const G=at(u,i),ce=i.source;t.bindTexture($,u.__webglTexture,e.TEXTURE0+P);const ne=r.get(ce);if(ce.version!==ne.__version||G===!0){if(t.activeTexture(e.TEXTURE0+P),!(typeof ImageBitmap<"u"&&i.image instanceof ImageBitmap)){const se=$e.getPrimaries($e.workingColorSpace),ve=i.colorSpace===$t?null:$e.getPrimaries(i.colorSpace),Ae=i.colorSpace===$t||se===ve?e.NONE:e.BROWSER_DEFAULT_WEBGL;t.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,i.flipY),t.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,i.premultiplyAlpha),t.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ae)}t.pixelStorei(e.UNPACK_ALIGNMENT,i.unpackAlignment);let M=_(i.image,!1,c.maxTextureSize);M=Re(i,M);const q=l.convert(i.format,i.colorSpace),pe=l.convert(i.type);let m=x(i.internalFormat,q,pe,i.normalized,i.colorSpace,i.isVideoTexture);ye($,i);let I;const j=i.mipmaps,ee=i.isVideoTexture!==!0,oe=ne.__version===void 0||G===!0,te=ce.dataReady,Me=p(i,M);if(i.isDepthTexture)m=n(i.format===Gt,i.type),oe&&(ee?t.texStorage2D(e.TEXTURE_2D,1,m,M.width,M.height):t.texImage2D(e.TEXTURE_2D,0,m,M.width,M.height,0,q,pe,null));else if(i.isDataTexture)if(j.length>0){ee&&oe&&t.texStorage2D(e.TEXTURE_2D,Me,m,j[0].width,j[0].height);for(let se=0,ve=j.length;se<ve;se++)I=j[se],ee?te&&t.texSubImage2D(e.TEXTURE_2D,se,0,0,I.width,I.height,q,pe,I.data):t.texImage2D(e.TEXTURE_2D,se,m,I.width,I.height,0,q,pe,I.data);i.generateMipmaps=!1}else ee?(oe&&t.texStorage2D(e.TEXTURE_2D,Me,m,M.width,M.height),te&&vt(i,M,q,pe)):t.texImage2D(e.TEXTURE_2D,0,m,M.width,M.height,0,q,pe,M.data);else if(i.isCompressedTexture)if(i.isCompressedArrayTexture){ee&&oe&&t.texStorage3D(e.TEXTURE_2D_ARRAY,Me,m,j[0].width,j[0].height,M.depth);for(let se=0,ve=j.length;se<ve;se++)if(I=j[se],i.format!==yt)if(q!==null)if(ee){if(te)if(i.layerUpdates.size>0){const Ae=mn(I.width,I.height,i.format,i.type);for(const Ie of i.layerUpdates){const me=I.data.subarray(Ie*Ae/I.data.BYTES_PER_ELEMENT,(Ie+1)*Ae/I.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,se,0,0,Ie,I.width,I.height,1,q,me)}}else t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,se,0,0,0,I.width,I.height,M.depth,q,I.data)}else t.compressedTexImage3D(e.TEXTURE_2D_ARRAY,se,m,I.width,I.height,M.depth,0,I.data,0,0);else Ge("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ee?te&&t.texSubImage3D(e.TEXTURE_2D_ARRAY,se,0,0,0,I.width,I.height,M.depth,q,pe,I.data):t.texImage3D(e.TEXTURE_2D_ARRAY,se,m,I.width,I.height,M.depth,0,q,pe,I.data);i.layerUpdates.size>0&&i.clearLayerUpdates()}else{ee&&oe&&t.texStorage2D(e.TEXTURE_2D,Me,m,j[0].width,j[0].height);for(let se=0,ve=j.length;se<ve;se++)I=j[se],i.format!==yt?q!==null?ee?te&&t.compressedTexSubImage2D(e.TEXTURE_2D,se,0,0,I.width,I.height,q,I.data):t.compressedTexImage2D(e.TEXTURE_2D,se,m,I.width,I.height,0,I.data):Ge("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ee?te&&t.texSubImage2D(e.TEXTURE_2D,se,0,0,I.width,I.height,q,pe,I.data):t.texImage2D(e.TEXTURE_2D,se,m,I.width,I.height,0,q,pe,I.data)}else if(i.isDataArrayTexture)if(ee){if(oe&&t.texStorage3D(e.TEXTURE_2D_ARRAY,Me,m,M.width,M.height,M.depth),te)if(i.layerUpdates.size>0){const se=mn(M.width,M.height,i.format,i.type);for(const ve of i.layerUpdates){const Ae=M.data.subarray(ve*se/M.data.BYTES_PER_ELEMENT,(ve+1)*se/M.data.BYTES_PER_ELEMENT);t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,ve,M.width,M.height,1,q,pe,Ae)}i.clearLayerUpdates()}else t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,M.width,M.height,M.depth,q,pe,M.data)}else t.texImage3D(e.TEXTURE_2D_ARRAY,0,m,M.width,M.height,M.depth,0,q,pe,M.data);else if(i.isData3DTexture)ee?(oe&&t.texStorage3D(e.TEXTURE_3D,Me,m,M.width,M.height,M.depth),te&&t.texSubImage3D(e.TEXTURE_3D,0,0,0,0,M.width,M.height,M.depth,q,pe,M.data)):t.texImage3D(e.TEXTURE_3D,0,m,M.width,M.height,M.depth,0,q,pe,M.data);else if(i.isFramebufferTexture){if(oe)if(ee)t.texStorage2D(e.TEXTURE_2D,Me,m,M.width,M.height);else{let se=M.width,ve=M.height;for(let Ae=0;Ae<Me;Ae++)t.texImage2D(e.TEXTURE_2D,Ae,m,se,ve,0,q,pe,null),se>>=1,ve>>=1}}else if(i.isHTMLTexture){if("texElementImage2D"in e){const se=e.canvas;if(se.hasAttribute("layoutsubtree")||se.setAttribute("layoutsubtree","true"),M.parentNode!==se){se.appendChild(M),O.add(i),se.onpaint=ve=>{const Ae=ve.changedElements;for(const Ie of O)Ae.includes(Ie.image)&&(Ie.needsUpdate=!0)},se.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,M);else{const ve=e.RGBA,Ae=e.RGBA,Ie=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,ve,Ae,Ie,M)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(j.length>0){if(ee&&oe){const se=be(j[0]);t.texStorage2D(e.TEXTURE_2D,Me,m,se.width,se.height)}for(let se=0,ve=j.length;se<ve;se++)I=j[se],ee?te&&t.texSubImage2D(e.TEXTURE_2D,se,0,0,q,pe,I):t.texImage2D(e.TEXTURE_2D,se,m,q,pe,I);i.generateMipmaps=!1}else if(ee){if(oe){const se=be(M);t.texStorage2D(e.TEXTURE_2D,Me,m,se.width,se.height)}te&&t.texSubImage2D(e.TEXTURE_2D,0,0,0,q,pe,M)}else t.texImage2D(e.TEXTURE_2D,0,m,q,pe,M);N(i)&&i.mipmapsAutoUpdate===!0&&S($),ne.__version=ce.version,i.onUpdate&&i.onUpdate(i)}u.__version=i.version}function ht(u,i,P){if(i.image.length!==6)return;const $=at(u,i),G=i.source;t.bindTexture(e.TEXTURE_CUBE_MAP,u.__webglTexture,e.TEXTURE0+P);const ce=r.get(G);if(G.version!==ce.__version||$===!0){t.activeTexture(e.TEXTURE0+P);const ne=$e.getPrimaries($e.workingColorSpace),M=i.colorSpace===$t?null:$e.getPrimaries(i.colorSpace),q=i.colorSpace===$t||ne===M?e.NONE:e.BROWSER_DEFAULT_WEBGL;t.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,i.flipY),t.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,i.premultiplyAlpha),t.pixelStorei(e.UNPACK_ALIGNMENT,i.unpackAlignment),t.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,q);const pe=i.isCompressedTexture||i.image[0].isCompressedTexture,m=i.image[0]&&i.image[0].isDataTexture,I=[];for(let me=0;me<6;me++)!pe&&!m?I[me]=_(i.image[me],!0,c.maxCubemapSize):I[me]=m?i.image[me].image:i.image[me],I[me]=Re(i,I[me]);const j=I[0],ee=l.convert(i.format,i.colorSpace),oe=l.convert(i.type);let te=x(i.internalFormat,ee,oe,i.normalized,i.colorSpace);const Me=i.isVideoTexture!==!0,se=ce.__version===void 0||$===!0,ve=G.dataReady;let Ae=p(i,j);ye(e.TEXTURE_CUBE_MAP,i);let Ie;if(i.isDepthTexture){if(te=n(i.format===Gt,i.type),se)if(Me)t.texStorage2D(e.TEXTURE_CUBE_MAP,1,te,j.width,j.height);else for(let me=0;me<6;me++)t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,te,j.width,j.height,0,ee,oe,null)}else if(pe){Me&&se&&t.texStorage2D(e.TEXTURE_CUBE_MAP,Ae,te,j.width,j.height);for(let me=0;me<6;me++){Ie=I[me].mipmaps;for(let ke=0;ke<Ie.length;ke++){const Ze=Ie[ke];i.format!==yt?ee!==null?Me?ve&&t.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke,0,0,Ze.width,Ze.height,ee,Ze.data):t.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke,te,Ze.width,Ze.height,0,Ze.data):Ge("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Me?ve&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke,0,0,Ze.width,Ze.height,ee,oe,Ze.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke,te,Ze.width,Ze.height,0,ee,oe,Ze.data)}}}else{if(Ie=i.mipmaps,Me&&se){Ie.length>0&&Ae++;const me=be(I[0]);t.texStorage2D(e.TEXTURE_CUBE_MAP,Ae,te,me.width,me.height)}for(let me=0;me<6;me++)if(m){Me?ve&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,I[me].width,I[me].height,ee,oe,I[me].data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,te,I[me].width,I[me].height,0,ee,oe,I[me].data);for(let ke=0;ke<Ie.length;ke++){const Ze=Ie[ke].image[me].image;Me?ve&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke+1,0,0,Ze.width,Ze.height,ee,oe,Ze.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke+1,te,Ze.width,Ze.height,0,ee,oe,Ze.data)}}else{Me?ve&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,ee,oe,I[me]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,te,ee,oe,I[me]);for(let ke=0;ke<Ie.length;ke++){const Ze=Ie[ke];Me?ve&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke+1,0,0,ee,oe,Ze.image[me]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+me,ke+1,te,ee,oe,Ze.image[me])}}}N(i)&&i.mipmapsAutoUpdate===!0&&S(e.TEXTURE_CUBE_MAP),ce.__version=G.version,i.onUpdate&&i.onUpdate(i)}u.__version=i.version}function Je(u,i,P,$,G,ce){const ne=l.convert(P.format,P.colorSpace),M=l.convert(P.type),q=x(P.internalFormat,ne,M,P.normalized,P.colorSpace),pe=r.get(i),m=r.get(P);if(m.__renderTarget=i,!pe.__hasExternalTextures){const I=Math.max(1,i.width>>ce),j=Math.max(1,i.height>>ce);G===e.TEXTURE_3D||G===e.TEXTURE_2D_ARRAY?t.texImage3D(G,ce,q,I,j,i.depth,0,ne,M,null):t.texImage2D(G,ce,q,I,j,0,ne,M,null)}t.bindFramebuffer(e.FRAMEBUFFER,u),ie(i)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,$,G,m.__webglTexture,0,je(i)):(G===e.TEXTURE_2D||G>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&G<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,$,G,m.__webglTexture,ce),t.bindFramebuffer(e.FRAMEBUFFER,null)}function Lt(u,i,P){if(e.bindRenderbuffer(e.RENDERBUFFER,u),i.depthBuffer){const $=i.depthTexture,G=$&&$.isDepthTexture?$.type:null,ce=n(i.stencilBuffer,G),ne=i.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;ie(i)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,je(i),ce,i.width,i.height):P?e.renderbufferStorageMultisample(e.RENDERBUFFER,je(i),ce,i.width,i.height):e.renderbufferStorage(e.RENDERBUFFER,ce,i.width,i.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,ne,e.RENDERBUFFER,u)}else{const $=i.textures;for(let G=0;G<$.length;G++){const ce=$[G],ne=l.convert(ce.format,ce.colorSpace),M=l.convert(ce.type),q=x(ce.internalFormat,ne,M,ce.normalized,ce.colorSpace);ie(i)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,je(i),q,i.width,i.height):P?e.renderbufferStorageMultisample(e.RENDERBUFFER,je(i),q,i.width,i.height):e.renderbufferStorage(e.RENDERBUFFER,q,i.width,i.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function st(u,i,P){const $=i.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(e.FRAMEBUFFER,u),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const G=r.get(i.depthTexture);G.__renderTarget=i;const ce=$?i.depthTexture.image[0]:i.depthTexture.image;(!G.__webglTexture||ce.width!==i.width||ce.height!==i.height)&&(ce.width=i.width,ce.height=i.height,i.depthTexture.needsUpdate=!0),$?ge(i.depthTexture,0):fe(i.depthTexture,0);const ne=G.__webglTexture,M=je(i),q=$?e.TEXTURE_CUBE_MAP_POSITIVE_X+P:e.TEXTURE_2D,pe=i.depthTexture.format===Gt?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===aa)ie(i)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,pe,q,ne,0,M):e.framebufferTexture2D(e.FRAMEBUFFER,pe,q,ne,0);else if(i.depthTexture.format===Gt)ie(i)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,pe,q,ne,0,M):e.framebufferTexture2D(e.FRAMEBUFFER,pe,q,ne,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function St(u){const i=r.get(u),P=u.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==u.depthTexture){const $=u.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),$){const G=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,$.removeEventListener("dispose",G)};$.addEventListener("dispose",G),i.__depthDisposeCallback=G}i.__boundDepthTexture=$}if(u.depthTexture&&!i.__autoAllocateDepthBuffer)if(P)for(let $=0;$<6;$++)st(i.__webglFramebuffer[$],u,$);else u.texture.mipmaps.length>0?st(i.__webglFramebuffer[0],u,0):st(i.__webglFramebuffer,u,0);else if(P){i.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[$]),i.__webglDepthbuffer[$]===void 0)i.__webglDepthbuffer[$]=e.createRenderbuffer(),Lt(i.__webglDepthbuffer[$],u,!1);else{const G=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ce=i.__webglDepthbuffer[$];e.bindRenderbuffer(e.RENDERBUFFER,ce),e.framebufferRenderbuffer(e.FRAMEBUFFER,G,e.RENDERBUFFER,ce)}}else if(u.texture.mipmaps.length>0?t.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):t.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),Lt(i.__webglDepthbuffer,u,!1);else{const $=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,G=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,G),e.framebufferRenderbuffer(e.FRAMEBUFFER,$,e.RENDERBUFFER,G)}t.bindFramebuffer(e.FRAMEBUFFER,null)}function Et(u,i,P){const $=r.get(u);i!==void 0&&Je($.__webglFramebuffer,u,u.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),P!==void 0&&St(u)}function Mt(u){const i=u.texture,P=r.get(u),$=r.get(i);u.addEventListener("dispose",z),K(u);const G=u.textures,ce=u.isWebGLCubeRenderTarget===!0,ne=G.length>1;if(ne||($.__webglTexture===void 0&&($.__webglTexture=e.createTexture()),$.__version=i.version,f.memory.textures++),ce){P.__webglFramebuffer=[];for(let M=0;M<6;M++)if(i.mipmaps.length>0){P.__webglFramebuffer[M]=[];for(let q=0;q<i.mipmaps.length;q++)P.__webglFramebuffer[M][q]=e.createFramebuffer()}else P.__webglFramebuffer[M]=e.createFramebuffer()}else{if(i.mipmaps.length>0){P.__webglFramebuffer=[];for(let M=0;M<i.mipmaps.length;M++)P.__webglFramebuffer[M]=e.createFramebuffer()}else P.__webglFramebuffer=e.createFramebuffer();if(ne)for(let M=0,q=G.length;M<q;M++){const pe=r.get(G[M]);pe.__webglTexture===void 0&&(pe.__webglTexture=e.createTexture(),f.memory.textures++)}if(u.samples>0&&ie(u)===!1){P.__webglMultisampledFramebuffer=e.createFramebuffer(),P.__webglColorRenderbuffer=[],t.bindFramebuffer(e.FRAMEBUFFER,P.__webglMultisampledFramebuffer);for(let M=0;M<G.length;M++){const q=G[M];P.__webglColorRenderbuffer[M]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,P.__webglColorRenderbuffer[M]);const pe=l.convert(q.format,q.colorSpace),m=l.convert(q.type),I=x(q.internalFormat,pe,m,q.normalized,q.colorSpace,u.isXRRenderTarget===!0),j=je(u);e.renderbufferStorageMultisample(e.RENDERBUFFER,j,I,u.width,u.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+M,e.RENDERBUFFER,P.__webglColorRenderbuffer[M])}e.bindRenderbuffer(e.RENDERBUFFER,null),u.depthBuffer&&(P.__webglDepthRenderbuffer=e.createRenderbuffer(),Lt(P.__webglDepthRenderbuffer,u,!0)),t.bindFramebuffer(e.FRAMEBUFFER,null)}}if(ce){t.bindTexture(e.TEXTURE_CUBE_MAP,$.__webglTexture),ye(e.TEXTURE_CUBE_MAP,i);for(let M=0;M<6;M++)if(i.mipmaps.length>0)for(let q=0;q<i.mipmaps.length;q++)Je(P.__webglFramebuffer[M][q],u,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+M,q);else Je(P.__webglFramebuffer[M],u,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+M,0);N(i)?S(e.TEXTURE_CUBE_MAP):i.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),t.unbindTexture()}else if(ne){for(let M=0,q=G.length;M<q;M++){const pe=G[M],m=r.get(pe);let I=e.TEXTURE_2D;(u.isWebGL3DRenderTarget||u.isWebGLArrayRenderTarget)&&(I=u.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(I,m.__webglTexture),ye(I,pe),Je(P.__webglFramebuffer,u,pe,e.COLOR_ATTACHMENT0+M,I,0),N(pe)&&S(I)}t.unbindTexture()}else{let M=e.TEXTURE_2D;if((u.isWebGL3DRenderTarget||u.isWebGLArrayRenderTarget)&&(M=u.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(M,$.__webglTexture),ye(M,i),i.mipmaps.length>0)for(let q=0;q<i.mipmaps.length;q++)Je(P.__webglFramebuffer[q],u,i,e.COLOR_ATTACHMENT0,M,q);else Je(P.__webglFramebuffer,u,i,e.COLOR_ATTACHMENT0,M,0);N(i)?S(M):i.mipmaps.length>0&&e.texParameteri(M,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),t.unbindTexture()}u.depthBuffer&&St(u)}function E(u){const i=u.textures;for(let P=0,$=i.length;P<$;P++){const G=i[P];if(N(G)&&G.mipmapsAutoUpdate===!0){const ce=b(u),ne=r.get(G).__webglTexture;t.bindTexture(ce,ne),S(ce),t.unbindTexture()}}}const Tt=[];function Ye(u){if(u.samples>0){if(ie(u)===!1){const i=u.textures,P=u.width,$=u.height;let G=e.COLOR_BUFFER_BIT;const ce=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ne=r.get(u),M=i.length>1;if(M)for(let q=0;q<i.length;q++)t.bindFramebuffer(e.FRAMEBUFFER,ne.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+q,e.RENDERBUFFER,null),t.bindFramebuffer(e.FRAMEBUFFER,ne.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+q,e.TEXTURE_2D,null,0);t.bindFramebuffer(e.READ_FRAMEBUFFER,ne.__webglMultisampledFramebuffer),u.texture.mipmaps.length>0?t.bindFramebuffer(e.DRAW_FRAMEBUFFER,ne.__webglFramebuffer[0]):t.bindFramebuffer(e.DRAW_FRAMEBUFFER,ne.__webglFramebuffer);for(let q=0;q<i.length;q++){if(u.resolveDepthBuffer&&(u.depthBuffer&&(G|=e.DEPTH_BUFFER_BIT),u.stencilBuffer&&u.resolveStencilBuffer&&(G|=e.STENCIL_BUFFER_BIT)),M){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,ne.__webglColorRenderbuffer[q]);const pe=r.get(i[q]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,pe,0)}e.blitFramebuffer(0,0,P,$,0,0,P,$,G,e.NEAREST),y===!0&&(Tt.length=0,Tt.push(e.COLOR_ATTACHMENT0+q),u.depthBuffer&&u.storeMultisampledDepthBuffer===!1&&Tt.push(ce),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Tt))}if(t.bindFramebuffer(e.READ_FRAMEBUFFER,null),t.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),M)for(let q=0;q<i.length;q++){t.bindFramebuffer(e.FRAMEBUFFER,ne.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+q,e.RENDERBUFFER,ne.__webglColorRenderbuffer[q]);const pe=r.get(i[q]).__webglTexture;t.bindFramebuffer(e.FRAMEBUFFER,ne.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+q,e.TEXTURE_2D,pe,0)}t.bindFramebuffer(e.DRAW_FRAMEBUFFER,ne.__webglMultisampledFramebuffer)}else if(u.depthBuffer&&u.storeMultisampledDepthBuffer===!1&&y){const i=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[i])}}}function je(u){return Math.min(c.maxSamples,u.samples)}function ie(u){const i=r.get(u);return u.samples>0&&a.has("WEBGL_multisampled_render_to_texture")===!0&&i.__useRenderToTexture!==!1}function it(u){const i=f.render.frame;V.get(u)!==i&&(V.set(u,i),u.update())}function Re(u,i){const P=u.colorSpace,$=u.format,G=u.type;return u.isCompressedTexture===!0||u.isVideoTexture===!0||P!==za&&P!==$t&&($e.getTransfer(P)===We?($!==yt||G!==At)&&Ge("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ke("WebGLTextures: Unsupported texture color space:",P)),i}function be(u){return typeof HTMLImageElement<"u"&&u instanceof HTMLImageElement?(L.width=u.naturalWidth||u.width,L.height=u.naturalHeight||u.height):typeof VideoFrame<"u"&&u instanceof VideoFrame?(L.width=u.displayWidth,L.height=u.displayHeight):(L.width=u.width,L.height=u.height),L}this.allocateTextureUnit=Ue,this.resetTextureUnits=Z,this.getTextureUnits=re,this.setTextureUnits=Pe,this.setTexture2D=fe,this.setTexture2DArray=Se,this.setTexture3D=Ce,this.setTextureCube=ge,this.rebindTextures=Et,this.setupRenderTarget=Mt,this.updateRenderTargetMipmap=E,this.updateMultisampleRenderTarget=Ye,this.setupDepthRenderbuffer=St,this.setupFrameBufferTexture=Je,this.useMultisampledRTT=ie,this.dispose=Q}function oo(e,a){function t(r,c=$t){let l;const f=$e.getTransfer(c);if(r===At)return e.UNSIGNED_BYTE;if(r===pr)return e.UNSIGNED_SHORT_4_4_4_4;if(r===mr)return e.UNSIGNED_SHORT_5_5_5_1;if(r===hn)return e.UNSIGNED_INT_5_9_9_9_REV;if(r===gn)return e.UNSIGNED_INT_10F_11F_11F_REV;if(r===_n)return e.BYTE;if(r===vn)return e.SHORT;if(r===da)return e.UNSIGNED_SHORT;if(r===Va)return e.INT;if(r===Vt)return e.UNSIGNED_INT;if(r===It)return e.FLOAT;if(r===Pt)return e.HALF_FLOAT;if(r===Sn)return e.ALPHA;if(r===En)return e.RGB;if(r===yt)return e.RGBA;if(r===aa)return e.DEPTH_COMPONENT;if(r===Gt)return e.DEPTH_STENCIL;if(r===Mn)return e.RED;if(r===hr)return e.RED_INTEGER;if(r===Zt)return e.RG;if(r===gr)return e.RG_INTEGER;if(r===_r)return e.RGBA_INTEGER;if(r===Aa||r===Ca||r===ba||r===La)if(f===We)if(l=a.get("WEBGL_compressed_texture_s3tc_srgb"),l!==null){if(r===Aa)return l.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Ca)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===ba)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===La)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(l=a.get("WEBGL_compressed_texture_s3tc"),l!==null){if(r===Aa)return l.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Ca)return l.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===ba)return l.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===La)return l.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===vr||r===Sr||r===Er||r===Mr)if(l=a.get("WEBGL_compressed_texture_pvrtc"),l!==null){if(r===vr)return l.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Sr)return l.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===Er)return l.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===Mr)return l.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Tr||r===xr||r===Rr||r===Ar||r===Cr||r===Ma||r===br)if(l=a.get("WEBGL_compressed_texture_etc"),l!==null){if(r===Tr||r===xr)return f===We?l.COMPRESSED_SRGB8_ETC2:l.COMPRESSED_RGB8_ETC2;if(r===Rr)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:l.COMPRESSED_RGBA8_ETC2_EAC;if(r===Ar)return l.COMPRESSED_R11_EAC;if(r===Cr)return l.COMPRESSED_SIGNED_R11_EAC;if(r===Ma)return l.COMPRESSED_RG11_EAC;if(r===br)return l.COMPRESSED_SIGNED_RG11_EAC}else return null;if(r===Lr||r===Pr||r===Dr||r===Nr||r===Ur||r===wr||r===Ir||r===yr||r===Fr||r===Or||r===Br||r===Gr||r===Hr||r===Vr)if(l=a.get("WEBGL_compressed_texture_astc"),l!==null){if(r===Lr)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:l.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===Pr)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:l.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Dr)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:l.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Nr)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:l.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===Ur)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:l.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===wr)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:l.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Ir)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:l.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===yr)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:l.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===Fr)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:l.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===Or)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:l.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Br)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:l.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Gr)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:l.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Hr)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:l.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===Vr)return f===We?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:l.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Wr||r===zr||r===kr)if(l=a.get("EXT_texture_compression_bptc"),l!==null){if(r===Wr)return f===We?l.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:l.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===zr)return l.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===kr)return l.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Xr||r===qr||r===Ta||r===Kr)if(l=a.get("EXT_texture_compression_rgtc"),l!==null){if(r===Xr)return l.COMPRESSED_RED_RGTC1_EXT;if(r===qr)return l.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===Ta)return l.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Kr)return l.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===jt?e.UNSIGNED_INT_24_8:e[r]!==void 0?e[r]:null}return{convert:t}}const au=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ru=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class iu{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(a,t){if(this.texture===null){const r=new Yr(a.texture);(a.depthNear!==t.depthNear||a.depthFar!==t.depthFar)&&(this.depthNear=a.depthNear,this.depthFar=a.depthFar),this.texture=r}}getMesh(a){if(this.texture!==null&&this.mesh===null){const t=a.cameras[0].viewport,r=new qt({vertexShader:au,fragmentShader:ru,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ot(new Ha(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class nu extends Tn{constructor(a,t){super();const r=this;let c=null,l=1,f=null,g="local-floor",y=1,L=null,V=null,O=null,v=null,T=null,D=null;const B=typeof XRWebGLBinding<"u",d=new iu,s={},_=t.getContextAttributes();let N=null,S=null;const b=[],x=[],n=new pt;let p=null,K=null;const U=new Pa;U.viewport=new mt;const F=new Pa;F.viewport=new mt;const z=[U,F],k=new xn;let R=null,Q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let fe=b[W];return fe===void 0&&(fe=new Da,b[W]=fe),fe.getTargetRaySpace()},this.getControllerGrip=function(W){let fe=b[W];return fe===void 0&&(fe=new Da,b[W]=fe),fe.getGripSpace()},this.getHand=function(W){let fe=b[W];return fe===void 0&&(fe=new Da,b[W]=fe),fe.getHandSpace()};function Y(W){const fe=x.indexOf(W.inputSource);if(fe===-1)return;const Se=b[fe];Se!==void 0&&(Se.update(W.inputSource,W.frame,L||f),Se.dispatchEvent({type:W.type,data:W.inputSource}))}function H(){c.removeEventListener("select",Y),c.removeEventListener("selectstart",Y),c.removeEventListener("selectend",Y),c.removeEventListener("squeeze",Y),c.removeEventListener("squeezestart",Y),c.removeEventListener("squeezeend",Y),c.removeEventListener("end",H),c.removeEventListener("inputsourceschange",ae);for(let W=0;W<b.length;W++){const fe=x[W];fe!==null&&(x[W]=null,b[W].disconnect(fe))}R=null,Q=null,d.reset();for(const W in s)delete s[W];if(a.setRenderTarget(N),T=null,v=null,O=null,c=null,S=null,Ue.stop(),r.isPresenting=!1,a.setPixelRatio(p),a.setSize(n.width,n.height,!1),K!==null){const W=K.camera;W.fov=K.fov,W.zoom=K.zoom,W.updateProjectionMatrix(),K=null}r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){l=W,r.isPresenting===!0&&Ge("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){g=W,r.isPresenting===!0&&Ge("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return L||f},this.setReferenceSpace=function(W){L=W},this.getBaseLayer=function(){return v!==null?v:T},this.getBinding=function(){return O===null&&B&&(O=new XRWebGLBinding(c,t)),O},this.getFrame=function(){return D},this.getSession=function(){return c},this.setSession=async function(W){if(c=W,c!==null){if(N=a.getRenderTarget(),c.addEventListener("select",Y),c.addEventListener("selectstart",Y),c.addEventListener("selectend",Y),c.addEventListener("squeeze",Y),c.addEventListener("squeezestart",Y),c.addEventListener("squeezeend",Y),c.addEventListener("end",H),c.addEventListener("inputsourceschange",ae),_.xrCompatible!==!0&&await t.makeXRCompatible(),p=a.getPixelRatio(),a.getSize(n),B&&"createProjectionLayer"in XRWebGLBinding.prototype){let fe=null,Se=null,Ce=null;_.depth&&(Ce=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,fe=_.stencil?Gt:aa,Se=_.stencil?jt:Vt);const ge={colorFormat:t.RGBA8,depthFormat:Ce,scaleFactor:l};O=this.getBinding(),v=O.createProjectionLayer(ge),c.updateRenderState({layers:[v]}),a.setPixelRatio(1),a.setSize(v.textureWidth,v.textureHeight,!1),S=new Ct(v.textureWidth,v.textureHeight,{format:yt,type:At,depthTexture:new ea(v.textureWidth,v.textureHeight,Se,void 0,void 0,void 0,void 0,void 0,void 0,fe),stencilBuffer:_.stencil,colorSpace:a.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:v.ignoreDepthValues===!1,resolveStencilBuffer:v.ignoreDepthValues===!1,storeMultisampledDepthBuffer:v.ignoreDepthValues===!1,storeMultisampledStencilBuffer:v.ignoreDepthValues===!1})}else{const fe={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:l};T=new XRWebGLLayer(c,t,fe),c.updateRenderState({baseLayer:T}),a.setPixelRatio(1),a.setSize(T.framebufferWidth,T.framebufferHeight,!1),S=new Ct(T.framebufferWidth,T.framebufferHeight,{format:yt,type:At,colorSpace:a.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:T.ignoreDepthValues===!1,resolveStencilBuffer:T.ignoreDepthValues===!1,storeMultisampledDepthBuffer:T.ignoreDepthValues===!1,storeMultisampledStencilBuffer:T.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(y),L=null,f=await c.requestReferenceSpace(g),Ue.setContext(c),Ue.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(c!==null)return c.environmentBlendMode},this.getDepthTexture=function(){return d.getDepthTexture()};function ae(W){for(let fe=0;fe<W.removed.length;fe++){const Se=W.removed[fe],Ce=x.indexOf(Se);Ce>=0&&(x[Ce]=null,b[Ce].disconnect(Se))}for(let fe=0;fe<W.added.length;fe++){const Se=W.added[fe];let Ce=x.indexOf(Se);if(Ce===-1){for(let xe=0;xe<b.length;xe++)if(xe>=x.length){x.push(Se),Ce=xe;break}else if(x[xe]===null){x[xe]=Se,Ce=xe;break}if(Ce===-1)break}const ge=b[Ce];ge&&ge.connect(Se)}}function X(W,fe){fe===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(fe.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(c===null)return;let fe=W.near,Se=W.far;d.texture!==null&&(d.depthNear>0&&(fe=d.depthNear),d.depthFar>0&&(Se=d.depthFar)),k.near=F.near=U.near=fe,k.far=F.far=U.far=Se,(R!==k.near||Q!==k.far)&&(c.updateRenderState({depthNear:k.near,depthFar:k.far}),R=k.near,Q=k.far),k.layers.mask=W.layers.mask|6,U.layers.mask=k.layers.mask&-5,F.layers.mask=k.layers.mask&-3;const Ce=W.parent,ge=k.cameras;X(k,Ce);for(let xe=0;xe<ge.length;xe++)X(ge[xe],Ce);k.projectionMatrix.copy(U.projectionMatrix),k.projectionMatrixInverse.copy(U.projectionMatrixInverse),K===null&&W.isPerspectiveCamera&&(K={camera:W,fov:W.fov,zoom:W.zoom}),Z(W,k,Ce)};function Z(W,fe,Se){Se===null?W.matrix.copy(fe.matrixWorld):(W.matrix.copy(Se.matrixWorld),W.matrix.invert(),W.matrix.multiply(fe.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(fe.projectionMatrix),W.projectionMatrixInverse.copy(fe.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=vo*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(v===null&&T===null))return y},this.setFoveation=function(W){y=W,v!==null&&(v.fixedFoveation=W),T!==null&&T.fixedFoveation!==void 0&&(T.fixedFoveation=W)},this.hasDepthSensing=function(){return d.texture!==null},this.getDepthSensingMesh=function(){return d.getMesh(k)},this.getCameraTexture=function(W){return s[W]};let re=null;function Pe(W,fe){if(V=fe.getViewerPose(L||f),D=fe,V!==null){const Se=V.views;T!==null&&(a.setRenderTargetFramebuffer(S,T.framebuffer),a.setRenderTarget(S));let Ce=!1;Se.length!==k.cameras.length&&(k.cameras.length=0,Ce=!0);for(let xe=0;xe<Se.length;xe++){const Qe=Se[xe];let De=null;if(T!==null)De=T.getViewport(Qe);else{const at=O.getViewSubImage(v,Qe);De=at.viewport,xe===0&&(a.setRenderTargetTextures(S,at.colorTexture,at.depthStencilTexture),a.setRenderTarget(S))}let ye=z[xe];ye===void 0&&(ye=new Pa,ye.layers.enable(xe),ye.viewport=new mt,z[xe]=ye),ye.matrix.fromArray(Qe.transform.matrix),ye.matrix.decompose(ye.position,ye.quaternion,ye.scale),ye.projectionMatrix.fromArray(Qe.projectionMatrix),ye.projectionMatrixInverse.copy(ye.projectionMatrix).invert(),ye.viewport.set(De.x,De.y,De.width,De.height),xe===0&&(k.matrix.copy(ye.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Ce===!0&&k.cameras.push(ye)}const ge=c.enabledFeatures;if(ge&&ge.includes("depth-sensing")&&c.depthUsage=="gpu-optimized"&&B){O=r.getBinding();const xe=O.getDepthInformation(Se[0]);xe&&xe.isValid&&xe.texture&&d.init(xe,c.renderState)}if(ge&&ge.includes("camera-access")&&B){a.state.unbindTexture(),O=r.getBinding();for(let xe=0;xe<Se.length;xe++){const Qe=Se[xe].camera;if(Qe){let De=s[Qe];De||(De=new Yr,s[Qe]=De);const ye=O.getCameraImage(Qe);De.sourceTexture=ye}}}}for(let Se=0;Se<b.length;Se++){const Ce=x[Se],ge=b[Se];Ce!==null&&ge!==void 0&&ge.update(Ce,fe,L||f)}re&&re(W,fe),fe.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:fe}),D=null}const Ue=new Pn;Ue.setAnimationLoop(Pe),this.setAnimationLoop=function(W){re=W},this.dispose=function(){}}}const ou=new Kt,so=new we;so.set(-1,0,0,0,1,0,0,0,1);function su(e,a){function t(d,s){d.matrixAutoUpdate===!0&&d.updateMatrix(),s.value.copy(d.matrix)}function r(d,s){s.color.getRGB(d.fogColor.value,ui(e)),s.isFog?(d.fogNear.value=s.near,d.fogFar.value=s.far):s.isFogExp2&&(d.fogDensity.value=s.density)}function c(d,s,_,N,S){s.isNodeMaterial?s.uniformsNeedUpdate=!1:s.isMeshBasicMaterial?l(d,s):s.isMeshLambertMaterial?(l(d,s),s.envMap&&(d.envMapIntensity.value=s.envMapIntensity)):s.isMeshToonMaterial?(l(d,s),O(d,s)):s.isMeshPhongMaterial?(l(d,s),V(d,s),s.envMap&&(d.envMapIntensity.value=s.envMapIntensity)):s.isMeshStandardMaterial?(l(d,s),v(d,s),s.isMeshPhysicalMaterial&&T(d,s,S)):s.isMeshMatcapMaterial?(l(d,s),D(d,s)):s.isMeshDepthMaterial?l(d,s):s.isMeshDistanceMaterial?(l(d,s),B(d,s)):s.isMeshNormalMaterial?l(d,s):s.isLineBasicMaterial?(f(d,s),s.isLineDashedMaterial&&g(d,s)):s.isPointsMaterial?y(d,s,_,N):s.isSpriteMaterial?L(d,s):s.isShadowMaterial?(d.color.value.copy(s.color),d.opacity.value=s.opacity):s.isShaderMaterial&&(s.uniformsNeedUpdate=!1)}function l(d,s){d.opacity.value=s.opacity,s.color&&d.diffuse.value.copy(s.color),s.emissive&&d.emissive.value.copy(s.emissive).multiplyScalar(s.emissiveIntensity),s.map&&(d.map.value=s.map,t(s.map,d.mapTransform)),s.alphaMap&&(d.alphaMap.value=s.alphaMap,t(s.alphaMap,d.alphaMapTransform)),s.bumpMap&&(d.bumpMap.value=s.bumpMap,t(s.bumpMap,d.bumpMapTransform),d.bumpScale.value=s.bumpScale,s.side===_t&&(d.bumpScale.value*=-1)),s.normalMap&&(d.normalMap.value=s.normalMap,t(s.normalMap,d.normalMapTransform),d.normalScale.value.copy(s.normalScale),s.side===_t&&d.normalScale.value.negate()),s.displacementMap&&(d.displacementMap.value=s.displacementMap,t(s.displacementMap,d.displacementMapTransform),d.displacementScale.value=s.displacementScale,d.displacementBias.value=s.displacementBias),s.emissiveMap&&(d.emissiveMap.value=s.emissiveMap,t(s.emissiveMap,d.emissiveMapTransform)),s.specularMap&&(d.specularMap.value=s.specularMap,t(s.specularMap,d.specularMapTransform)),s.alphaTest>0&&(d.alphaTest.value=s.alphaTest);const _=a.get(s),N=_.envMap,S=_.envMapRotation;N&&(d.envMap.value=N,d.envMapRotation.value.setFromMatrix4(ou.makeRotationFromEuler(S)).transpose(),N.isCubeTexture&&N.isRenderTargetTexture===!1&&d.envMapRotation.value.premultiply(so),d.reflectivity.value=s.reflectivity,d.ior.value=s.ior,d.refractionRatio.value=s.refractionRatio),s.lightMap&&(d.lightMap.value=s.lightMap,d.lightMapIntensity.value=s.lightMapIntensity,t(s.lightMap,d.lightMapTransform)),s.aoMap&&(d.aoMap.value=s.aoMap,d.aoMapIntensity.value=s.aoMapIntensity,t(s.aoMap,d.aoMapTransform))}function f(d,s){d.diffuse.value.copy(s.color),d.opacity.value=s.opacity,s.map&&(d.map.value=s.map,t(s.map,d.mapTransform))}function g(d,s){d.dashSize.value=s.dashSize,d.totalSize.value=s.dashSize+s.gapSize,d.scale.value=s.scale}function y(d,s,_,N){d.diffuse.value.copy(s.color),d.opacity.value=s.opacity,d.size.value=s.size*_,d.scale.value=N*.5,s.map&&(d.map.value=s.map,t(s.map,d.uvTransform)),s.alphaMap&&(d.alphaMap.value=s.alphaMap,t(s.alphaMap,d.alphaMapTransform)),s.alphaTest>0&&(d.alphaTest.value=s.alphaTest)}function L(d,s){d.diffuse.value.copy(s.color),d.opacity.value=s.opacity,d.rotation.value=s.rotation,s.map&&(d.map.value=s.map,t(s.map,d.mapTransform)),s.alphaMap&&(d.alphaMap.value=s.alphaMap,t(s.alphaMap,d.alphaMapTransform)),s.alphaTest>0&&(d.alphaTest.value=s.alphaTest)}function V(d,s){d.specular.value.copy(s.specular),d.shininess.value=Math.max(s.shininess,1e-4)}function O(d,s){s.gradientMap&&(d.gradientMap.value=s.gradientMap)}function v(d,s){d.metalness.value=s.metalness,s.metalnessMap&&(d.metalnessMap.value=s.metalnessMap,t(s.metalnessMap,d.metalnessMapTransform)),d.roughness.value=s.roughness,s.roughnessMap&&(d.roughnessMap.value=s.roughnessMap,t(s.roughnessMap,d.roughnessMapTransform)),s.envMap&&(d.envMapIntensity.value=s.envMapIntensity)}function T(d,s,_){d.ior.value=s.ior,s.diffuseRoughness>0&&(d.diffuseRoughness.value=s.diffuseRoughness,s.diffuseRoughnessMap&&(d.diffuseRoughnessMap.value=s.diffuseRoughnessMap,t(s.diffuseRoughnessMap,d.diffuseRoughnessMapTransform))),s.sheen>0&&(d.sheenColor.value.copy(s.sheenColor).multiplyScalar(s.sheen),d.sheenRoughness.value=s.sheenRoughness,s.sheenColorMap&&(d.sheenColorMap.value=s.sheenColorMap,t(s.sheenColorMap,d.sheenColorMapTransform)),s.sheenRoughnessMap&&(d.sheenRoughnessMap.value=s.sheenRoughnessMap,t(s.sheenRoughnessMap,d.sheenRoughnessMapTransform))),s.clearcoat>0&&(d.clearcoat.value=s.clearcoat,d.clearcoatRoughness.value=s.clearcoatRoughness,s.clearcoatMap&&(d.clearcoatMap.value=s.clearcoatMap,t(s.clearcoatMap,d.clearcoatMapTransform)),s.clearcoatRoughnessMap&&(d.clearcoatRoughnessMap.value=s.clearcoatRoughnessMap,t(s.clearcoatRoughnessMap,d.clearcoatRoughnessMapTransform)),s.clearcoatNormalMap&&(d.clearcoatNormalMap.value=s.clearcoatNormalMap,t(s.clearcoatNormalMap,d.clearcoatNormalMapTransform),d.clearcoatNormalScale.value.copy(s.clearcoatNormalScale),s.side===_t&&d.clearcoatNormalScale.value.negate())),s.dispersion>0&&(d.dispersion.value=s.dispersion),s.retroreflectivity>0&&(d.retroreflectivity.value=s.retroreflectivity),s.iridescence>0&&(d.iridescence.value=s.iridescence,d.iridescenceIOR.value=s.iridescenceIOR,d.iridescenceThicknessMinimum.value=s.iridescenceThicknessMinimum,d.iridescenceThicknessMaximum.value=s.iridescenceThicknessMaximum,s.iridescenceMap&&(d.iridescenceMap.value=s.iridescenceMap,t(s.iridescenceMap,d.iridescenceMapTransform)),s.iridescenceThicknessMap&&(d.iridescenceThicknessMap.value=s.iridescenceThicknessMap,t(s.iridescenceThicknessMap,d.iridescenceThicknessMapTransform))),s.transmission>0&&(d.transmission.value=s.transmission,d.transmissionSamplerMap.value=_.texture,d.transmissionSamplerSize.value.set(_.width,_.height),s.transmissionMap&&(d.transmissionMap.value=s.transmissionMap,t(s.transmissionMap,d.transmissionMapTransform)),d.thickness.value=s.thickness,s.thicknessMap&&(d.thicknessMap.value=s.thicknessMap,t(s.thicknessMap,d.thicknessMapTransform)),d.attenuationDistance.value=s.attenuationDistance,d.attenuationColor.value.copy(s.attenuationColor)),s.anisotropy>0&&(d.anisotropyVector.value.set(s.anisotropy*Math.cos(s.anisotropyRotation),s.anisotropy*Math.sin(s.anisotropyRotation)),s.anisotropyMap&&(d.anisotropyMap.value=s.anisotropyMap,t(s.anisotropyMap,d.anisotropyMapTransform))),d.specularIntensity.value=s.specularIntensity,d.specularColor.value.copy(s.specularColor),s.specularColorMap&&(d.specularColorMap.value=s.specularColorMap,t(s.specularColorMap,d.specularColorMapTransform)),s.specularIntensityMap&&(d.specularIntensityMap.value=s.specularIntensityMap,t(s.specularIntensityMap,d.specularIntensityMapTransform))}function D(d,s){s.matcap&&(d.matcap.value=s.matcap)}function B(d,s){const _=a.get(s).light;d.referencePosition.value.setFromMatrixPosition(_.matrixWorld),d.nearDistance.value=_.shadow.camera.near,d.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:c}}function lu(e,a,t,r){let c={},l={};function f(_,N){const S=N.program;r.uniformBlockBinding(_,S,c[_.id])}function g(_,N){let S=c[_.id];S===void 0&&(D(_),S=y(_),c[_.id]=S,_.addEventListener("dispose",d));const b=N.program;r.updateUBOMapping(_,b);const x=a.render.frame;l[_.id]!==x&&(L(_),l[_.id]=x)}function y(_){const N=e.createBuffer(),S=_.__size,b=_.usage;return e.bindBuffer(e.UNIFORM_BUFFER,N),e.bufferData(e.UNIFORM_BUFFER,S,b),e.bindBuffer(e.UNIFORM_BUFFER,null),N}function L(_){const N=c[_.id],S=_.uniforms,b=_.__cache;e.bindBuffer(e.UNIFORM_BUFFER,N);for(let x=0,n=S.length;x<n;x++){const p=S[x];if(Array.isArray(p))for(let K=0,U=p.length;K<U;K++)V(p[K],x,K,b);else V(p,x,0,b)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function V(_,N,S,b){if(v(_,N,S,b)===!0){const x=_.__offset,n=_.value;if(Array.isArray(n)){let p=0;for(let K=0;K<n.length;K++){const U=n[K],F=B(U,!0);O(U,_.__data,p),p+=F.storage/Float32Array.BYTES_PER_ELEMENT}}else O(n,_.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,x,_.__data)}}function O(_,N,S){typeof _=="number"||typeof _=="boolean"?N[S]=_:_.isMatrix3?(N[S]=_.elements[0],N[S+1]=_.elements[1],N[S+2]=_.elements[2],N[S+3]=0,N[S+4]=_.elements[3],N[S+5]=_.elements[4],N[S+6]=_.elements[5],N[S+7]=0,N[S+8]=_.elements[6],N[S+9]=_.elements[7],N[S+10]=_.elements[8],N[S+11]=0):ArrayBuffer.isView(_)?N.set(_.subarray(0,N.length-S),S):_.toArray(N,S)}function v(_,N,S,b){const x=_.value,n=N+"_"+S;if(Array.isArray(x)){b[n]===void 0&&(b[n]=[]);const p=b[n];let K=!1;for(let U=0;U<x.length;U++)T(x[U],p,U)===!0&&(K=!0);return K}return T(x,b,n)}function T(_,N,S){if(N[S]===void 0)return typeof _=="number"||typeof _=="boolean"?N[S]=_:ArrayBuffer.isView(_)?N[S]=_.slice():N[S]=_.clone(),!0;{const b=N[S];if(typeof _=="number"||typeof _=="boolean"){if(b!==_)return N[S]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(b.equals(_)===!1)return b.copy(_),!0}}return!1}function D(_){const N=_.uniforms;let S=0;const b=16;for(let n=0,p=N.length;n<p;n++){const K=Array.isArray(N[n])?N[n]:[N[n]];for(let U=0,F=K.length;U<F;U++){const z=K[U],k=Array.isArray(z.value)?z.value:[z.value],R=Array.isArray(N[n])||Array.isArray(z.value);let Q=S;for(let H=0,ae=k.length;H<ae;H++){const X=k[H],Z=B(X,R),re=S%b,Pe=re%Z.boundary,Ue=re+Pe;S+=Pe,Ue!==0&&b-Ue<Z.storage&&(S+=b-Ue),H===0&&(Q=S),S+=Z.storage}const Y=z.type==="int"?Int32Array:z.type==="uint"?Uint32Array:Float32Array;z.__data=new Y((S-Q)/Float32Array.BYTES_PER_ELEMENT),z.__offset=Q}}const x=S%b;return x>0&&(S+=b-x),_.__size=S,_.__cache={},this}function B(_,N){const S={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(S.boundary=4,S.storage=4):_.isVector2?(S.boundary=8,S.storage=8):_.isVector3||_.isColor?(S.boundary=16,S.storage=12):_.isVector4?(S.boundary=16,S.storage=16):_.isMatrix3?(S.boundary=16,S.storage=48):_.isMatrix4?(S.boundary=16,S.storage=64):_.isTexture?Ge("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(_)?(S.boundary=16,S.storage=_.byteLength):Ge("WebGLRenderer: Unsupported uniform value type.",_),N===!0&&(S.boundary=16,S.storage=Math.ceil(S.storage/16)*16),S}function d(_){const N=_.target;N.removeEventListener("dispose",d),e.deleteBuffer(c[N.id]),delete c[N.id],delete l[N.id]}function s(){for(const _ in c)e.deleteBuffer(c[_]);c={},l={}}return{bind:f,update:g,dispose:s}}const cu=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Ut=null;function du(){return Ut===null&&(Ut=new Rn(cu,16,16,Zt,Pt),Ut.name="DFG_LUT",Ut.minFilter=xt,Ut.magFilter=xt,Ut.wrapS=xa,Ut.wrapT=xa,Ut.generateMipmaps=!1,Ut.needsUpdate=!0),Ut}class uu{constructor(a={}){const{canvas:t=An(),context:r=null,depth:c=!0,stencil:l=!1,alpha:f=!1,antialias:g=!1,premultipliedAlpha:y=!0,preserveDrawingBuffer:L=!1,powerPreference:V="default",failIfMajorPerformanceCaveat:O=!1,reversedDepthBuffer:v=!1,outputBufferType:T=At}=a;this.isWebGLRenderer=!0;let D;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");D=r.getContextAttributes().alpha}else D=f;const B=T,d=new Set([_r,gr,hr]),s=new Set([At,Vt,da,jt,pr,mr]),_=new Uint32Array(4),N=new Int32Array(4),S={textures:[],min:[],max:[],resolution:[]};let b=null,x=null;const n=[],p=[];let K=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Dt,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const U=this;let F=!1,z=null,k=null,R=null,Q=null;this._outputColorSpace=Cn;let Y=0,H=0,ae=null,X=-1,Z=null;const re=new mt,Pe=new mt;let Ue=null;const W=new qe(0);let fe=0,Se=t.width,Ce=t.height,ge=1,xe=null,Qe=null;const De=new mt(0,0,Se,Ce),ye=new mt(0,0,Se,Ce);let at=!1;const lt=new sr,vt=new Ln;let rt=!1,ht=!1;const Je=new Kt,Lt=new He,st=new mt,St={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Et=!1;function Mt(){return ae===null?ge:1}let E=r;function Tt(o,h){return t.getContext(o,h)}let Ye,je,ie,it,Re,be,u,i,P,$,G,ce,ne,M,q,pe,m,I,j,ee,oe,te,Me;try{const o={alpha:!0,depth:c,stencil:l,antialias:g,premultipliedAlpha:y,preserveDrawingBuffer:L,powerPreference:V,failIfMajorPerformanceCaveat:O};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${bn}`),t.addEventListener("webglcontextlost",Ae,!1),t.addEventListener("webglcontextrestored",Ie,!1),t.addEventListener("webglcontextcreationerror",me,!1),E===null){const h="webgl2";if(E=Tt(h,o),E===null)throw Tt(h)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}se()}catch(o){throw t.removeEventListener("webglcontextlost",Ae,!1),t.removeEventListener("webglcontextrestored",Ie,!1),t.removeEventListener("webglcontextcreationerror",me,!1),Ke("WebGLRenderer: "+o.message),o}function se(){Ye=new hc(E),Ye.init(),oe=new oo(E,Ye),je=new ic(E,Ye,a,oe),ie=new eu(E,Ye),je.reversedDepthBuffer&&v&&ie.buffers.depth.setReversed(!0),k=E.createFramebuffer(),R=E.createFramebuffer(),Q=E.createFramebuffer(),it=new vc(E),Re=new Hd,be=new tu(E,Ye,ie,Re,je,oe,it),u=new mc(U),i=new Eo(E),te=new ac(E,i),P=new gc(E,i,it,te),$=new Ec(E,P,i,te,it),I=new Sc(E,je,be),q=new nc(Re),G=new Gd(U,u,Ye,je,te,q),ce=new su(U,Re),ne=new Wd,M=new Yd(Ye),m=new tc(U,u,ie,$,D,y),pe=new Jd(U,$,je),Me=new lu(E,it,je,ie),j=new rc(E,Ye,it),ee=new _c(E,Ye,it),it.programs=G.programs,U.capabilities=je,U.extensions=Ye,U.properties=Re,U.renderLists=ne,U.shadowMap=pe,U.state=ie,U.info=it}B!==At&&(K=new Tc(B,t.width,t.height,g,c,l));const ve=new nu(U,E);this.xr=ve,this.getContext=function(){return E},this.getContextAttributes=function(){return E.getContextAttributes()},this.forceContextLoss=function(){const o=Ye.get("WEBGL_lose_context");o&&o.loseContext()},this.forceContextRestore=function(){const o=Ye.get("WEBGL_lose_context");o&&o.restoreContext()},this.getPixelRatio=function(){return ge},this.setPixelRatio=function(o){o!==void 0&&(ge=o,this.setSize(Se,Ce,!1))},this.getSize=function(o){return o.set(Se,Ce)},this.setSize=function(o,h,w=!0){if(ve.isPresenting){Ge("WebGLRenderer: Can't change size while VR device is presenting.");return}Se=o,Ce=h,t.width=Math.floor(o*ge),t.height=Math.floor(h*ge),w===!0&&(t.style.width=o+"px",t.style.height=h+"px"),K!==null&&K.setSize(t.width,t.height),this.setViewport(0,0,o,h)},this.getDrawingBufferSize=function(o){return o.set(Se*ge,Ce*ge).floor()},this.setDrawingBufferSize=function(o,h,w){Se=o,Ce=h,ge=w,t.width=Math.floor(o*w),t.height=Math.floor(h*w),this.setViewport(0,0,o,h)},this.setEffects=function(o){if(B===At){Ke("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(o){for(let h=0;h<o.length;h++)if(o[h].isOutputPass===!0){Ge("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}K.setEffects(o||[])},this.getCurrentViewport=function(o){return o.copy(re)},this.getViewport=function(o){return o.copy(De)},this.setViewport=function(o,h,w,C){o.isVector4?De.set(o.x,o.y,o.z,o.w):De.set(o,h,w,C),ie.viewport(re.copy(De).multiplyScalar(Mt()).round())},this.getScissor=function(o){return o.copy(ye)},this.setScissor=function(o,h,w,C){o.isVector4?ye.set(o.x,o.y,o.z,o.w):ye.set(o,h,w,C),ie.scissor(Pe.copy(ye).multiplyScalar(Mt()).round())},this.getScissorTest=function(){return at},this.setScissorTest=function(o){ie.setScissorTest(at=o)},this.setOpaqueSort=function(o){xe=o},this.setTransparentSort=function(o){Qe=o},this.getClearColor=function(o){return o.copy(m.getClearColor())},this.setClearColor=function(){m.setClearColor(...arguments)},this.getClearAlpha=function(){return m.getClearAlpha()},this.setClearAlpha=function(){m.setClearAlpha(...arguments)},this.clear=function(o=!0,h=!0,w=!0){let C=0;if(o){let A=!1;if(ae!==null){const J=ae.texture.format;A=d.has(J)}if(A){const J=ae.texture.type,de=s.has(J),le=m.getClearColor(),he=m.getClearAlpha(),Te=le.r,Ne=le.g,Fe=le.b;de?(_[0]=Te,_[1]=Ne,_[2]=Fe,_[3]=he,E.clearBufferuiv(E.COLOR,0,_)):(N[0]=Te,N[1]=Ne,N[2]=Fe,N[3]=he,E.clearBufferiv(E.COLOR,0,N))}else C|=E.COLOR_BUFFER_BIT}h&&(C|=E.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),w&&(C|=E.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),C!==0&&E.clear(C)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(o){o.setRenderer(this),z=o},this.dispose=function(){t.removeEventListener("webglcontextlost",Ae,!1),t.removeEventListener("webglcontextrestored",Ie,!1),t.removeEventListener("webglcontextcreationerror",me,!1),m.dispose(),ne.dispose(),M.dispose(),be.dispose(),Re.dispose(),u.dispose(),$.dispose(),P.dispose(),te.dispose(),Me.dispose(),G.dispose(),ve.dispose(),ve.removeEventListener("sessionstart",ti),ve.removeEventListener("sessionend",ai),Wt.stop()};function Ae(o){o.preventDefault(),jr("WebGLRenderer: Context Lost."),F=!0}function Ie(){jr("WebGLRenderer: Context Restored."),F=!1;const o=it.autoReset,h=pe.enabled,w=pe.autoUpdate,C=pe.needsUpdate,A=pe.type;se(),it.autoReset=o,pe.enabled=h,pe.autoUpdate=w,pe.needsUpdate=C,pe.type=A}function me(o){Ke("WebGLRenderer: A WebGL context could not be created. Reason: ",o.statusMessage)}function ke(o){const h=o.target;h.removeEventListener("dispose",ke),Ze(h)}function Ze(o){lo(o),Re.remove(o)}function lo(o){const h=Re.get(o).programs;h!==void 0&&(h.forEach(function(w){G.releaseProgram(w)}),o.isShaderMaterial&&G.releaseShaderCache(o))}this.renderBufferDirect=function(o,h,w,C,A,J){h===null&&(h=St);const de=A.isMesh&&A.matrixWorld.determinantAffine()<0,le=fo(o,h,w,C,A);ie.setMaterial(C,de);let he=w.index,Te=1;if(C.wireframe===!0){if(he=P.getWireframeAttribute(w),he===void 0)return;Te=2}const Ne=w.drawRange,Fe=w.attributes.position;let _e=Ne.start*Te,Be=(Ne.start+Ne.count)*Te;J!==null&&(_e=Math.max(_e,J.start*Te),Be=Math.min(Be,(J.start+J.count)*Te)),he!==null?(_e=Math.max(_e,0),Be=Math.min(Be,he.count)):Fe!=null&&(_e=Math.max(_e,0),Be=Math.min(Be,Fe.count));const tt=Be-_e;if(tt<0||tt===1/0)return;te.setup(A,C,le,w,he);let Ve,ze=j;if(he!==null&&(Ve=i.get(he),ze=ee,ze.setIndex(Ve)),A.isMesh)C.wireframe===!0?(ie.setLineWidth(C.wireframeLinewidth*Mt()),ze.setMode(E.LINES)):ze.setMode(E.TRIANGLES);else if(A.isLine){let et=C.linewidth;et===void 0&&(et=1),ie.setLineWidth(et*Mt()),A.isLineSegments?ze.setMode(E.LINES):A.isLineLoop?ze.setMode(E.LINE_LOOP):ze.setMode(E.LINE_STRIP)}else A.isPoints?ze.setMode(E.POINTS):A.isSprite&&ze.setMode(E.TRIANGLES);if(A.isBatchedMesh)if(Ye.get("WEBGL_multi_draw"))ze.renderMultiDraw(A._multiDrawStarts,A._multiDrawCounts,A._multiDrawCount);else{const et=A._multiDrawStarts,Ee=A._multiDrawCounts,ut=A._multiDrawCount,zt=he?i.get(he).bytesPerElement:1,kt=Re.get(C).currentProgram.getUniforms();for(let dt=0;dt<ut;dt++)kt.setValue(E,"_gl_DrawID",dt),ze.render(et[dt]/zt,Ee[dt])}else if(A.isInstancedMesh)ze.renderInstances(_e,tt,A.count);else if(w.isInstancedBufferGeometry){const et=w._maxInstanceCount!==void 0?w._maxInstanceCount:1/0,Ee=Math.min(w.instanceCount,et);ze.renderInstances(_e,tt,Ee)}else ze.render(_e,tt)};function ei(o,h,w,C){z!==null&&o.isNodeMaterial&&z.setObject(C,o),rt===!0&&q.setState(o,w,!1),o.transparent===!0&&o.side===Nt&&o.forceSinglePass===!1?(o.side=_t,o.needsUpdate=!0,na(o,h,C),o.side=Qt,o.needsUpdate=!0,na(o,h,C),o.side=Nt):na(o,h,C)}this.compile=function(o,h,w=null){w===null&&(w=o),z!==null&&z.renderStart(o,h,w),x=M.get(w),x.init(h),p.push(x),w.traverseVisible(function(A){A.isLight&&A.layers.test(h.layers)&&(x.pushLight(A),A.castShadow&&x.pushShadow(A))}),o!==w&&o.traverseVisible(function(A){A.isLight&&A.layers.test(h.layers)&&(x.pushLight(A),A.castShadow&&x.pushShadow(A))}),x.setupLights(),z!==null&&z.updateLights(x.state.lightsArray),ht=this.localClippingEnabled,rt=q.init(this.clippingPlanes,ht),rt===!0&&q.setGlobalState(this.clippingPlanes,h),z!==null&&pe.render(x.state.shadowsArray,w,h);const C=new Set;return o.traverse(function(A){if(!(A.isMesh||A.isPoints||A.isLine||A.isSprite))return;const J=A.material;if(J)if(Array.isArray(J))for(let de=0;de<J.length;de++){const le=J[de];ei(le,w,h,A),C.add(le)}else ei(J,w,h,A),C.add(J)}),x=p.pop(),z!==null&&z.renderEnd(),C},this.compileAsync=function(o,h,w=null){const C=this.compile(o,h,w);return new Promise(A=>{function J(){if(C.forEach(function(de){const le=Re.get(de).currentProgram;(le===void 0||le.isReady())&&C.delete(de)}),C.size===0){A(o);return}setTimeout(J,10)}Ye.get("KHR_parallel_shader_compile")!==null?J():setTimeout(J,10)})};let Oa=null;function co(o){Oa&&Oa(o)}function ti(){Wt.stop()}function ai(){Wt.start()}const Wt=new Pn;Wt.setAnimationLoop(co),typeof self<"u"&&Wt.setContext(self),this.setAnimationLoop=function(o){Oa=o,ve.setAnimationLoop(o),o===null?Wt.stop():Wt.start()},ve.addEventListener("sessionstart",ti),ve.addEventListener("sessionend",ai),this.render=function(o,h){if(h!==void 0&&h.isCamera!==!0){Ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(F===!0)return;z!==null&&z.renderStart(o,h);const w=ve.enabled===!0&&ve.isPresenting===!0,C=K!==null&&(ae===null||w)&&K.begin(U,ae);if(o.matrixWorldAutoUpdate===!0&&o.updateMatrixWorld(),h.parent===null&&h.matrixWorldAutoUpdate===!0&&h.updateMatrixWorld(),ve.enabled===!0&&ve.isPresenting===!0&&(K===null||K.isCompositing()===!1)&&(ve.cameraAutoUpdate===!0&&ve.updateCamera(h),h=ve.getCamera()),o.isScene===!0&&o.onBeforeRender(U,o,h,ae),x=M.get(o,p.length),x.init(h),x.state.textureUnits=be.getTextureUnits(),p.push(x),Je.multiplyMatrices(h.projectionMatrix,h.matrixWorldInverse),h.isArrayCamera?vt.setFromArrayCamera(h):lt.setFromProjectionMatrix(Je,Zr,h.reversedDepth),ht=this.localClippingEnabled,rt=q.init(this.clippingPlanes,ht),b=ne.get(o,n.length),b.init(),n.push(b),this.info.render.frame++,ve.enabled===!0&&ve.isPresenting===!0){const J=U.xr.getDepthSensingMesh();J!==null&&Ba(J,h,-1/0,U.sortObjects)}Ba(o,h,0,U.sortObjects),b.finish(),z!==null&&z.updateLights(x.state.lightsArray),U.sortObjects===!0&&b.sort(xe,Qe),Et=ve.enabled===!1||ve.isPresenting===!1||ve.hasDepthSensing()===!1,Et&&m.addToRenderList(b,o),this.info.autoReset===!0&&this.info.reset(),rt===!0&&q.beginShadows();const A=x.state.shadowsArray;if(pe.render(A,o,h),rt===!0&&q.endShadows(),(C&&K.hasRenderPass())===!1){const J=b.opaque,de=b.transmissive;if(x.setupLights(),h.isArrayCamera){const le=h.cameras;if(de.length>0)for(let he=0,Te=le.length;he<Te;he++){const Ne=le[he];ii(J,de,o,Ne)}Et&&m.render(o);for(let he=0,Te=le.length;he<Te;he++){const Ne=le[he];ri(b,o,Ne,Ne.viewport)}}else de.length>0&&ii(J,de,o,h),Et&&m.render(o),ri(b,o,h)}ae!==null&&H===0&&(be.updateMultisampleRenderTarget(ae),be.updateRenderTargetMipmap(ae)),C&&K.end(U),o.isScene===!0&&o.onAfterRender(U,o,h),te.resetDefaultState(),X=-1,Z=null,p.pop(),p.length>0?(x=p[p.length-1],be.setTextureUnits(x.state.textureUnits),rt===!0&&q.setGlobalState(U.clippingPlanes,x.state.camera)):x=null,n.pop(),n.length>0?b=n[n.length-1]:b=null,z!==null&&z.renderEnd()};function Ba(o,h,w,C){if(o.visible===!1)return;if(o.layers.test(h.layers)){if(o.isGroup)w=o.renderOrder;else if(o.isLOD)o.autoUpdate===!0&&o.update(h);else if(o.isLight)x.pushLight(o),o.castShadow&&x.pushShadow(o);else if(o.isSprite){const J=h.isArrayCamera?vt:lt;if(!o.frustumCulled||o.intersectsFrustum(J)){C&&st.setFromMatrixPosition(o.matrixWorld).applyMatrix4(Je);const de=$.update(o),le=o.material;le.visible&&b.push(o,de,le,w,st.z,null,h)}}else if(o.isMesh||o.isLine||o.isPoints){const J=h.isArrayCamera?vt:lt;if(!o.frustumCulled||o.intersectsFrustum(J)){const de=$.update(o),le=o.material;if(C&&(o.boundingSphere!==void 0?(o.boundingSphere===null&&o.computeBoundingSphere(),st.copy(o.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),st.copy(de.boundingSphere.center)),st.applyMatrix4(o.matrixWorld).applyMatrix4(Je)),Array.isArray(le)){const he=de.groups;for(let Te=0,Ne=he.length;Te<Ne;Te++){const Fe=he[Te],_e=le[Fe.materialIndex];_e&&_e.visible&&b.push(o,de,_e,w,st.z,Fe,h)}}else le.visible&&b.push(o,de,le,w,st.z,null,h)}}}const A=o.children;for(let J=0,de=A.length;J<de;J++)Ba(A[J],h,w,C)}function ri(o,h,w,C){const{opaque:A,transmissive:J,transparent:de}=o;x.setupLightsView(w),rt===!0&&q.setGlobalState(U.clippingPlanes,w),C&&ie.viewport(re.copy(C)),A.length>0&&ha(A,h,w),J.length>0&&ha(J,h,w),de.length>0&&ha(de,h,w),ie.buffers.depth.setTest(!0),ie.buffers.depth.setMask(!0),ie.buffers.color.setMask(!0),ie.setPolygonOffset(!1)}function ii(o,h,w,C){if((w.isScene===!0?w.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[C.id]===void 0){const Fe=Ye.has("EXT_color_buffer_half_float")||Ye.has("EXT_color_buffer_float");x.state.transmissionRenderTarget[C.id]=new Ct(1,1,{generateMipmaps:!0,type:Fe?Pt:At,minFilter:Bt,samples:Math.max(4,je.samples),stencilBuffer:l,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:$e.workingColorSpace})}const A=x.state.transmissionRenderTarget[C.id],J=C.viewport||re;A.setSize(J.z*U.transmissionResolutionScale,J.w*U.transmissionResolutionScale);const de=U.getRenderTarget(),le=U.getActiveCubeFace(),he=U.getActiveMipmapLevel();U.setRenderTarget(A),U.getClearColor(W),fe=U.getClearAlpha(),fe<1&&U.setClearColor(16777215,.5),U.clear(),Et&&m.render(w);const Te=U.toneMapping;U.toneMapping=Dt;const Ne=C.viewport;if(C.viewport!==void 0&&(C.viewport=void 0),x.setupLightsView(C),rt===!0&&q.setGlobalState(U.clippingPlanes,C),ha(o,w,C),be.updateMultisampleRenderTarget(A),be.updateRenderTargetMipmap(A),Ye.has("WEBGL_multisampled_render_to_texture")===!1){let Fe=!1;for(let _e=0,Be=h.length;_e<Be;_e++){const tt=h[_e],{object:Ve,geometry:ze,material:et,group:Ee}=tt;if(et.side===Nt&&Ve.layers.test(C.layers)){const ut=et.side;et.side=_t,et.needsUpdate=!0,ni(Ve,w,C,ze,et,Ee),et.side=ut,et.needsUpdate=!0,Fe=!0}}Fe===!0&&(be.updateMultisampleRenderTarget(A),be.updateRenderTargetMipmap(A))}U.setRenderTarget(de,le,he),U.setClearColor(W,fe),Ne!==void 0&&(C.viewport=Ne),U.toneMapping=Te}function ha(o,h,w){const C=h.isScene===!0?h.overrideMaterial:null;for(let A=0,J=o.length;A<J;A++){const de=o[A],{object:le,geometry:he,group:Te}=de;let Ne=de.material;Ne.allowOverride===!0&&C!==null&&(Ne=C),le.layers.test(w.layers)&&ni(le,h,w,he,Ne,Te)}}function ni(o,h,w,C,A,J){z!==null&&A.isNodeMaterial&&z.setObject(o,A),o.onBeforeRender(U,h,w,C,A,J),o.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,o.matrixWorld),o.normalMatrix.getNormalMatrix(o.modelViewMatrix),A.onBeforeRender(U,h,w,C,o,J),A.transparent===!0&&A.side===Nt&&A.forceSinglePass===!1?(A.side=_t,A.needsUpdate=!0,U.renderBufferDirect(w,h,C,A,o,J),A.side=Qt,A.needsUpdate=!0,U.renderBufferDirect(w,h,C,A,o,J),A.side=Nt):U.renderBufferDirect(w,h,C,A,o,J),o.onAfterRender(U,h,w,C,A,J)}function oi(o){let h=0;for(const w of o)w.texture!==null&&h++;return h}function na(o,h,w){h.isScene!==!0&&(h=St);const C=Re.get(o),A=x.state.lights,J=x.state.shadowsArray,de=A.state.version,le=G.getParameters(o,A.state,J,h,w,x.state.lightProbeGridArray),he=G.getProgramCacheKey(le);let Te=C.programs;C.environment=o.isMeshStandardMaterial||o.isMeshLambertMaterial||o.isMeshPhongMaterial?h.environment:null,C.fog=h.fog;const Ne=o.isMeshStandardMaterial||o.isMeshLambertMaterial&&!o.envMap||o.isMeshPhongMaterial&&!o.envMap;C.envMap=u.get(o.envMap||C.environment,Ne),C.envMapRotation=C.environment!==null&&o.envMap===null?h.environmentRotation:o.envMapRotation,Te===void 0&&(o.addEventListener("dispose",ke),Te=new Map,C.programs=Te,C.programVariants=new Map);let Fe=Te.get(he);if(Fe!==void 0){if(C.currentProgram===Fe&&C.lightsStateVersion===de)return li(o,le),Fe}else le.uniforms=G.getUniforms(o),z!==null&&o.isNodeMaterial&&z.build(o,w,le),o.onBeforeCompile(le,U),Fe=G.acquireProgram(le,he),Te.set(he,Fe),C.uniforms=le.uniforms;const _e=C.uniforms;return(!o.isShaderMaterial&&!o.isRawShaderMaterial||o.clipping===!0)&&(_e.clippingPlanes=q.uniform),li(o,le),C.needsLights=mo(o),C.lightsStateVersion=de,C.needsLights&&(_e.ambientLightColor.value=A.state.ambient,_e.lightProbe.value=A.state.probe,_e.sunLights.value=A.state.sun,_e.sunLightShadows.value=A.state.sunShadow,_e.directionalLights.value=A.state.directional,_e.directionalLightShadows.value=A.state.directionalShadow,_e.spotLights.value=A.state.spot,_e.spotLightShadows.value=A.state.spotShadow,_e.rectAreaLights.value=A.state.rectArea,_e.ltc_1.value=A.state.rectAreaLTC1,_e.ltc_2.value=A.state.rectAreaLTC2,_e.pointLights.value=A.state.point,_e.pointLightShadows.value=A.state.pointShadow,_e.hemisphereLights.value=A.state.hemi,_e.sunShadowMatrix.value=A.state.sunShadowMatrix,_e.sunShadowCascade.value=A.state.sunShadowCascade,_e.directionalShadowMatrix.value=A.state.directionalShadowMatrix,_e.spotLightMatrix.value=A.state.spotLightMatrix,_e.spotLightMap.value=A.state.spotLightMap,_e.pointShadowMatrix.value=A.state.pointShadowMatrix),C.numLightProbeGrids=oi(x.state.lightProbeGridArray),C.currentProgram=Fe,C.uniformsList=null,Fe}function uo(o,h,w,C,A){const J=Re.get(o),de=J.currentProgram.id+","+C+","+A;let le=J.programVariants.get(de);return le===void 0?(le=na(o,h,w),J.programVariants.set(de,le)):(J.currentProgram=le,J.uniformsList=null,J.outputColorSpace=C,J.toneMapping=A),le}function si(o){if(o.uniformsList===null){const h=o.currentProgram.getUniforms();o.uniformsList=ya.seqWithValue(h.seq,o.uniforms)}return o.uniformsList}function li(o,h){const w=Re.get(o);w.outputColorSpace=h.outputColorSpace,w.batching=h.batching,w.batchingColor=h.batchingColor,w.instancing=h.instancing,w.instancingColor=h.instancingColor,w.instancingMorph=h.instancingMorph,w.skinning=h.skinning,w.morphTargets=h.morphTargets,w.morphNormals=h.morphNormals,w.morphColors=h.morphColors,w.morphTargetsCount=h.morphTargetsCount,w.numClippingPlanes=h.numClippingPlanes,w.numIntersection=h.numClipIntersection,w.vertexAlphas=h.vertexAlphas,w.vertexTangents=h.vertexTangents,w.toneMapping=h.toneMapping}function fo(o,h,w,C,A){h.isScene!==!0&&(h=St),be.resetTextureUnits();const J=h.fog,de=C.isMeshStandardMaterial||C.isMeshLambertMaterial||C.isMeshPhongMaterial?h.environment:null,le=ae===null?U.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:$e.workingColorSpace,he=C.isMeshStandardMaterial||C.isMeshLambertMaterial&&!C.envMap||C.isMeshPhongMaterial&&!C.envMap,Te=u.get(C.envMap||de,he),Ne=C.vertexColors===!0&&!!w.attributes.color&&w.attributes.color.itemSize===4,Fe=!!w.attributes.tangent&&(!!C.normalMap||C.anisotropy>0),_e=!!w.morphAttributes.position,Be=!!w.morphAttributes.normal,tt=!!w.morphAttributes.color;let Ve=Dt;C.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(Ve=U.toneMapping);const ze=w.morphAttributes.position||w.morphAttributes.normal||w.morphAttributes.color,et=ze!==void 0?ze.length:0,Ee=Re.get(C),ut=x.state.lights;if(rt===!0&&(ht===!0||o!==Z)){const Xe=o===Z&&C.id===X;q.setState(C,o,Xe)}let zt=!1,kt=!1;C.version===Ee.__version?Ee.needsLights&&Ee.lightsStateVersion!==ut.state.version||A.isBatchedMesh&&Ee.batching===!1||!A.isBatchedMesh&&Ee.batching===!0||A.isBatchedMesh&&Ee.batchingColor===!0&&A._colorsTexture===null||A.isBatchedMesh&&Ee.batchingColor===!1&&A._colorsTexture!==null||A.isInstancedMesh&&Ee.instancing===!1||!A.isInstancedMesh&&Ee.instancing===!0||A.isSkinnedMesh&&Ee.skinning===!1||!A.isSkinnedMesh&&Ee.skinning===!0||A.isInstancedMesh&&Ee.instancingColor===!0&&A.instanceColor===null||A.isInstancedMesh&&Ee.instancingColor===!1&&A.instanceColor!==null||A.isInstancedMesh&&Ee.instancingMorph===!0&&A.morphTexture===null||A.isInstancedMesh&&Ee.instancingMorph===!1&&A.morphTexture!==null||Ee.envMap!==Te||C.fog===!0&&Ee.fog!==J||Ee.numClippingPlanes!==void 0&&(Ee.numClippingPlanes!==q.numPlanes||Ee.numIntersection!==q.numIntersection)||Ee.vertexAlphas!==Ne||Ee.vertexTangents!==Fe||Ee.morphTargets!==_e||Ee.morphNormals!==Be||Ee.morphColors!==tt||Ee.morphTargetsCount!==et||Ee.numLightProbeGrids!==oi(x.state.lightProbeGridArray)?zt=!0:(Ee.outputColorSpace!==le||Ee.toneMapping!==Ve)&&(kt=!0):(zt=!0,Ee.__version=C.version);let dt=Ee.currentProgram;(zt===!0||kt===!0)&&(dt=kt===!0?uo(C,h,A,le,Ve):na(C,h,A),z&&C.isNodeMaterial&&z.onUpdateProgram(C,dt,Ee));let ga=!1,Ft=!1,Xt=!1;const Oe=dt.getUniforms(),ct=Ee.uniforms;if(ie.useProgram(dt.program)&&(ga=!0,Ft=!0,Xt=!0),C.id!==X&&(X=C.id,Ft=!0),ga||Z!==o){ie.buffers.depth.getReversed()&&o.reversedDepth!==!0&&(o._reversedDepth=!0,o.updateProjectionMatrix()),Oe.setValue(E,"projectionMatrix",o.projectionMatrix),Oe.setValue(E,"viewMatrix",o.matrixWorldInverse);const Xe=Oe.map.cameraPosition;Xe!==void 0&&Xe.setValue(E,Lt.setFromMatrixPosition(o.matrixWorld)),je.logarithmicDepthBuffer&&Oe.setValue(E,"logDepthBufFC",2/(Math.log(o.far+1)/Math.LN2)),(C.isMeshPhongMaterial||C.isMeshToonMaterial||C.isMeshLambertMaterial||C.isMeshBasicMaterial||C.isMeshStandardMaterial||C.isShaderMaterial)&&Oe.setValue(E,"isOrthographic",o.isOrthographicCamera===!0),Z!==o&&(Z=o,Ft=!0,Xt=!0)}if(Ee.needsLights&&(ut.state.sunShadowMap.length>0&&Oe.setValue(E,"sunShadowMap",ut.state.sunShadowMap,be),ut.state.directionalShadowMap.length>0&&Oe.setValue(E,"directionalShadowMap",ut.state.directionalShadowMap,be),ut.state.spotShadowMap.length>0&&Oe.setValue(E,"spotShadowMap",ut.state.spotShadowMap,be),ut.state.pointShadowMap.length>0&&Oe.setValue(E,"pointShadowMap",ut.state.pointShadowMap,be)),A.isSkinnedMesh){Oe.setOptional(E,A,"bindMatrix"),Oe.setOptional(E,A,"bindMatrixInverse");const Xe=A.skeleton;Xe&&(Xe.boneTexture===null&&Xe.computeBoneTexture(),Oe.setValue(E,"boneTexture",Xe.boneTexture,be))}A.isBatchedMesh&&(Oe.setOptional(E,A,"batchingTexture"),Oe.setValue(E,"batchingTexture",A._matricesTexture,be),Oe.setOptional(E,A,"batchingIdTexture"),Oe.setValue(E,"batchingIdTexture",A._indirectTexture,be),Oe.setOptional(E,A,"batchingColorTexture"),A._colorsTexture!==null&&Oe.setValue(E,"batchingColorTexture",A._colorsTexture,be));const Rt=w.morphAttributes;if((Rt.position!==void 0||Rt.normal!==void 0||Rt.color!==void 0)&&I.update(A,w,dt),(Ft||Ee.receiveShadow!==A.receiveShadow)&&(Ee.receiveShadow=A.receiveShadow,Oe.setValue(E,"receiveShadow",A.receiveShadow)),(C.isMeshStandardMaterial||C.isMeshLambertMaterial||C.isMeshPhongMaterial)&&C.envMap===null&&h.environment!==null&&(ct.envMapIntensity.value=h.environmentIntensity),ct.dfgLUT!==void 0&&(ct.dfgLUT.value=du()),Ft){if(Oe.setValue(E,"toneMappingExposure",U.toneMappingExposure),Ee.needsLights&&po(ct,Xt),J&&C.fog===!0&&ce.refreshFogUniforms(ct,J),ce.refreshMaterialUniforms(ct,C,ge,Ce,x.state.transmissionRenderTarget[o.id]),Ee.needsLights&&Ee.numLightProbeGrids>0){const Xe=S;let ft=0;for(const wt of x.state.lightProbeGridArray)wt.texture!==null&&(Xe.textures[ft]=wt.texture,Xe.min[ft]=wt.boundingBox.min,Xe.max[ft]=wt.boundingBox.max,Xe.resolution[ft]=wt.resolution,ft++);for(const wt in Xe)Xe[wt].length=ft;ct.probesSH.value=Xe.textures,ct.probesMin.value=Xe.min,ct.probesMax.value=Xe.max,ct.probesResolution.value=Xe.resolution}ya.upload(E,si(Ee),ct,be)}if(C.isShaderMaterial&&C.uniformsNeedUpdate===!0&&(ya.upload(E,si(Ee),ct,be),C.uniformsNeedUpdate=!1),C.isSpriteMaterial&&Oe.setValue(E,"center",A.center),Oe.setValue(E,"modelViewMatrix",A.modelViewMatrix),Oe.setValue(E,"normalMatrix",A.normalMatrix),Oe.setValue(E,"modelMatrix",A.matrixWorld),C.uniformsGroups!==void 0){const Xe=C.uniformsGroups;for(let ft=0,wt=Xe.length;ft<wt;ft++){const di=Xe[ft];Me.update(di,dt),Me.bind(di,dt)}}return dt}function po(o,h){o.ambientLightColor.needsUpdate=h,o.lightProbe.needsUpdate=h,o.sunLights.needsUpdate=h,o.sunLightShadows.needsUpdate=h,o.directionalLights.needsUpdate=h,o.directionalLightShadows.needsUpdate=h,o.pointLights.needsUpdate=h,o.pointLightShadows.needsUpdate=h,o.spotLights.needsUpdate=h,o.spotLightShadows.needsUpdate=h,o.rectAreaLights.needsUpdate=h,o.hemisphereLights.needsUpdate=h}function mo(o){return o.isMeshLambertMaterial||o.isMeshToonMaterial||o.isMeshPhongMaterial||o.isMeshStandardMaterial||o.isShadowMaterial||o.isShaderMaterial&&o.lights===!0}this.getActiveCubeFace=function(){return Y},this.getActiveMipmapLevel=function(){return H},this.getRenderTarget=function(){return ae},this.setRenderTargetTextures=function(o,h,w){const C=Re.get(o);C.__autoAllocateDepthBuffer=o.resolveDepthBuffer===!1,C.__autoAllocateDepthBuffer===!1&&(C.__useRenderToTexture=!1),Re.get(o.texture).__webglTexture=h,Re.get(o.depthTexture).__webglTexture=C.__autoAllocateDepthBuffer?void 0:w,C.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(o,h){const w=Re.get(o);w.__webglFramebuffer=h,w.__useDefaultFramebuffer=h===void 0},this.setRenderTarget=function(o,h=0,w=0){ae=o,Y=h,H=w;let C=null,A=!1,J=!1;if(o){const de=Re.get(o);if(de.__useDefaultFramebuffer!==void 0){ie.bindFramebuffer(E.FRAMEBUFFER,de.__webglFramebuffer),re.copy(o.viewport),Pe.copy(o.scissor),Ue=o.scissorTest,ie.viewport(re),ie.scissor(Pe),ie.setScissorTest(Ue),X=-1;return}else if(de.__webglFramebuffer===void 0)be.setupRenderTarget(o);else if(de.__hasExternalTextures)be.rebindTextures(o,Re.get(o.texture).__webglTexture,Re.get(o.depthTexture).__webglTexture);else if(o.depthBuffer){const Te=o.depthTexture;if(de.__boundDepthTexture!==Te){if(Te!==null&&Re.has(Te)&&(o.width!==Te.image.width||o.height!==Te.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");be.setupDepthRenderbuffer(o)}}const le=o.texture;(le.isData3DTexture||le.isDataArrayTexture||le.isCompressedArrayTexture)&&(J=!0);const he=Re.get(o).__webglFramebuffer;o.isWebGLCubeRenderTarget?(Array.isArray(he[h])?C=he[h][w]:C=he[h],A=!0):o.samples>0&&be.useMultisampledRTT(o)===!1?C=Re.get(o).__webglMultisampledFramebuffer:Array.isArray(he)?C=he[w]:C=he,re.copy(o.viewport),Pe.copy(o.scissor),Ue=o.scissorTest}else re.copy(De).multiplyScalar(ge).floor(),Pe.copy(ye).multiplyScalar(ge).floor(),Ue=at;if(w!==0&&(C=k),ie.bindFramebuffer(E.FRAMEBUFFER,C)&&ie.drawBuffers(o,C),ie.viewport(re),ie.scissor(Pe),ie.setScissorTest(Ue),A){const de=Re.get(o.texture);E.framebufferTexture2D(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_CUBE_MAP_POSITIVE_X+h,de.__webglTexture,w)}else if(J){const de=h;for(let le=0;le<o.textures.length;le++){const he=Re.get(o.textures[le]);E.framebufferTextureLayer(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0+le,he.__webglTexture,w,de)}}else if(o!==null&&w!==0){const de=Re.get(o.texture);E.framebufferTexture2D(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,de.__webglTexture,w)}X=-1};function ci(o){const h=Re.get(o);return(h.__readFormat!==o.format||h.__readType!==o.type)&&(h.__readFormat=o.format,h.__readType=o.type,h.__formatReadable=je.textureFormatReadable(o.format),h.__typeReadable=je.textureTypeReadable(o.type)),h}this.readRenderTargetPixels=function(o,h,w,C,A,J,de,le=0){if(!(o&&o.isWebGLRenderTarget)){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let he=Re.get(o).__webglFramebuffer;if(o.isWebGLCubeRenderTarget&&de!==void 0&&(he=he[de],Array.isArray(he)&&(he=he[0])),he){ie.bindFramebuffer(E.FRAMEBUFFER,he);try{const Te=o.textures[le],Ne=Te.format,Fe=Te.type;o.textures.length>1&&E.readBuffer(E.COLOR_ATTACHMENT0+le);const _e=ci(Te);if(_e.__formatReadable===!1){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(_e.__typeReadable===!1){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}h>=0&&h<=o.width-C&&w>=0&&w<=o.height-A&&E.readPixels(h,w,C,A,oe.convert(Ne),oe.convert(Fe),J)}finally{const Te=ae!==null?Re.get(ae).__webglFramebuffer:null;ie.bindFramebuffer(E.FRAMEBUFFER,Te)}}},this.readRenderTargetPixelsAsync=async function(o,h,w,C,A,J,de,le=0){if(!(o&&o.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let he=Re.get(o).__webglFramebuffer;if(o.isWebGLCubeRenderTarget&&de!==void 0&&(he=he[de],Array.isArray(he)&&(he=he[0])),he)if(h>=0&&h<=o.width-C&&w>=0&&w<=o.height-A){ie.bindFramebuffer(E.FRAMEBUFFER,he);const Te=o.textures[le],Ne=Te.format,Fe=Te.type;o.textures.length>1&&E.readBuffer(E.COLOR_ATTACHMENT0+le);const _e=ci(Te);if(_e.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(_e.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Be=E.createBuffer();E.bindBuffer(E.PIXEL_PACK_BUFFER,Be),E.bufferData(E.PIXEL_PACK_BUFFER,J.byteLength,E.STREAM_READ),E.readPixels(h,w,C,A,oe.convert(Ne),oe.convert(Fe),0),E.bindBuffer(E.PIXEL_PACK_BUFFER,null);const tt=ae!==null?Re.get(ae).__webglFramebuffer:null;ie.bindFramebuffer(E.FRAMEBUFFER,tt);const Ve=E.fenceSync(E.SYNC_GPU_COMMANDS_COMPLETE,0);return E.flush(),await So(E,Ve,4),E.bindBuffer(E.PIXEL_PACK_BUFFER,Be),E.getBufferSubData(E.PIXEL_PACK_BUFFER,0,J),E.bindBuffer(E.PIXEL_PACK_BUFFER,null),E.deleteBuffer(Be),E.deleteSync(Ve),J}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(o,h=null,w=0){const C=Math.pow(2,-w),A=Math.floor(o.image.width*C),J=Math.floor(o.image.height*C),de=h!==null?h.x:0,le=h!==null?h.y:0;be.setTexture2D(o,0),E.copyTexSubImage2D(E.TEXTURE_2D,w,0,0,de,le,A,J),ie.unbindTexture()},this.copyTextureToTexture=function(o,h,w=null,C=null,A=0,J=0){let de,le,he,Te,Ne,Fe,_e,Be,tt;const Ve=o.isCompressedTexture?o.mipmaps[J]:o.image;if(w!==null)de=w.max.x-w.min.x,le=w.max.y-w.min.y,he=w.isBox3?w.max.z-w.min.z:1,Te=w.min.x,Ne=w.min.y,Fe=w.isBox3?w.min.z:0;else{const Oe=Math.pow(2,-A);de=Math.floor(Ve.width*Oe),le=Math.floor(Ve.height*Oe),o.isDataArrayTexture?he=Ve.depth:o.isData3DTexture?he=Math.floor(Ve.depth*Oe):he=1,Te=0,Ne=0,Fe=0}C!==null?(_e=C.x,Be=C.y,tt=C.z):(_e=0,Be=0,tt=0);const ze=oe.convert(h.format),et=oe.convert(h.type);let Ee;h.isData3DTexture?(be.setTexture3D(h,0),Ee=E.TEXTURE_3D):h.isDataArrayTexture||h.isCompressedArrayTexture?(be.setTexture2DArray(h,0),Ee=E.TEXTURE_2D_ARRAY):(be.setTexture2D(h,0),Ee=E.TEXTURE_2D),ie.activeTexture(E.TEXTURE0),ie.pixelStorei(E.UNPACK_FLIP_Y_WEBGL,h.flipY),ie.pixelStorei(E.UNPACK_PREMULTIPLY_ALPHA_WEBGL,h.premultiplyAlpha),ie.pixelStorei(E.UNPACK_ALIGNMENT,h.unpackAlignment);const ut=ie.getParameter(E.UNPACK_ROW_LENGTH),zt=ie.getParameter(E.UNPACK_IMAGE_HEIGHT),kt=ie.getParameter(E.UNPACK_SKIP_PIXELS),dt=ie.getParameter(E.UNPACK_SKIP_ROWS),ga=ie.getParameter(E.UNPACK_SKIP_IMAGES);ie.pixelStorei(E.UNPACK_ROW_LENGTH,Ve.width),ie.pixelStorei(E.UNPACK_IMAGE_HEIGHT,Ve.height),ie.pixelStorei(E.UNPACK_SKIP_PIXELS,Te),ie.pixelStorei(E.UNPACK_SKIP_ROWS,Ne),ie.pixelStorei(E.UNPACK_SKIP_IMAGES,Fe);const Ft=o.isDataArrayTexture||o.isData3DTexture,Xt=h.isDataArrayTexture||h.isData3DTexture;if(o.isDepthTexture){const Oe=Re.get(o),ct=Re.get(h),Rt=Re.get(Oe.__renderTarget),Xe=Re.get(ct.__renderTarget);ie.bindFramebuffer(E.READ_FRAMEBUFFER,Rt.__webglFramebuffer),ie.bindFramebuffer(E.DRAW_FRAMEBUFFER,Xe.__webglFramebuffer);for(let ft=0;ft<he;ft++)Ft&&(E.framebufferTextureLayer(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,Re.get(o).__webglTexture,A,Fe+ft),E.framebufferTextureLayer(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,Re.get(h).__webglTexture,J,tt+ft)),E.blitFramebuffer(Te,Ne,Te+de,Ne+le,_e,Be,_e+de,Be+le,E.DEPTH_BUFFER_BIT,E.NEAREST);ie.bindFramebuffer(E.READ_FRAMEBUFFER,null),ie.bindFramebuffer(E.DRAW_FRAMEBUFFER,null)}else if(A!==0||o.isRenderTargetTexture||Re.has(o)){const Oe=Re.get(o),ct=Re.get(h);ie.bindFramebuffer(E.READ_FRAMEBUFFER,R),ie.bindFramebuffer(E.DRAW_FRAMEBUFFER,Q);for(let Rt=0;Rt<he;Rt++)Ft?E.framebufferTextureLayer(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,Oe.__webglTexture,A,Fe+Rt):E.framebufferTexture2D(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,Oe.__webglTexture,A),Xt?E.framebufferTextureLayer(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,ct.__webglTexture,J,tt+Rt):E.framebufferTexture2D(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,ct.__webglTexture,J),A!==0?E.blitFramebuffer(Te,Ne,Te+de,Ne+le,_e,Be,_e+de,Be+le,E.COLOR_BUFFER_BIT,E.NEAREST):Xt?E.copyTexSubImage3D(Ee,J,_e,Be,tt+Rt,Te,Ne,de,le):E.copyTexSubImage2D(Ee,J,_e,Be,Te,Ne,de,le);ie.bindFramebuffer(E.READ_FRAMEBUFFER,null),ie.bindFramebuffer(E.DRAW_FRAMEBUFFER,null)}else Xt?o.isDataTexture||o.isData3DTexture?E.texSubImage3D(Ee,J,_e,Be,tt,de,le,he,ze,et,Ve.data):h.isCompressedArrayTexture?E.compressedTexSubImage3D(Ee,J,_e,Be,tt,de,le,he,ze,Ve.data):E.texSubImage3D(Ee,J,_e,Be,tt,de,le,he,ze,et,Ve):o.isDataTexture?E.texSubImage2D(E.TEXTURE_2D,J,_e,Be,de,le,ze,et,Ve.data):o.isCompressedTexture?E.compressedTexSubImage2D(E.TEXTURE_2D,J,_e,Be,Ve.width,Ve.height,ze,Ve.data):E.texSubImage2D(E.TEXTURE_2D,J,_e,Be,de,le,ze,et,Ve);ie.pixelStorei(E.UNPACK_ROW_LENGTH,ut),ie.pixelStorei(E.UNPACK_IMAGE_HEIGHT,zt),ie.pixelStorei(E.UNPACK_SKIP_PIXELS,kt),ie.pixelStorei(E.UNPACK_SKIP_ROWS,dt),ie.pixelStorei(E.UNPACK_SKIP_IMAGES,ga),J===0&&h.generateMipmaps===!0&&h.mipmapsAutoUpdate===!0&&E.generateMipmap(Ee),ie.unbindTexture()},this.initRenderTarget=function(o){Re.get(o).__webglFramebuffer===void 0&&be.setupRenderTarget(o)},this.initTexture=function(o){o.isCubeTexture?be.setTextureCube(o,0):o.isData3DTexture?be.setTexture3D(o,0):o.isDataArrayTexture||o.isCompressedArrayTexture?be.setTexture2DArray(o,0):be.setTexture2D(o,0),ie.unbindTexture()},this.resetState=function(){Y=0,H=0,ae=null,ie.reset(),te.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Zr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(a){this._outputColorSpace=a;const t=this.getContext();t.drawingBufferColorSpace=$e._getDrawingBufferColorSpace(a),t.unpackColorSpace=$e._getUnpackColorSpace()}}export{Za as ACESFilmicToneMapping,ra as AddEquation,Ei as AddOperation,fr as AdditiveBlending,ja as AgXToneMapping,Sn as AlphaFormat,er as AlwaysCompare,Qi as AlwaysDepth,xn as ArrayCamera,_t as BackSide,_a as BoxGeometry,Li as BufferAttribute,Xa as BufferGeometry,_n as ByteType,$a as CineonToneMapping,xa as ClampToEdgeWrapping,qe as Color,$e as ColorManagement,wi as ConstantAlphaFactor,yi as ConstantColorFactor,va as CubeCamera,tr as CubeDepthTexture,oa as CubeReflectionMapping,Jt as CubeRefractionMapping,Wa as CubeTexture,cr as CullFaceBack,tn as CullFaceFront,en as CullFaceNone,an as CustomBlending,Ka as CustomToneMapping,vi as Data3DTexture,ka as DataArrayTexture,Rn as DataTexture,aa as DepthFormat,Gt as DepthStencilFormat,ea as DepthTexture,Nt as DoubleSide,Hi as DstAlphaFactor,Vi as DstColorFactor,un as EqualCompare,Zi as EqualDepth,Sa as EquirectangularReflectionMapping,Ea as EquirectangularRefractionMapping,Tn as EventDispatcher,Yr as ExternalTexture,qa as Float32BufferAttribute,It as FloatType,Qt as FrontSide,sr as Frustum,Ln as FrustumArray,ar as GLSL3,dn as GreaterCompare,Yi as GreaterDepth,nr as GreaterEqualCompare,ji as GreaterEqualDepth,Pt as HalfFloatType,Va as IntType,Ai as Layers,fn as LessCompare,$i as LessDepth,or as LessEqualCompare,lr as LessEqualDepth,xt as LinearFilter,Bt as LinearMipmapLinearFilter,Ra as LinearMipmapNearestFilter,za as LinearSRGBColorSpace,Ja as LinearToneMapping,rr as LinearTransfer,we as Matrix3,Kt as Matrix4,nn as MaxEquation,Ot as Mesh,Ci as MeshDepthMaterial,bi as MeshDistanceMaterial,rn as MinEquation,on as MirroredRepeatWrapping,Mi as MixOperation,dr as MultiplyBlending,Ti as MultiplyOperation,Ht as NearestFilter,ca as NearestMipmapLinearFilter,ln as NearestMipmapNearestFilter,Ya as NeutralToneMapping,pn as NeverCompare,Ji as NeverDepth,Yt as NoBlending,$t as NoColorSpace,Dt as NoToneMapping,la as NormalBlending,cn as NotEqualCompare,Ki as NotEqualDepth,Ri as ObjectSpaceNormalMap,Xi as OneFactor,Ui as OneMinusConstantAlphaFactor,Ii as OneMinusConstantColorFactor,Fi as OneMinusDstAlphaFactor,Oi as OneMinusDstColorFactor,Bi as OneMinusSrcAlphaFactor,Gi as OneMinusSrcColorFactor,_i as OrthographicCamera,sa as PCFShadowMap,Pi as PCFSoftShadowMap,ma as PMREMGenerator,Pa as PerspectiveCamera,fi as Plane,Ha as PlaneGeometry,Ar as R11_EAC_Format,Ta as RED_GREEN_RGTC2_Format,Xr as RED_RGTC1_Format,bn as REVISION,Ma as RG11_EAC_Format,yt as RGBAFormat,_r as RGBAIntegerFormat,Gr as RGBA_ASTC_10x10_Format,Fr as RGBA_ASTC_10x5_Format,Or as RGBA_ASTC_10x6_Format,Br as RGBA_ASTC_10x8_Format,Hr as RGBA_ASTC_12x10_Format,Vr as RGBA_ASTC_12x12_Format,Lr as RGBA_ASTC_4x4_Format,Pr as RGBA_ASTC_5x4_Format,Dr as RGBA_ASTC_5x5_Format,Nr as RGBA_ASTC_6x5_Format,Ur as RGBA_ASTC_6x6_Format,wr as RGBA_ASTC_8x5_Format,Ir as RGBA_ASTC_8x6_Format,yr as RGBA_ASTC_8x8_Format,Wr as RGBA_BPTC_Format,Rr as RGBA_ETC2_EAC_Format,Mr as RGBA_PVRTC_2BPPV1_Format,Er as RGBA_PVRTC_4BPPV1_Format,Ca as RGBA_S3TC_DXT1_Format,ba as RGBA_S3TC_DXT3_Format,La as RGBA_S3TC_DXT5_Format,En as RGBFormat,zr as RGB_BPTC_SIGNED_Format,kr as RGB_BPTC_UNSIGNED_Format,Tr as RGB_ETC1_Format,xr as RGB_ETC2_Format,Sr as RGB_PVRTC_2BPPV1_Format,vr as RGB_PVRTC_4BPPV1_Format,Aa as RGB_S3TC_DXT1_Format,Zt as RGFormat,gr as RGIntegerFormat,gi as RawShaderMaterial,Mn as RedFormat,hr as RedIntegerFormat,Qa as ReinhardToneMapping,sn as RepeatWrapping,Di as ReverseSubtractEquation,Cr as SIGNED_R11_EAC_Format,Kr as SIGNED_RED_GREEN_RGTC2_Format,qr as SIGNED_RED_RGTC1_Format,br as SIGNED_RG11_EAC_Format,Cn as SRGBColorSpace,We as SRGBTransfer,Le as ShaderChunk,bt as ShaderLib,qt as ShaderMaterial,vn as ShortType,zi as SrcAlphaFactor,Wi as SrcAlphaSaturateFactor,ki as SrcColorFactor,Ni as SubtractEquation,ur as SubtractiveBlending,ir as TangentSpaceNormalMap,Si as Texture,hi as Uint16BufferAttribute,mi as Uint32BufferAttribute,ue as UniformsLib,xi as UniformsUtils,At as UnsignedByteType,gn as UnsignedInt101111Type,jt as UnsignedInt248Type,hn as UnsignedInt5999Type,Vt as UnsignedIntType,pr as UnsignedShort4444Type,mr as UnsignedShort5551Type,da as UnsignedShortType,ta as VSMShadowMap,pt as Vector2,He as Vector3,mt as Vector4,Zr as WebGLCoordinateSystem,Ua as WebGLCubeRenderTarget,Ct as WebGLRenderTarget,uu as WebGLRenderer,oo as WebGLUtils,Da as WebXRController,qi as ZeroFactor,An as createCanvasElement,Ke as error,jr as log,Ge as warn,pi as warnOnce};
