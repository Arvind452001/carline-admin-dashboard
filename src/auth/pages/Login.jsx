import LoginForm from '../components/LoginForm'
import logo from '@/assets/logo.webp'

export default function Login() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-surface to-surface-raised flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none">
      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-border-subtle overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] relative">

        {/* Left Hero Panel (Bright, light, vibrant orange aesthetic) */}
        <div className="lg:col-span-6 relative flex flex-col justify-between p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-[#F15A26] via-[#FF7B49] to-[#FF9E73] text-white">

          {/* Top Right White Wavy Cutout overlay matching mockup curve */}
          <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white pointer-events-none opacity-100 hidden lg:block z-0"></div>

          {/* Logo positioned inside the top-right white cutout circle */}
          <div className="absolute top-6 right-6 z-10 hidden lg:flex items-center justify-center">
            <img
              src="/logo.webp"
              alt="Logo"
              className="h-40 w-40 object-contain drop-shadow-md hover:scale-105 transition-transform"
            />
          </div>

          {/* Floating 3D Spheres with light, vibrant orange gradients */}
          {/* Sphere 1: Prominent center sphere */}
          <div className="w-56 h-56 rounded-full bg-gradient-to-br from-[#FFB894] via-[#FF7A47] to-[#F15A26] shadow-xl shadow-orange-950/15 border border-white/40 absolute bottom-10 left-20 z-10 hidden sm:block"></div>

          {/* Sphere 2: Bottom-left background sphere */}
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[#FFA87D] via-[#F15A26] to-[#E34B16] shadow-lg border border-white/20 absolute -bottom-16 -left-16 z-0"></div>

          {/* Sphere 3: Corner overlapping accent sphere */}
          <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-[#FFC2A3] to-[#FF8554] shadow-lg border border-white/30 absolute -bottom-8 right-8 z-20 hidden sm:block"></div>



          {/* Hero Welcome Text */}
          <div className="relative z-20 max-w-xs space-y-3 my-auto py-10">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-wider text-white uppercase drop-shadow-md">
              WELCOME
            </h2>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-orange-100">
              TAXI DISPATCH ADMIN
            </p>
            <p className="text-xs text-white/90 leading-relaxed font-medium">
              Manage your taxi fleet, live drivers, rides, and dispatch operations effortlessly with our all-in-one real-time admin system.
            </p>
          </div>

          {/* Footer copyright */}
          <div className="relative z-20 text-[11px] text-white/75 font-medium">
            © {new Date().getFullYear()} Carline Taxi Dispatch. All rights reserved.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-6 flex flex-col justify-center p-8 sm:p-12 bg-white relative z-10 overflow-hidden">

          {/* Bottom Right Corner Accent Circle matching image reference */}
          <div className="absolute -bottom-14 -right-14 w-36 h-36 rounded-full bg-gradient-to-br from-[#FF8554] to-[#FFAB85] pointer-events-none opacity-80 hidden sm:block z-0"></div>

          <div className="w-full max-w-md mx-auto relative z-10 space-y-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-text-primary">Sign in</h1>
            </div>

            <LoginForm />
          </div>
        </div>

      </div>
    </div>
  )
}


