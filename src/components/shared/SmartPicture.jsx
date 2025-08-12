// src/components/SmartPicture.tsx
import manifest from '@/assets/images.manifest.json';

export default function SmartPicture({
  name, alt,
  sizes = '(max-width:768px) 100vw, 800px',
  priority = false,
  className
}) {
  const m = manifest[name];
  return (
    <picture>
      <source type="image/avif" srcSet={m.avif.join(', ')} sizes={sizes} />
      <source type="image/webp" srcSet={m.webp.join(', ')} sizes={sizes} />
      <img
        src={m.fallback}
        width={m.width}
        height={m.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={className}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </picture>
  );
}
