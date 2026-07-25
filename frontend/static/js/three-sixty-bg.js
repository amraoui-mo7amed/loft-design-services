(function () {
  const container = document.getElementById('panoramaBg');
  if (!container) return;

  const imagePath = container.dataset.panoramaSrc;
  if (!imagePath) return;

  const isRtl = document.documentElement.dir === 'rtl';

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 0.1);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(imagePath);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(500, 64, 64);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
  });

  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += isRtl ? 0.0015 : -0.0015;
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
