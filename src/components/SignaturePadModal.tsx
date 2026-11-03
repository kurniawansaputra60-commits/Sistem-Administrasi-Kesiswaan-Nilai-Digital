import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool, Sparkles, Upload, FileImage, ShieldCheck } from 'lucide-react';
import { generateDigitalSignatureSvg } from '../utils/signatureUtils';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  name: string;
  currentSignature?: string;
  onSave: (dataUrl: string) => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  title,
  name,
  currentSignature,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeColor, setStrokeColor] = useState<'blue' | 'black'>('blue');

  const isKepalaSekolah = title.toLowerCase().includes('kepala') || name.toLowerCase().includes('mulyadi');
  const isKurniawan = name.toLowerCase().includes('kurniawan') || title.toLowerCase().includes('admin');

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 460;
    canvas.height = 180;

    // Reset background transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing signature if provided
    if (currentSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 20, 10, canvas.width - 40, canvas.height - 20);
        setHasDrawn(true);
      };
      img.src = currentSignature;
    } else {
      setHasDrawn(false);
    }
  }, [isOpen, currentSignature]);

  if (!isOpen) return null;

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = strokeColor === 'blue' ? '#1e40af' : '#111827';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleGenerateCalligraphy = () => {
    const initial = isKurniawan ? 'KS' : isKepalaSekolah ? 'MLY' : undefined;
    const svgDataUrl = generateDigitalSignatureSvg(name || 'Petugas', initial);
    onSave(svgDataUrl);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 20, 10, canvas.width - 40, canvas.height - 20);
        setHasDrawn(true);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveDrawn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!hasDrawn) {
      alert('Silakan gambar tanda tangan terlebih dahulu, upload file, atau gunakan fitur Paraf Otomatis.');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Tanda Tangan Digital: {title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {isKepalaSekolah
                  ? 'Tanda Tangan Kepala Sekolah (Tercetak di sebelah kiri lembar dokumen resmi)'
                  : isKurniawan
                  ? 'Tanda Tangan Petugas Administrasi / Pengelola (Kurniawan Saputra)'
                  : `Tanda Tangan Resmi ${name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status Bar */}
          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600">Status Saat Ini:</span>
              {currentSignature ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3" /> TTD Tersimpan
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Belum ada TTD
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Upload File TTD */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-blue-800 rounded-md flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3 h-3 text-blue-600" />
                <span>Upload File TTD</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-600 text-[11px]">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-emerald-700" />
              <span>Gambar TTD di Layar (Mouse / Sentuhan):</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Tinta:</span>
              <button
                type="button"
                onClick={() => setStrokeColor('blue')}
                className={`w-5 h-5 rounded-full border cursor-pointer ${strokeColor === 'blue' ? 'border-blue-900 ring-2 ring-blue-400' : 'border-slate-300'}`}
                style={{ backgroundColor: '#1e40af' }}
                title="Tinta Biru Resmi Dinas"
              />
              <button
                type="button"
                onClick={() => setStrokeColor('black')}
                className={`w-5 h-5 rounded-full border cursor-pointer ${strokeColor === 'black' ? 'border-black ring-2 ring-slate-400' : 'border-slate-300'}`}
                style={{ backgroundColor: '#111827' }}
                title="Tinta Hitam"
              />
            </div>
          </div>

          {/* Canvas Box */}
          <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-amber-50/20 overflow-hidden touch-none flex justify-center items-center shadow-inner">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair w-full h-[180px] block"
            />
            {!hasDrawn && (
              <div className="absolute pointer-events-none text-slate-400 text-xs flex flex-col items-center justify-center">
                <PenTool className="w-5 h-5 mb-1 opacity-40 text-slate-500" />
                <span>Goreskan tanda tangan Anda di area kanvas ini</span>
              </div>
            )}
            <div className="absolute bottom-1 right-2 pointer-events-none text-[10px] text-slate-400 font-mono">
              {isKepalaSekolah ? 'TTD Kepala Sekolah (Kiri Lembar)' : 'TTD Petugas / Wali Kelas'}
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulangi Gambar</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateCalligraphy}
                className="px-2.5 py-1.5 text-xs text-emerald-800 hover:bg-emerald-50 border border-emerald-300 rounded-md flex items-center gap-1 cursor-pointer font-bold shadow-2xs"
                title="Generate tanda tangan atau paraf otomatis"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isKurniawan
                    ? 'Paraf Otomatis untuk Kurniawan Saputra'
                    : 'Paraf Otomatis'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveDrawn}
                className="px-4 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-md flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Tanda Tangan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
