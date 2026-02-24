import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { subcategoryImageMap } from '@/lib/subcategoryImages';

interface MigrationResult {
  slug: string;
  success: boolean;
  url?: string;
  error?: string;
}

const MigrateSubcategoryImages = ({ onComplete }: { onComplete?: () => void }) => {
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [progress, setProgress] = useState(0);

  const migrateImages = async () => {
    setMigrating(true);
    setResults([]);
    const slugs = Object.keys(subcategoryImageMap);
    const total = slugs.length;
    const migrationResults: MigrationResult[] = [];

    for (let i = 0; i < slugs.length; i++) {
      const slug = slugs[i];
      const localImageUrl = subcategoryImageMap[slug];
      setProgress(Math.round(((i + 1) / total) * 100));

      try {
        // Fetch the local bundled image as blob
        const response = await fetch(localImageUrl);
        const blob = await response.blob();

        // Determine extension from content type
        const contentType = blob.type || 'image/jpeg';
        const ext = contentType.includes('webp') ? 'webp' : contentType.includes('png') ? 'png' : 'jpg';
        const fileName = `subcategories/${slug}.${ext}`;

        // Upload to site-assets bucket
        const { error: uploadError } = await supabase.storage
          .from('site-assets')
          .upload(fileName, blob, { 
            upsert: true,
            contentType 
          });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('site-assets')
          .getPublicUrl(fileName);

        // Update subcategories table where slug matches
        const { error: updateError } = await supabase
          .from('subcategories')
          .update({ image_url: publicUrl })
          .eq('slug', slug);

        if (updateError) {
          console.warn(`No subcategory found for slug "${slug}", trying categories...`);
          // Try categories table too
          await supabase
            .from('categories')
            .update({ image_url: publicUrl })
            .eq('slug', slug);
        }

        migrationResults.push({ slug, success: true, url: publicUrl });
      } catch (error: any) {
        console.error(`Failed to migrate ${slug}:`, error);
        migrationResults.push({ slug, success: false, error: error.message });
      }
    }

    setResults(migrationResults);
    setMigrating(false);

    const successCount = migrationResults.filter(r => r.success).length;
    const failCount = migrationResults.filter(r => !r.success).length;

    if (failCount === 0) {
      toast.success(`All ${successCount} images migrated successfully!`);
    } else {
      toast.warning(`${successCount} migrated, ${failCount} failed`);
    }

    onComplete?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={migrateImages}
          disabled={migrating}
          variant="outline"
          className="gap-2"
        >
          {migrating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {migrating ? `Migrating... ${progress}%` : 'Migrate Images to Storage'}
        </Button>
        <span className="text-sm text-muted-foreground">
          {Object.keys(subcategoryImageMap).length} images to upload
        </span>
      </div>

      {results.length > 0 && (
        <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-1 text-sm">
          {results.map((r) => (
            <div key={r.slug} className="flex items-center gap-2">
              {r.success ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <span className="text-destructive flex-shrink-0">✗</span>
              )}
              <span className={r.success ? 'text-foreground' : 'text-destructive'}>
                {r.slug}
              </span>
              {r.error && <span className="text-muted-foreground">— {r.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MigrateSubcategoryImages;
