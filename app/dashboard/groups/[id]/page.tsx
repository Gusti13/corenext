"use client";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { UserIcon, Loader2 } from "lucide-react";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DetailPage({ params }: DetailPageProps) {
  const { id } = React.use(params);
  const { data } = useQuery({
    queryKey: ["/api/groups", id],
    queryFn: async (): Promise<User> => {
      const res = await fetch("/api/groups/" + id);
      return await res.json();
    },
  });

  return (
    <div className="space-y-8 py-8">{data && <UserDetail data={data} />}</div>
  );
}

// ============ Start General info section ================ ///

const schema = z.object({
  name: z.string().nonempty("Name is required"),
});

type UserType = z.input<typeof schema>;

interface UserDetailProps {
  data: User;
}

export const permisions = [
  { label: "read:user", value: "read:user", description: "You can enable or disable notifications at any time." },
];

export function UserDetail(props: UserDetailProps) {
  const queryClient = useQueryClient();
  const { handleSubmit, register, formState, reset } = useForm({
    resolver: zodResolver(schema),
  });
  const mutation = useMutation<Response, Error, UserType>({
    mutationFn: (data) => {
      return fetch("/api/groups/" + props.data.id, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/groups", props.data.id],
      });
      toast.success("User has been created.");
    },
    onError: () => {
      toast.error("Create user failed.");
    },
  });

  const onSubmit: SubmitHandler<UserType> = (data) => {
    mutation.mutate(data);
  };

  React.useEffect(() => {
    if (props.data) reset(props.data);
  }, [props.data]);

  return (
    <Card className="w-full max-w-lg mx-auto shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-muted-foreground" />
          General Info
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid gap-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" {...register("name")} />
              {formState.errors.name && (
                <small className="text-red-500">
                  {formState.errors.name.message}
                </small>
              )}
              <Label htmlFor="name" className="mt-4">
                Permision
              </Label>
              {permisions.map((item, i) => (
                <Label
                  key={i}
                  className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                >
                  <Checkbox
                    id="toggle-2"
                    defaultChecked
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                  />
                  <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">
                      {item.label}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </div>
                </Label>
              ))}
            </div>
          </div>

          <div className="pt-6 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============ End General info section ================ ///
