import { Link } from 'react-router-dom';
import { getDecodedToken } from '../../utils/authUtils';

const AdminHeader = () => {
  const token = localStorage.getItem('token');
  const decoded = getDecodedToken(token);
  const fullName = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Admin User";
  const role = decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "Superuser";

  return (
    <header className="w-full top-0 sticky bg-[#0e0e0e]/80 backdrop-blur-xl flex justify-between items-center px-6 py-3 z-50 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-6">
        <span className="text-2xl font-black italic text-[#b1ff24] font-['Inter'] tracking-tight">Kinetic AI</span>
        <div className="hidden lg:flex items-center bg-surface-container px-4 py-1.5 rounded-full border border-white/5">
          <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm w-64 text-on-surface outline-none" placeholder="Global search..." type="text"/>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-[#adaaaa] hover:text-[#b1ff24] hover:bg-[#262626] transition-colors active:scale-95 duration-200">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-[#adaaaa] hover:text-[#b1ff24] hover:bg-[#262626] transition-colors active:scale-95 duration-200">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-px bg-white/10 mx-2"></div>
        <Link to="/profile" className="flex items-center gap-3 hover:bg-[#262626] p-1 pr-3 rounded-full transition-colors cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{fullName}</p>
            <p className="text-[10px] text-primary uppercase font-bold tracking-tighter">{role}</p>
          </div>
          <img 
            alt="Administrator profile avatar" 
            className="w-9 h-9 rounded-full border border-primary/30 p-0.5" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkV0V1PddiBlbt2xmr8RWkbwIUl-NCRqYOWz5nGu7nzd9QJZpu3kejeuckpVT9lj-HkItaFt-9XVJAqY9-rAAhP4wrpbPY-Rco7x5Fj7SdcCOyL_f8XhZ-DPdhcqS5VYvyqWBuIMqL7RU-71MWZvygRDDIXihw_VYaF8lyCrkm_ExGqksnpbFdddWeVcnOu_R9KpmDx7XQV75DVOoWD-kV4drLm_bauAd-zjycjRCLRRtZravaGtbo_mA2pxZY2nlAi5O3FbIZOGHQ"
          />
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;
