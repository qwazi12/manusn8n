import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer id="footer" className="container py-24 pb-16 sm:py-32 sm:pb-24">
      <div className="p-10 bg-muted/50 dark:bg-card border rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
          <div className="col-span-full xl:col-span-2">
            <Link href="/" className="flex font-bold items-center">
              <Image
                src="/favicon.png"
                alt="n8nCraft Logo"
                width={28}
                height={28}
                className="mr-2"
              />
              <h3 className="text-2xl">n8nCraft</h3>
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Help</h3>
            <div>
              <Link href="/#contact" className="opacity-60 hover:opacity-100">
                Contact Us
              </Link>
            </div>
            <div>
              <Link href="/#faq" className="opacity-60 hover:opacity-100">
                FAQ
              </Link>
            </div>
            <div>
              <Link href="/#contact" className="opacity-60 hover:opacity-100">
                Feedback
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Policy</h3>
            <div>
              <Link href="/privacy" className="opacity-60 hover:opacity-100">
                Privacy
              </Link>
            </div>
            <div>
              <Link href="/tos" className="opacity-60 hover:opacity-100">
                TOS
              </Link>
            </div>
            <div>
              <Link href="/refund" className="opacity-60 hover:opacity-100">
                Refund
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Socials</h3>
            <div>
              <Link
                href="https://discord.gg/BFnVZ9D4aG"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100"
              >
                Discord
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
