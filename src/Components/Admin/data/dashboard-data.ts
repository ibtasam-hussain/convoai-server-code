export const dashboardData = {
  // 📊 Stats Cards
  statsCards: [
    {
      icon: "phone",
      title: "Today's Call Logs",
      value: "3,245",
      percentage: "28.4%",
    },
    {
      icon: "message-square",
      title: "Today's Chat Logs",
      value: "1,359",
      percentage: "28.4%",
    },
    {
      icon: "clock",
      title: "Today's Avg. Call Duration",
      value: "08 Min 18 Sec",
      percentage: "28.4%",
    },
    {
      icon: "ticket",
      title: "Tickets in Progress",
      value: "365",
      percentage: "28.4%",
    },
    {
      icon: "ticket",
      title: "Tickets Closed",
      value: "982",
      percentage: "28.4%",
    },
  ],

  // 🟪 Main Chart (Complaints Overview)
  mainChart: {
    title: "Total Complaints",
    value: "21,356",
    percentage: "28.4%",
    data: [
      { month: "Jan", calls: 25000, chats: 35000 },
      { month: "Feb", calls: 40000, chats: 30000 },
      { month: "Mar", calls: 65000, chats: 45000 },
      { month: "Apr", calls: 50000, chats: 60000 },
      { month: "May", calls: 80000, chats: 75000 },
      { month: "Jun", calls: 95000, chats: 90000 },
      { month: "Jul", calls: 100000, chats: 110000 },
      { month: "Aug", calls: 120000, chats: 100000 },
      { month: "Sep", calls: 90000, chats: 85000 },
      { month: "Oct", calls: 70000, chats: 75000 },
      { month: "Nov", calls: 80000, chats: 90000 },
      { month: "Dec", calls: 95000, chats: 100000 },
    ],
  },

  // 📞 Bar Chart (Avg. Call Duration)
  barChart: {
    title: "Avg. Call Duration",
    value: "08 Min 01 Sec",
    percentage: "28.4%",
    timeLabels: ["12 AM", "8 AM", "4 PM", "11 PM"],
    data: [
      { time: "12 AM", value: 65 },
      { time: "12:30 AM", value: 65 },
      { time: "1 AM", value: 45 },
      { time: "1:30 AM", value: 45 },
      { time: "2 AM", value: 75 },
      { time: "2:30 AM", value: 75 },
      { time: "3 AM", value: 55 },
      { time: "4 AM", value: 85 },
      { time: "5 AM", value: 50 },
      { time: "6 AM", value: 65 },
      { time: "7 AM", value: 75 },
      { time: "8 AM", value: 45 },
      { time: "9 AM", value: 65 },
      { time: "10 AM", value: 85 },
      { time: "11 AM", value: 75 },
      { time: "12 PM", value: 65 },
      { time: "1 PM", value: 55 },
      { time: "1:30 PM", value: 75 },
      { time: "2 PM", value: 75 },
      { time: "2:30 PM", value: 80 },
      { time: "3 PM", value: 85 },
      { time: "3:30 PM", value: 40 },
      { time: "4 PM", value: 65 },
      { time: "5 PM", value: 75 },
      { time: "6 PM", value: 55 },
    ],
  },

  // 📈 Line Charts (Activity Over Time)
  lineCharts: [
    {
      title: "Total Chats",
      value: "400",
      percentage: "28.4%",
      timeLabels: ["12 AM", "8 AM", "4 PM", "5 PM"],
      data: [
        { time: "12 AM", value: 30 },
        { time: "2 AM", value: 40 },
        { time: "4 AM", value: 25 },
        { time: "6 AM", value: 45 },
        { time: "8 AM", value: 35 },
        { time: "10 AM", value: 55 },
        { time: "12 PM", value: 40 },
        { time: "2 PM", value: 80 },
        { time: "4 PM", value: 65 },
        { time: "5 PM", value: 45 },
      ],
    },
    {
      title: "Total Calls",
      value: "400",
      percentage: "28.4%",
      visitors: "10k visitors",
      timeLabels: ["12 AM", "8 AM", "4 PM", "11 PM"],
      data: [
        { time: "12 AM", value: 35 },
        { time: "2 AM", value: 45 },
        { time: "4 AM", value: 30 },
        { time: "6 AM", value: 50 },
        { time: "8 AM", value: 40 },
        { time: "10 AM", value: 60 },
        { time: "12 PM", value: 45 },
        { time: "2 PM", value: 85 },
        { time: "4 PM", value: 70 },
        { time: "11 PM", value: 50 },
      ],
    },
  ],

  // 💬 Social Media Chart
  socialChart: {
    title: "Total Chats",
    value: "1,200",
    percentage: "28.4%",
    data: [
      { platform: "web", percentage: 70 },
      { platform: "facebook", percentage: 60 },
      { platform: "whatsapp", percentage: 90 },
      { platform: "instagram", percentage: 70 },
      { platform: "phone", percentage: 80 },
    ],
  },

  // 🌍 Location Data
  locationData: {
    title: "Users by Location",
    value: "12.4 K",
    percentage: "28.4%",
    locations: [
      { name: "Defense Phase 2, Karachi", percentage: 30 },
      { name: "Federal B Area, Karachi", percentage: 70 },
      { name: "Gulshan-e-Iqbal Block 5, Karachi", percentage: 62 },
    ],
  },
};
