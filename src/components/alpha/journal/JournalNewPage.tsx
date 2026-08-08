'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Upload,
  X,
  ImageIcon,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useNavigationStore } from '@/stores';

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];
const EMOTIONS = ['Tenang', 'Fokus', 'Eksitasi', 'Cemas', 'Takut', 'Geram', 'Lainnya'];
const TAG_OPTIONS = ['Planned', 'Revenge', 'Impulsive', 'Overtrading', 'News-driven'];

const tradeSchema = z.object({
  pair: z.string().min(1, 'Pair wajib diisi').max(10, 'Maksimal 10 karakter'),
  direction: z.enum(['LONG', 'SHORT'], { required_error: 'Pilih arah trade' }),
  timeframe: z.string().optional(),
  strategy: z.string().optional(),
  entryPrice: z.coerce.number({ invalid_type_error: 'Harga harus berupa angka' }).positive('Harga harus positif'),
  stopLoss: z.coerce.number().positive().optional().nullable(),
  takeProfit: z.coerce.number().positive().optional().nullable(),
  lotSize: z.coerce.number().positive().optional().nullable(),
  planNotes: z.string().optional(),
  emotionBefore: z.string().optional(),
  tags: z.array(z.string()).optional(),
  screenshotUrl: z.string().optional(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

function DirectionToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: 'LONG' | 'SHORT') => void;
}) {
  return (
    <div className='flex gap-2'>
      <button
        type='button'
        onClick={() => onChange('LONG')}
        className={`alpha-press flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-150 ${
          value === 'LONG'
            ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
            : 'bg-transparent border-[#232636] text-[#9CA3AF] hover:border-[#9CA3AF]/40'
        }`}
      >
        LONG
      </button>
      <button
        type='button'
        onClick={() => onChange('SHORT')}
        className={`alpha-press flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-150 ${
          value === 'SHORT'
            ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
            : 'bg-transparent border-[#232636] text-[#9CA3AF] hover:border-[#9CA3AF]/40'
        }`}
      >
        SHORT
      </button>
    </div>
  );
}

function TagChips({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (tag: string) => void;
}) {
  return (
    <div className='flex flex-wrap gap-2'>
      {TAG_OPTIONS.map((tag) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            type='button'
            onClick={() => onToggle(tag)}
            className={`alpha-press alpha-badge-interactive inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 border ${
              active
                ? 'bg-[#6366F1]/15 border-[#6366F1]/40 text-[#818CF8]'
                : 'bg-transparent border-[#232636] text-[#9CA3AF] hover:border-[#9CA3AF]/40 hover:text-[#F3F4F6]'
            }`}
          >
            {active && <X className='size-3' />}
            {tag}
          </button>
        );
      })}
    </div>
  );
}

