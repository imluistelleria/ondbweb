// Random Hero Headline
const heroHeadlines = [
    "Stop blocking bots.<br>Start <em>billing</em> them.",
    "Sell your <em>private data</em><br>to AI agents",
    "Turn anti-scraping costs<br>into <em>revenue</em>",
    "80% of data is private.<br>Agents will <em>pay for it.</em>"
];

function initRandomHeadline() {
    const headline = document.getElementById('hero-headline');
    if (headline) {
        const randomIndex = Math.floor(Math.random() * heroHeadlines.length);
        headline.innerHTML = heroHeadlines[randomIndex];
    }
}

// Always dark mode
function initThemeToggle() {
    document.documentElement.setAttribute('data-theme', 'dark');
}

(function() {
    document.documentElement.setAttribute('data-theme', 'dark');
})();

// Mobile Menu Toggle
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const body = document.body;

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            body.classList.toggle('menu-open');
        });

        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });

        // Handle nav dropdown toggle on mobile
        const dropdownTriggers = document.querySelectorAll('.nav-dropdown-trigger');
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const dropdown = this.closest('.nav-dropdown');
                    dropdown.classList.toggle('active');
                }
            });
        });
    }
}

// Three.js 3D Hero Animation - Collective Intelligence Network
let scene, camera, renderer, networkGroup, nodes, connections, centralCore;
let mouseX = 0, mouseY = 0;
let time = 0;

