import { useLanguage } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Baby,
  Shield,
  Ruler,
  Weight,
  Calendar,
  Palette,
  Layers,
} from "lucide-react";

interface CategorySpecificFieldsProps {
  categoryId: string;
  categoryName: string;
  attributes: Record<string, string | boolean | string[]>;
  updateAttributes: (attributes: Record<string, string | boolean | string[]>) => void;
}

export const CategorySpecificFields = ({
  categoryId,
  categoryName,
  attributes,
  updateAttributes,
}: CategorySpecificFieldsProps) => {
  const { isRTL } = useLanguage();

  const updateAttribute = (key: string, value: string | boolean | string[]) => {
    updateAttributes({ ...attributes, [key]: value });
  };

  const renderElectronicsFields = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <Smartphone className="w-5 h-5" />
        <span className="font-medium">{isRTL ? "مشخصات الکترونیکی" : "Electronics Specifications"}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isRTL ? "مدل" : "Model"}</Label>
          <Input
            value={(attributes.model as string) || ""}
            onChange={(e) => updateAttribute("model", e.target.value)}
            placeholder={isRTL ? "مدل محصول" : "Product model"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "سال تولید" : "Year of Production"}</Label>
          <Select
            value={(attributes.productionYear as string) || ""}
            onValueChange={(value) => updateAttribute("productionYear", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isRTL ? "انتخاب کنید" : "Select"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="older">{isRTL ? "قدیمی‌تر" : "Older"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>{isRTL ? "مشخصات فنی" : "Technical Specifications"}</Label>
          <Textarea
            value={(attributes.specifications as string) || ""}
            onChange={(e) => updateAttribute("specifications", e.target.value)}
            placeholder={
              isRTL
                ? "مشخصات فنی را اینجا بنویسید...\nمثال:\n- پردازنده: ...\n- حافظه: ...\n- صفحه نمایش: ..."
                : "Write technical specs here...\nExample:\n- Processor: ...\n- Memory: ...\n- Display: ..."
            }
            rows={4}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <Card className="md:col-span-2 p-4 space-y-3 bg-muted/30">
          <Label className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            {isRTL ? "گارانتی" : "Warranty"}
          </Label>
          <div className="flex items-center gap-4">
            <Switch
              checked={(attributes.hasWarranty as boolean) || false}
              onCheckedChange={(checked) => updateAttribute("hasWarranty", checked)}
            />
            <span className="text-sm text-muted-foreground">
              {attributes.hasWarranty ? (isRTL ? "دارد" : "Yes") : isRTL ? "ندارد" : "No"}
            </span>
          </div>

          {attributes.hasWarranty && (
            <Select
              value={(attributes.warrantyDuration as string) || ""}
              onValueChange={(value) => updateAttribute("warrantyDuration", value)}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder={isRTL ? "مدت گارانتی" : "Warranty Duration"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">{isRTL ? "۳ ماه" : "3 Months"}</SelectItem>
                <SelectItem value="6months">{isRTL ? "۶ ماه" : "6 Months"}</SelectItem>
                <SelectItem value="1year">{isRTL ? "۱ سال" : "1 Year"}</SelectItem>
                <SelectItem value="2years">{isRTL ? "۲ سال" : "2 Years"}</SelectItem>
                <SelectItem value="3years">{isRTL ? "۳ سال" : "3 Years"}</SelectItem>
                <SelectItem value="lifetime">{isRTL ? "مادام‌العمر" : "Lifetime"}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </Card>
      </div>
    </div>
  );

  const renderClothingFields = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <Shirt className="w-5 h-5" />
        <span className="font-medium">{isRTL ? "مشخصات پوشاک" : "Clothing Specifications"}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">{isRTL ? "جنسیت" : "Gender"}</Label>
          <Select
            value={(attributes.gender as string) || ""}
            onValueChange={(value) => updateAttribute("gender", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isRTL ? "انتخاب کنید" : "Select"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="men">{isRTL ? "مردانه" : "Men"}</SelectItem>
              <SelectItem value="women">{isRTL ? "زنانه" : "Women"}</SelectItem>
              <SelectItem value="unisex">{isRTL ? "یونیسکس" : "Unisex"}</SelectItem>
              <SelectItem value="kids">{isRTL ? "بچگانه" : "Kids"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            {isRTL ? "سایزهای موجود" : "Available Sizes"}
          </Label>
          <div className="flex flex-wrap gap-2">
            {["XS", "S", "M", "L", "XL", "XXL"].map((size) => {
              const selectedSizes = (attributes.sizes as string[]) || [];
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    const newSizes = isSelected ? selectedSizes.filter((s) => s !== size) : [...selectedSizes, size];
                    updateAttribute("sizes", newSizes);
                  }}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary/50",
                  )}
                >
                  {size}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                const selectedSizes = (attributes.sizes as string[]) || [];
                const isSelected = selectedSizes.includes("freesize");
                const newSizes = isSelected
                  ? selectedSizes.filter((s) => s !== "freesize")
                  : [...selectedSizes, "freesize"];
                updateAttribute("sizes", newSizes);
              }}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200",
                ((attributes.sizes as string[]) || []).includes("freesize")
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/50",
              )}
            >
              {isRTL ? "فری سایز" : "Free"}
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-sm text-muted-foreground">
              {isRTL ? "سایز دیگر (اختیاری)" : "Custom Size (optional)"}
            </Label>
            <Input
              value={(attributes.customSize as string) || ""}
              onChange={(e) => updateAttribute("customSize", e.target.value)}
              placeholder={isRTL ? "مثال: 38، 40، 42 یا XXS" : "e.g., 38, 40, 42 or XXS"}
              className={cn(isRTL && "text-right")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            {isRTL ? "رنگ" : "Color"}
          </Label>
          <Input
            value={(attributes.color as string) || ""}
            onChange={(e) => updateAttribute("color", e.target.value)}
            placeholder={isRTL ? "رنگ محصول" : "Product color"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            {isRTL ? "جنس پارچه" : "Fabric / Material"}
          </Label>
          <Input
            value={(attributes.fabric as string) || ""}
            onChange={(e) => updateAttribute("fabric", e.target.value)}
            placeholder={isRTL ? "مثال: پنبه، پلی‌استر" : "e.g., Cotton, Polyester"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>{isRTL ? "راهنمای شستشو" : "Washing Instructions"}</Label>
          <Textarea
            value={(attributes.washingInstructions as string) || ""}
            onChange={(e) => updateAttribute("washingInstructions", e.target.value)}
            placeholder={isRTL ? "دستورالعمل‌های شستشو و نگهداری..." : "Washing and care instructions..."}
            rows={2}
            className={cn(isRTL && "text-right")}
          />
        </div>
      </div>
    </div>
  );

  const renderHomeFields = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <Home className="w-5 h-5" />
        <span className="font-medium">{isRTL ? "مشخصات خانه و زندگی" : "Home & Living Specifications"}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            {isRTL ? "جنس" : "Material"}
          </Label>
          <Input
            value={(attributes.material as string) || ""}
            onChange={(e) => updateAttribute("material", e.target.value)}
            placeholder={isRTL ? "جنس محصول" : "Product material"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            {isRTL ? "ابعاد" : "Dimensions"}
          </Label>
          <Input
            value={(attributes.dimensions as string) || ""}
            onChange={(e) => updateAttribute("dimensions", e.target.value)}
            placeholder={isRTL ? "طول x عرض x ارتفاع (سانتی‌متر)" : "L x W x H (cm)"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Weight className="w-4 h-4" />
            {isRTL ? "وزن (کیلوگرم)" : "Weight (kg)"}
          </Label>
          <Input
            type="number"
            step="0.1"
            value={(attributes.weight as string) || ""}
            onChange={(e) => updateAttribute("weight", e.target.value)}
            placeholder="0.0"
          />
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "رنگ" : "Color"}</Label>
          <Input
            value={(attributes.color as string) || ""}
            onChange={(e) => updateAttribute("color", e.target.value)}
            placeholder={isRTL ? "رنگ محصول" : "Product color"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <Card className="md:col-span-2 p-4 space-y-3 bg-muted/30">
          <Label>{isRTL ? "نیاز به مونتاژ" : "Assembly Required"}</Label>
          <div className="flex items-center gap-4">
            <Switch
              checked={(attributes.assemblyRequired as boolean) || false}
              onCheckedChange={(checked) => updateAttribute("assemblyRequired", checked)}
            />
            <span className="text-sm text-muted-foreground">
              {attributes.assemblyRequired
                ? isRTL
                  ? "بله، نیاز به مونتاژ دارد"
                  : "Yes, assembly required"
                : isRTL
                  ? "خیر، آماده استفاده"
                  : "No, ready to use"}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderBeautyFields = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">
          {isRTL ? "مشخصات زیبایی و بهداشت" : "Beauty & Personal Care Specifications"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isRTL ? "نوع پوست/مو" : "Skin/Hair Type"}</Label>
          <Select
            value={(attributes.skinType as string) || ""}
            onValueChange={(value) => updateAttribute("skinType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isRTL ? "انتخاب کنید" : "Select"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "همه انواع" : "All Types"}</SelectItem>
              <SelectItem value="oily">{isRTL ? "چرب" : "Oily"}</SelectItem>
              <SelectItem value="dry">{isRTL ? "خشک" : "Dry"}</SelectItem>
              <SelectItem value="combination">{isRTL ? "مختلط" : "Combination"}</SelectItem>
              <SelectItem value="sensitive">{isRTL ? "حساس" : "Sensitive"}</SelectItem>
              <SelectItem value="normal">{isRTL ? "نرمال" : "Normal"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "حجم / مقدار" : "Volume / Quantity"}</Label>
          <Input
            value={(attributes.volume as string) || ""}
            onChange={(e) => updateAttribute("volume", e.target.value)}
            placeholder={isRTL ? "مثال: ۵۰ میلی‌لیتر" : "e.g., 50ml"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>{isRTL ? "مواد تشکیل‌دهنده" : "Ingredients"}</Label>
          <Textarea
            value={(attributes.ingredients as string) || ""}
            onChange={(e) => updateAttribute("ingredients", e.target.value)}
            placeholder={isRTL ? "مواد تشکیل‌دهنده اصلی محصول..." : "Main ingredients of the product..."}
            rows={3}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {isRTL ? "تاریخ انقضا" : "Expiry Date"}
          </Label>
          <Input
            type="date"
            value={(attributes.expiryDate as string) || ""}
            onChange={(e) => updateAttribute("expiryDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "کشور سازنده" : "Country of Origin"}</Label>
          <Input
            value={(attributes.countryOfOrigin as string) || ""}
            onChange={(e) => updateAttribute("countryOfOrigin", e.target.value)}
            placeholder={isRTL ? "مثال: فرانسه" : "e.g., France"}
            className={cn(isRTL && "text-right")}
          />
        </div>
      </div>
    </div>
  );

  const renderSportsFields = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <Dumbbell className="w-5 h-5" />
        <span className="font-medium">{isRTL ? "مشخصات ورزشی" : "Sports & Outdoor Specifications"}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isRTL ? "نوع ورزش" : "Sport Type"}</Label>
          <Select
            value={(attributes.sportType as string) || ""}
            onValueChange={(value) => updateAttribute("sportType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isRTL ? "انتخاب کنید" : "Select"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="football">{isRTL ? "فوتبال" : "Football"}</SelectItem>
              <SelectItem value="basketball">{isRTL ? "بسکتبال" : "Basketball"}</SelectItem>
              <SelectItem value="running">{isRTL ? "دویدن" : "Running"}</SelectItem>
              <SelectItem value="gym">{isRTL ? "بدنسازی" : "Gym"}</SelectItem>
              <SelectItem value="swimming">{isRTL ? "شنا" : "Swimming"}</SelectItem>
              <SelectItem value="cycling">{isRTL ? "دوچرخه‌سواری" : "Cycling"}</SelectItem>
              <SelectItem value="hiking">{isRTL ? "کوهنوردی" : "Hiking"}</SelectItem>
              <SelectItem value="yoga">{isRTL ? "یوگا" : "Yoga"}</SelectItem>
              <SelectItem value="other">{isRTL ? "سایر" : "Other"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "جنس" : "Material"}</Label>
          <Input
            value={(attributes.material as string) || ""}
            onChange={(e) => updateAttribute("material", e.target.value)}
            placeholder={isRTL ? "جنس محصول" : "Product material"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "سایز" : "Size"}</Label>
          <Input
            value={(attributes.size as string) || ""}
            onChange={(e) => updateAttribute("size", e.target.value)}
            placeholder={isRTL ? "سایز محصول" : "Product size"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "سطح مهارت" : "Skill Level"}</Label>
          <Select
            value={(attributes.skillLevel as string) || ""}
            onValueChange={(value) => updateAttribute("skillLevel", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isRTL ? "انتخاب کنید" : "Select"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">{isRTL ? "مبتدی" : "Beginner"}</SelectItem>
              <SelectItem value="intermediate">{isRTL ? "متوسط" : "Intermediate"}</SelectItem>
              <SelectItem value="advanced">{isRTL ? "پیشرفته" : "Advanced"}</SelectItem>
              <SelectItem value="professional">{isRTL ? "حرفه‌ای" : "Professional"}</SelectItem>
              <SelectItem value="all">{isRTL ? "همه سطوح" : "All Levels"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "رنگ" : "Color"}</Label>
          <Input
            value={(attributes.color as string) || ""}
            onChange={(e) => updateAttribute("color", e.target.value)}
            placeholder={isRTL ? "رنگ محصول" : "Product color"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "وزن" : "Weight"}</Label>
          <Input
            value={(attributes.weight as string) || ""}
            onChange={(e) => updateAttribute("weight", e.target.value)}
            placeholder={isRTL ? "وزن محصول" : "Product weight"}
            className={cn(isRTL && "text-right")}
          />
        </div>
      </div>
    </div>
  );

  const renderBabyFields = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <Baby className="w-5 h-5" />
        <span className="font-medium">{isRTL ? "مشخصات کودک و نوزاد" : "Baby & Kids Specifications"}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isRTL ? "رده سنی" : "Age Range"}</Label>
          <Select
            value={(attributes.ageRange as string) || ""}
            onValueChange={(value) => updateAttribute("ageRange", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isRTL ? "انتخاب کنید" : "Select"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-3m">{isRTL ? "۰-۳ ماه" : "0-3 Months"}</SelectItem>
              <SelectItem value="3-6m">{isRTL ? "۳-۶ ماه" : "3-6 Months"}</SelectItem>
              <SelectItem value="6-12m">{isRTL ? "۶-۱۲ ماه" : "6-12 Months"}</SelectItem>
              <SelectItem value="1-2y">{isRTL ? "۱-۲ سال" : "1-2 Years"}</SelectItem>
              <SelectItem value="2-4y">{isRTL ? "۲-۴ سال" : "2-4 Years"}</SelectItem>
              <SelectItem value="4-6y">{isRTL ? "۴-۶ سال" : "4-6 Years"}</SelectItem>
              <SelectItem value="6-8y">{isRTL ? "۶-۸ سال" : "6-8 Years"}</SelectItem>
              <SelectItem value="8-12y">{isRTL ? "۸-۱۲ سال" : "8-12 Years"}</SelectItem>
              <SelectItem value="12+y">{isRTL ? "۱۲ سال به بالا" : "12+ Years"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "جنسیت" : "Gender"}</Label>
          <Select
            value={(attributes.gender as string) || ""}
            onValueChange={(value) => updateAttribute("gender", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isRTL ? "انتخاب کنید" : "Select"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boy">{isRTL ? "پسرانه" : "Boy"}</SelectItem>
              <SelectItem value="girl">{isRTL ? "دخترانه" : "Girl"}</SelectItem>
              <SelectItem value="unisex">{isRTL ? "هر دو" : "Unisex"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "جنس" : "Material"}</Label>
          <Input
            value={(attributes.material as string) || ""}
            onChange={(e) => updateAttribute("material", e.target.value)}
            placeholder={isRTL ? "جنس محصول" : "Product material"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "رنگ" : "Color"}</Label>
          <Input
            value={(attributes.color as string) || ""}
            onChange={(e) => updateAttribute("color", e.target.value)}
            placeholder={isRTL ? "رنگ محصول" : "Product color"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <Card className="md:col-span-2 p-4 space-y-3 bg-muted/30">
          <Label className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            {isRTL ? "اطلاعات ایمنی" : "Safety Information"}
          </Label>
          <Textarea
            value={(attributes.safetyInfo as string) || ""}
            onChange={(e) => updateAttribute("safetyInfo", e.target.value)}
            placeholder={isRTL ? "اطلاعات ایمنی و هشدارها را وارد کنید..." : "Enter safety info and warnings..."}
            rows={2}
            className={cn(isRTL && "text-right")}
          />
        </Card>

        <div className="space-y-2">
          <Label>{isRTL ? "گواهینامه‌ها" : "Certifications"}</Label>
          <Input
            value={(attributes.certifications as string) || ""}
            onChange={(e) => updateAttribute("certifications", e.target.value)}
            placeholder={isRTL ? "مثال: CE, ASTM, EN71" : "e.g., CE, ASTM, EN71"}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label>{isRTL ? "کشور سازنده" : "Country of Origin"}</Label>
          <Input
            value={(attributes.countryOfOrigin as string) || ""}
            onChange={(e) => updateAttribute("countryOfOrigin", e.target.value)}
            placeholder={isRTL ? "کشور تولیدکننده" : "Manufacturing country"}
            className={cn(isRTL && "text-right")}
          />
        </div>
      </div>
    </div>
  );

  // Match category by name - works with both English names and Persian names
  const getCategoryType = (name: string): string => {
    const categoryMap: Record<string, string[]> = {
      electronics: ["electronics", "الکترونیک", "electronic"],
      clothing: ["clothing", "پوشاک", "fashion", "clothes"],
      home: ["home", "home-living", "خانه", "home & living", "living", "خانگی"],
      beauty: [
        "beauty",
        "beauty-personal-care",
        "زیبایی",
        "beauty & personal care",
        "personal care",
        "آرایشی",
        "بهداشتی",
      ],
      sports: ["sports", "sports-outdoor", "ورزش", "sports & outdoor", "outdoor", "ورزشی"],
      baby: ["baby", "baby-kids", "کودک", "baby & kids", "kids", "نوزاد", "بچه"],
    };

    const normalizedName = name.toLowerCase();

    for (const [type, matches] of Object.entries(categoryMap)) {
      if (matches.some((m) => normalizedName.includes(m) || m.includes(normalizedName))) {
        return type;
      }
    }

    return "";
  };

  const categoryType = getCategoryType(categoryName);

  switch (categoryType) {
    case "electronics":
      return renderElectronicsFields();
    case "clothing":
      return renderClothingFields();
    case "home":
      return renderHomeFields();
    case "beauty":
      return renderBeautyFields();
    case "sports":
      return renderSportsFields();
    case "baby":
      return renderBabyFields();
    default:
      return (
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            {isRTL ? "فیلد اختصاصی برای این دسته‌بندی تعریف نشده است" : "No specific fields defined for this category"}
          </p>
        </Card>
      );
  }
};
