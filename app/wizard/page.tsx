import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";
import Logo from "@/components/Logo";
import { Separator } from "@/components/ui/separator";
import { CurrenctComboBox } from "@/components/CurrenctComboBox";

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return (
    <div>
      <div className="container flex max-w-2xl flex-col items-center justify-between gap-4">
        <h1 className="text-center text-3xl">
          Welcome,<span className="ml-2 font-bold">{user.firstName}! 👋🏻</span>
        </h1>
        <h2 className="mt-4 text-center text-base text-muted-foreground">
          Let &apos;s get started by setting up your currency!
        </h2>
        <h3 className="mt-2 text-center text-sm text-muted-foreground">
          You can change these settings at any time
        </h3>

        <Separator />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>
              Set your default currency for transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrenctComboBox />
          </CardContent>
        </Card>
        <Separator />

        <Button className="w-full" asChild>
          <Link href="/"> I&apos;m done! Take me to the dashboard </Link>
        </Button>
        <div className="mt-8">
          <Logo />
        </div>
      </div>
    </div>
  );
}

export default page;