function init3D() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup - pulled back for spacious view
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 18;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Main network group
    networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // Colors
    const primaryBlue = 0x2563eb;
    const lightBlue = 0x60a5fa;
    const paleBlue = 0xdbeafe;
    const white = 0xffffff;

    // === CENTRAL CORE - Pulsing Dodecahedron ===
    const coreGroup = new THREE.Group();

    // Inner glowing core - larger
    const coreGeometry = new THREE.DodecahedronGeometry(1.0, 0);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: primaryBlue,
        wireframe: true,
        transparent: true,
        opacity: 1.0
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    coreGroup.add(core);

    // Outer shell - larger
    const shellGeometry = new THREE.IcosahedronGeometry(1.4, 1);
    const shellMaterial = new THREE.MeshBasicMaterial({
        color: lightBlue,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    coreGroup.add(shell);

    // Single energy ring around core
    const ringGeometry = new THREE.TorusGeometry(2.0, 0.02, 8, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: lightBlue,
        transparent: true,
        opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.userData = { speed: 0.5, axis: 0 };
    coreGroup.add(ring);

    centralCore = coreGroup;
    networkGroup.add(coreGroup);

    // === DATA NODES - Fewer nodes, spread out more ===
    nodes = [];
    const nodeCount = 16;
    const orbits = [5.0, 7.5, 10.0]; // Three orbital rings, wider spread

    for (let i = 0; i < nodeCount; i++) {
        const orbitIndex = i % 3;
        const radius = orbits[orbitIndex];
        const angleOffset = (i / nodeCount) * Math.PI * 2 + orbitIndex * 0.5;
        const verticalOffset = (Math.random() - 0.5) * 4;

        // Node - simple octahedrons
        const nodeSize = 0.15 + Math.random() * 0.08;
        const nodeGeometry = new THREE.OctahedronGeometry(nodeSize, 0);
        const nodeColor = orbitIndex === 0 ? primaryBlue : orbitIndex === 1 ? lightBlue : paleBlue;
        const nodeMaterial = new THREE.MeshBasicMaterial({
            color: nodeColor,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);

        // Store orbital data
        node.userData = {
            radius: radius,
            angle: angleOffset,
            speed: 0.1 + Math.random() * 0.15,
            verticalOffset: verticalOffset,
            verticalSpeed: 0.3 + Math.random() * 0.3,
            rotationSpeed: 0.01 + Math.random() * 0.01,
            pulseOffset: Math.random() * Math.PI * 2
        };

        nodes.push(node);
        networkGroup.add(node);
    }

    // === CONNECTIONS - Dynamic data flow lines - More visible ===
    connections = [];
    const connectionMaterial = new THREE.LineBasicMaterial({
        color: lightBlue,
        transparent: true,
        opacity: 0.3
    });

    // Create sparse connections between nodes
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (Math.random() > 0.85) { // 15% chance of connection - much sparser
                const lineGeometry = new THREE.BufferGeometry();
                const positions = new Float32Array(6);
                lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const line = new THREE.Line(lineGeometry, connectionMaterial.clone());
                line.userData = { nodeA: i, nodeB: j };
                connections.push(line);
                networkGroup.add(line);
            }
        }
    }

    // Fewer connections from core to nodes
    for (let i = 0; i < 6; i++) {
        const nodeIndex = Math.floor(i * nodeCount / 6);
        const lineGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const lineMaterial = new THREE.LineBasicMaterial({
            color: primaryBlue,
            transparent: true,
            opacity: 0.25
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData = { nodeA: -1, nodeB: nodeIndex, isCore: true };
        connections.push(line);
        networkGroup.add(line);
    }

    // === AMBIENT PARTICLES - Fewer background stars ===
    const ambientGeometry = new THREE.BufferGeometry();
    const ambientCount = 100;
    const ambientPositions = new Float32Array(ambientCount * 3);

    for (let i = 0; i < ambientCount; i++) {
        ambientPositions[i * 3] = (Math.random() - 0.5) * 50;
        ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
    const ambientMaterial = new THREE.PointsMaterial({
        color: paleBlue,
        size: 0.03,
        transparent: true,
        opacity: 0.3
    });
    const ambientParticles = new THREE.Points(ambientGeometry, ambientMaterial);
    scene.add(ambientParticles);

    // === OUTER BOUNDARY - Subtle hexagonal grid sphere ===
    const boundaryGeometry = new THREE.IcosahedronGeometry(14, 1);
    const boundaryMaterial = new THREE.MeshBasicMaterial({
        color: primaryBlue,
        wireframe: true,
        transparent: true,
        opacity: 0.04
    });
    const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
    networkGroup.add(boundary);

    // Event listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);

    animate();
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.0006;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.0006;
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    if (!renderer || !scene || !camera) return;
    requestAnimationFrame(animate);

    time += 0.016;

    // Rotate entire network slowly
    if (networkGroup) {
        networkGroup.rotation.y += 0.0008;
        networkGroup.rotation.x += mouseY * 0.015;
        networkGroup.rotation.y += mouseX * 0.015;
    }

    // Animate central core
    if (centralCore) {
        // Inner core rotation
        centralCore.children[0].rotation.x += 0.004;
        centralCore.children[0].rotation.y += 0.006;

        // Outer shell counter-rotation
        centralCore.children[1].rotation.x -= 0.003;
        centralCore.children[1].rotation.z += 0.004;

        // Subtle pulse effect
        const pulse = 1 + Math.sin(time * 1.2) * 0.08;
        centralCore.children[0].scale.setScalar(pulse);
        centralCore.children[1].scale.setScalar(1 + Math.sin(time * 1.2 + 1) * 0.05);

        // Animate single energy ring
        if (centralCore.children[2]) {
            centralCore.children[2].rotation.z += 0.004;
        }
    }

    // Animate nodes in orbits
    nodes.forEach((node, index) => {
        const data = node.userData;

        // Slower orbital motion
        data.angle += data.speed * 0.005;
        const wobble = Math.sin(time * data.verticalSpeed + index) * 0.3;

        node.position.x = Math.cos(data.angle) * data.radius;
        node.position.z = Math.sin(data.angle) * data.radius;
        node.position.y = data.verticalOffset + wobble;

        // Node rotation
        node.rotation.x += data.rotationSpeed;
        node.rotation.y += data.rotationSpeed * 0.7;

        // Subtle pulse opacity
        const pulseOpacity = 0.6 + Math.sin(time * 1.5 + data.pulseOffset) * 0.2;
        node.material.opacity = pulseOpacity;
    });

    // Update connections
    connections.forEach(line => {
        const positions = line.geometry.attributes.position.array;
        const data = line.userData;

        if (data.isCore) {
            // Core to node connection
            positions[0] = 0;
            positions[1] = 0;
            positions[2] = 0;
            positions[3] = nodes[data.nodeB].position.x;
            positions[4] = nodes[data.nodeB].position.y;
            positions[5] = nodes[data.nodeB].position.z;
        } else {
            // Node to node connection
            positions[0] = nodes[data.nodeA].position.x;
            positions[1] = nodes[data.nodeA].position.y;
            positions[2] = nodes[data.nodeA].position.z;
            positions[3] = nodes[data.nodeB].position.x;
            positions[4] = nodes[data.nodeB].position.y;
            positions[5] = nodes[data.nodeB].position.z;
        }

        line.geometry.attributes.position.needsUpdate = true;

        // Fade connections based on distance - subtle opacity
        const dx = positions[3] - positions[0];
        const dy = positions[4] - positions[1];
        const dz = positions[5] - positions[2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        line.material.opacity = Math.max(0.05, 0.2 - dist * 0.01);
    });

    renderer.render(scene, camera);
}

// How It Works 3D Background
function initHowItWorks3D() {
    const container = document.getElementById('how-it-works-canvas');
    if (!container) return;

    // Scene setup
    const howScene = new THREE.Scene();
    
    // Camera setup
    const howCamera = new THREE.PerspectiveCamera(50, window.innerWidth / 600, 0.1, 1000);
    howCamera.position.z = 30;

    // Renderer setup
    const howRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    howRenderer.setSize(window.innerWidth, 600);
    howRenderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(howRenderer.domElement);

    // Create particle network effect
    const particleCount = 150;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const connections = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0x2563eb,
        size: 0.3,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    howScene.add(particleSystem);

    // Create connecting lines
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.05,
        linewidth: 1
    });

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];

    // Create connections between nearby particles
    for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < 10) {
                linePositions.push(
                    positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                    positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                );
            }
        }
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    howScene.add(lines);

    // Create floating data blocks
    const blockGroup = new THREE.Group();
    const blockGeometry = new THREE.BoxGeometry(2, 2, 2);
    const blockMaterial = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    for (let i = 0; i < 5; i++) {
        const block = new THREE.Mesh(blockGeometry, blockMaterial);
        block.position.x = (Math.random() - 0.5) * 40;
        block.position.y = (Math.random() - 0.5) * 20;
        block.position.z = (Math.random() - 0.5) * 10;
        block.userData = {
            rotationSpeed: {
                x: Math.random() * 0.01,
                y: Math.random() * 0.01,
                z: Math.random() * 0.01
            },
            floatSpeed: Math.random() * 0.5 + 0.5,
            floatOffset: Math.random() * Math.PI * 2
        };
        blockGroup.add(block);
    }
    howScene.add(blockGroup);

    // Animation function
    function animateHowItWorks() {
        requestAnimationFrame(animateHowItWorks);

        // Rotate particle system
        particleSystem.rotation.y += 0.0005;
        lines.rotation.y += 0.0005;

        // Animate floating blocks
        blockGroup.children.forEach((block, index) => {
            block.rotation.x += block.userData.rotationSpeed.x;
            block.rotation.y += block.userData.rotationSpeed.y;
            block.rotation.z += block.userData.rotationSpeed.z;
            
            // Float animation
            const time = Date.now() * 0.001;
            block.position.y += Math.sin(time * block.userData.floatSpeed + block.userData.floatOffset) * 0.01;
        });

        // Move particles slightly
        const positions = particles.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            positions[idx + 1] += Math.sin(Date.now() * 0.001 + i) * 0.001;
        }
        particles.attributes.position.needsUpdate = true;

        howRenderer.render(howScene, howCamera);
    }

    // Handle window resize
    function onHowItWorksResize() {
        howCamera.aspect = window.innerWidth / 600;
        howCamera.updateProjectionMatrix();
        howRenderer.setSize(window.innerWidth, 600);
    }

    window.addEventListener('resize', onHowItWorksResize);

    // Scroll-based animation
    const howItWorksSection = document.getElementById('how-it-works');
    window.addEventListener('scroll', () => {
        const rect = howItWorksSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
            const scrollProgress = 1 - (rect.top / window.innerHeight);
            howCamera.position.z = 30 - scrollProgress * 5;
            blockGroup.rotation.y = scrollProgress * 0.5;
        }
    });

    animateHowItWorks();
}

