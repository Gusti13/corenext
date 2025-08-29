"use client";
import React from "react";
import { Table } from "@/components/table";
import { PaginationQuery } from "@/components/pagination-query";
import { SearchInputQuery } from "@/components/search-query";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, User as UserIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ResponseList } from "@/lib/prisma";
import Link from "next/link";
import { Group } from "@prisma/client";

export default function Page() {
  const searchParams = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/groups", searchParams.toString()],
    queryFn: async (): Promise<ResponseList<Group[]>> => {
      // Ambil semua query dari URL dan teruskan ke API
      const queryString = searchParams.toString();
      const res = await fetch(`/api/groups?${queryString}`);
      return await res.json();
    },
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <SearchInputQuery />
        <CreateNew />
      </div>
      <Table<Group>
        isLoading={isLoading}
        columns={[
          {
            label: "Name",
            key: "name",
            render: (obj) => (
              <Link
                href={"/dashboard/groups/" + obj.id}
                className="cursor-pointer flex items-center gap-2 text-sm hover:underline"
              >
                <UserIcon className="w-4 h-4 stroke-green-600 dark:stroke-green-500" />
                {obj.name}
              </Link>
            ),
          },
          {
            label: "Created At",
            key: "created_at",
            render: (obj) => `${obj.created_at}`,
          },
        ]}
        datas={data?.data || []}
      />
      <PaginationQuery pageTotal={data?.totalPages || 1} />
    </div>
  );
}

const schema = z.object({
  name: z.string().nonempty("Name is required"),
});

type UserType = z.input<typeof schema>;

export const CreateNew = () => {
  const queryClient = useQueryClient();
  const { handleSubmit, register, formState } = useForm({
    resolver: zodResolver(schema),
  });
  const mutation = useMutation<Response, Error, UserType>({
    mutationFn: (data) => {
      return fetch("/api/groups", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast.success("User has been created.");
    },
    onError: () => {
      toast.error("Create user failed.");
    },
  });

  const onSubmit: SubmitHandler<UserType> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          Create New <PlusCircle />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div className="grid gap-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" {...register("name")} />
              {formState.errors.name && (
                <small className="text-red-500">
                  {formState.errors.name.message}
                </small>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={mutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
