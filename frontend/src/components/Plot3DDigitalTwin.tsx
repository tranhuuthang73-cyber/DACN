import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  ArrowPathIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  CloudIcon,
  CameraIcon,
  BoltIcon,
  PlusIcon,
  XMarkIcon,
  SwatchIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export type FruitShapeType =
  | 'CITRUS'
  | 'DURIAN'
  | 'APPLE'
  | 'MANGO'
  | 'AVOCADO'
  | 'BERRY'
  | 'GRAIN'
  | 'WATERMELON'
  | 'BANANA'
  | 'GRAPE'
  | 'DRAGONFRUIT'
  | 'COCONUT';

export interface FruitConfig {
  id: string;
  label: string;
  emoji: string;
  nameVi: string;
  fruitColorHex: number;
  fruitRoughness: number;
  foliageColorHex: number;
  foliageTipColorHex: number;
  trunkColorHex: number;
  fruitShape: FruitShapeType;
  harvestDesc: string;
  isCustom?: boolean;
}

const DEFAULT_PRESETS: FruitConfig[] = [
  {
    id: 'ORANGE',
    label: 'Cam Sành / Quýt',
    emoji: '🍊',
    nameVi: 'Cây Cam Sành Cổ Thụ (Citrus sinensis)',
    fruitColorHex: 0xf97316,
    fruitRoughness: 0.2,
    foliageColorHex: 0x15803d,
    foliageTipColorHex: 0x4ade80,
    trunkColorHex: 0x451a03,
    fruitShape: 'CITRUS',
    harvestDesc: 'Quả cam mọng nước, vỏ cam vàng óng ả căng tròn'
  },
  {
    id: 'DURIAN',
    label: 'Sầu Riêng Ri6',
    emoji: '🍈',
    nameVi: 'Sầu Riêng Ri6 Bến Tre (Durio zibethinus)',
    fruitColorHex: 0xd97706,
    fruitRoughness: 0.5,
    foliageColorHex: 0x166534,
    foliageTipColorHex: 0x86efac,
    trunkColorHex: 0x3b1d0c,
    fruitShape: 'DURIAN',
    harvestDesc: 'Trái sầu riêng to tròn đầy gai nhọn, múi cơm vàng béo ngậy'
  },
  {
    id: 'APPLE_TOMATO',
    label: 'Táo Đỏ / Cà Chua',
    emoji: '🍎',
    nameVi: 'Táo Đỏ & Cà Chua Ruby Tuyệt Đẹp',
    fruitColorHex: 0xdc2626,
    fruitRoughness: 0.15,
    foliageColorHex: 0x15803d,
    foliageTipColorHex: 0xa7f3d0,
    trunkColorHex: 0x4a2810,
    fruitShape: 'APPLE',
    harvestDesc: 'Trái đỏ mọng bóng bẩy căng tràn sức sống, vị ngọt thanh'
  },
  {
    id: 'MANGO',
    label: 'Xoài Cát Hòa Lộc',
    emoji: '🥭',
    nameVi: 'Xoài Cát Hòa Lộc Tiền Giang',
    fruitColorHex: 0xfacc15,
    fruitRoughness: 0.2,
    foliageColorHex: 0x14532d,
    foliageTipColorHex: 0x86efac,
    trunkColorHex: 0x381e0d,
    fruitShape: 'MANGO',
    harvestDesc: 'Xoài cát da vàng ươm, dáng thon cong má đào trĩu cành'
  },
  {
    id: 'WATERMELON',
    label: 'Dưa Hấu Long An',
    emoji: '🍉',
    nameVi: 'Dưa Hấu Long An (Citrullus lanatus)',
    fruitColorHex: 0x15803d,
    fruitRoughness: 0.2,
    foliageColorHex: 0x15803d,
    foliageTipColorHex: 0x86efac,
    trunkColorHex: 0x543310,
    fruitShape: 'WATERMELON',
    harvestDesc: 'Trái dưa hấu to tròn vỏ sọc xanh thẫm, ruột đỏ ngọt lịm'
  },
  {
    id: 'DRAGONFRUIT',
    label: 'Thanh Long Bình Thuận',
    emoji: '🐉',
    nameVi: 'Thanh Long Ruột Đỏ Hoàng Gia',
    fruitColorHex: 0xec4899,
    fruitRoughness: 0.25,
    foliageColorHex: 0x047857,
    foliageTipColorHex: 0x34d399,
    trunkColorHex: 0x334155,
    fruitShape: 'DRAGONFRUIT',
    harvestDesc: 'Trái thanh long hồng tím rực rỡ với tai vẩy xanh độc đáo'
  },
  {
    id: 'GRAPE',
    label: 'Nho Tím Ninh Thuận',
    emoji: '🍇',
    nameVi: 'Nho Tím Ninh Thuận (Vitis vinifera)',
    fruitColorHex: 0x7e22ce,
    fruitRoughness: 0.15,
    foliageColorHex: 0x15803d,
    foliageTipColorHex: 0xa7f3d0,
    trunkColorHex: 0x4a2e16,
    fruitShape: 'GRAPE',
    harvestDesc: 'Chùm nho tím mọng bóng bẩy đung đưa dưới vòm lá'
  },
  {
    id: 'BANANA',
    label: 'Chuối Ngự Tiến Vua',
    emoji: '🍌',
    nameVi: 'Chuối Ngự Tiến Vua (Musa acuminata)',
    fruitColorHex: 0xfacc15,
    fruitRoughness: 0.3,
    foliageColorHex: 0x16a34a,
    foliageTipColorHex: 0x86efac,
    trunkColorHex: 0x65a30d,
    fruitShape: 'BANANA',
    harvestDesc: 'Nải chuối vàng ươm thơm lừng, quả cong mập đều đặn'
  },
  {
    id: 'AVOCADO',
    label: 'Bơ Sáp 034',
    emoji: '🥑',
    nameVi: 'Bơ Sáp 034 Đắk Lắk',
    fruitColorHex: 0x15803d,
    fruitRoughness: 0.3,
    foliageColorHex: 0x064e3b,
    foliageTipColorHex: 0x34d399,
    trunkColorHex: 0x451a03,
    fruitShape: 'AVOCADO',
    harvestDesc: 'Trái bơ sáp dài màu xanh đậm bóng mịn, dẻo béo hảo hạng'
  },
  {
    id: 'COCONUT',
    label: 'Dừa Xiêm Bến Tre',
    emoji: '🥥',
    nameVi: 'Dừa Xiêm Xanh Bến Tre (Cocos nucifera)',
    fruitColorHex: 0x65a30d,
    fruitRoughness: 0.4,
    foliageColorHex: 0x166534,
    foliageTipColorHex: 0xfde047,
    trunkColorHex: 0x5c3a21,
    fruitShape: 'COCONUT',
    harvestDesc: 'Chùm dừa xanh trĩu quả nước ngọt thanh mát lành'
  },
  {
    id: 'COFFEE',
    label: 'Cà Phê Robusta',
    emoji: '☕',
    nameVi: 'Cà Phê Robusta Buôn Ma Thuột',
    fruitColorHex: 0x991b1b,
    fruitRoughness: 0.15,
    foliageColorHex: 0x064e3b,
    foliageTipColorHex: 0x22c55e,
    trunkColorHex: 0x4a2e16,
    fruitShape: 'BERRY',
    harvestDesc: 'Chùm quả cà phê chín mọng đỏ rực như ngọc bích dọc cành'
  },
  {
    id: 'RICE',
    label: 'Lúa Nước ST25',
    emoji: '🌾',
    nameVi: 'Lúa Gạo ST25 Hảo Hạng',
    fruitColorHex: 0xfacc15,
    fruitRoughness: 0.35,
    foliageColorHex: 0x16a34a,
    foliageTipColorHex: 0xfef08a,
    trunkColorHex: 0x78350f,
    fruitShape: 'GRAIN',
    harvestDesc: 'Cánh đồng lúa vàng óng ả, bông lúa trĩu hạt uốn cong hạt ngọc'
  }
];

interface Plot3DDigitalTwinProps {
  plotName?: string;
  areaM2?: number;
  cropType?: string;
  soilType?: string;
  moisturePercent?: number;
  soilPh?: number;
  isWateringActive?: boolean;
  weather?: any;
  seasonPlantedDate?: string;
  targetYield?: number;
}

