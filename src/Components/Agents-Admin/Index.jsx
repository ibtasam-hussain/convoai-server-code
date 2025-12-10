'use client';
import { useCallback, useEffect, useState } from 'react';
import AddUser from '../Agents/AddUser';
import EditUser from '../Agents/EditUser';
import axios from 'axios';
import { apiUrl } from '@/config/config';
import { axiosClient } from '@/utils/axiosClient';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import secureLocalStorage from 'react-secure-storage';
import '@ant-design/v5-patch-for-react-19';

const languagesData = [
  { id: 1, title: 'English', image: '/assets/Agents/english.png' },
  { id: 2, title: 'Urdu',    image: '/assets/Agents/urdu.png' },
  { id: 3, title: 'German',  image: '/assets/Agents/german.png' },
  { id: 4, title: 'Arabic',  image: '/assets/Agents/arabic.png' },
];

const AgentsAdminMain = () => {
  // states: data of agents/users/languages
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [languages, setLanguages] = useState(languagesData);
  // states: select
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  // states: show/display
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  // cached users from 'users' state
  const [cachedUsers, setCachedUsers] = useState({});

  const router = useRouter();

  // toggle select/unselect language
  const selectLanguages = (id, name) => {
    if (!id) return;
    setSelectedLanguages((prev) =>
      prev?.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const selectAgent = (id) => {
    if (!id) return;
    setSelectedAgent(id);
    setSelectedUser(''); // null selected user
  };

  const handleAddUser = () => {
    if (!selectedAgent) return message.info('Please select an agent first to add user!');
    setShowAddUser(true);
  };

  const handleEditUser = () => {
    if (!selectedUser) return message.info('Please select a user first to edit!');
    setShowEditUser(true);
  };

  const handleStart = () => {
    if (!selectedAgent) return message.info('Please select an agent first to start!');
    if (!selectedLanguages || selectedLanguages?.length === 0)
      return message.info('Please select language(s) to start!');

    const agent = agents.find((item) => item.id === selectedAgent);

    const lang = selectedLanguages?.map((name) => {
      const img = languages?.find((i) => i.title.toLowerCase() === name.toLowerCase())?.image;
      return { name, image: img };
    });

    const encodedLang = encodeURIComponent(JSON.stringify(lang));
    router.push(
      `/start?agent=${agent?.name}&agentId=${agent?.id}&image=${agent?.image}&languages=${encodedLang}`
    );
  };

  const fetchAgents = useCallback(async () => {
    try {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      if (!user?.id) return;
      const response = await axiosClient.get('/agents/by-user/' + user.id);
      if (response?.data) setAgents(response.data);
    } catch (error) {
      console.error('Error in /agents: ', error?.response?.data || error?.message || error);
      const msg =
        JSON.stringify(error?.response?.data?.message) ||
        JSON.stringify(error?.response?.data) ||
        JSON.stringify(error?.message) ||
        JSON.stringify(error);
      message.error("There is an error in 'agents': " + msg);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, []); // initial fetch only

  const fetchUsers = useCallback(async () => {
    if (!selectedAgent) return;
    try {
      const response = await axiosClient.get('/users/' + selectedAgent);
      if (response?.data) {
        setUsers(response.data);
        setCachedUsers((prev) => ({ ...prev, [selectedAgent]: response.data }));
      }
    } catch (error) {
      console.error('Error in /users: ', error?.response?.data || error?.message || error);
      const msg =
        JSON.stringify(error?.response?.data?.message) ||
        JSON.stringify(error?.response?.data) ||
        JSON.stringify(error?.message) ||
        JSON.stringify(error);
      message.error("There is an error in 'users': " + msg);
    }
  }, [selectedAgent]);

  // 🔑 Helper: robustly parse agent.languages into array of names
  const parseAgentLanguageNames = (agent) => {
    if (!agent) return [];
    const raw = agent.languages;
    if (!raw) return [];

    // 1) If already array in backend
    if (Array.isArray(raw)) return raw;

    // 2) If string: try JSON parse first
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'string') {
          return parsed.split(',').map((s) => s.trim()).filter(Boolean);
        }
      } catch {
        // not JSON, treat as comma-separated
        return raw.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // 🔄 Update language boxes for selected agent AND pre-select them immediately
  const updateLanguage = () => {
    const agent = agents.find((item) => String(item.id) === String(selectedAgent));
    const langNames = parseAgentLanguageNames(agent);

    const normalized = langNames.map((s) => s.toLowerCase().trim());
    const newLanguages = languagesData.filter((l) => normalized.includes(l.title.toLowerCase()));

    // show only agent-allowed languages
    setLanguages(newLanguages);

    // ✅ PRE-SELECT agent's languages right away
    setSelectedLanguages(newLanguages.map((l) => l.title));
  };

  // When agent changes, fetch users + update language boxes & preselect
  useEffect(() => {
    if (!selectedAgent) return;

    if (!cachedUsers[selectedAgent]) {
      fetchUsers();
      updateLanguage();
    } else {
      updateLanguage();
      setUsers(cachedUsers[selectedAgent]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent]);

  // Initial selection: if no agent selected yet, select all visible languages (4 defaults)
  useEffect(() => {
    if (!selectedAgent && languages && languages.length > 0) {
      setSelectedLanguages(languages.map((item) => item.title));
    }
  }, [languages, selectedAgent]);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    if (!token) return router.push('/login');

    const AuthUser = async () => {
      try {
        await axios.post(apiUrl + '/auth/validate-user', { token, email: user?.email });
      } catch (error) {
        console.error('Error in /auth: ', error?.response?.data || error?.message || error);
        const msg =
          JSON.stringify(error?.response?.data?.message) ||
          JSON.stringify(error?.response?.data) ||
          JSON.stringify(error?.message) ||
          JSON.stringify(error);
        message.error('You are not authenticated: ' + msg);
        router.push('/login');
      }
    };
    AuthUser();
  }, [router]);

  return (
    <div className="agents-page min-h-[75vh] w-[92%] xs:w-[80%] 2lg:w-[65%] 3xl:w-[49%] mx-auto flex flex-col gap-[2.5rem] md:gap-[3rem] lg:gap-[4rem] mb-[2.5rem]">
      <div className="agents relative flex flex-col gap-[1.25rem]">
        <div className="gradient-text text-[1.4rem] 4xs:text-[1.45rem] xs:text-[1.6rem] md:text-[1.75rem] leading-[1.2] relative z-10">
          Select your Organization
        </div>
        <div className="boxes grid grid-cols-2 4sm:grid-cols-3 2md:grid-cols-4 items-center justify-center gap-[.5rem] gap-y-[.75rem] 2md:gap-[.9375rem] 2md:gap-y-[.9375rem] relative z-10">
          {agents?.map((item) => (
            <div
              key={item?.id}
              onClick={() => selectAgent(item?.id)}
              className="box relative px-[.4rem] xs:px-[.625rem] py-[.75rem] border-[1px] border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[.625rem]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)',
              }}
            >
              <div className="image mb-[.7rem]">
                <img
                  src={item?.image}
                  className="w-full aspect-[1.05] object-cover object-top rounded-[.625rem]"
                  alt="agent-image"
                />
              </div>
              <div className="title text-[1.1rem] 2lg:text-[1.3125rem] font-semibold text-center leading-none uppercase mb-[.33rem]">
                {item?.name}
              </div>
              {String(item?.id) === String(selectedAgent) && (
                <div className="icon w-[1.375rem] h-[1.375rem] absolute right-[-.4rem] top-[-.5rem] flex items-center justify-center bg-[#108E2B] rounded-[50%]">
                  <img src="/assets/Start/tick-icon.svg" alt="" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="absolute top-[-12rem] left-[3rem] z-0">
          <img src="/assets/Agents/bg-shade.svg" className="relative z-0" alt="" />
        </div>
      </div>

      {selectedAgent && (
        <div className="users flex flex-col gap-[1.25rem]">
          <div className="gradient-text text-[1.4rem] 4xs:text-[1.45rem] xs:text-[1.6rem] md:text-[1.75rem] leading-[1.2]">
            Existing Users
          </div>
          <div className="boxes grid grid-cols-2 sm:grid-cols-3 4sm:grid-cols-4 2md:grid-cols-5 justify-center gap-[.5rem] gap-y-[.7rem] 2md:gap-[.9375rem] 2md:gap-y-[.9375rem]">
            {users?.map((item) => (
              <div
                key={item?.id}
                onClick={() => setSelectedUser(item?.id)}
                className="box relative px-[.4rem] xs:px-[.625rem] py-[.75rem] border-[1px] border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[.625rem]"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)',
                }}
              >
                <div className="image mb-[.7rem]">
                  {item?.image ? (
                    <img
                      src={item?.image}
                      className="w-full aspect-[1.05] object-cover object-top rounded-[.625rem]"
                      alt="user-image"
                    />
                  ) : (
                    <div className="w-full aspect-[1.05] object-cover object-top flex justify-center items-center bg-gray-200 rounded-[.625rem]">
                      <img src="/assets/Agents/user.png" className="w-[55%]" alt="" />
                    </div>
                  )}
                </div>
                <div className="title text-[.95rem] 2lg:text-[1.1rem] font-semibold text-center leading-none uppercase mb-[.4rem]">
                  {item?.name}
                </div>
                <div className="sub-title text-[.75rem] 2lg:text-[.8rem] leading-none text-center text-ellipsis overflow-hidden">
                  {item?.email}
                </div>
                {String(item?.id) === String(selectedUser) && (
                  <div className="icon w-[1.375rem] h-[1.375rem] absolute right-[-.4rem] top-[-.5rem] flex items-center justify-center bg-[#108E2B] rounded-[50%]">
                    <img src="/assets/Start/tick-icon.svg" alt="" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap xs:grid xs:grid-cols-2 3sm:grid-cols-3 items-center justify-center gap-[.4rem] lg:gap-[.7rem]">
            <div
              onClick={handleAddUser}
              className="button flex-1 3xs:flex-none max-w-[65%] w-[49%] xs:w-auto xs:max-w-none text-nowrap py-[.8rem] px-[1.1rem] xs:px-[.5rem] 2sm:px-[1.4rem] flex items-center justify-center gap-[.4rem] 2sm:gap-[.7rem] mt-[.3rem] border-[1px] border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[.625rem]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)',
              }}
            >
              <img src="/assets/Agents/plus-2.svg" className="w-[.9rem]" alt="" />
              <div className="text-[.85rem] lg:text-[.95rem] leading-none">Add User</div>
            </div>
            <div
              onClick={handleEditUser}
              className="button flex-1 3xs:flex-none max-w-[65%] w-[49%] xs:w-auto xs:max-w-none text-nowrap py-[.8rem] px-[1.1rem] xs:px-[.5rem] 2sm:px-[1.4rem] flex items-center justify-center gap-[.4rem] 2sm:gap-[.7rem] mt-[.3rem] border-[1px] border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[.625rem]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)',
              }}
            >
              <img src="/assets/Agents/plus-2.svg" className="w-[.9rem]" alt="" />
              <div className="text-[.85rem] lg:text-[.95rem] leading-none">Edit User</div>
            </div>
            <div
              onClick={() => console.log('clicked')}
              className="button flex-1 3xs:flex-none max-w-[65%] w-[49%] xs:w-auto xs:max-w-none text-nowrap py-[.8rem] px-[1.1rem] xs:px-[.5rem] 2sm:px-[1.4rem] flex items-center justify-center gap-[.4rem] 2sm:gap-[.7rem] mt-[.3rem] border-[1px] border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[.625rem]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)',
              }}
            >
              <img src="/assets/Agents/plus-2.svg" className="w-[.9rem]" alt="" />
              <div className="text-[.85rem] lg:text-[.95rem] leading-none">Delete User</div>
            </div>
          </div>
        </div>
      )}

      <div className="language">
        <div className="gradient-text text-[1.4rem] 4xs:text-[1.45rem] xs:text-[1.6rem] md:text-[1.75rem] leading-[1.2] mb-[1.6rem]">
          Languages
        </div>
        <div className="languages flex flex-wrap items-center justify-center 2sm:justify-start gap-[.6rem] 5xs:gap-[.8rem] gap-y-[.6rem] xs:gap-[.9375rem] xs:gap-y-[.9375rem] relative z-10">
          {languages?.map((item) => (
            <div
              key={item?.id}
              onClick={() => selectLanguages(item?.id, item?.title)}
              className="button w-[calc(25%-.75rem)] min-w-[8.25rem] relative py-[.75rem] 2sm:py-[1rem] px-[1rem] flex items-center justify-center gap-[.4rem] border-[1px] border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[.625rem] cursor-pointer"
              style={{
                background:
                  'linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)',
              }}
            >
              <img src={item?.image} alt="" />
              <div className="text-[.9rem] xs:text-[.95rem] md:text-[1.0625rem] leading-none">
                {item?.title}
              </div>
              {selectedLanguages.includes(item?.title) && (
                <div className="icon w-[1.375rem] h-[1.375rem] absolute right-[-.4rem] top-[-.5rem] flex items-center justify-center bg-[#108E2B] rounded-[50%]">
                  <img src="/assets/Start/tick-icon.svg" alt="" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="button py-[.75rem] bg-[#EF0B64] text-[1.125rem] text-center font-medium rounded-[.9375rem]" onClick={handleStart}>
        Get Started
      </div>

      {showAddUser ? (
        <AddUser setShowAddUser={setShowAddUser} agentId={selectedAgent} fetchUsers={fetchUsers} />
      ) : null}
      {showEditUser ? (
        <EditUser
          setShowEditUser={setShowEditUser}
          data={users.filter((item) => item.id == selectedUser)[0]}
          fetchUsers={fetchUsers}
        />
      ) : null}
    </div>
  );
};

export default AgentsAdminMain;
