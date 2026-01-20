/**
 * Creatix - 3D Organic Flame/Wave Effects
 * Creates flowing organic shapes like the OPTICORE reference
 */

class OrganicBlobs {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.blobs = [];
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.mouseVelocity = { x: 0, y: 0 };  // Для эффекта пинания
        this.lastMouse = { x: 0, y: 0 };
        this.time = 0;
        this.scrollY = 0;
        this.targetScrollY = 0;  // Для плавного скролла

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 6;

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('bg-canvas'),
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create organic flame-like blobs that flow down the page
        this.createMainBlob();      // Основной справа
        this.createSecondBlob();    // Вторичный слева

        this.addLights();

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('scroll', () => this.onScroll());

        this.animate();
    }

    // Vertex shader with organic deformation
    getVertexShader() {
        return `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying float vDisplacement;
            uniform float uTime;
            uniform float uIntensity;
            uniform vec2 uMouse;

            // Simplex 3D Noise
            vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
            vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

            float snoise(vec3 v){
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);

                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);

                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;

                i = mod(i, 289.0);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                float n_ = 1.0/7.0;
                vec3 ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);

                vec4 x = x_ * ns.x + ns.yyyy;
                vec4 y = y_ * ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);

                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);

                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }

            void main() {
                vUv = uv;
                vNormal = normal;

                vec3 pos = position;

                // Multi-layered organic noise for flame-like effect
                float t = uTime * 0.4;

                // Primary wave deformation
                float wave1 = snoise(pos * 0.5 + vec3(t * 0.3, t * 0.2, t * 0.1)) * 0.6;
                float wave2 = snoise(pos * 1.0 + vec3(t * 0.5, -t * 0.3, t * 0.2)) * 0.35;
                float wave3 = snoise(pos * 2.0 + vec3(-t * 0.4, t * 0.4, -t * 0.3)) * 0.2;
                float wave4 = snoise(pos * 3.5 + vec3(t * 0.6, t * 0.5, t * 0.4)) * 0.1;

                // Combine waves for organic flow
                float displacement = (wave1 + wave2 + wave3 + wave4) * uIntensity;

                // Add stretching effect for flame-like appearance
                float stretch = snoise(vec3(pos.x * 0.3, pos.y * 0.5 + t * 0.3, pos.z * 0.3));
                pos.y += stretch * 0.4 * uIntensity;

                // Apply displacement along normal
                pos += normal * displacement;

                // Subtle mouse interaction
                pos.x += uMouse.x * 0.15;
                pos.y += uMouse.y * 0.1;

                vPosition = pos;
                vDisplacement = displacement;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;
    }

    // Fragment shader with vibrant gradient
    getFragmentShader(colorScheme = 'top') {
        const colors = colorScheme === 'top' ? `
            // Vibrant purple-pink-blue gradient (like OPTICORE)
            vec3 color1 = vec3(0.25, 0.15, 0.95);  // Deep blue-purple
            vec3 color2 = vec3(0.6, 0.15, 0.95);   // Violet
            vec3 color3 = vec3(0.95, 0.25, 0.6);   // Hot pink
            vec3 color4 = vec3(1.0, 0.55, 0.75);   // Light pink/salmon
            vec3 color5 = vec3(0.4, 0.7, 1.0);     // Sky blue
        ` : `
            // Magenta-purple-pink gradient for bottom (flame-like)
            vec3 color1 = vec3(0.6, 0.1, 0.8);     // Deep magenta-purple
            vec3 color2 = vec3(0.85, 0.15, 0.55);  // Hot magenta
            vec3 color3 = vec3(1.0, 0.4, 0.7);     // Pink
            vec3 color4 = vec3(0.7, 0.2, 0.95);    // Purple
            vec3 color5 = vec3(0.35, 0.25, 0.9);   // Blue-purple
        `;

        return `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying float vDisplacement;
            uniform float uTime;

            void main() {
                ${colors}

                // Create flowing gradient based on position and time
                float t = uTime * 0.3;
                float gradientVal = vPosition.x * 0.25 + vPosition.y * 0.35 + vPosition.z * 0.15;
                gradientVal += sin(t + vPosition.x) * 0.15;
                gradientVal += vDisplacement * 0.3;
                gradientVal = fract(gradientVal * 0.5 + 0.5);

                // Smooth color interpolation
                vec3 color;
                if (gradientVal < 0.2) {
                    color = mix(color1, color2, gradientVal * 5.0);
                } else if (gradientVal < 0.4) {
                    color = mix(color2, color3, (gradientVal - 0.2) * 5.0);
                } else if (gradientVal < 0.6) {
                    color = mix(color3, color4, (gradientVal - 0.4) * 5.0);
                } else if (gradientVal < 0.8) {
                    color = mix(color4, color5, (gradientVal - 0.6) * 5.0);
                } else {
                    color = mix(color5, color1, (gradientVal - 0.8) * 5.0);
                }

                // Dynamic lighting
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);

                // Enhanced rim/fresnel lighting for glossy effect
                vec3 viewDir = normalize(cameraPosition - vPosition);
                float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 2.5);

                // Specular highlight
                vec3 halfDir = normalize(lightDir + viewDir);
                float specular = pow(max(dot(normalize(vNormal), halfDir), 0.0), 32.0);

                // Combine lighting
                color = color * (0.5 + diffuse * 0.4);
                color += vec3(1.0, 0.9, 1.0) * fresnel * 0.45;
                color += vec3(1.0) * specular * 0.25;

                // Subtle inner glow
                color += color * 0.15;

                // Boost saturation
                float gray = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(gray), color, 1.3);

                gl_FragColor = vec4(color, 0.95);
            }
        `;
    }

    createMainBlob() {
        // Основной блоб справа вверху
        const geometry = new THREE.IcosahedronGeometry(2.2, 48);

        const material = new THREE.ShaderMaterial({
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader('top'),
            uniforms: {
                uTime: { value: 0 },
                uIntensity: { value: 1.2 },
                uMouse: { value: new THREE.Vector2(0, 0) }
            },
            transparent: true,
            side: THREE.DoubleSide
        });

        const blob = new THREE.Mesh(geometry, material);
        blob.position.set(3.0, 0.8, -1.2);
        blob.rotation.set(0.5, 0.4, -0.3);
        blob.scale.set(1.0, 1.6, 0.85);

        this.scene.add(blob);
        this.blobs.push({
            mesh: blob,
            basePos: { x: 3.0, y: 0.8, z: -1.2 },
            baseRot: { x: 0.5, y: 0.4, z: -0.3 },
            speed: 1
        });
    }

    createSecondBlob() {
        // Второй блоб слева внизу - ближе к первому
        const geometry = new THREE.IcosahedronGeometry(2.5, 48);

        const material = new THREE.ShaderMaterial({
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader('bottom'),
            uniforms: {
                uTime: { value: 0 },
                uIntensity: { value: 1.3 },
                uMouse: { value: new THREE.Vector2(0, 0) }
            },
            transparent: true,
            side: THREE.DoubleSide
        });

        const blob = new THREE.Mesh(geometry, material);
        blob.position.set(-3.0, -2.5, -1.5);
        blob.rotation.set(0.2, -0.5, 0.4);
        blob.scale.set(0.95, 1.8, 0.8);

        this.scene.add(blob);
        this.blobs.push({
            mesh: blob,
            basePos: { x: -3.0, y: -2.5, z: -1.5 },
            baseRot: { x: 0.2, y: -0.5, z: 0.4 },
            speed: 0.9
        });
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0x301030, 0.3);
        this.scene.add(ambientLight);

        // Purple light
        const purpleLight = new THREE.PointLight(0x8b5cf6, 1.5, 15);
        purpleLight.position.set(5, 3, 5);
        this.scene.add(purpleLight);

        // Pink light
        const pinkLight = new THREE.PointLight(0xec4899, 1.5, 15);
        pinkLight.position.set(-5, -3, 5);
        this.scene.add(pinkLight);

        // Blue light
        const blueLight = new THREE.PointLight(0x3b82f6, 0.8, 15);
        blueLight.position.set(0, 5, 3);
        this.scene.add(blueLight);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        const newX = (event.clientX / window.innerWidth) * 2 - 1;
        const newY = -(event.clientY / window.innerHeight) * 2 + 1;

        // Расчет скорости мыши для эффекта "пинания"
        this.mouseVelocity.x = (newX - this.mouse.targetX) * 15;
        this.mouseVelocity.y = (newY - this.mouse.targetY) * 15;

        this.mouse.targetX = newX;
        this.mouse.targetY = newY;
    }

    onScroll() {
        this.targetScrollY = window.scrollY;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.time += 0.016;

        // Плавный скролл
        this.scrollY += (this.targetScrollY - this.scrollY) * 0.05;

        // Smooth mouse following (без пинания)
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.03;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.03;

        // Update blobs - эффект "перетекания как в воде"
        this.blobs.forEach((blob, index) => {
            const uniforms = blob.mesh.material.uniforms;

            uniforms.uTime.value = this.time * blob.speed;
            uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);

            // Плавная органическая анимация
            const floatX = Math.sin(this.time * 0.25 + index * 1.5) * 0.15;
            const floatY = Math.cos(this.time * 0.2 + index * 1.2) * 0.1;
            const floatZ = Math.sin(this.time * 0.15 + index) * 0.05;

            // Эффект "волны" при скролле - блобы плывут как в воде
            const wavePhase = this.scrollY * 0.003 + index * Math.PI;
            const waveX = Math.sin(wavePhase) * 0.8;  // Волна по X
            const waveY = Math.cos(wavePhase * 0.5) * 0.4;  // Волна по Y

            // Финальные позиции - блобы "перетекают" при скролле
            blob.mesh.position.x = blob.basePos.x + floatX + waveX + this.mouse.x * 0.15;
            blob.mesh.position.y = blob.basePos.y + floatY + waveY + this.mouse.y * 0.1;
            blob.mesh.position.z = blob.basePos.z + floatZ;

            // Плавное вращение
            blob.mesh.rotation.x = blob.baseRot.x + Math.sin(this.time * 0.1) * 0.08;
            blob.mesh.rotation.y = blob.baseRot.y + this.time * 0.03;
            blob.mesh.rotation.z = blob.baseRot.z + Math.cos(this.time * 0.08) * 0.04;
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new OrganicBlobs();
});
