import React from 'react';
import {
  Sprout,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  HeartHandshake,
  Recycle,
  Leaf,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const Footer = ({ setActiveTab }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20 border-t border-stone-800">
      {/* Top Value Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-950 text-white py-6 border-b border-brand-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-brand-300">
                <Recycle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold">100% Circular Economy</h4>
                <p className="text-xs text-brand-200">Zero burning, zero landfill rot</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-brand-300">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Farmer First Monetization</h4>
                <p className="text-xs text-brand-200">Fair pricing for vegetable & stubble waste</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-brand-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Verified Organic Feedstock</h4>
                <p className="text-xs text-brand-200">Certified compost & bio-fertilizer supply</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">ReLoop</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              ReLoop is India's leading Smart GreenTech platform bridging farmers directly with
              compost manufacturers, biogas plants, and organic fertilizer units. We monetize farm
              waste and eliminate crop stubble burning.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-xs text-brand-400 font-semibold">
              <HeartHandshake className="w-4 h-4" />
              Empowering 10,000+ Farmers
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Marketplace Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="hover:text-brand-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                  Browse Available Farm Waste
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('matching')}
                  className="hover:text-brand-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                  Smart Matching Engine
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('farmer')}
                  className="hover:text-brand-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                  Farmer Hub (Post Waste Listing)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('buyer')}
                  className="hover:text-brand-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                  Buyer & Recycler Procurement
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Organic Materials */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Supported Materials
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Vegetable Waste',
                'Fruit Pulp & Peel',
                'Crop Stubble & Straw',
                'Sugarcane Bagasse',
                'Cattle Manure Slurry',
                'Mustard Oilseed Cake',
              ].map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-stone-800 text-[11px] text-stone-300 border border-stone-700/80"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Information & Help Desk */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact & Helpline
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <PhoneCall className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Farmer Support Toll-Free</p>
                  <p className="text-stone-400">1800-RELOOP-IN (+91 1800 735 667)</p>
                  <p className="text-stone-400">+91 98765-43210 (WhatsApp Helpdesk)</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Email Inquiries</p>
                  <p className="text-stone-400">support@reloop.in</p>
                  <p className="text-stone-400">procurement@reloop-circular.org</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Punjab Regional Agro Hub</p>
                  <p className="text-stone-400">
                    GT Road Samrala Bypass, Industrial Area Phase 2, Ludhiana, Punjab 141114
                  </p>
                </div>
              </li>

              <li className="flex items-center gap-2.5 text-stone-400">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Mon – Sat: 8:00 AM – 7:00 PM IST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ReLoop Waste Management Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Spring Boot 3.x Backend</span>
            <span>•</span>
            <span>MySQL 8.0</span>
            <span>•</span>
            <span>Circular Economy Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
