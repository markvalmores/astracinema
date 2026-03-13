
export interface CinemaState {
  videoUrl: string | null;
  isPlaying: boolean;
  isMenuOpen: boolean;
  volume: number;
}

export interface SeatProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}
