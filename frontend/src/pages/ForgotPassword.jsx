import ForgotForm from '../components/auth/ForgotForm'

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-artisan-dark flex flex-col lg:flex-row">
      {/* Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-artisan-grey p-24 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-8xl xl:text-[10rem] font-display font-extrabold text-artisan-dark uppercase tracking-tighter leading-[0.8]">
            Access <br /> 
            <span className="opacity-40">Portal.</span>
          </h2>
        </div>
        
        <div className="relative z-10">
           <p className="text-xl text-artisan-dark font-display font-extrabold uppercase tracking-widest">Restore the Connection.</p>
           <p className="text-sm text-artisan-dark/60 font-mono uppercase tracking-widest mt-2">Verified Artisan Platform v1.0</p>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute -bottom-20 -left-20 text-[30rem] font-display font-extrabold text-artisan-dark/[0.05] pointer-events-none select-none">
          FS
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 bg-artisan-dark p-8 md:p-12 lg:p-24 flex items-center justify-center">
        <ForgotForm />
      </div>
    </div>
  )
}