// Initialize 3D scene when page loads
if (typeof THREE !== 'undefined') {
    init3D();
    initHowItWorks3D();
}

// Smooth scroll functionality
function scrollToTerminal() {
    const terminal = document.getElementById('terminal');
    terminal.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Scroll-triggered navigation with smooth animations
let lastScroll = 0;
const navbar = document.querySelector('.navbar');
const heroSection = document.querySelector('.hero');

function updateNavbarOnScroll() {
    const currentScroll = window.pageYOffset;

    // Add scrolled effect when scrolling past 100px
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Update active section highlighting
    updateActiveSection();

    lastScroll = currentScroll;
}

function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateNavbarOnScroll);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateNavbarOnScroll();
});

// Smooth anchor scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
// Smooth cubic-bezier for all scroll animations
const smoothEase = 'cubic-bezier(0.23, 1, 0.32, 1)';

const observerOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
            entry.target.style.filter = 'blur(0)';
        }
    });
}, observerOptions);

// Animate feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(32px) scale(0.97)';
    card.style.filter = 'blur(4px)';
    card.style.transition = `opacity 0.8s ${smoothEase} ${index * 0.12}s, transform 0.8s ${smoothEase} ${index * 0.12}s, filter 0.8s ${smoothEase} ${index * 0.12}s`;
    observer.observe(card);
});

