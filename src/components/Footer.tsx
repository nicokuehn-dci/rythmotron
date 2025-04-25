import React from 'react';
import { Separator } from '@/components/ui/separator';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-zinc-900 border-t border-zinc-800 py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <i className="fa-solid fa-waveform-path text-white text-sm"></i>
              </div>
              <div className="font-bold text-xl tracking-tight">ARythm-EMU 2050</div>
            </div>
            <p className="text-zinc-400 mb-4">
              The future of sound design and music production, available today.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <i className="fa-brands fa-twitter text-lg"></i>
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <i className="fa-brands fa-facebook text-lg"></i>
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <i className="fa-brands fa-instagram text-lg"></i>
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <i className="fa-brands fa-youtube text-lg"></i>
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Products</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">ARythm-EMU 2050</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Sound Packs</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Expansion Modules</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Preset Collections</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Hardware Controllers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Tutorials</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">User Forum</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Sound Design Blog</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Developer API</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Press Kit</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <Separator className="bg-zinc-800 mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-zinc-500 mb-4 md:mb-0">
            © 2025 ARythm Audio Technologies. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <i className="fa-brands fa-cc-visa text-zinc-400 text-2xl mr-2"></i>
              <i className="fa-brands fa-cc-mastercard text-zinc-400 text-2xl mr-2"></i>
              <i className="fa-brands fa-cc-paypal text-zinc-400 text-2xl mr-2"></i>
              <i className="fa-brands fa-cc-apple-pay text-zinc-400 text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;