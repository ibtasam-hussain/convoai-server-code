'use client'
import { message } from "antd";
import axios from "axios";
import { useState } from "react";
import '@ant-design/v5-patch-for-react-19';
import secureLocalStorage from "react-secure-storage";
import { apiUrl } from "@/config/config";
import { useRouter } from "next/navigation";
import validateEmail from '@/utils/validateEmail.js';


const LoginPage = () => {
    const [data, setData] = useState({
        email: '',
        password: '',
    });
    const [hide, setHide] = useState(true);

    // const pasteHandler = (e) => {
    //     e.preventDefault();
    //     // const pastedText = e.clipboardData.getData("text/plain");
    //     const clipboardData = e.clipboardData || window.clipboardData;
    //     const pastedText = clipboardData.getData('Text');
    //     // Retrieve current selection positions
    //     const { selectionStart, selectionEnd } = e.target;
    //     const newText = e.target.value.slice(0, selectionStart) + pastedText + e.target.value.slice(selectionEnd);
    //     setData(prev => ({ ...prev, password: newText }));
    // }

const handleLogin = async () => {
    try {
        if (!validateEmail(data?.email)) return message.error("Please enter a valid email address!");

        const response = await axios.post(apiUrl + "/auth/login", {
            email: data.email,
            password: data.password,
        });

        const res = response?.data;

        if (res?.token) {
            localStorage.setItem("token", res.token);
        }

        if (res?.user) {
            localStorage.setItem("user", JSON.stringify({
                name: res.user.name || '',
                email: res.user.email,
                id: res.user.id,
                role: res.user.role,
            }));
            
            // Dispatch custom event to notify sidebar of user update
            window.dispatchEvent(new Event("userUpdated"));
        }

        console.log('res.data in /login: ', res?.token, res?.user);

        res?.user?.role === 'super-admin' ? router.push('/agents') : router.push('/agents-admin');

    } catch (error) {
        console.error("Error in /login: ", error?.response?.data || error?.message || error);
        const msg = error?.response?.data?.message || error?.message || "There is an error";
        message.error(msg);
    }
};


    const router = useRouter();

  return (
    <div className="login-page relative w-full md:w-[90%] min-h-[75vh] mx-auto flex justify-center items-center">
        <div className="box w-[95%] 4sm:w-[70%] lg:w-[55%] 3xl:w-[36.5%] px-[1.5rem] py-[2.4rem] xs:px-[2rem] 4xs:py-[2.7rem] 2sm:px-[3rem] xs:py-[3rem] lg:px-[4.3rem] md:py-[4.125rem] mt-[-3rem] xs:mt-0 flex flex-col gap-[1.25rem] backdrop-blur-[40px] border-white border-[1.5px] rounded-[3.5rem] z-50" style={{ background: 'linear-gradient(44deg, rgba(96, 92, 241, 0.10) 14.64%, rgba(160, 57, 252, 0.10) 85.36%)' }}>
            <div className="title-section text-center">
                <div className="title text-[1.8rem] 3xs:text-[2.1rem] lg:text-[2.5rem] text-[#EFEFEF] font-semibold">Welcome Back!</div>
                <div className="sub-title text-[.9rem] 3xs:text-[1rem] text-[#A4A4A4] font-medium mt-[-5px]">welcome back we missed you</div>
            </div>
            <div className="input-section flex flex-col gap-[.75rem] text-[#A4A4A4] font-medium">
                <div className="input-container">
                    <label htmlFor="email-input text-[1rem]">Email</label>
                    <div className="input px-[1.125rem] flex items-center gap-[1.25rem] text-[.9rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] rounded-[.5rem] mt-[.5rem]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                        <div className="icon"><img src="/assets/Login/user-icon.svg" alt="" /></div>
                        <input type="text" placeholder="Email" className="w-full py-[.7rem] xs:py-[1rem] bg-transparent outline-none" id="email-input" value={data?.email} onChange={e => setData(prev => ({...prev, email: e.target.value}))} />
                    </div>
                </div>
                <div className="input-container">
                    <label htmlFor="password-input text-[1rem]">Password</label>
                    <div className="input px-[1.125rem] flex items-center gap-[1.25rem] text-[.9rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] rounded-[.5rem] mt-[.5rem]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                        <div className="icon"><img src="/assets/Login/key-icon.svg" alt="" /></div>
                        <input type={hide ? "password" : "text"} placeholder="Password" className="w-full py-[.7rem] xs:py-[1rem] bg-transparent outline-none" id="password-input" value={data?.password} onChange={e => setData(prev => ({...prev, password: e.target.value}))} />
                        {hide ? <div className="hide button" onClick={() => setHide(prev => !prev)}><img src="/assets/Login/eye.svg" className="w-[1.5rem] xl:w-[1.75rem]" alt="" /></div> : <div className="hide button" onClick={() => setHide(prev => !prev)}><img src="/assets/Login/eye-hide.svg" className="w-[1.5rem] xl:w-[1.75rem]" alt="" /></div>}
                    </div>
                </div>
                <div className="bottom flex flex-wrap items-center justify-between gap-y-[.2rem] gap-[.4rem] text-[.85rem] 3xs:text-[.875rem]">
                    <div className="link">Don't have an account?</div>
                    <div className="link">Forgot Password?</div>
                </div>
            </div>
            <div className="button py-[.75rem] bg-[#EF0B64] text-[1.125rem] text-center font-medium rounded-[.9375rem]" onClick={handleLogin}>Sign in</div>
        </div>
        {/* gradient background */}
        <div className="bg-wrapper absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] h-full w-full z-10"><img src="/assets/Landing/bg.svg" alt="" /></div>
    </div>
  )
}

export default LoginPage