const Plot3DDigitalTwin: React.FC<Plot3DDigitalTwinProps> = ({
  plotName = 'Thửa Ruộng Số 1',
  areaM2 = 2500,
  cropType = 'Lúa nước (Oryza sativa)',
  soilType = 'Đất phù sa bồi tụ',
  moisturePercent = 52,
  soilPh = 6.4,
  isWateringActive = false,
  weather,
  seasonPlantedDate,
  targetYield = 3800
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetLookAtRef = useRef<THREE.Vector3 | null>(null);

  const [isTurboMode, setIsTurboMode] = useState<boolean>(true);

  // Load and manage presets
  const [fruitList, setFruitList] = useState<FruitConfig[]>(() => {
    try {
      const saved = localStorage.getItem('smart_farm_custom_crops');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...DEFAULT_PRESETS, ...parsed];
      }
    } catch {
      // ignore
    }
    return DEFAULT_PRESETS;
  });

  const detectInitialPreset = (): string => {
    const ct = cropType.toLowerCase();
    const found = fruitList.find(
      (f) =>
        ct.includes(f.label.toLowerCase()) ||
        ct.includes(f.nameVi.toLowerCase()) ||
        f.id.toLowerCase() === ct
    );
    if (found) return found.id;
    if (ct.includes('sầu riêng') || ct.includes('durian')) return 'DURIAN';
    if (ct.includes('dưa') || ct.includes('watermelon')) return 'WATERMELON';
    if (ct.includes('thanh long')) return 'DRAGONFRUIT';
    if (ct.includes('nho') || ct.includes('grape')) return 'GRAPE';
    if (ct.includes('chuối') || ct.includes('banana')) return 'BANANA';
    if (ct.includes('cam') || ct.includes('quýt')) return 'ORANGE';
    if (ct.includes('xoài')) return 'MANGO';
    if (ct.includes('bơ')) return 'AVOCADO';
    if (ct.includes('dừa')) return 'COCONUT';
    if (ct.includes('cà phê')) return 'COFFEE';
    if (ct.includes('lúa')) return 'RICE';
    return 'ORANGE';
  };

  const [selectedFruitId, setSelectedFruitId] = useState<string>(detectInitialPreset());
  const [autoRotate, setAutoRotate] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'CROPS' | 'SOIL_STRATA' | 'IRRIGATION'>('ALL');
  const [isNDVILayer, setIsNDVILayer] = useState(false);
  const [localWatering, setLocalWatering] = useState(false);
  const [isDroneScanning, setIsDroneScanning] = useState(true);

  // Customizer Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🍒');
  const [customColor, setCustomColor] = useState('#e11d48');
  const [customFoliageColor, setCustomFoliageColor] = useState('#15803d');
  const [customShape, setCustomShape] = useState<FruitShapeType>('CITRUS');

  // Growth Stage State
  const calculateInitialProgress = () => {
    if (!seasonPlantedDate) return 85;
    const planted = new Date(seasonPlantedDate).getTime();
    const now = new Date().getTime();
    const days = Math.max(1, Math.floor((now - planted) / (1000 * 60 * 60 * 24)));
    return Math.min(100, Math.max(10, Math.round((days / 100) * 100)));
  };

  const [growthProgress, setGrowthProgress] = useState<number>(calculateInitialProgress());
  const [isTimeLapsePlaying, setIsTimeLapsePlaying] = useState(false);

  const currentFruitConfig =
    fruitList.find((f) => f.id === selectedFruitId) || fruitList[0];
  const effectiveWatering = isWateringActive || localWatering;
  const isRaining = (weather?.rainfall_mm || 0) > 0 || (weather?.weather_code || 0) >= 51;

  useEffect(() => {
    if (!isTimeLapsePlaying) return;
    const interval = setInterval(() => {
      setGrowthProgress((prev) => (prev >= 100 ? 5 : prev + 1));
    }, 120);
    return () => clearInterval(interval);
  }, [isTimeLapsePlaying]);

  const handleCreateCustomCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newCrop: FruitConfig = {
      id: `CUSTOM_${Date.now()}`,
      label: customName.trim(),
      emoji: customEmoji,
      nameVi: customName.trim(),
      fruitColorHex: parseInt(customColor.replace('#', '0x')),
      fruitRoughness: 0.25,
      foliageColorHex: parseInt(customFoliageColor.replace('#', '0x')),
      foliageTipColorHex: 0x86efac,
      trunkColorHex: 0x451a03,
      fruitShape: customShape,
      harvestDesc: `Trái ${customName.trim()} chín mọng trĩu cành, hương vị thơm ngon tuyệt hảo`,
      isCustom: true
    };

    const updated = [...fruitList, newCrop];
    setFruitList(updated);
    setSelectedFruitId(newCrop.id);
    setIsCustomModalOpen(false);

    try {
      const customOnly = updated.filter((f) => f.isCustom);
      localStorage.setItem('smart_farm_custom_crops', JSON.stringify(customOnly));
    } catch {
      // ignore
    }
  };

  const getStageInfo = (pct: number) => {
    if (pct < 25) {
      return {
        stageNum: 1,
        name: '🌱 Giai Đoạn 1: Cây Con / Bén Rễ',
        desc: 'Cây non hấp thụ dưỡng chất tầng đất thịt, đâm chồi vươn mầm',
        fruitStatus: 'Chưa có quả (Đang nuôi rễ & chồi non)',
        color: 'text-lime-400',
        badgeBg: 'bg-lime-500/20 border-lime-500/40'
      };
    } else if (pct < 55) {
      return {
        stageNum: 2,
        name: '🌿 Giai Đoạn 2: Tán Lá & Trổ Nụ Hoa',
        desc: 'Tán lá vươn cao xum xuê, bắt đầu trổ các chùm hoa thơm ngát',
        fruitStatus: 'Đang trổ hoa thụ phấn',
        color: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 border-emerald-500/40'
      };
    } else if (pct < 80) {
      return {
        stageNum: 3,
        name: '🌸 Giai Đoạn 3: Ra Hoa & Nuôi Trái Non',
        desc: 'Trái non phát triển nhanh, cần cung cấp đủ Kali & độ ẩm',
        fruitStatus: '🍈 Trái non đang lớn nhanh từng ngày',
        color: 'text-amber-300',
        badgeBg: 'bg-amber-500/20 border-amber-500/40'
      };
    } else {
      return {
        stageNum: 4,
        name: '✨ Giai Đoạn 4: Trái Chín Rộ & Mùa Thu Hoạch',
        desc: `${currentFruitConfig.harvestDesc} (Đạt chuẩn VietGAP 100%)`,
        fruitStatus: `🏆 ${currentFruitConfig.emoji} Trái chín rộ trĩu cành - Sẵn sàng thu hoạch!`,
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/30 border-amber-400'
      };
    }
  };

  const currentStage = getStageInfo(growthProgress);

  // -----------------------------------------------------------------
  // 🌟 ARTISAN BOTANICAL ORCHARD ENGINE (NINTENDO / GHIBLI STYLIZED)
  // -----------------------------------------------------------------

  const createBotanicalFruitMesh = (
    cfg: FruitConfig,
    isRipe: boolean,
    materials: {
      sharedFruitMat: THREE.Material;
      sharedStemMat: THREE.Material;
      sharedLeafMat: THREE.Material;
    }
  ) => {
    const fruitGroup = new THREE.Group();

    // Natural Curved Hanging Peduncle Stalk
    const stalkGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.28, 8);
    const stalk = new THREE.Mesh(stalkGeo, materials.sharedStemMat);
    stalk.position.y = isRipe ? 0.22 : 0.14;
    stalk.rotation.z = 0.18;
    fruitGroup.add(stalk);

    if (cfg.fruitShape === 'DURIAN') {
      // 🍈 HYPER-REALISTIC DURIAN RI6 (Oval with 36+ radial sharp thorns & calyx)
      const durianBody = new THREE.Mesh(
        new THREE.SphereGeometry(isRipe ? 0.28 : 0.16, 16, 16),
        materials.sharedFruitMat
      );
      durianBody.scale.set(0.92, 1.35, 0.92);
      durianBody.castShadow = true;
      fruitGroup.add(durianBody);

      // Calyx Ring at the stem base
      const calyxRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.06, 0.02, 6, 12),
        materials.sharedStemMat
      );
      calyxRing.position.y = isRipe ? 0.32 : 0.18;
      calyxRing.rotation.x = Math.PI / 2;
      fruitGroup.add(calyxRing);

      // Radial array of Sharp Pyramidal Thorns
      const thornGeo = new THREE.ConeGeometry(0.028, 0.07, 4);
      const thornRows = 5;
      const thornsPerRow = 8;
      for (let r = 0; r < thornRows; r++) {
        const yOff = (r - (thornRows - 1) / 2) * (isRipe ? 0.11 : 0.06);
        const radiusAtRow = (isRipe ? 0.25 : 0.14) * Math.cos((yOff / (isRipe ? 0.38 : 0.22)) * (Math.PI / 2.2));
        for (let t = 0; t < thornsPerRow; t++) {
          const angle = (t * Math.PI * 2) / thornsPerRow + (r % 2) * (Math.PI / thornsPerRow);
          const thorn = new THREE.Mesh(thornGeo, materials.sharedFruitMat);
          thorn.position.set(Math.cos(angle) * radiusAtRow, yOff, Math.sin(angle) * radiusAtRow);
          thorn.lookAt(thorn.position.x * 2, thorn.position.y, thorn.position.z * 2);
          thorn.rotateX(Math.PI / 2);
          fruitGroup.add(thorn);
        }
      }

    } else if (cfg.fruitShape === 'CITRUS') {
      // 🍊 HYPER-REALISTIC CITRUS (Glossy sphere with star calyx & delicate stem leaf)
      const orange = new THREE.Mesh(
        new THREE.SphereGeometry(isRipe ? 0.23 : 0.14, 16, 16),
        materials.sharedFruitMat
      );
      orange.scale.set(1.04, 0.96, 1.04);
      orange.castShadow = true;
      fruitGroup.add(orange);

      // Star-shaped green calyx
      const calyxStar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.01, 0.02, 5),
        materials.sharedLeafMat
      );
      calyxStar.position.y = isRipe ? 0.21 : 0.13;
      fruitGroup.add(calyxStar);

      // Fresh green leaf on stalk
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 4), materials.sharedLeafMat);
      leaf.position.set(0.07, isRipe ? 0.24 : 0.15, 0);
      leaf.rotation.z = Math.PI / 3;
      leaf.scale.set(1, 1, 0.3);
      fruitGroup.add(leaf);

    } else if (cfg.fruitShape === 'COCONUT') {
      // 🥥 HYPER-REALISTIC COCONUT BUNCH (Smooth fibrous oval clusters)
      for (let c = 0; c < 3; c++) {
        const cAngle = (c * Math.PI * 2) / 3;
        const coconut = new THREE.Mesh(
          new THREE.SphereGeometry(isRipe ? 0.22 : 0.13, 12, 12),
          materials.sharedFruitMat
        );
        coconut.scale.set(0.9, 1.25, 0.9);
        coconut.position.set(Math.cos(cAngle) * 0.14, -c * 0.04, Math.sin(cAngle) * 0.14);
        coconut.castShadow = true;
        fruitGroup.add(coconut);
      }

    } else if (cfg.fruitShape === 'MANGO') {
      // 🥭 HYPER-REALISTIC GOLDEN MANGO (Teardrop curved fruit)
      const mango = new THREE.Mesh(
        new THREE.SphereGeometry(isRipe ? 0.24 : 0.13, 16, 16),
        materials.sharedFruitMat
      );
      mango.scale.set(0.85, 1.45, 0.72);
      mango.rotation.z = 0.22;
      mango.castShadow = true;
      fruitGroup.add(mango);

    } else if (cfg.fruitShape === 'DRAGONFRUIT') {
      // 🐉 HYPER-REALISTIC DRAGONFRUIT (Oval with curving green leafy scales)
      const df = new THREE.Mesh(
        new THREE.SphereGeometry(isRipe ? 0.24 : 0.14, 14, 14),
        materials.sharedFruitMat
      );
      df.scale.set(0.88, 1.42, 0.88);
      df.castShadow = true;
      fruitGroup.add(df);

      for (let sc = 0; sc < 8; sc++) {
        const scAngle = (sc * Math.PI * 2) / 8;
        const scale = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 4), materials.sharedLeafMat);
        scale.position.set(Math.cos(scAngle) * 0.18, ((sc % 3) - 1) * 0.1, Math.sin(scAngle) * 0.18);
        scale.rotation.x = Math.sin(scAngle) * 0.6;
        scale.rotation.z = -Math.cos(scAngle) * 0.6;
        fruitGroup.add(scale);
      }

    } else if (cfg.fruitShape === 'BANANA') {
      // 🍌 BANANA BUNCH
      const bananaGeo = new THREE.TorusGeometry(0.18, 0.04, 6, 10, Math.PI / 2.2);
      for (let bn = 0; bn < 4; bn++) {
        const bnAng = (bn * Math.PI) / 2 - Math.PI / 2;
        const banana = new THREE.Mesh(bananaGeo, materials.sharedFruitMat);
        banana.position.set(Math.cos(bnAng) * 0.14, (bn % 2) * 0.05, Math.sin(bnAng) * 0.14);
        banana.rotation.z = Math.PI / 4;
        banana.rotation.y = bnAng;
        banana.castShadow = true;
        fruitGroup.add(banana);
      }

    } else {
      // 🍎 Default / Apple / Grape / Watermelon
      const fruit = new THREE.Mesh(
        new THREE.SphereGeometry(isRipe ? 0.23 : 0.13, 16, 16),
        materials.sharedFruitMat
      );
      fruit.scale.set(1.05, 0.95, 1.05);
      fruit.castShadow = true;
      fruitGroup.add(fruit);
    }

    return fruitGroup;
  };

  const createArtisanBotanicalTree = (
    cfg: FruitConfig,
    growthScale: number,
    hasFlowers: boolean,
    hasFruits: boolean,
    isRipe: boolean,
    materials: {
      trunkMat: THREE.Material;
      foliageDarkMat: THREE.Material;
      foliageMidMat: THREE.Material;
      foliageLightMat: THREE.Material;
      flowerMat: THREE.Material;
      crateMat: THREE.Material;
      soilMoundMat: THREE.Material;
      sharedFruitMat: THREE.Material;
      sharedStemMat: THREE.Material;
      sharedLeafMat: THREE.Material;
    }
  ) => {
    const treeGroup = new THREE.Group();
    treeGroup.scale.set(growthScale, growthScale, growthScale);

    // -------------------------------------------------------------
    // SPECIAL ARCHITECTURE FOR COCONUT PALM (DỪA BẾN TRE)
    // -------------------------------------------------------------
    if (cfg.fruitShape === 'COCONUT') {
      // 1. Raised Mound
      const mound = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.1, 0.25, 16), materials.soilMoundMat);
      mound.position.y = 0.12;
      mound.receiveShadow = true;
      treeGroup.add(mound);

      // 2. Curved Ringed Palm Trunk
      const trunkSegments = 8;
      let currentHeight = 0.2;
      let currentRadius = 0.26;
      for (let s = 0; s < trunkSegments; s++) {
        const segHeight = 0.45;
        const nextRadius = currentRadius * 0.94;
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(nextRadius, currentRadius, segHeight, 12),
          materials.trunkMat
        );
        const curveOffset = Math.sin((s / trunkSegments) * Math.PI * 0.8) * 0.22;
        seg.position.set(curveOffset, currentHeight + segHeight / 2, 0);
        seg.rotation.z = -0.06 * Math.sin((s / trunkSegments) * Math.PI);
        seg.castShadow = true;
        treeGroup.add(seg);

        // Ring ring scar
        const ring = new THREE.Mesh(new THREE.TorusGeometry(currentRadius + 0.015, 0.012, 6, 12), materials.trunkMat);
        ring.position.set(curveOffset, currentHeight + segHeight, 0);
        ring.rotation.x = Math.PI / 2;
        treeGroup.add(ring);

        currentHeight += segHeight;
        currentRadius = nextRadius;
      }

      // 3. Arching Palm Fronds (8 Large Feathery Canopy Leaves)
      const frondCount = 8;
      for (let f = 0; f < frondCount; f++) {
        const fAngle = (f * Math.PI * 2) / frondCount;
        const frondGroup = new THREE.Group();
        frondGroup.position.set(0.15, currentHeight, 0);

        // Arching Rib
        const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 2.2, 8), materials.foliageDarkMat);
        rib.position.set(Math.cos(fAngle) * 0.9, 0.2, Math.sin(fAngle) * 0.9);
        rib.rotation.z = -Math.cos(fAngle) * 0.95;
        rib.rotation.x = Math.sin(fAngle) * 0.95;
        frondGroup.add(rib);

        // Palm Leaf Tufts along the rib
        for (let l = 0; l < 4; l++) {
          const lDist = 0.5 + l * 0.35;
          const leaflet = new THREE.Mesh(
            new THREE.ConeGeometry(0.22, 0.7, 4),
            l % 2 === 0 ? materials.foliageLightMat : materials.foliageMidMat
          );
          leaflet.scale.set(0.25, 1, 0.7);
          leaflet.position.set(Math.cos(fAngle) * lDist, 0.3 - l * 0.12, Math.sin(fAngle) * lDist);
          leaflet.rotation.y = fAngle;
          leaflet.rotation.z = -Math.cos(fAngle) * (1.1 + l * 0.1);
          leaflet.rotation.x = Math.sin(fAngle) * (1.1 + l * 0.1);
          frondGroup.add(leaflet);
        }

        treeGroup.add(frondGroup);
      }

      // 4. Clusters of Coconuts at Palm Crown
      if (hasFruits) {
        const coconutCluster = createBotanicalFruitMesh(cfg, isRipe, {
          sharedFruitMat: materials.sharedFruitMat,
          sharedStemMat: materials.sharedStemMat,
          sharedLeafMat: materials.sharedLeafMat
        });
        coconutCluster.position.set(0.12, currentHeight - 0.2, 0.05);
        treeGroup.add(coconutCluster);
      }

      return treeGroup;
    }

    // -------------------------------------------------------------
    // HYPER-REALISTIC BROADLEAF FRUIT TREE (SẦU RIÊNG, CAM, BƯỞI, XOÀI...)
    // -------------------------------------------------------------

    // 1. Organic Raised Garden Bed Mound
    const mound = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.25, 0.22, 16), materials.soilMoundMat);
    mound.position.y = 0.11;
    mound.receiveShadow = true;
    treeGroup.add(mound);

    // 4 Organic Curving Buttress Roots firmly gripping soil
    for (let r = 0; r < 4; r++) {
      const rAng = (r * Math.PI * 2) / 4 + Math.PI / 8;
      const root = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.85, 8), materials.trunkMat);
      root.position.set(Math.cos(rAng) * 0.38, 0.22, Math.sin(rAng) * 0.38);
      root.rotation.x = Math.sin(rAng) * 0.52;
      root.rotation.z = -Math.cos(rAng) * 0.52;
      root.castShadow = true;
      treeGroup.add(root);
    }

    // 2. Multi-Tier Organic Tapering Trunk with Natural Bark Grain
    const trunkBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 1.1, 14), materials.trunkMat);
    trunkBase.position.y = 0.65;
    trunkBase.rotation.z = 0.04;
    trunkBase.castShadow = true;
    treeGroup.add(trunkBase);

    const trunkMid = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 1.0, 12), materials.trunkMat);
    trunkMid.position.set(0.04, 1.6, 0.02);
    trunkMid.rotation.z = -0.06;
    trunkMid.castShadow = true;
    treeGroup.add(trunkMid);

    // 3. Spreading Natural Scaffolding Boughs (5 Primary Structural Branches)
    const boughConfigs = [
      { angle: 0.3, y: 1.85, length: 1.45, pitch: 0.68, size: 0.12 },
      { angle: 1.6, y: 1.95, length: 1.55, pitch: 0.62, size: 0.11 },
      { angle: 2.9, y: 2.1, length: 1.4, pitch: 0.72, size: 0.12 },
      { angle: 4.2, y: 2.0, length: 1.6, pitch: 0.65, size: 0.13 },
      { angle: 5.4, y: 2.2, length: 1.35, pitch: 0.58, size: 0.10 }
    ];

    boughConfigs.forEach((b) => {
      const bough = new THREE.Mesh(new THREE.CylinderGeometry(0.06, b.size, b.length, 8), materials.trunkMat);
      const bx = Math.cos(b.angle) * 0.52;
      const bz = Math.sin(b.angle) * 0.52;
      bough.position.set(bx, b.y, bz);
      bough.rotation.z = -Math.cos(b.angle) * b.pitch;
      bough.rotation.x = Math.sin(b.angle) * b.pitch;
      bough.castShadow = true;
      treeGroup.add(bough);
    });

    // 4. Hyper-Lush Stratified Canopy Clouds (9 Smooth-Shaded Organic Foliage Clumps)
    // Uses Smooth Icosahedron Spheres with multi-layer canopy depth & sun-kissed highlight tips
    const canopyClumps = [
      // Top Crown (Bright vibrant growth tips)
      { x: 0.05, y: 3.4, z: 0.02, rx: 1.35, ry: 1.1, rz: 1.35, mat: materials.foliageLightMat },
      { x: -0.2, y: 3.65, z: 0.15, rx: 0.9, ry: 0.85, rz: 0.9, mat: materials.foliageLightMat },
      // Mid Canopy Major Layers
      { x: 1.15, y: 2.65, z: 0.45, rx: 1.25, ry: 1.0, rz: 1.2, mat: materials.foliageMidMat },
      { x: -1.1, y: 2.7, z: -0.35, rx: 1.2, ry: 0.95, rz: 1.15, mat: materials.foliageMidMat },
      { x: 0.35, y: 2.85, z: -1.15, rx: 1.15, ry: 0.95, rz: 1.15, mat: materials.foliageMidMat },
      { x: -0.45, y: 2.5, z: 1.1, rx: 1.1, ry: 0.9, rz: 1.05, mat: materials.foliageMidMat },
      // Underside Deep Chlorophyll Shaded Tufts
      { x: 0.75, y: 2.05, z: -0.55, rx: 0.95, ry: 0.75, rz: 0.9, mat: materials.foliageDarkMat },
      { x: -0.65, y: 2.0, z: 0.6, rx: 0.9, ry: 0.7, rz: 0.85, mat: materials.foliageDarkMat },
      { x: 0.1, y: 2.2, z: 0.8, rx: 0.85, ry: 0.7, rz: 0.8, mat: materials.foliageDarkMat }
    ];

    canopyClumps.forEach((c) => {
      const clump = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 16, 16),
        c.mat
      );
      clump.position.set(c.x, c.y, c.z);
      clump.scale.set(c.rx, c.ry, c.rz);
      clump.castShadow = true;
      clump.receiveShadow = true;
      treeGroup.add(clump);
    });

    // 5. Delicate 5-Petal Spring Blossoms (White & Golden Anther)
    if (hasFlowers && !isRipe) {
      for (let fl = 0; fl < 8; fl++) {
        const flAngle = (fl * Math.PI * 2) / 8;
        const flMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), materials.flowerMat);
        flMesh.position.set(Math.cos(flAngle) * 1.35, 2.1 + (fl % 3) * 0.35, Math.sin(flAngle) * 1.35);
        treeGroup.add(flMesh);
      }
    }

    // 6. Bountiful Ripe Fruits Hanging Underneath Foliage
    if (hasFruits) {
      const fruitCount = isRipe ? 7 : 4;
      const fruitSpots = [
        { x: 0.95, y: 1.75, z: 0.45 },
        { x: -0.85, y: 1.8, z: -0.35 },
        { x: 0.25, y: 1.95, z: -0.9 },
        { x: -0.45, y: 1.7, z: 0.85 },
        { x: 0.65, y: 1.65, z: -0.65 },
        { x: -0.3, y: 1.95, z: -0.7 },
        { x: 0.4, y: 1.85, z: 0.75 }
      ];

      for (let f = 0; f < fruitCount; f++) {
        const spot = fruitSpots[f % fruitSpots.length];
        const fruitMesh = createBotanicalFruitMesh(cfg, isRipe, {
          sharedFruitMat: materials.sharedFruitMat,
          sharedStemMat: materials.sharedStemMat,
          sharedLeafMat: materials.sharedLeafMat
        });
        fruitMesh.position.set(spot.x, spot.y, spot.z);
        treeGroup.add(fruitMesh);
      }

      // Wooden Harvest Crate Full of Ripe Fresh Fruit on the Ground
      if (isRipe && growthScale > 0.8) {
        const crate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.34, 0.48), materials.crateMat);
        crate.position.set(0.72, 0.22, 0.72);
        crate.rotation.y = Math.PI / 4.5;
        crate.castShadow = true;
        treeGroup.add(crate);

        // 3 Freshly Harvested Ripe Fruits inside crate
        for (let cf = 0; cf < 3; cf++) {
          const cFruit = createBotanicalFruitMesh(cfg, true, {
            sharedFruitMat: materials.sharedFruitMat,
            sharedStemMat: materials.sharedStemMat,
            sharedLeafMat: materials.sharedLeafMat
          });
          cFruit.scale.set(0.7, 0.7, 0.7);
          cFruit.position.set(0.6 + cf * 0.12, 0.45, 0.72);
          treeGroup.add(cFruit);
        }
      }
    }

    return treeGroup;
  };

  const createBotanicalRicePaddy = (
    growthScale: number,
    isRipeCrop: boolean,
    riceMat: THREE.Material,
    grainMat: THREE.Material
  ) => {
    const riceGroup = new THREE.Group();
    riceGroup.scale.set(growthScale, growthScale, growthScale);

    for (let b = 0; b < 6; b++) {
      const bAngle = (b * Math.PI * 2) / 6;
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.04, 1.25, 3), riceMat);
      blade.position.set(Math.cos(bAngle) * 0.09, 0.62, Math.sin(bAngle) * 0.09);

      const droop = isRipeCrop ? 0.58 : 0.25;
      blade.rotation.x = Math.sin(bAngle) * droop;
      blade.rotation.z = -Math.cos(bAngle) * droop;
      riceGroup.add(blade);

      if (growthScale > 0.55) {
        const panicle = new THREE.Mesh(new THREE.SphereGeometry(isRipeCrop ? 0.065 : 0.035, 4, 4), grainMat);
        panicle.position.set(Math.cos(bAngle) * 0.28, 1.18, Math.sin(bAngle) * 0.28);
        panicle.scale.set(1, 2.4, 1);
        riceGroup.add(panicle);
      }
    }

    return riceGroup;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNightMode ? 0x060913 : 0x0f172a);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 90);
    camera.position.set(17, 13, 17);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isTurboMode,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isTurboMode ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = !isTurboMode;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // --- 2. OrbitControls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;
    controls.target.set(0, 1.2, 0);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.6;
    controlsRef.current = controls;

    // --- 3. Studio Lighting (Warm Sun & Rich Emerald Depth) ---
    const hemiLight = new THREE.HemisphereLight(
      isNightMode ? 0x312e81 : 0xe0f2fe,
      isNightMode ? 0x030712 : 0x1c1917,
      isNightMode ? 0.7 : 1.3
    );
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(
      isNightMode ? 0xa5b4fc : isRaining ? 0x93c5fd : 0xffedd5,
      isNightMode ? 0.9 : isRaining ? 1.1 : 2.4
    );
    sunLight.position.set(16, 22, 14);
    if (!isTurboMode) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 512;
      sunLight.shadow.mapSize.height = 512;
    }
    scene.add(sunLight);

    const beaconLight = new THREE.PointLight(0x38bdf8, 1.8, 12);
    beaconLight.position.set(0, 4.2, 0);
    scene.add(beaconLight);

    // --- 4. Island Terrain & Layered Beds ---
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    const islandW = 14.5;
    const islandL = 14.5;
    const topsoilH = 0.8;
    const subsoilH = 1.5;
    const waterTableH = 0.9;

    const topsoilMat = new THREE.MeshStandardMaterial({
      color: isNDVILayer
        ? 0x10b981 // Multispectral Emerald NDVI Heatmap
        : moisturePercent < 35
        ? 0x854d0e
        : moisturePercent > 70
        ? 0x064e3b
        : 0x15803d,
      roughness: isNDVILayer ? 0.4 : 0.8,
      flatShading: true
    });

    const topsoilMesh = new THREE.Mesh(new THREE.BoxGeometry(islandW, topsoilH, islandL), topsoilMat);
    islandGroup.add(topsoilMesh);

    const subsoilMat = new THREE.MeshStandardMaterial({ color: 0x4a2e16, roughness: 0.9, flatShading: true });
    const subsoilMesh = new THREE.Mesh(new THREE.BoxGeometry(islandW * 0.98, subsoilH, islandL * 0.98), subsoilMat);
    subsoilMesh.position.y = -topsoilH / 2 - subsoilH / 2;
    islandGroup.add(subsoilMesh);

    const bedrockMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const bedrockMesh = new THREE.Mesh(new THREE.BoxGeometry(islandW * 0.94, waterTableH, islandL * 0.94), bedrockMat);
    bedrockMesh.position.y = -topsoilH / 2 - subsoilH - waterTableH / 2;
    islandGroup.add(bedrockMesh);

    // Irrigation canals
    const canalMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.1, metalness: 0.3 });
    const canal1 = new THREE.Mesh(new THREE.BoxGeometry(islandW * 0.92, 0.1, 0.85), canalMat);
    canal1.position.set(0, topsoilH / 2 + 0.01, 5.4);
    islandGroup.add(canal1);

    const canal2 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.1, islandL * 0.92), canalMat);
    canal2.position.set(-5.4, topsoilH / 2 + 0.01, 0);
    islandGroup.add(canal2);

    const pipeGroup = new THREE.Group();
    islandGroup.add(pipeGroup);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });

    for (let pz = -4.2; pz <= 4.2; pz += 4.2) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 9, 6), pipeMat);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(0, topsoilH / 2 + 0.03, pz);
      pipeGroup.add(pipe);
    }

    // --- 5. RENDER BOTANICAL ORCHARD CROPS ---
    const cropGroup = new THREE.Group();
    islandGroup.add(cropGroup);

    const swayingObjects: Array<{ mesh: THREE.Object3D; baseRotZ: number; speed: number; offset: number }> = [];

    const growthScale = 0.28 + (growthProgress / 100) * 0.82;
    const hasFlowers = growthProgress >= 40;
    const hasFruits = growthProgress >= 58;
    const isRipe = growthProgress >= 80;

    const sharedMaterials = {
      trunkMat: new THREE.MeshStandardMaterial({
        color: currentFruitConfig.trunkColorHex,
        roughness: 0.85,
        flatShading: true
      }),
      foliageDarkMat: new THREE.MeshStandardMaterial({
        color: 0x064e3b, // Deep Shadow Green
        roughness: 0.7,
        flatShading: true
      }),
      foliageMidMat: new THREE.MeshStandardMaterial({
        color: isNightMode ? 0x065f46 : currentFruitConfig.foliageColorHex, // Midtone Emerald
        roughness: 0.6,
        flatShading: true
      }),
      foliageLightMat: new THREE.MeshStandardMaterial({
        color: isNightMode ? 0x0d9488 : currentFruitConfig.foliageTipColorHex, // Sunlit Lime/Teal
        roughness: 0.5,
        flatShading: true
      }),
      flowerMat: new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3, flatShading: true }),
      crateMat: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9, flatShading: true }),
      soilMoundMat: new THREE.MeshStandardMaterial({ color: 0x382012, roughness: 0.95, flatShading: true }),
      sharedFruitMat: new THREE.MeshStandardMaterial({
        color: isRipe ? currentFruitConfig.fruitColorHex : 0x65a30d,
        roughness: currentFruitConfig.fruitRoughness,
        metalness: 0.08,
        flatShading: true
      }),
      sharedStemMat: new THREE.MeshStandardMaterial({ color: 0x27170c, roughness: 0.9 }),
      sharedLeafMat: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, flatShading: true })
    };

    if (currentFruitConfig.fruitShape === 'GRAIN') {
      const riceGreenMat = new THREE.MeshStandardMaterial({ color: isRipe ? 0x84cc16 : 0x16a34a, roughness: 0.6, flatShading: true });
      const riceGrainMat = new THREE.MeshStandardMaterial({ color: isRipe ? 0xfacc15 : 0xa3e635, roughness: 0.4, flatShading: true });

      for (let rx = -5.0; rx <= 5.0; rx += 1.6) {
        for (let rz = -4.8; rz <= 3.8; rz += 1.6) {
          if (Math.abs(rx) < 1.4 && Math.abs(rz) < 1.4) continue;

          const clump = createBotanicalRicePaddy(growthScale, isRipe, riceGreenMat, riceGrainMat);
          clump.position.set(rx, topsoilH / 2, rz);
          cropGroup.add(clump);
          swayingObjects.push({ mesh: clump, baseRotZ: 0, speed: 2.2, offset: (rx + rz) * 0.5 });
        }
      }
    } else {
      // 6 Gorgeous Botanical Orchard Trees in 2 Parallel Rows
      const treePositions = [
        [-3.6, -3.0], [0, -3.0], [3.6, -3.0],
        [-3.6, 2.6],  [0, 2.6],  [3.6, 2.6]
      ];

      treePositions.forEach(([tx, tz], i) => {
        const tree = createArtisanBotanicalTree(
          currentFruitConfig,
          growthScale,
          hasFlowers,
          hasFruits,
          isRipe,
          sharedMaterials
        );
        tree.position.set(tx, topsoilH / 2, tz);
        cropGroup.add(tree);
        swayingObjects.push({ mesh: tree, baseRotZ: 0, speed: 1.1, offset: i * 0.6 });
      });
    }

    // --- 6. IOT WEATHER TOWER ---
    const towerGroup = new THREE.Group();
    towerGroup.position.set(0, topsoilH / 2, 0);
    islandGroup.add(towerGroup);

    const baseBlock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.95, 0.35, 6),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    baseBlock.position.y = 0.18;
    towerGroup.add(baseBlock);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 3.4, 6),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 })
    );
    mast.position.y = 1.85;
    towerGroup.add(mast);

    const anemometerGroup = new THREE.Group();
    anemometerGroup.position.set(0, 3.55, 0);
    towerGroup.add(anemometerGroup);

    const cupMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
    for (let c = 0; c < 3; c++) {
      const cAngle = (c * Math.PI * 2) / 3;
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 3), cupMat);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = cAngle;
      arm.position.set(Math.cos(cAngle) * 0.22, 0, Math.sin(cAngle) * 0.22);
      anemometerGroup.add(arm);
    }

    // --- 7. AUTONOMOUS DRONE ---
    const droneGroup = new THREE.Group();
    droneGroup.position.set(3, 4.5, 3);
    scene.add(droneGroup);

    const droneBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.1, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 })
    );
    droneGroup.add(droneBody);

    const laserCone = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, 4.0, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    );
    laserCone.position.set(0, -2.0, 0);
    droneGroup.add(laserCone);
    laserCone.visible = isDroneScanning;

    // --- 8. PARTICLES ---
    const sprayCount = isTurboMode ? 100 : 250;
    const sprayGeo = new THREE.BufferGeometry();
    const sprayPos = new Float32Array(sprayCount * 3);
    const sprayVelocities: Array<{ angle: number; speed: number; radius: number; heightProgress: number }> = [];

    for (let sp = 0; sp < sprayCount; sp++) {
      sprayPos[sp * 3] = 0;
      sprayPos[sp * 3 + 1] = 2.8;
      sprayPos[sp * 3 + 2] = 0;
      sprayVelocities.push({
        angle: Math.random() * Math.PI * 2,
        speed: 0.05 + Math.random() * 0.08,
        radius: 0,
        heightProgress: Math.random()
      });
    }
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
    const sprayParticles = new THREE.Points(
      sprayGeo,
      new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.18, transparent: true, opacity: 0.8 })
    );
    scene.add(sprayParticles);
    sprayParticles.visible = effectiveWatering;

    const rainCount = isTurboMode ? 150 : 350;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let r = 0; r < rainCount; r++) {
      rainPos[r * 3] = (Math.random() - 0.5) * 20;
      rainPos[r * 3 + 1] = Math.random() * 18;
      rainPos[r * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainSystem = new THREE.Points(
      rainGeo,
      new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.1, transparent: true, opacity: 0.7 })
    );
    scene.add(rainSystem);
    rainSystem.visible = isRaining;

    // --- 9. RENDER LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (targetCamPosRef.current && targetLookAtRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.08);
        controls.target.lerp(targetLookAtRef.current, 0.08);
        if (camera.position.distanceTo(targetCamPosRef.current) < 0.1) {
          targetCamPosRef.current = null;
          targetLookAtRef.current = null;
        }
      }

      controls.update();

      anemometerGroup.rotation.y += (weather?.wind_speed_kmh || 12) * 0.005;

      swayingObjects.forEach((item) => {
        item.mesh.rotation.z = item.baseRotZ + Math.sin(elapsedTime * item.speed + item.offset) * 0.035;
      });

      const droneAngle = elapsedTime * 0.45;
      droneGroup.position.x = Math.cos(droneAngle) * 5.2;
      droneGroup.position.z = Math.sin(droneAngle) * 5.2;
      droneGroup.position.y = 4.2 + Math.sin(elapsedTime * 1.2) * 0.2;
      droneGroup.rotation.y = -droneAngle + Math.PI / 2;

      if (activeLayer === 'CROPS') {
        cropGroup.visible = true;
        subsoilMesh.visible = false;
        bedrockMesh.visible = false;
        pipeGroup.visible = false;
      } else if (activeLayer === 'SOIL_STRATA') {
        cropGroup.visible = false;
        subsoilMesh.visible = true;
        bedrockMesh.visible = true;
        pipeGroup.visible = false;
      } else if (activeLayer === 'IRRIGATION') {
        cropGroup.visible = false;
        subsoilMesh.visible = true;
        bedrockMesh.visible = true;
        pipeGroup.visible = true;
      } else {
        cropGroup.visible = true;
        subsoilMesh.visible = true;
        bedrockMesh.visible = true;
        pipeGroup.visible = true;
      }

      if (effectiveWatering) {
        sprayParticles.visible = true;
        const positions = sprayGeo.attributes.position.array as Float32Array;
        for (let sp = 0; sp < sprayCount; sp++) {
          const v = sprayVelocities[sp];
          v.radius += v.speed;
          v.heightProgress += 0.02;

          if (v.radius > 6.0 || v.heightProgress > 1) {
            v.radius = 0;
            v.heightProgress = 0;
            v.angle = (v.angle + 0.15) % (Math.PI * 2);
          }

          positions[sp * 3] = Math.cos(v.angle + elapsedTime * 0.5) * v.radius;
          positions[sp * 3 + 1] = Math.max(topsoilH / 2 + 0.05, 2.8 + Math.sin(v.heightProgress * Math.PI) * 1.4 - v.radius * 0.45);
          positions[sp * 3 + 2] = Math.sin(v.angle + elapsedTime * 0.5) * v.radius;
        }
        sprayGeo.attributes.position.needsUpdate = true;
      } else {
        sprayParticles.visible = false;
      }

      if (isRaining) {
        rainSystem.visible = true;
        const rPositions = rainGeo.attributes.position.array as Float32Array;
        for (let r = 0; r < rainCount; r++) {
          rPositions[r * 3 + 1] -= 0.4;
          if (rPositions[r * 3 + 1] < 0) {
            rPositions[r * 3 + 1] = 16;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
      } else {
        rainSystem.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [
    selectedFruitId,
    fruitList,
    moisturePercent,
    isNightMode,
    activeLayer,
    effectiveWatering,
    isRaining,
    autoRotate,
    growthProgress,
    isDroneScanning,
    isTurboMode,
    isNDVILayer
  ]);

  const smoothFlyTo = (pos: THREE.Vector3, lookAt: THREE.Vector3) => {
    targetCamPosRef.current = pos;
    targetLookAtRef.current = lookAt;
  };

  const setCameraView = (view: 'ISO' | 'TOP' | 'CLOSEUP' | 'STRATA' | 'DRONE') => {
    if (view === 'ISO') {
      smoothFlyTo(new THREE.Vector3(17, 13, 17), new THREE.Vector3(0, 1.2, 0));
    } else if (view === 'TOP') {
      smoothFlyTo(new THREE.Vector3(0, 24, 0.1), new THREE.Vector3(0, 0, 0));
    } else if (view === 'CLOSEUP') {
      smoothFlyTo(new THREE.Vector3(4.5, 2.8, 4.5), new THREE.Vector3(0, 1.4, 0));
    } else if (view === 'STRATA') {
      smoothFlyTo(new THREE.Vector3(14, 0.2, 14), new THREE.Vector3(0, -1.0, 0));
    } else if (view === 'DRONE') {
      smoothFlyTo(new THREE.Vector3(7, 6, 7), new THREE.Vector3(0, 1.0, 0));
    }
  };

  return (
    <section aria-label="Không gian số 3D thửa ruộng" className="bg-stone-950 border border-emerald-500/40 rounded-3xl p-6 text-stone-100 shadow-2xl space-y-5 relative overflow-hidden font-sans">
      {/* Ambient background glow accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-400 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-emerald-500/30 shrink-0">
            <span className="text-2xl">{currentFruitConfig.emoji}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                Không Gian Số 3D • Vườn Cây Ăn Trái Phong Cách Ghibli Tuyệt Đẹp
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                GHIBLI BOTANICAL ART
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Thửa: <strong className="text-white">{plotName}</strong> • Giống cây:{' '}
              <strong className="text-emerald-400 font-bold">{currentFruitConfig.nameVi}</strong> • Đất:{' '}
              <strong className="text-stone-300">{soilType}</strong> • Quy mô:{' '}
              <strong>{areaM2.toLocaleString()} m²</strong>
            </p>
          </div>
        </div>

        {/* 3D Action Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Turbo 60 FPS Toggle Button */}
          <button
            type="button"
            onClick={() => setIsTurboMode(!isTurboMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 min-h-[36px] ${
              isTurboMode
                ? 'bg-gradient-to-r from-amber-500 to-emerald-600 text-stone-950 border-amber-300 shadow-md shadow-emerald-500/20'
                : 'bg-stone-900 text-stone-300 border-stone-800'
            }`}
            title="Bật/tắt tăng tốc 60 FPS siêu mượt"
          >
            <BoltIcon className="w-4 h-4 text-stone-950 fill-current" />
            <span>{isTurboMode ? '⚡ 60 FPS Siêu Mượt' : '✨ Ultra HD'}</span>
          </button>

          {/* Layer Filter */}
          <div className="flex bg-stone-900/90 p-1 rounded-xl border border-stone-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveLayer('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeLayer === 'ALL' ? 'bg-emerald-700 text-white shadow' : 'text-stone-400 hover:text-white'
              }`}
            >
              Toàn cảnh
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('CROPS')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeLayer === 'CROPS' ? 'bg-emerald-700 text-white shadow' : 'text-stone-400 hover:text-white'
              }`}
            >
              Cây trồng
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('SOIL_STRATA')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeLayer === 'SOIL_STRATA' ? 'bg-emerald-700 text-white shadow' : 'text-stone-400 hover:text-white'
              }`}
            >
              Tầng đất
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('IRRIGATION')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeLayer === 'IRRIGATION' ? 'bg-emerald-700 text-white shadow' : 'text-stone-400 hover:text-white'
              }`}
            >
              Ống tưới
            </button>
          </div>

          {/* Drone Toggle */}
          <button
            type="button"
            onClick={() => setIsDroneScanning(!isDroneScanning)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 min-h-[36px] ${
              isDroneScanning
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                : 'bg-stone-900 text-stone-400 border-stone-800'
            }`}
          >
            <BoltIcon className="w-3.5 h-3.5" />
            <span>Drone AI</span>
          </button>

          {/* NDVI Multispectral Layer Toggle */}
          <button
            type="button"
            onClick={() => setIsNDVILayer(!isNDVILayer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 min-h-[36px] ${
              isNDVILayer
                ? 'bg-purple-950 text-purple-300 border-purple-400 ring-2 ring-purple-400/40 shadow-lg shadow-purple-950/30'
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
            }`}
            title="Bật/tắt lớp quang phổ viễn thám NDVI sức khỏe cây trồng"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-purple-300" />
            <span>{isNDVILayer ? '🛰️ Lớp NDVI (Bật)' : '🛰️ Viễn Thám NDVI'}</span>
          </button>

          {/* Night Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsNightMode(!isNightMode)}
            aria-label="Chuyển chế độ ngày/đêm"
            className={`p-2 rounded-xl text-xs font-bold border transition-all min-h-[36px] min-w-[36px] flex items-center justify-center ${
              isNightMode ? 'bg-indigo-950 text-indigo-300 border-indigo-600/50' : 'bg-stone-900 text-amber-300 border-stone-800'
            }`}
          >
            {isNightMode ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
          </button>

          {/* Auto Rotate Toggle */}
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 min-h-[36px] ${
              autoRotate ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50' : 'bg-stone-900 text-stone-400 border-stone-800'
            }`}
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{autoRotate ? 'Xoay 360°' : 'Khóa góc'}</span>
          </button>

          {/* 3D Sprinkler Test Toggle */}
          <button
            type="button"
            onClick={() => setLocalWatering(!localWatering)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 min-h-[36px] ${
              effectiveWatering ? 'bg-sky-500 text-stone-950 border-sky-400 font-black shadow-lg shadow-sky-500/30' : 'bg-stone-900 text-sky-400 border-stone-800'
            }`}
          >
            <PlayIcon className="w-3.5 h-3.5 fill-current" />
            <span>{effectiveWatering ? 'Đang Phun 3D' : 'Bật Béc Phun 3D'}</span>
          </button>
        </div>
      </div>

      {/* FRUIT & CROP SELECTOR BAR WITH CUSTOM CREATOR BUTTON */}
      <div className="bg-stone-900/95 p-3.5 rounded-2xl border border-stone-800 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <SparklesIcon className="w-4 h-4" /> Chọn Giống Cây & Màu Quả:
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {fruitList.map((fItem) => {
            const isSelected = selectedFruitId === fItem.id;
            return (
              <button
                key={fItem.id}
                type="button"
                onClick={() => setSelectedFruitId(fItem.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-600 text-stone-950 border-amber-300 ring-2 ring-amber-400/40 shadow-lg scale-105'
                    : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 border-stone-800 hover:border-stone-700'
                }`}
              >
                <span>{fItem.emoji}</span>
                <span>{fItem.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 shadow-md border border-purple-400/50"
          >
            <PlusIcon className="w-4 h-4" />
            <span>+ Tạo Giống Cây / Màu Khác</span>
          </button>
        </div>
      </div>

      {/* Interactive Growth Lifecycle Timeline Bar */}
      <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800/80 space-y-3 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
              Chu Kỳ Sinh Trưởng & Ra Trái 3D:
            </span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${currentStage.badgeBg} ${currentStage.color}`}>
              {currentStage.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTimeLapsePlaying(!isTimeLapsePlaying)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md ${
                isTimeLapsePlaying
                  ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400 animate-pulse'
                  : 'bg-emerald-800 hover:bg-emerald-700 text-white'
              }`}
            >
              {isTimeLapsePlaying ? <PauseIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-3.5 h-3.5 fill-current" />}
              <span>{isTimeLapsePlaying ? 'Dừng Tua Nhanh' : '▶️ Tua Nhanh Vòng Đời'}</span>
            </button>

            <button
              type="button"
              onClick={() => setGrowthProgress(calculateInitialProgress())}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold border border-stone-700"
            >
              Đồng bộ Mùa Vụ
            </button>
          </div>
        </div>

        {/* Growth Timeline Slider */}
        <div className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="range"
              min="5"
              max="100"
              value={growthProgress}
              onChange={(e) => {
                setIsTimeLapsePlaying(false);
                setGrowthProgress(parseInt(e.target.value));
              }}
              className="w-full h-2.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Quick Stage Jump Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setIsTimeLapsePlaying(false); setGrowthProgress(15); }}
              className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                growthProgress < 25
                  ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold ring-1 ring-emerald-500 shadow-md'
                  : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}
            >
              <div className="font-black text-lime-400">🌱 1. Cây con</div>
              <div className="text-[10px] text-stone-400 mt-0.5">0 - 25 ngày (Bén rễ)</div>
            </button>

            <button
              type="button"
              onClick={() => { setIsTimeLapsePlaying(false); setGrowthProgress(40); }}
              className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                growthProgress >= 25 && growthProgress < 55
                  ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold ring-1 ring-emerald-500 shadow-md'
                  : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}
            >
              <div className="font-black text-emerald-400">🌿 2. Đẻ nhánh</div>
              <div className="text-[10px] text-stone-400 mt-0.5">25 - 55 ngày (Nhú hoa)</div>
            </button>

            <button
              type="button"
              onClick={() => { setIsTimeLapsePlaying(false); setGrowthProgress(68); }}
              className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                growthProgress >= 55 && growthProgress < 80
                  ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold ring-1 ring-emerald-500 shadow-md'
                  : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}
            >
              <div className="font-black text-amber-300">🌸 3. Ra hoa / Trái non</div>
              <div className="text-[10px] text-stone-400 mt-0.5">55 - 80 ngày (Lớn nhanh)</div>
            </button>

            <button
              type="button"
              onClick={() => { setIsTimeLapsePlaying(false); setGrowthProgress(95); }}
              className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                growthProgress >= 80
                  ? 'bg-amber-950/80 border-amber-500 text-white font-bold ring-1 ring-amber-500 shadow-md'
                  : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}
            >
              <div className="font-black text-amber-400">✨ 4. Trái chín & Thu hoạch</div>
              <div className="text-[10px] text-stone-400 mt-0.5">80 - 100+ ngày (Chín rộ)</div>
            </button>
          </div>
        </div>

        {/* Current Stage Description Banner */}
        <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-stone-300">{currentStage.desc}</span>
          </div>
          <div className="shrink-0 font-bold text-amber-300 bg-stone-900 px-3 py-1 rounded-lg border border-stone-700">
            {currentStage.fruitStatus}
          </div>
        </div>
      </div>

      {/* Three.js 3D Viewport */}
      <div className="relative w-full h-[460px] sm:h-[540px] rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-2xl flex items-center justify-center">
        {/* Sky / Weather State Pill */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          {isRaining ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/85 border border-sky-500/50 rounded-full text-xs font-black text-sky-300 backdrop-blur-md shadow-xl">
              <CloudIcon className="w-4 h-4 animate-bounce" />
              <span>MƯA VỆ TINH REAL-TIME (HẠT MƯA 3D ĐANG RƠI)</span>
            </div>
          ) : isNightMode ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/85 border border-indigo-500/50 rounded-full text-xs font-black text-indigo-300 backdrop-blur-md shadow-xl">
              <MoonIcon className="w-4 h-4" />
              <span>BAN ĐÊM • DRONE & CẢM BIẾN IOT PHÁT QUANG</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/85 border border-amber-500/50 rounded-full text-xs font-black text-amber-300 backdrop-blur-md shadow-xl">
              <SunIcon className="w-4 h-4 text-amber-400" />
              <span>NẮNG RÁO • QUANG HỢP {growthProgress}%</span>
            </div>
          )}
        </div>

        {/* Floating 3D Telemetry HUD */}
        <div className="absolute top-4 right-4 z-20 bg-stone-900/90 border border-stone-700/80 rounded-2xl p-4 text-xs space-y-2 shadow-2xl backdrop-blur-md min-w-[185px]">
          <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider flex items-center justify-between">
            <span>Cảm biến Digital Twin</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-300 font-medium">Giống cây:</span>
            <strong className="text-amber-400 font-black">{currentFruitConfig.emoji} {currentFruitConfig.label}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-300 font-medium">Tiến độ sinh trưởng:</span>
            <strong className="text-emerald-400 font-black">{growthProgress}%</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-300 font-medium">Độ ẩm tầng đất:</span>
            <strong className={`font-black ${moisturePercent < 35 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {moisturePercent}%
            </strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-300 font-medium">Độ pH đất:</span>
            <strong className="text-emerald-400 font-black">{soilPh} pH</strong>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-stone-800">
            <span className="text-stone-400 text-[10px]">Năng suất dự kiến:</span>
            <span className="font-mono text-emerald-300 font-bold">
              {Math.round((targetYield * growthProgress) / 100)} / {targetYield} kg
            </span>
          </div>
        </div>

        {/* Camera Quick-View Angle Controls Bar */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-stone-950/85 p-1.5 rounded-2xl border border-stone-800 backdrop-blur-md">
          <span className="text-[10px] font-bold text-stone-400 px-1.5 flex items-center gap-1">
            <CameraIcon className="w-3.5 h-3.5" /> Góc quay:
          </span>
          <button
            type="button"
            onClick={() => setCameraView('ISO')}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-[11px] font-bold transition-all"
          >
            3D Toàn Cảnh
          </button>
          <button
            type="button"
            onClick={() => setCameraView('CLOSEUP')}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-[11px] font-bold transition-all"
          >
            Cận Cảnh Trái Cây
          </button>
          <button
            type="button"
            onClick={() => setCameraView('DRONE')}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-[11px] font-bold transition-all"
          >
            Góc Drone AI
          </button>
          <button
            type="button"
            onClick={() => setCameraView('STRATA')}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-[11px] font-bold transition-all"
          >
            Mặt Cắt Đất
          </button>
          <button
            type="button"
            onClick={() => setCameraView('TOP')}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-[11px] font-bold transition-all"
          >
            Flycam Top
          </button>
        </div>

        {/* Instruction Badge */}
        <div className="absolute bottom-4 right-4 z-20 text-[11px] text-stone-400 font-medium bg-stone-950/85 px-3 py-1.5 rounded-xl border border-stone-800 backdrop-blur-md hidden sm:block">
          🖱️ Giữ chuột xoay 360° • Phong cách vườn cây Ghibli tuyệt đẹp 🍃
        </div>

        {/* Three.js Container */}
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      {/* CUSTOM CROP CREATOR MODAL */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-stone-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 text-stone-100 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black shadow-md">
                  <SwatchIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Studio Tùy Biến Giống Cây & Màu Quả 3D</h3>
                  <p className="text-xs text-stone-400">Tự do tạo bất kỳ loại cây nào bạn muốn trong mô hình</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomCrop} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block text-stone-300 mb-1">Tên loại cây / Quả</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Vải Thiều Lục Ngạn, Chanh Dây..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 px-3.5 py-2.5 rounded-xl text-white font-bold focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1">Biểu tượng</label>
                  <input
                    type="text"
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 px-3.5 py-2.5 rounded-xl text-center text-lg font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 mb-1.5">Dáng quả 3D (Fruit Shape)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CITRUS', label: '🍊 Tròn mọng', desc: 'Cam, Quýt, Ổi' },
                    { id: 'APPLE', label: '🍎 Táo / Cà chua', desc: 'Có tai lá 5 cánh' },
                    { id: 'DURIAN', label: '🍈 Vỏ gai nhọn', desc: 'Sầu riêng, Mít' },
                    { id: 'MANGO', label: '🥭 Giọt nước cong', desc: 'Xoài, Đu đủ' },
                    { id: 'WATERMELON', label: '🍉 Dưa sọc to', desc: 'Dưa hấu, Dưa lưới' },
                    { id: 'GRAPE', label: '🍇 Chùm chùm', desc: 'Nho, Nhãn, Vải' },
                    { id: 'DRAGONFRUIT', label: '🐉 Vảy rồng', desc: 'Thanh long' },
                    { id: 'BANANA', label: '🍌 Nải cong', desc: 'Chuối' },
                    { id: 'AVOCADO', label: '🥑 Trái lê dài', desc: 'Bơ sáp' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCustomShape(s.id as FruitShapeType)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        customShape === s.id
                          ? 'bg-purple-950 border-purple-400 text-white ring-1 ring-purple-400'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="font-black text-white">{s.label}</div>
                      <div className="text-[10px] text-stone-400">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-stone-300 mb-1">Màu sắc quả chín (Fruit Color)</label>
                  <div className="flex items-center gap-2 bg-stone-950 border border-stone-700 p-2 rounded-xl">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-stone-200 uppercase">{customColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-300 mb-1">Màu tán lá (Foliage Color)</label>
                  <div className="flex items-center gap-2 bg-stone-950 border border-stone-700 p-2 rounded-xl">
                    <input
                      type="color"
                      value={customFoliageColor}
                      onChange={(e) => setCustomFoliageColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-stone-200 uppercase">{customFoliageColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-black shadow-lg flex items-center gap-1.5"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Áp Dụng Vào Mô Hình 3D</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Plot3DDigitalTwin;
