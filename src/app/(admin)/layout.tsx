"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Client-side role check (backup for middleware)
  useEffect(() => {
    // In production, verify user role from auth context/session
    // For now, just ensure the user is accessing a valid admin route
    const isCollegeAdmin = pathname.startsWith("/admin/college");
    const isCompanyAdmin = pathname.startsWith("/admin/company");

    if (!isCollegeAdmin && !isCompanyAdmin) {
      // Invalid admin route, redirect to login
      router.push("/login");
    }

    // Add role verification logic here when auth is implemented
    // const userRole = getUserRoleFromAuthContext();
    // if (isCollegeAdmin && userRole !== 'college_admin') {
    //   router.push('/unauthorized');
    // }
    // if (isCompanyAdmin && userRole !== 'company_admin') {
    //   router.push('/unauthorized');
    // }
  }, [pathname, router]);

  return <>{children}</>;
}
