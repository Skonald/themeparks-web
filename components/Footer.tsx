import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Image
                src="/themeparky_logo_symbol.png"
                alt=""
                width={28}
                height={28}
              />
              <span className="font-bold text-brand-primary">ThemeParks</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Research waits, crowds, and trends on the web. Save trips and build
              optimized days in the mobile app.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex gap-6 text-sm font-medium">
              <Link
                href="/parks"
                className="text-slate-600 hover:text-brand-primary"
              >
                Parks
              </Link>
              <Link
                href="/download"
                className="text-slate-600 hover:text-brand-primary"
              >
                Download
              </Link>
            </div>
            <Button href="/download" variant="secondary" className="sm:mt-2">
              Get the app
            </Button>
          </div>
        </div>
        <p className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} ThemeParks · Plan smarter, play harder
        </p>
      </div>
    </footer>
  );
}
