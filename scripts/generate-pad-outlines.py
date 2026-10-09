# Generate the lily pad collision outlines; rerun when the SVG pad shapes change.
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
outlines = {}
for name in ['1', '2', '3', '4', 'freddy']:
    svg = (root / f'public/images/lilypads/{name}.svg').read_text()
    path = re.search(r'<path d="([^"]+)"', svg)[1]
    tokens = iter(re.findall(r'[MCLZ]|-?\d*\.?\d+(?:e[-+]?\d+)?', path))
    points = []
    for command in tokens:
        if command in ('M', 'L'):
            point = (float(next(tokens)), float(next(tokens)))
            points.append(point)
        elif command == 'C':
            start = point
            a, b, end = [tuple(float(next(tokens)) for _ in range(2)) for _ in range(3)]
            for step in range(1, 9):
                t = step / 8
                points.append(tuple(
                    (1 - t) ** 3 * start[i] + 3 * (1 - t) ** 2 * t * a[i]
                    + 3 * (1 - t) * t ** 2 * b[i] + t ** 3 * end[i]
                    for i in range(2)
                ))
            point = end
        elif command != 'Z':
            raise ValueError(f'Unsupported SVG command: {command}')
    outlines[name] = [[round(x, 3), round(y, 3)] for x, y in points]

(root / 'src/scripts/pond/outlines.json').write_text(json.dumps(outlines, separators=(',', ':')) + '\n')
