import Section from "@/components/section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar } from "lucide-react";

const blogPosts = [
  {
    title: "Introducing NodePilot",
    excerpt: "Meet NodePilot — your AI-powered automation co-pilot built to help you create powerful n8n workflows effortlessly.",
    date: "2 months ago",
    slug: "/blog",
    image: "/dashboard.png"
  }
];

export default function NPV3Blog() {
  return (
    <Section title="Blog" subtitle="Latest Articles">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post, index) => (
          <Card key={index} className="border bg-card/50 hover:bg-card/80 transition-colors group hover:scale-105 duration-300">
            <CardHeader>
              <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                {post.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed mb-4">
                {post.excerpt}
              </CardDescription>
              <Button variant="outline" asChild className="w-full">
                <Link href={post.slug}>
                  Read More
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Button variant="outline" asChild>
          <Link href="/blog">
            View All Articles
          </Link>
        </Button>
      </div>
    </Section>
  );
}
