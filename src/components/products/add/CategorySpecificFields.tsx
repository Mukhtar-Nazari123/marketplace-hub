import { useLanguage } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CategorySpecificFieldsProps {
  categoryId: string;
  attributes: Record<string, string | boolean | string[]>;
  updateAttributes: (attributes: Record<string, string | boolean | string[]>) => void;
}

export const CategorySpecificFields = ({ 
  categoryId, 
  attributes, 
  updateAttributes 
}: CategorySpecificFieldsProps) => {
  const { isRTL } = useLanguage();

  const updateAttribute = (key: string, value: string | boolean | string[]) => {
    updateAttributes({ ...attributes, [key]: value });
  };

  const renderElectronicsFields = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>{isRTL ? 'مدل' : 'Model'}</Label>
        <Input
          value={(attributes.model as string) || ''}
          onChange={(e) => updateAttribute('model', e.target.value)}
          placeholder={isRTL ? 'مدل محصول' : 'Product model'}
          className={cn(isRTL && "text-right")}
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'مشخصات فنی' : 'Technical Specifications'}</Label>
        <Textarea
          value={(attributes.specifications as string) || ''}
          onChange={(e) => updateAttribute('specifications', e.target.value)}
          placeholder={isRTL ? 'مشخصات فنی...' : 'Technical specs...'}
          rows={3}
          className={cn(isRTL && "text-right")}
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'گارانتی' : 'Warranty'}</Label>
        <div className="flex items-center gap-4">
          <Switch
            checked={(attributes.hasWarranty as boolean) || false}
            onCheckedChange={(checked) => updateAttribute('hasWarranty', checked)}
          />
          <span className="text-sm text-muted-foreground">
            {attributes.hasWarranty ? (isRTL ? 'دارد' : 'Yes') : (isRTL ? 'ندارد' : 'No')}
          </span>
        </div>
      </div>

      {attributes.hasWarranty && (
        <div className="space-y-2">
          <Label>{isRTL ? 'مدت گارانتی' : 'Warranty Duration'}</Label>
          <Select
            value={(attributes.warrantyDuration as string) || ''}
            onValueChange={(value) => updateAttribute('warrantyDuration', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isRTL ? 'انتخاب کنید' : 'Select'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">{isRTL ? '۶ ماه' : '6 Months'}</SelectItem>
              <SelectItem value="1year">{isRTL ? '۱ سال' : '1 Year'}</SelectItem>
              <SelectItem value="2years">{isRTL ? '۲ سال' : '2 Years'}</SelectItem>
              <SelectItem value="3years">{isRTL ? '۳ سال' : '3 Years'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  const renderClothingFields = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>{isRTL ? 'جنسیت' : 'Gender'}</Label>
        <Select
          value={(attributes.gender as string) || ''}
          onValueChange={(value) => updateAttribute('gender', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={isRTL ? 'انتخاب کنید' : 'Select'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="men">{isRTL ? 'مردانه' : 'Men'}</SelectItem>
            <SelectItem value="women">{isRTL ? 'زنانه' : 'Women'}</SelectItem>
            <SelectItem value="unisex">{isRTL ? 'یونیسکس' : 'Unisex'}</SelectItem>
            <SelectItem value="kids">{isRTL ? 'بچگانه' : 'Kids'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'سایز' : 'Size'}</Label>
        <Select
          value={(attributes.size as string) || ''}
          onValueChange={(value) => updateAttribute('size', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={isRTL ? 'انتخاب کنید' : 'Select'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="XS">XS</SelectItem>
            <SelectItem value="S">S</SelectItem>
            <SelectItem value="M">M</SelectItem>
            <SelectItem value="L">L</SelectItem>
            <SelectItem value="XL">XL</SelectItem>
            <SelectItem value="XXL">XXL</SelectItem>
            <SelectItem value="freesize">{isRTL ? 'فری سایز' : 'Free Size'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'رنگ' : 'Color'}</Label>
        <Input
          value={(attributes.color as string) || ''}
          onChange={(e) => updateAttribute('color', e.target.value)}
          placeholder={isRTL ? 'رنگ محصول' : 'Product color'}
          className={cn(isRTL && "text-right")}
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'جنس پارچه' : 'Fabric / Material'}</Label>
        <Input
          value={(attributes.fabric as string) || ''}
          onChange={(e) => updateAttribute('fabric', e.target.value)}
          placeholder={isRTL ? 'مثال: پنبه، پلی‌استر' : 'e.g., Cotton, Polyester'}
          className={cn(isRTL && "text-right")}
        />
      </div>
    </div>
  );

  const renderHomeFields = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>{isRTL ? 'جنس' : 'Material'}</Label>
        <Input
          value={(attributes.material as string) || ''}
          onChange={(e) => updateAttribute('material', e.target.value)}
          placeholder={isRTL ? 'جنس محصول' : 'Product material'}
          className={cn(isRTL && "text-right")}
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'ابعاد' : 'Dimensions'}</Label>
        <Input
          value={(attributes.dimensions as string) || ''}
          onChange={(e) => updateAttribute('dimensions', e.target.value)}
          placeholder={isRTL ? 'طول x عرض x ارتفاع' : 'L x W x H'}
          className={cn(isRTL && "text-right")}
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'وزن (گرم)' : 'Weight (grams)'}</Label>
        <Input
          type="number"
          value={(attributes.weight as string) || ''}
          onChange={(e) => updateAttribute('weight', e.target.value)}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'نیاز به مونتاژ' : 'Assembly Required'}</Label>
        <div className="flex items-center gap-4">
          <Switch
            checked={(attributes.assemblyRequired as boolean) || false}
            onCheckedChange={(checked) => updateAttribute('assemblyRequired', checked)}
          />
          <span className="text-sm text-muted-foreground">
            {attributes.assemblyRequired ? (isRTL ? 'بله' : 'Yes') : (isRTL ? 'خیر' : 'No')}
          </span>
        </div>
      </div>
    </div>
  );

  const renderBeautyFields = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>{isRTL ? 'نوع پوست/مو' : 'Skin/Hair Type'}</Label>
        <Select
          value={(attributes.skinType as string) || ''}
          onValueChange={(value) => updateAttribute('skinType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={isRTL ? 'انتخاب کنید' : 'Select'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'همه' : 'All Types'}</SelectItem>
            <SelectItem value="oily">{isRTL ? 'چرب' : 'Oily'}</SelectItem>
            <SelectItem value="dry">{isRTL ? 'خشک' : 'Dry'}</SelectItem>
            <SelectItem value="combination">{isRTL ? 'مختلط' : 'Combination'}</SelectItem>
            <SelectItem value="sensitive">{isRTL ? 'حساس' : 'Sensitive'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'مواد تشکیل‌دهنده' : 'Ingredients'}</Label>
        <Textarea
          value={(attributes.ingredients as string) || ''}
          onChange={(e) => updateAttribute('ingredients', e.target.value)}
          placeholder={isRTL ? 'مواد تشکیل‌دهنده اصلی...' : 'Main ingredients...'}
          rows={2}
          className={cn(isRTL && "text-right")}
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'تاریخ انقضا' : 'Expiry Date'}</Label>
        <Input
          type="date"
          value={(attributes.expiryDate as string) || ''}
          onChange={(e) => updateAttribute('expiryDate', e.target.value)}
        />
      </div>
    </div>
  );

  const renderSportsFields = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>{isRTL ? 'نوع ورزش' : 'Sport Type'}</Label>
        <Input
          value={(attributes.sportType as string) || ''}
          onChange={(e) => updateAttribute('sportType', e.target.value)}
          placeholder={isRTL ? 'مثال: فوتبال، بسکتبال' : 'e.g., Football, Basketball'}
          className={cn(isRTL && "text-right")}
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'جنس' : 'Material'}</Label>
        <Input
          value={(attributes.material as string) || ''}
          onChange={(e) => updateAttribute('material', e.target.value)}
          placeholder={isRTL ? 'جنس محصول' : 'Product material'}
          className={cn(isRTL && "text-right")}
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'سطح مهارت' : 'Skill Level'}</Label>
        <Select
          value={(attributes.skillLevel as string) || ''}
          onValueChange={(value) => updateAttribute('skillLevel', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={isRTL ? 'انتخاب کنید' : 'Select'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">{isRTL ? 'مبتدی' : 'Beginner'}</SelectItem>
            <SelectItem value="intermediate">{isRTL ? 'متوسط' : 'Intermediate'}</SelectItem>
            <SelectItem value="advanced">{isRTL ? 'پیشرفته' : 'Advanced'}</SelectItem>
            <SelectItem value="professional">{isRTL ? 'حرفه‌ای' : 'Professional'}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderBabyFields = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>{isRTL ? 'رده سنی' : 'Age Range'}</Label>
        <Select
          value={(attributes.ageRange as string) || ''}
          onValueChange={(value) => updateAttribute('ageRange', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={isRTL ? 'انتخاب کنید' : 'Select'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-6m">{isRTL ? '۰-۶ ماه' : '0-6 Months'}</SelectItem>
            <SelectItem value="6-12m">{isRTL ? '۶-۱۲ ماه' : '6-12 Months'}</SelectItem>
            <SelectItem value="1-2y">{isRTL ? '۱-۲ سال' : '1-2 Years'}</SelectItem>
            <SelectItem value="2-4y">{isRTL ? '۲-۴ سال' : '2-4 Years'}</SelectItem>
            <SelectItem value="4-6y">{isRTL ? '۴-۶ سال' : '4-6 Years'}</SelectItem>
            <SelectItem value="6+y">{isRTL ? '۶ سال به بالا' : '6+ Years'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'جنس' : 'Material'}</Label>
        <Input
          value={(attributes.material as string) || ''}
          onChange={(e) => updateAttribute('material', e.target.value)}
          placeholder={isRTL ? 'جنس محصول' : 'Product material'}
          className={cn(isRTL && "text-right")}
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'اطلاعات ایمنی' : 'Safety Information'}</Label>
        <Textarea
          value={(attributes.safetyInfo as string) || ''}
          onChange={(e) => updateAttribute('safetyInfo', e.target.value)}
          placeholder={isRTL ? 'اطلاعات ایمنی و هشدارها...' : 'Safety info and warnings...'}
          rows={2}
          className={cn(isRTL && "text-right")}
        />
      </div>

      <div className="space-y-2">
        <Label>{isRTL ? 'گواهینامه‌ها' : 'Certifications'}</Label>
        <Input
          value={(attributes.certifications as string) || ''}
          onChange={(e) => updateAttribute('certifications', e.target.value)}
          placeholder={isRTL ? 'مثال: CE, ASTM' : 'e.g., CE, ASTM'}
          className={cn(isRTL && "text-right")}
        />
      </div>
    </div>
  );

  switch (categoryId) {
    case 'electronics':
      return renderElectronicsFields();
    case 'clothing':
      return renderClothingFields();
    case 'home':
      return renderHomeFields();
    case 'beauty':
      return renderBeautyFields();
    case 'sports':
      return renderSportsFields();
    case 'baby':
      return renderBabyFields();
    default:
      return (
        <p className="text-sm text-muted-foreground">
          {isRTL ? 'فیلد اختصاصی برای این دسته‌بندی وجود ندارد' : 'No specific fields for this category'}
        </p>
      );
  }
};
