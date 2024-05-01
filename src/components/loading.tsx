export default function LoadingComponent() {
  return (
    <main className="min-h-screen content-center items-center justify-center p-5">
      
      <div className="flex items-center justify-center border p-4 my-2 rounded-lg backdrop-blur-lg border-blue-600 backdrop-brightness-125">
        <p className="text-white text-lg font-mono animate-spin">. </p>
        <p className="text-white text-lg font-mono animate-pulse px-2"> Loading</p>
      </div>
    </main>
  );
}