export function JournalNewPage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      pair: '',
      direction: undefined,
      timeframe: 'H1',
      strategy: '',
      entryPrice: undefined as unknown as number,
      stopLoss: null,
      takeProfit: null,
      lotSize: null,
      planNotes: '',
      emotionBefore: '',
      tags: [],
      screenshotUrl: '',
    },
  });

  const { watch } = form;
  const formValues = watch();

  const createMutation = useMutation({
    mutationFn: async (data: TradeFormData) => {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan trade');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Trade berhasil disimpan!');
      navigate('journal');
    },
    onError: (err) => {
      toast.error(err.message || 'Gagal menyimpan trade');
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diperbolehkan');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setScreenshotPreview(base64);
      form.setValue('screenshotUrl', base64);
    };
    reader.readAsDataURL(file);
  }, [form]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const onSubmit = (data: TradeFormData) => {
    createMutation.mutate(data);
  };

  const toggleTag = (tag: string) => {
    const current = form.getValues('tags') || [];
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    form.setValue('tags', updated);
  };

  return (
    <div className='alpha-animate-in space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          className='alpha-press size-9 hover:bg-[#1E2030]'
          onClick={() => navigate('journal')}
        >
          <ArrowLeft className='size-4 text-[#9CA3AF]' />
        </Button>
        <div>
          <h1 className='text-xl font-semibold text-[#F3F4F6]'>Trade Baru</h1>
          <p className='alpha-caption'>Catat trade kamu dengan detail lengkap</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
          {/* Left: Form — 3 cols */}
          <div className='lg:col-span-3 space-y-6'>
            {/* Pair & Direction */}
            <div className='alpha-card p-5 space-y-5'>
              <h3 className='alpha-heading-sm mb-1'>Info Trade</h3>

              <FormField
                control={form.control}
                name='pair'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='alpha-label'>Pair *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='EURUSD'
                        className='alpha-focus-ring bg-[#0B0D17] border-[#232636] font-financial text-sm h-9 placeholder:text-[#6B7280]'
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    <p className='alpha-caption'>Format: EURUSD, GBPJPY, dll.</p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='direction'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='alpha-label'>Arah (Direction) *</FormLabel>
                    <FormControl>
                      <Controller
                        name='direction'
                        control={form.control}
                        render={({ field: f }) => (
                          <DirectionToggle
                            value={f.value || ''}
                            onChange={f.onChange}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='timeframe'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='alpha-label'>Timeframe</FormLabel>
                      <Select
                        value={field.value || ''}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className='alpha-focus-ring bg-[#0B0D17] border-[#232636] h-9 text-sm'>
                            <SelectValue placeholder='Pilih' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='bg-[#151827] border-[#232636]'>
                          {TIMEFRAMES.map((tf) => (
                            <SelectItem key={tf} value={tf} className='text-sm'>
                              {tf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='strategy'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='alpha-label'>Strategi</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Breakout, Pullback...'
                          className='alpha-focus-ring bg-[#0B0D17] border-[#232636] text-sm h-9 placeholder:text-[#6B7280]'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Price Data */}
            <div className='alpha-card p-5 space-y-5'>
              <h3 className='alpha-heading-sm mb-1'>Harga & Posisi</h3>

              <FormField
                control={form.control}
                name='entryPrice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='alpha-label'>Entry Price *</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='any'
                        {...field}
                        placeholder='1.08500'
                        className='alpha-focus-ring bg-[#0B0D17] border-[#232636] font-financial text-sm h-9 placeholder:text-[#6B7280]'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='stopLoss'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='alpha-label'>Stop Loss</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='any'
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : null)
                          }
                          placeholder='—'
                          className='alpha-focus-ring bg-[#0B0D17] border-[#232636] font-financial text-sm h-9 placeholder:text-[#6B7280]'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='takeProfit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='alpha-label'>Take Profit</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='any'
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : null)
                          }
                          placeholder='—'
                          className='alpha-focus-ring bg-[#0B0D17] border-[#232636] font-financial text-sm h-9 placeholder:text-[#6B7280]'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='lotSize'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='alpha-label'>Lot Size</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='any'
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : null)
                          }
                          placeholder='0.1'
                          className='alpha-focus-ring bg-[#0B0D17] border-[#232636] font-financial text-sm h-9 placeholder:text-[#6B7280]'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Psychology & Tags */}
            <div className='alpha-card p-5 space-y-5'>
              <h3 className='alpha-heading-sm mb-1'>Psikologi & Tag</h3>

              <FormField
                control={form.control}
                name='planNotes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='alpha-label'>Catatan Rencana</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Apa rencana trade kamu sebelum entry?'
                        rows={3}
                        className='alpha-focus-ring bg-[#0B0D17] border-[#232636] text-sm placeholder:text-[#6B7280] resize-none'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='emotionBefore'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='alpha-label'>Emosi Sebelum Entry</FormLabel>
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='alpha-focus-ring bg-[#0B0D17] border-[#232636] h-9 text-sm'>
                          <SelectValue placeholder='Pilih emosi' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-[#151827] border-[#232636]'>
                        {EMOTIONS.map((em) => (
                          <SelectItem key={em} value={em} className='text-sm'>
                            {em}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div>
                <label className='alpha-label block mb-2'>Tags</label>
                <Controller
                  name='tags'
                  control={form.control}
                  render={({ field: f }) => (
                    <TagChips
                      selected={f.value || []}
                      onToggle={toggleTag}
                    />
                  )}
                />
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className='alpha-card p-5 space-y-3'>
              <h3 className='alpha-heading-sm mb-1'>Screenshot Chart</h3>

              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              {screenshotPreview ? (
                <div className='relative group'>
                  <img
                    src={screenshotPreview}
                    alt='Screenshot preview'
                    className='w-full max-h-48 object-contain rounded-lg border border-[#232636]'
                  />
                  <button
                    type='button'
                    onClick={() => {
                      setScreenshotPreview(null);
                      form.setValue('screenshotUrl', '');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className='alpha-press absolute top-2 right-2 size-7 rounded-full bg-[#0B0D17]/80 border border-[#232636] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='size-3.5 text-[#9CA3AF]' />
                  </button>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`alpha-press flex flex-col items-center justify-center py-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#6366F1] bg-[#6366F1]/5'
                      : 'border-[#232636] hover:border-[#6366F1]/40'
                  }`}
                >
                  <div className='size-10 rounded-full bg-[#1E2030] flex items-center justify-center mb-3'>
                    {isDragging ? (
                      <Upload className='size-5 text-[#6366F1]' />
                    ) : (
                      <ImageIcon className='size-5 text-[#6B7280]' />
                    )}
                  </div>
                  <p className='text-sm text-[#9CA3AF]'>Drag & drop atau klik untuk upload</p>
                  <p className='alpha-caption mt-1'>PNG, JPG, max 5MB</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className='flex items-center gap-3'>
              <Button
                type='submit'
                disabled={createMutation.isPending}
                className='alpha-press bg-[#6366F1] hover:bg-[#818CF8] text-white h-10 px-6'
              >
                {createMutation.isPending ? (
                  <span className='inline-flex items-center gap-2'>
                    <span className='size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Menyimpan...
                  </span>
                ) : (
                  <>
                    <Plus className='size-4' />
                    Simpan Trade
                  </>
                )}
              </Button>
              <Button
                type='button'
                variant='outline'
                className='alpha-press border-[#232636] text-[#9CA3AF] hover:text-[#F3F4F6] h-10 px-6'
                onClick={() => navigate('journal')}
              >
                Batal
              </Button>
            </div>
          </div>

          {/* Right: Preview — 2 cols */}
          <div className='lg:col-span-2'>
            <div className='sticky top-6 alpha-card p-5 space-y-4'>
              <h3 className='alpha-heading-sm'>Preview Trade</h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='alpha-caption'>Pair</span>
                  <span className='font-financial text-sm font-bold text-[#F3F4F6]'>
                    {formValues.pair || '—'}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='alpha-caption'>Direction</span>
                  {formValues.direction ? (
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                        formValues.direction === 'LONG'
                          ? 'bg-[#22C55E]/15 text-[#22C55E]'
                          : 'bg-[#EF4444]/15 text-[#EF4444]'
                      }`}
                    >
                      {formValues.direction}
                    </span>
                  ) : (
                    <span className='text-sm text-[#6B7280]'>—</span>
                  )}
                </div>
                <div className='flex justify-between items-center'>
                  <span className='alpha-caption'>Timeframe</span>
                  <span className='text-sm text-[#F3F4F6]'>
                    {formValues.timeframe || '—'}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='alpha-caption'>Strategi</span>
                  <span className='text-sm text-[#F3F4F6]'>
                    {formValues.strategy || '—'}
                  </span>
                </div>

                <div className='border-t border-[#232636] pt-3 space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='alpha-caption'>Entry Price</span>
                    <span className='font-financial text-sm text-[#F3F4F6]'>
                      {formValues.entryPrice ? Number(formValues.entryPrice).toFixed(5) : '—'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='alpha-caption'>Stop Loss</span>
                    <span className='font-financial text-sm text-[#F3F4F6]'>
                      {formValues.stopLoss ? Number(formValues.stopLoss).toFixed(5) : '—'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='alpha-caption'>Take Profit</span>
                    <span className='font-financial text-sm text-[#F3F4F6]'>
                      {formValues.takeProfit ? Number(formValues.takeProfit).toFixed(5) : '—'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='alpha-caption'>Lot Size</span>
                    <span className='font-financial text-sm text-[#F3F4F6]'>
                      {formValues.lotSize || '—'}
                    </span>
                  </div>
                </div>

                <div className='border-t border-[#232636] pt-3 space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='alpha-caption'>Emosi</span>
                    <span className='text-sm text-[#F3F4F6]'>
                      {formValues.emotionBefore || '—'}
                    </span>
                  </div>
                  {(formValues.tags && formValues.tags.length > 0) && (
                    <div className='flex justify-between items-start'>
                      <span className='alpha-caption'>Tags</span>
                      <div className='flex flex-wrap gap-1 justify-end'>
                        {formValues.tags.map((tag) => (
                          <span
                            key={tag}
                            className='rounded-full bg-[#6366F1]/10 px-2 py-0.5 text-[10px] text-[#818CF8]'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {formValues.planNotes && (
                  <div className='border-t border-[#232636] pt-3'>
                    <p className='alpha-caption mb-1'>Rencana</p>
                    <p className='alpha-body whitespace-pre-wrap line-clamp-4'>
                      {formValues.planNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
