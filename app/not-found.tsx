import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-6xl font-bold text-brand-primary/20">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">
        This park or page doesn&apos;t exist. Browse parks or head back home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/" variant="outline">
          Home
        </Button>
        <Button href="/parks" variant="primary">
          Browse parks
        </Button>
      </div>
    </div>
  );
}