// Animate demo cards
document.querySelectorAll('.demo-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(32px) scale(0.97)';
    card.style.filter = 'blur(4px)';
    card.style.transition = `opacity 0.8s ${smoothEase} ${index * 0.12}s, transform 0.8s ${smoothEase} ${index * 0.12}s, filter 0.8s ${smoothEase} ${index * 0.12}s`;
    observer.observe(card);
});

// Animate CTA cards
document.querySelectorAll('.cta-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px) scale(0.97)';
    card.style.filter = 'blur(4px)';
    card.style.transition = `opacity 0.8s ${smoothEase} ${index * 0.15}s, transform 0.8s ${smoothEase} ${index * 0.15}s, filter 0.8s ${smoothEase} ${index * 0.15}s`;
    observer.observe(card);
});

// Animate alternating feature blocks
document.querySelectorAll('.alt-feature').forEach((block, index) => {
    block.style.opacity = '0';
    block.style.transform = 'translateY(40px) scale(0.98)';
    block.style.filter = 'blur(6px)';
    block.style.transition = `opacity 1s ${smoothEase}, transform 1s ${smoothEase}, filter 1s ${smoothEase}`;
    observer.observe(block);
});

// Animate quote cards
document.querySelectorAll('.quote-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px) scale(0.97)';
    card.style.filter = 'blur(4px)';
    card.style.transition = `opacity 0.7s ${smoothEase} ${index * 0.15}s, transform 0.7s ${smoothEase} ${index * 0.15}s, filter 0.7s ${smoothEase} ${index * 0.15}s`;
    observer.observe(card);
});

// Animate comparison table
const comparisonTable = document.querySelector('.comparison-table-wrapper');
if (comparisonTable) {
    comparisonTable.style.opacity = '0';
    comparisonTable.style.transform = 'translateY(24px) scale(0.99)';
    comparisonTable.style.filter = 'blur(4px)';
    comparisonTable.style.transition = `opacity 0.9s ${smoothEase}, transform 0.9s ${smoothEase}, filter 0.9s ${smoothEase}`;
    observer.observe(comparisonTable);
}

// Animate FAQ items
document.querySelectorAll('.faq-accordion-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(12px)';
    item.style.transition = `opacity 0.6s ${smoothEase} ${index * 0.06}s, transform 0.6s ${smoothEase} ${index * 0.06}s`;
    observer.observe(item);
});

// Animate dashboard content
const dashboardContent = document.querySelector('.dashboard-content');
if (dashboardContent) {
    dashboardContent.style.opacity = '0';
    dashboardContent.style.transform = 'translateY(24px) scale(0.99)';
    dashboardContent.style.filter = 'blur(4px)';
    dashboardContent.style.transition = `opacity 0.9s ${smoothEase}, transform 0.9s ${smoothEase}, filter 0.9s ${smoothEase}`;
    observer.observe(dashboardContent);
}

