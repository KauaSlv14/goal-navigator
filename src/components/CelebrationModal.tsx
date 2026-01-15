import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/types';
import { PartyPopper, Trophy, Sparkles } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalName: string;
  amount: number;
}

const Confetti = () => {
  const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 2}s`,
    size: `${8 + Math.random() * 8}px`,
    rotation: `${Math.random() * 360}deg`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute bottom-0 animate-confetti"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
        >
          <div
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              transform: `rotate(${piece.rotation})`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export const CelebrationModal = ({
  isOpen,
  onClose,
  goalName,
  amount,
}: CelebrationModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {showConfetti && <Confetti />}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md text-center border-0 bg-gradient-to-br from-card to-secondary/50">
          <div className="py-8 px-4">
            <div className="flex justify-center mb-6">
              <div className="relative animate-bounce-in">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-warning flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-accent-foreground" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-accent animate-pulse" />
                <PartyPopper className="absolute -bottom-1 -left-2 w-7 h-7 text-success animate-pulse" />
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-foreground mb-3 animate-scale-in">
              Parabéns! 🎉
            </h2>

            <p className="text-lg text-muted-foreground mb-2">
              Você atingiu sua meta
            </p>

            <p className="text-2xl font-bold text-gradient mb-4">
              {goalName}
            </p>

            <div className="bg-success/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-success font-medium mb-1">
                Total acumulado
              </p>
              <p className="text-3xl font-extrabold text-success">
                {formatCurrency(amount)}
              </p>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Continue assim! Cada meta alcançada é um passo rumo aos seus sonhos.
            </p>

            <Button
              onClick={onClose}
              variant="gradient"
              size="lg"
              className="w-full"
            >
              Celebrar! 🥳
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
