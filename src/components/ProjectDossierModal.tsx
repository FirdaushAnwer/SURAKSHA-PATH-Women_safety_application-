import React from 'react';
import {
  Info,
  X,
  Award,
  Users,
  Target,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

interface ProjectDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDossierModal: React.FC<ProjectDossierModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
              <Award size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>SEVA FIRST Innovation Challenge 2026</span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Official Submission Dossier · Team QUANTAKRYPTS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs text-slate-300">
          {/* Project Title Card */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/40 rounded-2xl space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-800">
              Project Title
            </span>
            <h3 className="text-sm font-extrabold text-white">
              SurakshaPath: Proactive Community Safety-Mapping & Dynamic Safe-Routing Platform
            </h3>
            <p className="text-[11px] text-emerald-200/90 font-medium italic">
              "Shifting women’s mobility from reactive SOS alerts to predictive, infrastructure-led prevention."
            </p>
            <div className="text-[10px] text-slate-400 pt-1">
              Category: <strong>Diploma & Higher Education – Open Innovation Submission</strong>
            </div>
          </div>

          {/* Team Credentials */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
              <Users size={12} /> Team Composition & Mentorship
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">Team Name</span>
                <strong className="text-white">QUANTAKRYPTS</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">Team Leader</span>
                <strong className="text-white">MD FIRDAUSH</strong>
                <span className="text-[10px] text-slate-400 block font-mono">7992249048</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800/80 col-span-2">
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">Institution & Faculty Mentor</span>
                <div className="text-white font-medium">Sri Siddhartha School of Engineering</div>
                <div className="text-slate-400 text-[10px]">Faculty Mentor: Prof. Shaida Ahmed</div>
              </div>
            </div>
          </div>

          {/* Ground Evidence & Survey */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <FileCheck size={12} /> Field Survey Evidence (N = 120 Female Commuters)
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span><strong className="text-white">78%</strong> alter walking routes or pay extra for autos after 7:00 PM due to unlit streets.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span><strong className="text-white">84%</strong> stated they would report dark spots & harassment if guaranteed 100% anonymity.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Top avoided zones: Unlit approach roads to bus stops, isolated market back-lanes, and liquor vends.</span>
              </div>
            </div>
          </div>

          {/* Core Technical Innovations */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Shield size={12} /> Key Architectural Breakthroughs
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div>
                <strong className="text-emerald-300">1. Zero-PII Hardware Attestation:</strong> Play Integrity 500m geofence validation with zero stored identity and 30-min privacy buffer.
              </div>
              <div>
                <strong className="text-emerald-300">2. Uber H3 Res 9 Grid:</strong> 150m spatial hexagon aggregation enforcing k-anonymity threshold ≥ 3.
              </div>
              <div>
                <strong className="text-emerald-300">3. Anti-Isolation Bayesian Prior:</strong> Avoids the "crime-avoidance trap" by penalizing unmapped dark alleys after sunset.
              </div>
              <div>
                <strong className="text-emerald-300">4. Closed-Loop Civic Verification:</strong> 1-tap commuter micro-prompts to verify municipal lighting repairs in real-time.
              </div>
            </div>
          </div>

          {/* Budget & Target TRL */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Pilot Cost</div>
              <div className="font-extrabold text-base text-white font-mono mt-0.5">₹60,000</div>
              <div className="text-[9px] text-slate-400 mt-1">
                Scalable at &lt; ₹0.50 per active monthly commuter.
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Target TRL</div>
              <div className="font-extrabold text-base text-sky-400 font-mono mt-0.5">TRL 6</div>
              <div className="text-[9px] text-slate-400 mt-1">
                75-day live prototype in neighborhood environment.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
