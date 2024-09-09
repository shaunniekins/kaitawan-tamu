// components/admin/pages/SellPage.tsx

"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const SellPage = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableRotate = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 2;

    const geometry = new THREE.BoxGeometry(10, 10, 10); // Create a box geometry

    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      "/images/shirt-front.jpg",
      (texture) => {
        console.log("Texture loaded successfully");
      },
      undefined,
      (error) => {
        console.error("Error loading texture:", error);
      }
    );

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material); // Apply the material to the cube

    scene.add(cube);
    camera.position.set(0, 0, 20);

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01; // Rotate only along the x-axis
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="h-full w-full" ref={mountRef}></div>;
};

export default SellPage;
