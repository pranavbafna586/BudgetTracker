import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CurrenctComboBox } from "@/components/CurrenctComboBox";
import ManageIncomeCategories from "../_components/ManageIncomeCategories";
import ManageExpenseCategories from "../_components/ManageExpenseCategories";

async function ManagePage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!userSettings) {
    redirect("/wizard");
  }

  // Fetch categories
  const incomeCategories = await prisma.category.findMany({
    where: {
      userId: user.id,
      type: "income",
    },
    orderBy: {
      name: "asc",
    },
  });

  const expenseCategories = await prisma.category.findMany({
    where: {
      userId: user.id,
      type: "expense",
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 flex flex-col items-center">
      <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Manage</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and categories
        </p>
      </div>

      <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl space-y-8">
        {/* Currency Settings Section */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950/50 dark:to-transparent">
            <CardTitle>Currency</CardTitle>
            <CardDescription>
              Set your default currency for transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <CurrenctComboBox />
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Categories Management Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center sm:text-left">
            Categories
          </h2>

          <div className="space-y-8">
            {/* Income Categories */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-50/30 dark:from-emerald-950/50 dark:to-emerald-950/10">
                <CardTitle className="flex items-center text-emerald-700 dark:text-emerald-400">
                  <span className="text-xl mr-2">💰</span>
                  Income Categories
                </CardTitle>
                <CardDescription>
                  Manage your income sources and categories
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ManageIncomeCategories
                  initialCategories={incomeCategories}
                  userId={user.id}
                />
              </CardContent>
            </Card>

            {/* Expense Categories */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-rose-50/30 dark:from-rose-950/50 dark:to-rose-950/10">
                <CardTitle className="flex items-center text-rose-700 dark:text-rose-400">
                  <span className="text-xl mr-2">💸</span>
                  Expense Categories
                </CardTitle>
                <CardDescription>
                  Manage your expense types and categories
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ManageExpenseCategories
                  initialCategories={expenseCategories}
                  userId={user.id}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagePage;
