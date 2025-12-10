'use client'
import { useState } from "react";
import { message } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import { axiosClient } from "@/utils/axiosClient";
// import { apiUrl } from "@/config/config";
// import axios from "axios";
import validateEmail from '@/utils/validateEmail.js';



const AddUser = ({ setShowAddUser, agentId, fetchUsers }) => {
    const [preview, setPreview] = useState('');
    const [fields, setFields] = useState({
        name: '',
        email: '',
        password: '',
        image: '',
        expiry: '15m',
    });
    const [hidePassword, setHidePassword] = useState(true);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFields(prev => ({...prev, [name]: value}));
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFields(prev => ({...prev, image: file}));
            setPreview(URL.createObjectURL(file)); // Preview Image
        }
    };

    const handleSubmit = async () => {
        if (!fields?.image || !fields?.email || !fields?.password || !fields?.name) return message.error("Please fill all fields and upload image!");
        if(!validateEmail(fields?.email)) return message.error("Please enter a valid email address!");
        const formData = new FormData();
        formData.append("image", fields?.image);
        formData.append("agentId", agentId);

        Object.entries(fields).forEach(([key, value]) => {
            if(key != 'image') {
                formData.append(key, value);
            }
        });
        console.log('formData: ', formData);
    
        try {
            const response = await axiosClient.post("/users/add", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log('res.data in /add-user: ', response?.data);
            message.success('User saved successfully!');
            await fetchUsers();
            setShowAddUser(false);
        } catch (error) {
            console.error("Error in /add-user: ", error?.response?.data || error?.message || error);
            const msg = JSON.stringify(error?.response?.data?.message) || JSON.stringify(error?.response?.data) || JSON.stringify(error?.message) || JSON.stringify(error);
            message.error("There is an error while 'adding user': ", msg);
        }
    };
        
    return (
        <div className="w-full h-full fixed top-0 left-0 z-30 backdrop-blur-sm">
            <div className="box-wrapper w-[95%] xs:w-[90%] md:w-[80%] lg:w-[70%] 3lg:w-[60%] 3xl:w-[50%] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-[rgb(30,17,59,.75)] z-40">
                <div className="box relative w-full py-[3rem] pb-[1.75rem] xs:pb-[3rem] border-[1px] border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[1.5rem] z-50" style={{ background: 'linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)', boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px'}}>
                    <div className="w-[90%] sm:w-[85%] md:w-[80%] mx-auto flex flex-col gap-[.75rem] xs:gap-[1rem]">
                        <div className="title-section text-center">
                            <div className="title text-[1.7rem] xs:text-[1.9rem] 3xl:text-[2.25rem] leading-[1.15] text-[#EFEFEF] font-semibold">Add User to Convo AI</div>
                            <div className="sub-title text-[.9rem] xs:text-[1rem] text-[#A4A4A4] font-medium mt-[3px]">Enter the following details to add user</div>
                        </div>
                        <div className="input-section flex flex-col gap-[.6rem] xs:gap-[.75rem] text-[#A4A4A4] font-medium">
                            <div className="input-container">
                                <label htmlFor="email-input" className="text-[.95rem] xs:text-[1rem]">Email</label>
                                <div className="input px-[1.125rem] flex items-center gap-[1.25rem] text-[.95rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] rounded-[.5rem] mt-[.3rem] xs:mt-[.5rem]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                                    <div className="icon"><img src="/assets/Login/user-icon.svg" alt="" /></div>
                                    <input type="text" placeholder="Email" className="w-full py-[.7rem] sm:py-[.95rem] bg-transparent outline-none" id="email-input" name="email" value={fields?.email} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="input-container">
                                <label htmlFor="password-input" className="text-[.95rem] xs:text-[1rem]">Password</label>
                                <div className="input px-[1.125rem] flex items-center gap-[1.25rem] text-[.95rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] rounded-[.5rem] mt-[.3rem] xs:mt-[.5rem]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                                    <div className="icon"><img src="/assets/Login/key-icon.svg" alt="" /></div>
                                    <input type={hidePassword ? 'password' : 'text'} placeholder="•••••••••" className="w-full py-[.7rem] sm:py-[.95rem] bg-transparent outline-none" id="password-input" name="password" value={fields?.password} onChange={handleInputChange} required />
                                    {hidePassword ? <div className="hide button" onClick={() => setHidePassword(prev => !prev)}><img src="/assets/Login/eye.svg" className="w-[1.5rem] xl:w-[1.75rem]" alt="" /></div> : <div className="hide button" onClick={() => setHidePassword(prev => !prev)}><img src="/assets/Login/eye-hide.svg" className="w-[1.5rem] xl:w-[1.75rem]" alt="" /></div>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 3xs:grid-cols-2 gap-[.4rem] 2sm:gap-[.8rem]">
                                <div className="input-container">
                                    <label htmlFor="name-input" className="text-[.95rem] xs:text-[1rem]">User Name</label>
                                    <div className="input px-[1.125rem] flex items-center gap-[1.25rem] text-[.95rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] rounded-[.5rem] mt-[.3rem] xs:mt-[.5rem]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                                        <div className="icon"><img src="/assets/Login/user-icon.svg" alt="" /></div>
                                        <input type="text" placeholder="Name" className="w-full py-[.7rem] sm:py-[.95rem] bg-transparent outline-none" id="name-input" name="name" value={fields?.name} onChange={handleInputChange} required />
                                    </div>
                                </div>
                                <div className="input-container">
                                    <label htmlFor="expiry-input" className="text-[.95rem] xs:text-[1rem]">Expiry</label>
                                    <div className="select-wrapper relative">
                                        <select id="expiry-input" name="expiry" value={fields?.expiry} onChange={handleInputChange} className="w-full px-[1.125rem] py-[.7rem] sm:py-[.95rem] flex items-center gap-[1.25rem] text-[.95rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] rounded-[.5rem] outline-none mt-[.3rem] xs:mt-[.5rem]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                                            <option className="px-[1.125rem] py-[.95rem] text-[.95rem] text-white bg-sky-600" value={'15m'} selected>15m</option>
                                            <option className="px-[1.125rem] py-[.95rem] text-[.95rem] text-white bg-sky-600" value={'1h'}>1h</option>
                                            <option className="px-[1.125rem] py-[.95rem] text-[.95rem] text-white bg-sky-600" value={'1d'}>1d</option>
                                            <option className="px-[1.125rem] py-[.95rem] text-[.95rem] text-white bg-sky-600" value={'never'}>Never</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="input-container">
                                <div htmlFor="image-input" className="text-[.95rem] xs:text-[1rem]">User Image</div>
                                <input type="file" accept="image/*" id="image-input" className="hidden" onChange={handleFileChange} />
                                <label htmlFor="image-input" className="w-fit inline-block">
                                    <div className="input w-[3.5rem] h-[3.5rem] xs:w-[4.2rem] xs:h-[4.2rem] flex items-center justify-center gap-[1.25rem] text-[.95rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] mt-[.3rem] xs:mt-[.5rem] rounded-[50%]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                                        {preview ? <img src={preview} className="w-[2rem] xs:w-[2.25rem]" alt="" /> : <img src="/assets/Agents/image-icon.svg" className="w-[2rem] xs:w-[2.25rem]" alt="" />}
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="button py-[.6rem] xs:py-[.75rem] bg-[#EF0B64] text-[1.05rem] xs:text-[1.125rem] text-center font-medium rounded-[.9375rem] mt-[.3rem]" onClick={handleSubmit}>Add User</div>
                    </div>
                    <div className="button absolute top-[.6rem] right-[.6rem] md:top-[1rem] md:right-[1rem]" onClick={() => setShowAddUser(false)}><img src="/assets/Agents/cross.svg" className="w-[2.1rem] md:w-[2.7rem]" alt="" /></div>
                </div>
            </div>
        </div>
    )
}


export default AddUser;