document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('panoramaBg');
  if (!container || typeof THREE === 'undefined') return;

  var imagePath = container.dataset.panoramaSrc;
  if (!imagePath) return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 0);

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  var textureLoader = new THREE.TextureLoader();
  var texture = textureLoader.load(imagePath);
  texture.colorSpace = THREE.SRGBColorSpace;

  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(500, 64, 64),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide })
  );
  scene.add(sphere);

  var isDragging = false;
  var prevX = 0;
  var prevY = 0;

  container.addEventListener('pointerdown', function (e) {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
  });

  window.addEventListener('pointermove', function (e) {
    if (!isDragging) return;
    sphere.rotation.y += (e.clientX - prevX) * 0.005;
    sphere.rotation.x += (e.clientY - prevY) * 0.005;
    sphere.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, sphere.rotation.x));
    prevX = e.clientX;
    prevY = e.clientY;
  });

  window.addEventListener('pointerup', function () { isDragging = false; });

  function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) sphere.rotation.y += 0.001;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
