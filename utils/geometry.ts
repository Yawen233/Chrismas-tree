import * as THREE from 'three';

// Random float between min and max
export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate a random point inside a sphere of radius R
export const randomInSphere = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

// Generate a point on a cone volume (for the tree)
export const randomInCone = (height: number, baseRadius: number): [number, number, number] => {
  const y = Math.random() * height; // Height from bottom (0) to top (height)
  // Radius at this height (linear taper)
  const rAtHeight = baseRadius * (1 - y / height);
  
  // Random position within the circle at this height
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * rAtHeight; // Sqrt for uniform distribution
  
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  
  // Shift y to center the tree somewhat vertically
  return [x, y - height / 2, z];
};