// Animate section headers on scroll
document.querySelectorAll('.section-category, .section-description').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.7s ${smoothEase}, transform 0.7s ${smoothEase}`;
    observer.observe(el);
});

// Animate h2 headings on scroll
document.querySelectorAll('section h2').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.7s ${smoothEase} 0.05s, transform 0.7s ${smoothEase} 0.05s`;
    observer.observe(el);
});

// Animate quote followup
const quoteFollowup = document.querySelector('.quote-followup');
if (quoteFollowup) {
    quoteFollowup.style.opacity = '0';
    quoteFollowup.style.transform = 'translateY(16px)';
    quoteFollowup.style.transition = `opacity 0.8s ${smoothEase} 0.4s, transform 0.8s ${smoothEase} 0.4s`;
    observer.observe(quoteFollowup);
}

// Animate report wrapper
const reportWrapper = document.querySelector('.report-wrapper');
if (reportWrapper) {
    reportWrapper.style.opacity = '0';
    reportWrapper.style.transform = 'translateY(30px)';
    reportWrapper.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(reportWrapper);
}

// Dashboard tabs functionality
const dashboardTabs = document.querySelectorAll('.dashboard-tab');
const dashboardPanels = document.querySelectorAll('.dashboard-panel');

dashboardTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');

        // Remove active class from all tabs and panels
        dashboardTabs.forEach(t => t.classList.remove('active'));
        dashboardPanels.forEach(p => p.classList.remove('active'));

        // Add active class to clicked tab and corresponding panel
        this.classList.add('active');
        const targetPanel = document.getElementById('panel-' + targetTab);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    });
});

// Terminal language tabs functionality
const terminalTabs = document.querySelectorAll('.terminal-tab');
const terminalPanels = document.querySelectorAll('.terminal-panel');

terminalTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const lang = this.getAttribute('data-lang');

        // Remove active class from all tabs and panels
        terminalTabs.forEach(t => t.classList.remove('active'));
        terminalPanels.forEach(p => p.classList.remove('active'));

        // Add active class to clicked tab and corresponding panel
        this.classList.add('active');
        const targetPanel = document.getElementById('terminal-' + lang);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    });
});

// FAQ accordion functionality
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other items
        faqItems.forEach(other => other.classList.remove('active'));

        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Animate steps with enhanced effects
