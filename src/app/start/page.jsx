'use client'
import Start from "@/Components/Pages/Start";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";


const StartPage = () => {
  // const searchParams = useSearchParams();
    
  return (
    <Suspense fallback={<div>Loading Start...</div>}>
      <StartPageClient />
      {/* <Start searchParams={searchParams} /> */}
    </Suspense>
  )
}

const StartPageClient = () => {
  const searchParams = useSearchParams();
  return <Start searchParams={searchParams} />;
};

export default StartPage
