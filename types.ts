import * as THREE from 'three';
import { ReactThreeFiber } from '@react-three/fiber';

export interface DualPosition {
  tree: [number, number, number];
  scatter: [number, number, number];
  scale: number;
  rotation: [number, number, number];
}

export interface OrnamentData {
  id: number;
  type: 'box' | 'bauble' | 'star';
  positions: DualPosition;
  color: string;
}

export interface CalibrationSettings {
  scale: number;
  x: number;
  y: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ReactThreeFiber.IntrinsicElements {}
  }
}