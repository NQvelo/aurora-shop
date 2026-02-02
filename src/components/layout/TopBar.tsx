import { useShop } from '@/context/ShopContext';

const TopBar = () => {
  const { currency, setCurrency, country, setCountry } = useShop();
  
  return (
    <div className="top-bar">
      <p className="text-[10px] uppercase tracking-[0.2em] font-light">
        Free Worldwide Shipping on Orders Over ₾3,500
      </p>
    </div>
  );
};

export default TopBar;
