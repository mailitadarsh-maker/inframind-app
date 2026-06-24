import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    if (!file) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Resize to small for fast processing
    const { data, info } = await sharp(buffer)
      .resize(50, 50, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Sample pixels and find dominant colors
    const pixels: [number,number,number][] = [];
    for (let i = 0; i < data.length; i += info.channels) {
      pixels.push([data[i], data[i+1], data[i+2]]);
    }

    // Simple k-means: find 2 dominant colors by clustering
    // Sort by brightness to separate light/dark
    pixels.sort((a, b) => (b[0]+b[1]+b[2]) - (a[0]+a[1]+a[2]));
    
    const toHex = (r: number, g: number, b: number) =>
      '#' + [r,g,b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('');

    // Take average of top 20% (bright = primary) and bottom 20% (dark = secondary)
    const topCount = Math.max(1, Math.floor(pixels.length * 0.2));
    const top = pixels.slice(0, topCount);
    const bottom = pixels.slice(-topCount);

    const avg = (arr: [number,number,number][]) => arr.reduce((acc, p) => [acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]], [0,0,0]).map(v => v/arr.length);
    
    const [r1,g1,b1] = avg(top);
    const [r2,g2,b2] = avg(bottom);

    return NextResponse.json({
      primary: toHex(r1,g1,b1),
      secondary: toHex(r2,g2,b2),
    });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
