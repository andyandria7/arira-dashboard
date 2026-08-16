// Construit une liste de points SVG (polyline) à partir d'une série de
// valeurs, normalisée dans [0, height] (0 = haut du graphique, comme en SVG).
export function buildPolyline(values: number[], width: number, height: number, padding = 4): string {
  if (values.length === 0) return "";
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  return values
    .map((v, i) => {
      const x = i * step;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function buildAreaPolygon(values: number[], width: number, height: number, padding = 4): string {
  const line = buildPolyline(values, width, height, padding);
  return `${line} ${width},${height} 0,${height}`;
}