document.querySelectorAll('.glass-step').forEach((step, index) => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(40px) scale(0.95)';
    step.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`;
    
    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                
                // Animate step number
                const stepNumber = entry.target.querySelector('.step-number');
                if (stepNumber) {
                    stepNumber.style.animation = `pulseScale 0.6s ease ${index * 0.15}s`;
                }
                
                // Animate connector
                const nextConnector = entry.target.nextElementSibling;
                if (nextConnector && nextConnector.classList.contains('step-connector')) {
                    setTimeout(() => {
                        nextConnector.style.opacity = '1';
                    }, 300 + index * 150);
                }
            }
        });
    }, { threshold: 0.3 });
    
    stepObserver.observe(step);
});

// Initialize connectors as invisible
document.querySelectorAll('.step-connector').forEach(connector => {
    connector.style.opacity = '0';
    connector.style.transition = 'opacity 0.5s ease';
});

// Terminal typing effect
let codeTyped = false;
const terminalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !codeTyped) {
            codeTyped = true;
            typeCode();
        }
    });
}, { threshold: 0.5 });

const terminal = document.querySelector('.terminal');
if (terminal) {
    terminalObserver.observe(terminal);
}

function typeCode() {
    const codeBlocks = document.querySelectorAll('.terminal-body pre');
    codeBlocks.forEach((block, index) => {
        block.style.opacity = '0';
        setTimeout(() => {
            block.style.opacity = '1';
            block.style.animation = 'fadeIn 0.5s ease';
        }, index * 300);
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-10px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    
    @keyframes pulseScale {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Button ripple effect
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline').forEach(button => {
    button.addEventListener('mouseenter', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        from {
            width: 0;
            height: 0;
            opacity: 1;
        }
        to {
            width: 300px;
            height: 300px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Liquid glass effect on mouse move
document.addEventListener('mousemove', (e) => {
    const liquidOverlay = document.querySelector('.liquid-glass-overlay');
    if (liquidOverlay) {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        liquidOverlay.style.transform = `translate(${x}px, ${y}px)`;
    }
});

// Glass card tilt effect - DISABLED (too distracting)
// Keeping CSS-only subtle hover effects instead

// Initialize mobile menu and theme toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initRandomHeadline();
    initMobileMenu();
    initThemeToggle();
});

// Mascot Animation - Interactive Body Parts
function initMascotAnimation() {
    const mascot = document.getElementById('mascot');
    const mascotContainer = document.getElementById('mascot-container');
    if (!mascot || !mascotContainer) return;

    let svgElement = null;
    let bodyParts = {};
    let isIdle = true;
    let idleTimeout;
    let idleAnimFrame = 0;

    // Fetch and inject the SVG
    fetch('/images/stacky/stacky-default.svg')
        .then(response => response.text())
        .then(svgText => {
            // Insert the SVG into the container
            mascot.innerHTML = svgText;

            // Get the SVG element
            svgElement = mascot.querySelector('svg');
            if (!svgElement) {
                console.log('Could not find SVG element');
                return;
            }

            console.log('SVG loaded, finding body parts...');

            // Get body parts with the actual IDs from the SVG
            bodyParts = {
                leftHand: svgElement.querySelector('#left_hand'),
                rightHand: svgElement.querySelector('#right_hand'),
                leftLeg: svgElement.querySelector('#left_leg'),
                rightLeg: svgElement.querySelector('#right_leg'),
                body: svgElement.querySelector('#body'),
                head: svgElement.querySelector('#head'),
                leftEar: svgElement.querySelector('#left_ear'),
                rightEar: svgElement.querySelector('#right_ear'),
                trunk: svgElement.querySelector('#trunk'),
                eyes: svgElement.querySelector('#eyes_open')
            };

            console.log('Body parts found:', Object.keys(bodyParts).filter(k => bodyParts[k] !== null));

            // Add CSS to SVG elements for smooth transforms
            Object.values(bodyParts).forEach(part => {
                if (part) {
                    part.style.transition = 'transform 0.3s ease-out';
                }
            });

            // Start idle animation
            startIdleAnimation();
        })
        .catch(error => {
            console.error('Error loading SVG:', error);
        });

    // Mouse tracking with smooth follow
    document.addEventListener('mousemove', (e) => {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;

        const heroRect = heroSection.getBoundingClientRect();

        // Only track mouse when in hero section
        if (e.clientY >= heroRect.top && e.clientY <= heroRect.bottom) {
            const containerRect = mascotContainer.getBoundingClientRect();
            const centerX = containerRect.left + containerRect.width / 2;
            const centerY = containerRect.top + containerRect.height / 2;

            // Calculate distance for body part animation
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;

            isIdle = false;
            clearTimeout(idleTimeout);

            // Animate body parts only
            if (svgElement) {
                animateBodyPartsToMouse(deltaX, deltaY);
            }

            // Reset to idle after 1.5 seconds
            idleTimeout = setTimeout(() => {
                isIdle = true;
            }, 1500);
        }
    });



    // Animate body parts based on mouse
    function animateBodyPartsToMouse(deltaX, deltaY) {
        if (!svgElement) return;

        const mouseX = deltaX / 400; // Normalize (increased for even more subtle movement)
        const mouseY = deltaY / 400;

        // Clamp the values to prevent extreme movements
        const clampedMouseX = Math.max(-1, Math.min(1, mouseX));
        const clampedMouseY = Math.max(-1, Math.min(1, mouseY));

        // Head follows mouse with rotation (minimal movement)
        if (bodyParts.head) {
            const headRotation = clampedMouseX * 1.5;  // reduced from 2
            const headTranslateX = clampedMouseX * 3;  // reduced from 4
            const headTranslateY = clampedMouseY * 2;  // reduced from 3
            bodyParts.head.style.transform = `translate(${headTranslateX}px, ${headTranslateY}px) rotate(${headRotation}deg)`;
            bodyParts.head.style.transformOrigin = 'center center';
        }

        // Trunk follows (minimal)
        if (bodyParts.trunk) {
            const trunkRotation = clampedMouseX * 2;  // reduced from 3
            bodyParts.trunk.style.transform = `rotate(${trunkRotation}deg)`;
            bodyParts.trunk.style.transformOrigin = 'top center';
        }

        // Ears wiggle (minimal)
        if (bodyParts.leftEar) {
            const earRotation = -clampedMouseX * 1;  // reduced from 1.5
            bodyParts.leftEar.style.transform = `rotate(${earRotation}deg)`;
            bodyParts.leftEar.style.transformOrigin = 'bottom center';
        }

        if (bodyParts.rightEar) {
            const earRotation = clampedMouseX * 1;  // reduced from 1.5
            bodyParts.rightEar.style.transform = `rotate(${earRotation}deg)`;
            bodyParts.rightEar.style.transformOrigin = 'bottom center';
        }

        // Arms follow (minimal)
        if (bodyParts.leftHand) {
            const rotation = -clampedMouseX * 2.5 + clampedMouseY * 1.5;  // reduced from 4 and 2
            bodyParts.leftHand.style.transform = `rotate(${rotation}deg)`;
            bodyParts.leftHand.style.transformOrigin = 'top center';
        }

        if (bodyParts.rightHand) {
            const rotation = clampedMouseX * 2.5 + clampedMouseY * 1.5;  // reduced from 4 and 2
            bodyParts.rightHand.style.transform = `rotate(${rotation}deg)`;
            bodyParts.rightHand.style.transformOrigin = 'top center';
        }

        // Eyes follow mouse (subtle movement)
        if (bodyParts.eyes) {
            const eyeTranslateX = clampedMouseX * 2;
            const eyeTranslateY = clampedMouseY * 2;
            bodyParts.eyes.style.transform = `translate(${eyeTranslateX}px, ${eyeTranslateY}px)`;
        }
    }

    // Idle breathing animation
    function startIdleAnimation() {
        function idleLoop() {
            if (isIdle && svgElement) {
                idleAnimFrame += 0.02;

                // Breathing on body
                if (bodyParts.body) {
                    const breathe = Math.sin(idleAnimFrame) * 1.5;
                    bodyParts.body.style.transform = `translateY(${breathe}px)`;
                }

                // Head gentle bob
                if (bodyParts.head) {
                    const headBob = Math.sin(idleAnimFrame * 0.8) * 2;
                    bodyParts.head.style.transform = `translateY(${headBob}px)`;
                }

                // Ears wiggle
                if (bodyParts.leftEar) {
                    const wiggle = Math.sin(idleAnimFrame * 0.6) * 1;
                    bodyParts.leftEar.style.transform = `rotate(${wiggle}deg)`;
                    bodyParts.leftEar.style.transformOrigin = 'bottom center';
                }

                if (bodyParts.rightEar) {
                    const wiggle = Math.sin(idleAnimFrame * 0.6 + Math.PI) * 1;
                    bodyParts.rightEar.style.transform = `rotate(${wiggle}deg)`;
                    bodyParts.rightEar.style.transformOrigin = 'bottom center';
                }

                // Trunk sway
                if (bodyParts.trunk) {
                    const sway = Math.sin(idleAnimFrame * 0.5) * 2;
                    bodyParts.trunk.style.transform = `rotate(${sway}deg)`;
                    bodyParts.trunk.style.transformOrigin = 'top center';
                }
            }

            requestAnimationFrame(idleLoop);
        }

        idleLoop();
    }
}

// Initialize mascot animation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMascotAnimation();
});

// Console branding
console.log('%c OnchainDB ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 24px; padding: 10px 20px; border-radius: 8px; font-family: "Space Mono", monospace;');
console.log('%c Welcome to the future of decentralized databases! ', 'color: #2563eb; font-size: 14px; font-family: "IBM Plex Serif", serif;');