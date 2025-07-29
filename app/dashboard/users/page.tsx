"use client";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { Table } from "@/components/table";
import { PaginationQuery } from "@/components/pagination-query";
import { SearchInputQuery } from "@/components/search-query";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PlusCircle, User as UserIcon } from "lucide-react";
import { User } from "@prisma/client";
import React from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [pageTotal, setPageTotal] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(false);

  const searchParams = useSearchParams();

  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      // Ambil semua query dari URL dan teruskan ke API
      const queryString = searchParams.toString();
      const res = await fetch(`/api/users?${queryString}`);
      const json = await res.json();

      setUsers(json.data);
      setPageTotal(json.totalPages);
      setLoading(false);
    };

    fetchUsers();
  }, [searchParams]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="min-h-screen pt-12 transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:pt-12">
          <div className="p-4 space-y-4">
            <div className="flex justify-between">
              <SearchInputQuery />
              <Button>
                Add user <PlusCircle />
              </Button>
            </div>
            <Table<User>
              columns={[
                {
                  label: "Name",
                  key: "name",
                  render: (obj) => (
                    <a
                      href="#"
                      className="cursor-pointer flex items-center gap-2 text-sm hover:underline"
                    >
                      <UserIcon className="w-4 h-4 stroke-green-600 dark:stroke-green-500" />
                      {obj.name}
                    </a>
                  ),
                },
                {
                  label: "Username",
                  key: "username",
                },
              ]}
              datas={users}
            />
            <PaginationQuery pageTotal={pageTotal} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
