'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useGetMe } from '@/services/api/generated'; 

export const UserInitializer = ({ children }: { children: React.ReactNode }) => {
  const setUser = useUserStore((s) => s.setUser);
  const setLoading = useUserStore((s) => s.setLoading);
  
  
  const { data, isSuccess, isError, isLoading } = useGetMe({
    query: {
      retry: false, 
    }
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data); 
    } else if (isError) {
      setUser(null); 
    }
    setLoading(isLoading);
    console.log(data)
  }, [data, isSuccess, isError, isLoading, setUser, setLoading]);

  return <>{children}</>;
};