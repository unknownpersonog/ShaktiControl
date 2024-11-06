import { signIn } from "../../auth";
import Image from "next/image";
export default function Login() {
  return (
    <main className="min-h-screen w-full content-start items-center">
      <div className="flex justify-center py-2">
        <Image
          src="/favicon.ico"
          alt="UnknownVPS Logo"
          width={512}
          height={512}
          className="w-48 h-48 border rounded-lg border-orange-300 backdrop-blur-lg backdrop-brightness-125 text-white text-3xl"
        ></Image>
      </div>
      <div className="flex justify-center">
        <p className="text-white text-sm font-mono border p-2 my-2 rounded-lg backdrop-blur-lg border-blue-600 backdrop-brightness-125">
          Please signin to continue
        </p>
      </div>
      <div className="z-10 w-full items-center justify-center font-mono text-2xl flex justify-center">
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button
            className="flex rounded border p-2 text-white backdrop-blur-sm border-purple-600 backdrop-brightness-150 motion-safe:hover:animate-pulse"
            type="submit"
          >
            <Image
              src="/google.png"
              alt="Google"
              width={512}
              height={512}
              className="w-8 h-8 mx-2"
            />
            Sign in with Google
          </button>
        </form>
      </div>
      <div className="flex justify-center p-2">
        <p className="rounded border border-blue-600 backdrop-blur-lg backdrop-brighness-125 text-white text-xs p-2">
          By clicking Login you agree to UnknownVPS T&C & Privacy Policy
        </p>
      </div>
    </main>
  );
}
