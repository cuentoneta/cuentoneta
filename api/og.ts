import { html } from 'satori-html';
import satori from 'satori';
import { readFileSync } from 'fs';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ReactNode } from 'react';

import Logo from './_utils/Logo';

export default async function get(req: VercelRequest, res: VercelResponse) {
  const {author, title, rrss, storylist} = req.query;
  let text: string;

  if (storylist) {
    text = String(storylist)
  }else if (author && title){
    text = `${title} - ${author}`
  }else {
    text = "La Cuentoneta"
  }

  let width: number;
  let height: number;

  if (rrss === 'twitter') {
    width = 1000;
    height = 523;
  } else if (rrss === 'facebook' || rrss === 'whatsapp') {
    width = 1000;
    height = 1000;
  } else {
    width = 1200;
    height = 630;
  }

  // Ruta al archivo de la font family
  const fontFilePath: string = `${process.cwd()}/api/_utils/Inter-Medium.ttf`;
  const fontFile: Buffer = readFileSync(fontFilePath);

  const markup = html(`
      <div
          style="height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #e17d6b;"
      >
          ${Logo(String(rrss))}
          <p style="margin-top: 40px; font-size: 60px; text-align: center; color: #fff;">${text}</p>
      </div>
  `);

  const svg: string = await satori(markup as ReactNode, {
    width,
    height,
    fonts: [
      {
        name: 'Inter',
        data: fontFile,
        style: 'normal',
      },
    ],
  });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
}
