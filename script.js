document.addEventListener('DOMContentLoaded', () => {

    // 1. Loader Logic
    const loader = document.querySelector('.loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 2500);
    });
    
    // 2. Theme Switcher
    const themeSwitcher = document.getElementById('theme-switcher');
    const body = document.body;

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.add(currentTheme);
        themeSwitcher.textContent = currentTheme === 'dark-mode' ? '☀️' : '🌙';
    }

    themeSwitcher.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        let theme = 'light-mode';
        if (body.classList.contains('dark-mode')) {
            theme = 'dark-mode';
            themeSwitcher.textContent = '☀️';
        } else {
            themeSwitcher.textContent = '🌙';
        }
        localStorage.setItem('theme', theme);
    });

    // 3. Navbar Smooth Scrolling & Active Link Highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 80) { // 80 is approx header height + buffer
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 4. Interactive Background with Three.js
    let camera, scene, renderer, material;
    const mouse = { x: 0, y: 0 };

    function initInteractiveBackground() {
        const container = document.getElementById('interactive-background');
        if (!container || !window.THREE) return;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2;
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        const geometry = new THREE.PlaneGeometry(6, 6, 50, 50);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(
            'https://images.unsplash.com/photo-1593435713589-1097a81414b8?w=1200',
            () => { animate() } // Start animation loop only after texture loads
        );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { type: "f", value: 1.0 },
                u_mouse: { type: "v2", value: new THREE.Vector2() },
                u_texture: { value: texture }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D u_texture;
                uniform vec2 u_mouse;
                uniform float u_time;
                varying vec2 vUv;

                void main() {
                    vec2 p = vUv;
                    float dist = distance(p, u_mouse);
                    float strength = smoothstep(0.5, 0.0, dist);
                    
                    vec2 distorted_uv = p + (normalize(p - u_mouse) * strength * 0.1);
                    
                    vec4 color = texture2D(u_texture, distorted_uv);
                    color.rgb += strength * 0.15; // glow effect
                    
                    gl_FragColor = color;
                }
            `
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onMouseMove, false);
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(event) {
        if (!material) return;
        mouse.x = (event.clientX / window.innerWidth);
        mouse.y = 1.0 - (event.clientY / window.innerHeight);
        material.uniforms.u_mouse.value.set(mouse.x, mouse.y);
    }

    function animate() {
        if (!renderer) return;
        requestAnimationFrame(animate);
        if (material) material.uniforms.u_time.value += 0.05;
        renderer.render(scene, camera);
    }

    initInteractiveBackground();

    // 5. Tabbed Features Section Logic
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            tabTriggers.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            trigger.classList.add('active');
            const targetPaneId = trigger.dataset.tab;
            document.getElementById(targetPaneId).classList.add('active');
        });
    });

    // 6. Work Showcase Slider Logic
    const slides = document.querySelectorAll('.work-slide');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function startSlideShow() {
        stopSlideShow(); // Prevent multiple intervals
        slideInterval = setInterval(nextSlide, 7000);
    }

    function stopSlideShow() {
        clearInterval(slideInterval);
    }

    if(slides.length > 0) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopSlideShow(); // Stop auto-slide on manual click
        });

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
            stopSlideShow();
        });
        
        startSlideShow(); // Start the slideshow initially
    }
    
    // 7. Stats Section Animation on Scroll
    const statsSection = document.getElementById('stats');

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate bars
                const bars = entry.target.querySelectorAll('.bar');
                bars.forEach(bar => {
                    bar.style.width = bar.dataset.width;
                });
                
                // Animate numbers
                const counters = entry.target.querySelectorAll('.stat-value');
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    if (counter.innerText === target.toLocaleString()) return; // Already animated
                    
                    gsap.to(counter, {
                        duration: 1.5,
                        innerText: target,
                        roundProps: "innerText",
                        ease: "power2.out",
                        onUpdate: function() {
                            counter.innerText = Math.ceil(Number(counter.innerText)).toLocaleString();
                        }
                    });
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});