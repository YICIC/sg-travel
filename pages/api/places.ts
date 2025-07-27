import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data } = await supabase.from('places').select('*');
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    const { name, lat, lng, description } = req.body;
    const { data, error } = await supabase.from('places').insert([{ name, lat, lng, description }]);
    res.status(200).json({ success: !error });
  }
}
