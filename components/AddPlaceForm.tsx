// components/AddPlaceForm.tsx
import { useState } from 'react';

export default function AddPlaceForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    lat: '',
    lng: '',
    description: '',
    video: '',
    articles: '',
    images: '',
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        articles: form.articles.split(',').map((s) => s.trim()),
        images: form.images.split(',').map((s) => s.trim()),
      }),
    });

    if (res.ok) {
      alert('地点已保存');
      onSaved(); // 可用于刷新地图
    } else {
      alert('保存失败');
    }
  };

  return (
    <div className="p-4">
      <input name="id" onChange={handleChange} placeholder="ID (可自定义)" className="mb-2 w-full" />
      <input name="name" onChange={handleChange} placeholder="名称" className="mb-2 w-full" />
      <input name="lat" onChange={handleChange} placeholder="纬度" className="mb-2 w-full" />
      <input name="lng" onChange={handleChange} placeholder="经度" className="mb-2 w-full" />
      <input name="description" onChange={handleChange} placeholder="描述" className="mb-2 w-full" />
      <input name="video" onChange={handleChange} placeholder="YouTube链接" className="mb-2 w-full" />
      <input name="articles" onChange={handleChange} placeholder="文章链接（用英文逗号分隔）" className="mb-2 w-full" />
      <input name="images" onChange={handleChange} placeholder="图片链接（用英文逗号分隔）" className="mb-2 w-full" />
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 mt-2">提交</button>
    </div>
  );
}
