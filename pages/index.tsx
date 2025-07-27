// pages/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { GoogleMap, Marker, LoadScript, OverlayView } from "@react-google-maps/api";
import Link from "next/link";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 1.3521,
  lng: 103.8198,
};

type Site = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  video?: string;
  articles?: string[];
  images?: string[];
};


function toEmbedUrl(url: string) {
  const regex1 = /youtu\.be\/([a-zA-Z0-9_-]+)/;
  const regex2 = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
  let match = url.match(regex1);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  match = url.match(regex2);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url; // 如果不是YouTube链接就返回原地址
}

function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // 生成本地URL预览
      const newUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
      onChange([...images, ...newUrls]);
    },
    [images, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  // 支持删除预览图
  const handleRemove = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-400 rounded p-4 text-center cursor-pointer bg-white hover:bg-gray-50"
      style={{ minHeight: "100px" }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-gray-600">拖放图片到这里...</p>
      ) : (
        <p className="text-gray-600">点击或拖放图片上传（支持多张）</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {images.map((url, i) => (
          <div key={i} className="relative inline-block">
            <img
              src={url}
              alt={`preview-${i}`}
              className="w-24 h-24 object-cover rounded shadow"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(i);
              }}
              className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 hover:bg-red-800"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 新增：Google Places Autocomplete 输入框组件
function PlacesAutocompleteInput({
  onPlaceSelected,
  defaultValue = "",
}: {
  onPlaceSelected: (lat: number, lng: number, address: string) => void;
  defaultValue?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current || autocomplete) return;

    if (
      window.google &&
      window.google.maps &&
      window.google.maps.places
    ) {
      const auto = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: "sg" },
      });

      auto.addListener("place_changed", () => {
        const place = auto.getPlace();
        if (place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || "";
          onPlaceSelected(lat, lng, address);
        }
      });

      setAutocomplete(auto);
    }
  }, [autocomplete]);


  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="搜索地址或地点"
      defaultValue={defaultValue}
      className="border p-2 w-full mb-2"
      autoComplete="off"
    />
  );
}

