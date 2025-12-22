import Link from "next/link";
import Logo from "../../../public/assets/Admin/dashboard/logow.png";
import Image from "next/image";

const Header = () => {
  return (
    <div className="header py-[2.5rem] xs:py-[3.9rem] w-[90%] sm:w-[84%] mx-auto flex justify-between items-center">
      
      {/* Logo → admin/login */}
      <div className="left">
        <Link href="/admin/login">
          <div className="logo w-[12.5rem] sm:w-[14.375rem] cursor-pointer">
            <Image src={Logo} className="w-full" alt="logo-image" />
          </div>
        </Link>
      </div>

      {/* Login button → admin/login */}
      <Link
        href="/admin/login"
        className="right button text-[1rem] px-[1.8rem] py-[.8rem] xs:px-[2.5rem] xs:py-[1rem] rounded-[2.5rem] border-[1.5px] border-white"
        style={{ boxShadow: "0px 0px 10px 0px #74F" }}
      >
        Login
      </Link>
    </div>
  );
};

export default Header;
