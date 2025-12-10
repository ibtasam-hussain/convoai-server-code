'use client'
import { useState } from "react";
import { message } from 'antd';
import '@ant-design/v5-patch-for-react-19';
// import { apiUrl } from "@/config/config";
// import axios from "axios";
import { axiosClient } from "@/utils/axiosClient";
import validateEmail from '@/utils/validateEmail.js';


const languagesData = [
    {
        id: 1,
        title: 'English',
        image: '/assets/Agents/english.png',
    },
    {
        id: 2,
        title: 'Urdu',
        image: '/assets/Agents/urdu.png',
    },
    {
        id: 3,
        title: 'German',
        image: '/assets/Agents/german.png',
    },
    {
        id: 4,
        title: 'Arabic',
        image: '/assets/Agents/arabic.png',
    },
];


const AddAgent = ({ setShowAddAgent, fetchAgents }) => {
    const [preview, setPreview] = useState({
        orgImage: '',
        userImage: '',
    });
    const [fields, setFields] = useState({
        userEmail: '',
        password: '',
        orgName: '',
        // orgType: '',
        orgImage: '',
        userImage: '',
        languages: [],
    });
    console.log('fields: ', fields);
    const [languages, setLanguages] = useState(languagesData);
    const [hidePassword, setHidePassword] = useState(true);
    
    const selectLanguages = (id, name) => {
        if(!id) return;
        setLanguages(prev => prev?.map(item => item.id == id ? {...item, selected: !item.selected} : item));
        setFields(prev => ({...prev, languages: prev.languages.includes(name) ? prev.languages.filter(item => item !== name) : [...prev.languages, name] }));
    }

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFields(prev => ({...prev, [name]: value}));
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const name = event.target.name;
        if (file) {
          setFields(prev => ({...prev, [name]: file}));
          setPreview(prev => ({...prev, [name]: URL.createObjectURL(file)})); // Preview Image
        }
    };

    const handleSubmit = async () => {
        console.log('fields:sda ', fields);
        if (!fields?.orgImage || !fields?.userEmail || !fields?.password || !fields?.orgName || !fields?.languages) return message.error("Please fill all fields and upload image!");
        if(!validateEmail(fields?.userEmail)) return message.error("Please enter a valid email address!");
    const formData = new FormData();
formData.append("orgImage", fields?.orgImage);
fields?.userImage && formData.append("userImage", fields?.userImage);

Object.entries(fields).forEach(([key, value]) => {
  if (key !== 'orgImage' && key !== 'userImage') {
    formData.append(key, value);
  }
});
       console.log('formData contents:');
for (let [key, value] of formData.entries()) {
  console.log(`${key}:`, value);
}

    
        try {
            const response = await axiosClient.post("/agents/add", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
            });
            console.log('res.data in /add-agent: ', response?.data);
            await fetchAgents();
            message.success('Agent saved successfully!');
            setShowAddAgent(false);
        } catch (error) {
          console.error("Error in /add-agent: ", error?.response?.data || error?.message || error);
          const msg = JSON.stringify(error?.response?.data?.message) || JSON.stringify(error?.response?.data) || JSON.stringify(error?.message) || JSON.stringify(error);
          message.error("There is an error while 'adding agent': "+msg);
        }
    };

    return (
        <div className="w-full h-full fixed top-0 left-0 z-30 backdrop-blur-sm">
            <div className="box-wrapper w-[95%] xs:w-[90%] md:w-[80%] lg:w-[70%] 3lg:w-[60%] 3xl:w-[50%] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-[rgb(30,17,59,.75)] z-40">
                <div className="box relative w-full py-[3rem] pb-[2rem] xs:pb-[3rem] border-[1px] border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[1.5rem] z-50" style={{ background: 'linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)', boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px'}}>
                    <div className="custom-scroll w-[98%] 3xs:w-[95%] sm:w-[85%] md:w-[80%] max-h-[85vh] px-[1rem] overflow-y-auto mx-auto flex flex-col gap-[.7rem] xs:gap-[1.2rem]">
                        <div className="title-section text-center">
                            <div className="title text-[1.7rem] xs:text-[1.9rem] 3xl:text-[2.25rem] leading-[1.15] text-[#EFEFEF] font-semibold">Add Organization to Convo AI</div>
                            {/* <div className="sub-title text-[1rem] text-[#A4A4A4] font-medium mt-[3px]">Enter the following details to add user</div> */}
                        </div>
                        <div className="sub-title text-[1.05rem] xs:text-[1.2rem] text-[#ddd] font-medium mt-[4px] xs:mt-[5px] 3xl:mt-[10px] mb-[3px] xs:mb-[4px] py-[.35rem] border-y-[1px] border-y-gray-400 text-center">Organization Details:</div> 
                        <div className="input-section flex flex-col gap-[.5rem] xs:gap-[.75rem] text-[#A4A4A4] font-medium">
                            <div className="flex flex-wrap gap-[.6rem] xs:gap-[.8rem]">
                                <div className="input-container w-full 2md:w-[calc(50%-.4rem)] min-w-[16rem]">
                                    <label htmlFor="name-input" className="text-[1rem]">Organization Name</label>
                                    <div className="input px-[1.125rem] flex items-center gap-[1.25rem] text-[.95rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] rounded-[.5rem] mt-[.35rem] xs:mt-[.5rem]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                                        <div className="icon"><img src="/assets/Login/user-icon.svg" alt="" /></div>
                                        <input type="text" placeholder="Name" className="w-full py-[.75rem] xs:py-[.95rem] bg-transparent outline-none" id="name-input" name="orgName" value={fields?.orgName} onChange={handleInputChange} required />
                                    </div>
                                </div>
                                <div className="input-container w-full 2md:w-[calc(50%-.4rem)]">
                                <div className="title text-[1rem]">Oraganization Image</div>
                                    <input type="file" accept="image/*" id="org-image-input" className="hidden" name="orgImage" onChange={handleFileChange} />
                                    <label htmlFor="org-image-input" className="w-fit inline-block pl-[.5rem]">
                                        <div className="input w-[3.5rem] h-[3.5rem] xs:w-[4.2rem] xs:h-[4.2rem] flex items-center justify-center gap-[1.25rem] text-[.95rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] mt-[.35rem] xs:mt-[.5rem] rounded-[50%]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                                            {preview?.orgImage ? <img src={preview?.orgImage} className="w-[2rem] xs:w-[2.25rem]" alt="" /> : <img src="/assets/Agents/image-icon.svg" className="w-[2rem] xs:w-[2.25rem]" alt="" />}
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="input-container">
                                <label htmlFor="languages-input" className="text-[1rem]">Languages</label>
                                <div className="languages flex flex-wrap items-center gap-[.4rem] gap-y-[.6rem] xs:gap-[.9375rem] xs:gap-y-[.9375rem] relative mt-[.35rem] xs:mt-[.5rem]">
                                    {languages?.map(item => (
                                        <div onClick={() => selectLanguages(item?.id, item?.title)} className="button w-[calc(25%-.75rem)] min-w-[8.25rem] relative py-[.75rem] 2sm:py-[1rem] px-[1rem] flex items-center justify-center gap-[.4rem] border-[1px] border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[.625rem] cursor-pointer" style={{ background: 'linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)'}}>
                                            <img src={item?.image} alt="" />
                                            <div className="text-[1.0625rem] leading-none">{item?.title}</div>
                                            {item?.selected && <div className="icon w-[1.375rem] h-[1.375rem] absolute right-[-.4rem] top-[-.5rem] flex items-center justify-center bg-[#108E2B] rounded-[50%]"><img src="/assets/Start/tick-icon.svg" alt="" /></div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="sub-title text-[1.05rem] xs:text-[1.2rem] text-[#ddd] font-medium mt-[10px] xs:mt-[20px] mb-[4px] py-[.35rem] border-y-[1px] border-y-gray-400 text-center">Admin User Details:</div> 
                            {/* <div className="sub-title text-[1.2rem] text-[#f6f6f6] font-medium mt-[20px]"></div>  */}
                            <div className="input-container">
                                <label htmlFor="email-input" className="text-[1rem]">Email</label>
                                <div className="input px-[1.125rem] flex items-center gap-[1.25rem] text-[.95rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] rounded-[.5rem] mt-[.35rem] xs:mt-[.5rem]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                                    <div className="icon"><img src="/assets/Login/user-icon.svg" alt="" /></div>
                                    <input type="text" placeholder="Email" className="w-full py-[.75rem] xs:py-[.95rem] bg-transparent outline-none" id="email-input" name="userEmail" value={fields?.userEmail} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="input-container">
                                <label htmlFor="password-input" className="text-[1rem]">Password</label>
                                <div className="input px-[1.125rem] flex items-center gap-[1.25rem] text-[.95rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] rounded-[.5rem] mt-[.35rem] xs:mt-[.5rem]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                                    <div className="icon"><img src="/assets/Login/user-icon.svg" alt="" /></div>
                                    <input type={hidePassword ? "password" : "text"} placeholder="•••••••••" className="w-full py-[.75rem] xs:py-[.95rem] bg-transparent outline-none" id="password-input" name="password" value={fields?.password} onChange={handleInputChange} required />
                                    {hidePassword ? <div className="hide button" onClick={() => setHidePassword(prev => !prev)}><img src="/assets/Login/eye.svg" className="w-[1.5rem] xl:w-[1.75rem]" alt="" /></div> : <div className="hide button" onClick={() => setHidePassword(prev => !prev)}><img src="/assets/Login/eye-hide.svg" className="w-[1.5rem] xl:w-[1.75rem]" alt="" /></div>}
                                </div>
                            </div>
                            
                            
                            <div className="input-container">
                                <div className="title text-[1rem]">User Image</div>
                                <input type="file" accept="image/*" id="user-img-input" className="hidden" name="userImage" onChange={handleFileChange} />
                                <label htmlFor="user-img-input" className="w-fit inline-block">
                                    <div className="input w-[3.5rem] h-[3.5rem] xs:w-[4.2rem] xs:h-[4.2rem] flex items-center justify-center gap-[1.25rem] text-[.95rem] backdrop-blur-[6px] border-[0.3px] border-[rgba(255,255,255,.25)] mt-[.35rem] xs:mt-[.5rem] rounded-[50%]" style={{ background: 'radial-gradient(151.92% 127.02% at 15.32% 21.04%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 77.08%, rgba(255, 255, 255, 0.00) 100%)' }}>
                                        {preview?.userImage ? <img src={preview?.userImage} className="w-[2rem] xs:w-[2.25rem]" alt="" /> : <img src="/assets/Agents/image-icon.svg" className="w-[2rem] xs:w-[2.25rem]" alt="" />}
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="button py-[.6rem] xs:py-[.75rem] bg-[#EF0B64] text-[1.05rem] xs:text-[1.125rem] text-center font-medium rounded-[.9375rem] mt-[.3rem]" onClick={handleSubmit}>Add Organization</div>
                    </div>
                    <div className="button absolute top-[.6rem] right-[.6rem] md:top-[1rem] md:right-[1rem]" onClick={() => setShowAddAgent(false)}><img src="/assets/Agents/cross.svg" className="w-[2.1rem] md:w-[2.7rem]" alt="" /></div>
                </div>
            </div>
        </div>
    )
}


export default AddAgent;