export default function Home() {
  // 初始化 sites，支持 localStorage 持久化
  const [sites, setSites] = useState<Site[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("sites");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: "gardens-by-the-bay",
        name: "Gardens by the Bay",
        lat: 1.2816,
        lng: 103.8636,
        description: "Futuristic park with Supertree Grove and Cloud Forest.",
        video: "https://www.youtube.com/embed/8kzW7oFCbqs",
        articles: [
          "https://www.visitsingapore.com/see-do-singapore/nature-wildlife/parks-gardens/gardens-by-the-bay/",
        ],
        images: ["/images/gardens1.jpg", "/images/gardens2.jpg"],
      },
    ];
  });

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  // 新建卡片，默认marker在地图中心
  const handleAddNewCard = () => {
    setEditingSite({
      id: `new-${Date.now()}`,
      name: "",
      lat: center.lat,
      lng: center.lng,
      description: "",
      video: "",
      articles: [],
      images: [],
    });
    setIsEditing(true);
    setSelectedSiteId(null);
  };

  // 点击marker显示详情，退出编辑
  const handleMarkerClick = (site: Site) => {
    setSelectedSiteId(site.id);
    setEditingSite(null);
    setIsEditing(false);
  };

  // 编辑当前选中站点
  const handleEdit = () => {
    if (selectedSiteId) {
      const site = sites.find((s) => s.id === selectedSiteId);
      if (site) {
        setEditingSite({ ...site });
        setIsEditing(true);
        setSelectedSiteId(null);
      }
    }
  };

  // 删除当前选中站点
  const handleDelete = () => {
    if (selectedSiteId) {
      if (confirm("确定删除该站点吗？")) {
        setSites(sites.filter((s) => s.id !== selectedSiteId));
        setSelectedSiteId(null);
        setEditingSite(null);
        setIsEditing(false);
      }
    }
  };

  // Marker 拖动结束，更新编辑站点经纬度
  const onDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!editingSite) return;
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setEditingSite({ ...editingSite, lat, lng });
    }
  };

  // 站点字段输入变化
  const handleInputChange = (field: keyof Site, value: any) => {
    if (!editingSite) return;
    setEditingSite({ ...editingSite, [field]: value });
  };

  // 搜索框选中地点回调，更新lat,lng并可自动更新名称（你也可以自己修改）
  const handlePlaceSelected = (
    lat: number,
    lng: number,
    address: string
  ) => {
    if (!editingSite) return;
    setEditingSite({
      ...editingSite,
      lat,
      lng,
      name: address || editingSite.name,
    });
  };

  // 保存（新增或更新）
  const handleSave = () => {
    if (!editingSite) return;
    if (!editingSite.name.trim()) {
      alert("请填写站点名称");
      return;
    }
    setSites((prev) => {
      const exists = prev.find((s) => s.id === editingSite.id);
      if (exists) {
        return prev.map((s) => (s.id === editingSite.id ? editingSite : s));
      } else {
        return [...prev, editingSite];
      }
    });
    setIsEditing(false);
    setEditingSite(null);
    setSelectedSiteId(null);
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setEditingSite(null);
    setSelectedSiteId(null);
  };

  // sites 持久化
  useEffect(() => {
    const storedId = localStorage.getItem("selectedSiteId");
    if (storedId) {
      setSelectedSiteId(storedId);
      localStorage.removeItem("selectedSiteId");
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("sites", JSON.stringify(sites));
    }
  }, [sites]);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  return (
    <>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        libraries={["places"]}
      >
        <div className="flex h-screen relative">
          {/* 地图区 */}
          <div className="w-3/4 h-full">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={12}
              onRightClick={() => {
                // 禁用右键新增，改为用按钮新增
                // 你可以启用此功能：
                // setEditingSite({...})
                // setIsEditing(true);
                // setSelectedSiteId(null);
              }}
            >
              {/* 所有markers */}
              {sites.map((site) => (
                <div key={site.id}>
                  <Marker
                    position={{ lat: site.lat, lng: site.lng }}
                    onClick={() => handleMarkerClick(site)}
                  />
                  <OverlayView
                    position={{ lat: site.lat, lng: site.lng }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 inline-block bg-white/60 text-black px-3 py-1 rounded shadow text-sm font-semibold whitespace-nowrap max-w-[300px] inline-block break-words">
                      {site.name}
                    </div>
                  </OverlayView>
                </div>
              ))}

              {/* 编辑模式marker */}
              {isEditing && editingSite && (
                <Marker
                  position={{ lat: editingSite.lat, lng: editingSite.lng }}
                  draggable
                  onDragEnd={onDragEnd}
                />
              )}
            </GoogleMap>
          </div>

          {/* 右侧面板 */}
          <div className="w-1/4 h-full overflow-auto bg-white border-l p-4">
            {isEditing && editingSite ? (
              <>
                <h2 className="text-xl font-bold mb-2">
                  {sites.find((s) => s.id === editingSite.id)
                    ? "编辑站点"
                    : "新增站点"}
                </h2>
                <p className="mb-2 text-sm text-gray-600">
                  位置：纬度 {editingSite.lat.toFixed(6)}，经度{" "}
                  {editingSite.lng.toFixed(6)}
                </p>

                {/* Places Autocomplete搜索框 */}
                <PlacesAutocompleteInput
                  onPlaceSelected={handlePlaceSelected}
                  defaultValue={editingSite.name}
                />

                <input
                  className="w-full mb-2 border p-2"
                  type="text"
                  placeholder="站点名称"
                  value={editingSite.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                <textarea
                  className="w-full mb-2 border p-2"
                  placeholder="描述"
                  value={editingSite.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
                <input
                  className="w-full mb-2 border p-2"
                  type="text"
                  placeholder="视频URL"
                  value={editingSite.video || ""}
                  onChange={(e) => handleInputChange("video", e.target.value)}
                />
                <input
                  className="w-full mb-2 border p-2"
                  type="text"
                  placeholder="文章URLs，逗号分隔"
                  value={(editingSite.articles || []).join(",")}
                  onChange={(e) =>
                    handleInputChange("articles", e.target.value.split(","))
                  }
                />
                
                <div className="mb-4">
                  <label className="block mb-1 font-semibold">图片上传</label>
                  <ImageUploader
                    images={editingSite.images || []}
                    onChange={(imgs) => handleInputChange("images", imgs)}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-4 py-2 rounded flex-1"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 px-4 py-2 rounded flex-1"
                  >
                    取消
                  </button>
                </div>
              </>
            ) : selectedSite ? (
              <>
                <h2 className="text-xl font-bold mb-2">{selectedSite.name}</h2>
                <p className="mb-2">{selectedSite.description}</p>
                {selectedSite.video && (
                  <iframe
                    className="w-full aspect-video mb-2"
                    src={toEmbedUrl(selectedSite.video)}
                    title={`${selectedSite.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {selectedSite.articles && selectedSite.articles.length > 0 && (
                  <>
                    <h3 className="font-semibold mb-1">相关文章:</h3>
                    <ul className="list-disc list-inside mb-2">
                      {selectedSite.articles.map((url, i) => (
                        <li key={i}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {selectedSite.images && selectedSite.images.length > 0 && (
                  <>
                    <h3 className="font-semibold mb-1">图片:</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedSite.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`${selectedSite.name} image ${i + 1}`}
                          className="w-24 h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="bg-yellow-400 px-4 py-2 rounded flex-1"
                  >
                    编辑
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded flex-1"
                  >
                    删除
                  </button>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-4">站点信息</h2>
                <p>点击地图上的marker查看详情，右下角按钮新增站点。</p>
              </div>
            )}
          </div>

          {/* 右下新增按钮 */}
          <button
            onClick={handleAddNewCard}
            className="absolute bottom-4 right-4 bg-white bg-opacity-80 px-4 py-2 rounded shadow hover:bg-opacity-100"
          >
            Add New Card
          </button>

          {/* 底部居中查看卡片链接 */}
          <Link href="/cards">
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-60 px-4 py-2 rounded shadow hover:bg-opacity-80 cursor-pointer">
              View as Cards
            </div>
          </Link>
        </div>
      </LoadScript>
    </>
  );
}
