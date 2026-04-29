'use client';

import React from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  floating?: boolean;
}

export function ShareButton({
  title = 'تطبيقنا المميز',
  text = 'تفقد هذا التطبيق الرائع!',
  url,
  className = '',
  floating = true
}: ShareButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    // Get the URL dynamically on the client side
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        toast({
          title: 'تمت المشاركة',
          description: 'شكراً لمشاركة التطبيق!',
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast({
          title: 'تم نسخ الرابط!',
          description: 'تم نسخ رابط التطبيق إلى الحافظة بنجاح.',
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast({
          title: 'خطأ',
          description: 'عذراً، لم نتمكن من نسخ الرابط.',
          variant: 'destructive',
        });
      }
    }
  };

  if (floating) {
    return (
      <button
        onClick={handleShare}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium py-3 px-5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-md md:hidden ${className}`}
        aria-label="Share App"
        dir="rtl"
      >
        {copied ? (
          <Check className="h-5 w-5 text-green-300 animate-pulse ml-1" />
        ) : (
          <Share2 className="h-5 w-5 ml-1 animate-pulse" style={{ animationDuration: '3s' }} />
        )}
        <span className="text-sm font-semibold">مشاركة التطبيق</span>
      </button>
    );
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className={`border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold shadow-sm transition-all duration-300 gap-2 ${className}`}
      dir="rtl"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600 ml-1" />
      ) : (
        <Share2 className="h-4 w-4 ml-1" />
      )}
      <span>{copied ? 'تم النسخ!' : 'مشاركة التطبيق'}</span>
    </Button>
  );
}
