"use client";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { UserIcon, Loader2, Shield, ShieldOff } from "lucide-react";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "@prisma/client";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = React.use(params);
  const { data } = useQuery({
    queryKey: ["/api/users", id],
    queryFn: async (): Promise<User> => {
      const res = await fetch("/api/users/" + id);
      return await res.json();
    },
  });

  return (
    <div className="space-y-8 py-8">
      {data && <UserDetail data={data} />}{" "}
      {data && <ChangePassword data={data} />}
      {data && <DeleteAccount data={data} />}
    </div>
  );
}

// ============ Start General info section ================ ///

const schema = z.object({
  name: z.string().nonempty("Name is required"),
  username: z.string().nonempty("Username is required"),
});

type UserType = z.input<typeof schema>;

interface UserDetailProps {
  data: User;
}

export function UserDetail(props: UserDetailProps) {
  const queryClient = useQueryClient();
  const { handleSubmit, register, formState, reset } = useForm({
    resolver: zodResolver(schema),
  });
  const mutation = useMutation<Response, Error, UserType>({
    mutationFn: (data) => {
      return fetch("/api/users/" + props.data.id, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", props.data.id],
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
            </div>
            <div className="grid gap-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" {...register("username")} />
              {formState.errors.username && (
                <small className="text-red-500">
                  {formState.errors.username.message}
                </small>
              )}
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

// ============ Start Password Setting section ================ ///

const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordSchemaType = z.infer<typeof passwordSchema>;

interface ChangePasswordProps {
  data: User;
}

export function ChangePassword({ data }: ChangePasswordProps) {
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<PasswordSchemaType>({
    resolver: zodResolver(passwordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (formData: PasswordSchemaType) => {
      const res = await fetch(`/api/users/${data.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formData.password }),
      });

      if (!res.ok) throw new Error("Failed to change password");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", data.id],
      });
      toast.success("Password updated successfully.");
      reset(); // clear form
    },
    onError: () => {
      toast.error("Failed to update password.");
    },
  });

  const onSubmit: SubmitHandler<PasswordSchemaType> = (formData) => {
    mutation.mutate(formData);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-muted-foreground" />
          Change Password
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid gap-1">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <small className="text-red-500">
                  {errors.password.message}
                </small>
              )}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <small className="text-red-500">
                  {errors.confirmPassword.message}
                </small>
              )}
            </div>
          </div>

          <div className="pt-6 flex gap-2 justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => reset()}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============ End Password Setting section ================ ///

// ============ Start Delete aaccount section ================ ///

interface DeleteAccountProps {
  data: User;
}

export function DeleteAccount({ data }: DeleteAccountProps) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/${data.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete account");
      return res.json();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["/api/users", data.id] });
      toast.success("Account deleted successfully.");
      window.location.href = "/"; // Or redirect somewhere else
    },
    onError: () => {
      toast.error("Failed to delete account.");
    },
  });

  const handleConfirmDelete = () => {
    if (inputValue !== data.username) {
      toast.error("Username doesn't match. Cannot delete.");
      return;
    }

    mutation.mutate();
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <ShieldOff className="w-5 h-5" />
          Delete Account
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Deleting your account is permanent and cannot be undone. Please type{" "}
          <span className="font-semibold">{data.username}</span> to confirm.
        </p>

        {!confirming ? (
          <Button
            variant="destructive"
            onClick={() => setConfirming(true)}
            className="w-full"
          >
            Delete Account
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-1">
              <Label htmlFor="usernameConfirm">Confirm Username</Label>
              <Input
                id="usernameConfirm"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your username"
                disabled={mutation.isPending}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirming(false);
                  setInputValue("");
                }}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={mutation.isPending || inputValue !== data.username}
              >
                {mutation.isPending && (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                )}
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============ End Delete aaccount section ================ ///
