import React, { useState, useRef } from 'react';
import { Stage, Layer, Line, Circle, Text } from 'react-konva';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Point {
  x: number;
  y: number;
}

interface SilhouetteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (path: string) => void;
  initialPath?: string;
}

const SilhouetteEditor: React.FC<SilhouetteEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPath = '0,-25 25,0 0,25 -25,0',
}) => {
  const [points, setPoints] = useState<Point[]>(() => {
    // Parse initial path
    try {
      const parsed = initialPath
        .split(' ')
        .map((coord) => {
          const [x, y] = coord.split(',').map(Number);
          if (isNaN(x) || isNaN(y)) {
            return null;
          }
          return { x, y };
        })
        .filter((p): p is Point => p !== null);

      // Ensure we have at least 3 valid points, otherwise use default diamond
      if (parsed.length >= 3) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse initial path:', e);
    }

    // Default diamond shape
    return [
      { x: 0, y: -25 },
      { x: 25, y: 0 },
      { x: 0, y: 25 },
      { x: -25, y: 0 },
    ];
  });

  const stageRef = useRef<any>(null);

  const CANVAS_SIZE = 400;
  const CENTER = CANVAS_SIZE / 2;
  const SCALE = 4; // Scale factor to convert from -25..25 range to canvas coordinates

  // Convert point to canvas coordinates
  const toCanvas = (p: Point) => ({
    x: CENTER + p.x * SCALE,
    y: CENTER + p.y * SCALE,
  });

  // Convert canvas coordinates to point
  const fromCanvas = (x: number, y: number): Point => ({
    x: (x - CENTER) / SCALE,
    y: (y - CENTER) / SCALE,
  });

  const handleStageClick = (e: any) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    // Only add point if clicking on the stage itself (not on a shape)
    if (e.target === stage || e.target.getClassName() === 'Layer') {
      const newPoint = fromCanvas(pointerPosition.x, pointerPosition.y);
      setPoints([...points, newPoint]);
    }
  };

  const handlePointDrag = (index: number, x: number, y: number) => {
    const newPoint = fromCanvas(x, y);
    const newPoints = [...points];
    newPoints[index] = newPoint;
    setPoints(newPoints);
  };

  const handleDeletePoint = (index: number) => {
    if (points.length <= 3) {
      alert('A polygon needs at least 3 points');
      return;
    }
    setPoints(points.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setPoints([
      { x: 0, y: -25 },
      { x: 25, y: 0 },
      { x: 0, y: 25 },
      { x: -25, y: 0 },
    ]);
  };

  const handleSave = () => {
    const pathString = points
      .filter((p) => p !== undefined && p !== null)
      .map((p) => `${Math.round(p.x)},${Math.round(p.y)}`)
      .join(' ');
    onSave(pathString);
    onClose();
  };

  // Convert points to flat array for Konva Line
  const linePoints = points.flatMap((p) => {
    const cp = toCanvas(p);
    return [cp.x, cp.y];
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Custom Silhouette Editor</DialogTitle>
          <DialogDescription>
            Click to add points. Drag points to move them. Right-click a point
            to delete it. The shape should fit within a 50x50 unit area centered
            at (0,0).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-muted/20">
            <Stage
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              onClick={handleStageClick}
              ref={stageRef}
            >
              <Layer>
                {/* Grid background */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <React.Fragment key={`grid-${i}`}>
                    <Line
                      points={[i * 20, 0, i * 20, CANVAS_SIZE]}
                      stroke="#ccc"
                      strokeWidth={0.5}
                      opacity={0.3}
                    />
                    <Line
                      points={[0, i * 20, CANVAS_SIZE, i * 20]}
                      stroke="#ccc"
                      strokeWidth={0.5}
                      opacity={0.3}
                    />
                  </React.Fragment>
                ))}

                {/* Center crosshair */}
                <Line
                  points={[CENTER, 0, CENTER, CANVAS_SIZE]}
                  stroke="#666"
                  strokeWidth={1}
                  opacity={0.5}
                  dash={[5, 5]}
                />
                <Line
                  points={[0, CENTER, CANVAS_SIZE, CENTER]}
                  stroke="#666"
                  strokeWidth={1}
                  opacity={0.5}
                  dash={[5, 5]}
                />

                {/* Boundary circle (50 units diameter = 100px at scale 4) */}
                <Circle
                  x={CENTER}
                  y={CENTER}
                  radius={25 * SCALE}
                  stroke="#666"
                  strokeWidth={2}
                  opacity={0.4}
                  dash={[10, 5]}
                />

                {/* Polygon */}
                {points.length >= 3 && (
                  <Line
                    points={linePoints}
                    fill="hsl(var(--primary) / 0.3)"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    closed
                  />
                )}

                {/* Lines between points (if less than 3 points) */}
                {points.length > 0 && points.length < 3 && (
                  <Line
                    points={linePoints}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                )}

                {/* Control points */}
                {points.map((point, index) => {
                  const cp = toCanvas(point);
                  return (
                    <React.Fragment key={index}>
                      <Circle
                        x={cp.x}
                        y={cp.y}
                        radius={8}
                        fill="white"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        draggable
                        onDragMove={(e) => {
                          handlePointDrag(index, e.target.x(), e.target.y());
                        }}
                        onContextMenu={(e) => {
                          e.evt.preventDefault();
                          handleDeletePoint(index);
                        }}
                        onMouseEnter={(e) => {
                          const container = e.target.getStage()?.container();
                          if (container) {
                            container.style.cursor = 'grab';
                          }
                        }}
                        onMouseLeave={(e) => {
                          const container = e.target.getStage()?.container();
                          if (container) {
                            container.style.cursor = 'default';
                          }
                        }}
                        onDragStart={(e) => {
                          const container = e.target.getStage()?.container();
                          if (container) {
                            container.style.cursor = 'grabbing';
                          }
                        }}
                        onDragEnd={(e) => {
                          const container = e.target.getStage()?.container();
                          if (container) {
                            container.style.cursor = 'grab';
                          }
                        }}
                      />
                      <Text
                        x={cp.x + 12}
                        y={cp.y - 15}
                        text={String(index + 1)}
                        fontSize={12}
                        fill="#666"
                        listening={false}
                      />
                    </React.Fragment>
                  );
                })}
              </Layer>
            </Stage>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Preview (actual size):</h4>
            <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/20">
              <svg width="100" height="100" viewBox="-30 -30 60 60">
                {points.length >= 3 && (
                  <>
                    <defs>
                      <clipPath id="preview-clip">
                        <polygon
                          points={points
                            .filter((p) => p !== undefined && p !== null)
                            .map((p) => `${p.x},${p.y}`)
                            .join(' ')}
                        />
                      </clipPath>
                    </defs>
                    <image
                      href="/silhouette_men.webp"
                      x="-25"
                      y="-25"
                      width="50"
                      height="50"
                      clipPath="url(#preview-clip)"
                    />
                    <text
                      fill="currentColor"
                      strokeWidth="1"
                      x="0"
                      y="40"
                      textAnchor="middle"
                      fontSize="12"
                    >
                      John Doe
                    </text>
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Tips:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click anywhere on the canvas to add a new point</li>
              <li>Drag points to adjust the shape</li>
              <li>Right-click a point to delete it (minimum 3 points)</li>
              <li>Keep the shape within the dashed circle for best results</li>
              <li>Points are numbered in the order they connect</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset to Diamond
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={points.length < 3}>
            Save Shape
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SilhouetteEditor;
