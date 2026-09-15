import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  isPaused: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ analyser, isRecording, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : new Uint8Array(64);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!isRecording || isPaused) {
        // Flat resting line or subtle idle wave
        ctx.beginPath();
        const isDark = document.documentElement.classList.contains('dark');
        ctx.strokeStyle = isDark ? '#52525b' : '#a1a1aa';
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      }

      const barCount = 36;
      const barWidth = (width / barCount) - 3;
      const centerY = height / 2;

      for (let i = 0; i < barCount; i++) {
        // Map frequency data or compute synthetic fluctuation
        const sampleIndex = Math.floor((i / barCount) * (dataArray.length / 2));
        const value = analyser ? dataArray[sampleIndex] : Math.random() * 40 + 10;
        const normalized = Math.max(4, (value / 255) * (height * 0.85));

        const x = i * (barWidth + 3) + 2;
        const y = centerY - normalized / 2;

        // Gradient for active sound
        const gradient = ctx.createLinearGradient(0, y, 0, y + normalized);
        gradient.addColorStop(0, '#f59e0b'); // amber-500
        gradient.addColorStop(0.5, '#ef4444'); // red-500
        gradient.addColorStop(1, '#ec4899'); // pink-500

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, normalized, 3);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, isRecording, isPaused]);

  return (
    <div id="audio-waveform-container" className="w-full h-16 bg-neutral-100 dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800/80 p-2 flex items-center justify-center overflow-hidden transition-colors">
      <canvas
        id="audio-waveform-canvas"
        ref={canvasRef}
        width={400}
        height={60}
        className="w-full h-full"
      />
    </div>
  );
};
