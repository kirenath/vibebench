const SHAPES = [
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "30% 70% 70% 30% / 30% 30% 70% 70%",
  "70% 30% 50% 50% / 40% 60% 40% 60%",
  "40% 60% 60% 40% / 50% 40% 60% 50%",
  "50% 50% 30% 70% / 60% 40% 50% 50%",
  "65% 35% 45% 55% / 55% 45% 55% 45%",
];

interface BlobProps {
  color?: string;
  size?: string;
  className?: string;
  shapeIndex?: number;
}

export default function Blob({
  color = "bg-primary",
  size = "w-64 h-64",
  className = "",
  shapeIndex = 0,
}: BlobProps) {
  const shape = SHAPES[shapeIndex % SHAPES.length];
  return (
    <div
      className={`absolute blur-3xl opacity-20 pointer-events-none ${color} ${size} ${className}`}
      style={{ borderRadius: shape }}
    />
  );
}
