// pages/api/places.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('places').select('*');
    if (error) return res.status(500).json({ error });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { id, name, lat, lng, description, video, articles, images } = req.body;
    const { data, error } = await supabase.from('places').insert([
      { id, name, lat, lng, description, video, articles, images }
    ]);
    if (error) return res.status(500).json({ error });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
