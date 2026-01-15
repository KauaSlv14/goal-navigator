import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Link, Calendar, Shield, Banknote, Smartphone, ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => void;
}

export interface GoalFormData {
  name: string;
  targetAmount: number;
  initialCash: number;
  initialPix: number;
  productLink: string;
  imageUrl: string;
  targetDate: string;
  safetyMargin: number;
}

export const CreateGoalModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateGoalModalProps) => {
  const [loading, setLoading] = useState(false);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [uploadedImageName, setUploadedImageName] = useState('');
  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    targetAmount: 0,
    initialCash: 0,
    initialPix: 0,
    productLink: '',
    imageUrl: '',
    targetDate: '',
    safetyMargin: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const nextValue = type === 'number' ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (name === 'imageUrl') {
      setUploadedImageName('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Envie um arquivo de imagem');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setFormData((prev) => ({
          ...prev,
          imageUrl: result,
        }));
        setUploadedImageName(file.name);
        toast.success('Imagem carregada!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSearchImage = async () => {
    if (!formData.name && !formData.productLink) {
      toast.error('Digite o nome do item ou cole o link do produto');
      return;
    }
    
    setLoading(true);
    setUploadedImageName('');
    // Mock image search - in production, this would call an API
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: `https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop`,
      }));
      setLoading(false);
      toast.success('Imagem encontrada!');
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Digite o nome da meta');
      return;
    }
    
    if (formData.targetAmount <= 0) {
      toast.error('O valor alvo deve ser maior que zero');
      return;
    }

    onSubmit(formData);
    setFormData({
      name: '',
      targetAmount: 0,
      initialCash: 0,
      initialPix: 0,
      productLink: '',
      imageUrl: '',
      targetDate: '',
      safetyMargin: 10,
    });
    setUploadedImageName('');
    setImageInputKey((prev) => prev + 1);
    onClose();
    toast.success('Meta criada com sucesso!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="w-6 h-6 text-primary" />
            Criar Meta
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome do item *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Honda CB 500F"
              className="h-11"
            />
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="targetAmount" className="text-sm font-medium">
              Valor alvo (R$) *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="targetAmount"
                name="targetAmount"
                type="number"
                value={formData.targetAmount || ''}
                onChange={handleChange}
                placeholder="0,00"
                className="h-11 pl-10"
                min={0}
                step={0.01}
              />
            </div>
          </div>

          {/* Initial Balances */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initialCash" className="text-sm font-medium flex items-center gap-1.5">
                <Banknote className="w-4 h-4" />
                Saldo inicial (Dinheiro)
              </Label>
              <Input
                id="initialCash"
                name="initialCash"
                type="number"
                value={formData.initialCash || ''}
                onChange={handleChange}
                placeholder="0,00"
                className="h-11"
                min={0}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialPix" className="text-sm font-medium flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                Saldo inicial (Pix)
              </Label>
              <Input
                id="initialPix"
                name="initialPix"
                type="number"
                value={formData.initialPix || ''}
                onChange={handleChange}
                placeholder="0,00"
                className="h-11"
                min={0}
                step={0.01}
              />
            </div>
          </div>

          {/* Product Link */}
          <div className="space-y-2">
            <Label htmlFor="productLink" className="text-sm font-medium flex items-center gap-1.5">
              <Link className="w-4 h-4" />
              Link do produto (opcional)
            </Label>
            <Input
              id="productLink"
              name="productLink"
              value={formData.productLink}
              onChange={handleChange}
              placeholder="https://www.loja.com/produto"
              className="h-11"
            />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              Imagem
            </Label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="URL da imagem ou busque automaticamente"
                  className="h-11 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearchImage}
                  disabled={loading}
                  className="h-11 px-4"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Buscar'
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  key={imageInputKey}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="h-11 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-secondary file:text-sm file:font-medium file:text-foreground hover:file:bg-secondary/80"
                />
                {uploadedImageName && (
                  <span className="text-xs text-muted-foreground truncate">
                    {uploadedImageName}
                  </span>
                )}
              </div>
            </div>
            {formData.imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden w-24 h-24 bg-secondary">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label htmlFor="targetDate" className="text-sm font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Data alvo (opcional)
            </Label>
            <Input
              id="targetDate"
              name="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={handleChange}
              className="h-11"
            />
          </div>

          {/* Safety Margin */}
          <div className="space-y-2">
            <Label htmlFor="safetyMargin" className="text-sm font-medium flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Margem de segurança (%)
            </Label>
            <Input
              id="safetyMargin"
              name="safetyMargin"
              type="number"
              value={formData.safetyMargin}
              onChange={handleChange}
              placeholder="10"
              className="h-11"
              min={0}
              max={100}
            />
            <p className="text-xs text-muted-foreground">
              Adiciona uma reserva extra ao valor alvo para imprevistos
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" className="flex-1">
              Criar Meta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
