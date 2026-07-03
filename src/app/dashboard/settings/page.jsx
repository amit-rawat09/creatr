"use client";

import React, { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "../../../../Hooks/useConvex";
import { BarLoader } from "react-spinners";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function Settingpage() {
  const [username, setUsername] = useState("");
  const { data: currentUser, isLoading } = useConvexQuery(
    api.user.getCurrentUser,
  );

  const { mutate: updateUsername, isLoading: isSubmitting } = useConvexMutation(
    api.user.updateUsername,
  );

  if (isLoading) {
    return <BarLoader width={"100%"} color="#D8B4FE" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    await updateUsername({username:username.trim()})
    toast.success("Username updated successfully...")
  };

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div className="">
        <h1 className="text-3xl font-bold gradient-text-primary">Settings</h1>
        <p className="text-slate-400 my-4">
          Manage your profile and account preferences
        </p>

        <Card className="card-glass max-w-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
            Username Settings
            </CardTitle>
            <User className="h-5 w-5 mr-2" />

            <CardDescription>
              Set your unique username for your public profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="bg-slate-800 broder border-slate-600 text-white"
                />

                {currentUser?.username && (
                  <div className="text-sm text-slate-400">
                    Current Username :{" "}
                    <span className="text-white">@{currentUser.username}</span>
                  </div>
                )}

                <div className="text-xs text-slate-500">
                  3-20 characters, letters, numbers, underscores, and hypens
                  only{" "}
                </div>
              </div>

              <div className="">
                <Button
                  disabled={isSubmitting}
                  className="w-full sm:w-auto cursor-pointer"
                  type="submit"
                  variant="primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating
                    </>
                  ) : (
                    "Update Username"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Settingpage;
