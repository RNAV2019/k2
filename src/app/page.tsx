import Link from "next/link";
import FileUpload from "~/components/user/FileUpload";
import { Github } from "~/icons/Github";

export default function HomePage() {
  return (
    <>
      <div className="absolute inset-0 -z-50 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)]" />
      <main className="flex min-h-screen flex-col items-center text-black">
        <div className="flex h-full w-full max-w-xs grow flex-col items-center justify-between py-16 md:max-w-4xl md:items-stretch">
          <div className="mb-16 space-y-24">
            <nav className="flex h-8 w-full flex-row justify-between">
              <h2 className="text-3xl font-medium">K2</h2>
              <Link href={"/"}>
                <Github className="h-8 w-8" />
              </Link>
            </nav>
            <section className="flex w-full flex-col items-center gap-16">
              <div className="max-w-xl text-wrap text-center text-4xl font-bold">
                Upload, Optimize, Shine: Your Files, Web-Ready!
              </div>
            </section>
          </div>
          <FileUpload />
        </div>
      </main>
    </>
  );
}
