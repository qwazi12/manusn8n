import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to n8nCraft</h1>
          <p className="text-muted-foreground">Your AI-powered n8n automation platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate a Workflow</CardTitle>
              <CardDescription>Create a new automation workflow with AI</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/dashboard/create">Start Creating</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Workflows</CardTitle>
              <CardDescription>View and manage your existing workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/workflows">View Workflows</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscribe</CardTitle>
              <CardDescription>Upgrade to a premium plan for more features</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/#pricing">View Plans</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Credits</CardTitle>
              <CardDescription>You have 500 credits remaining on your Free plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full w-[45%]" />
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>0</span>
                <span>500 credits</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
