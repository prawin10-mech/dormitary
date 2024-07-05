import NewUserForm from "./components/NewUserForm";
import Bed from "./components/Bed";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="w-full bg-white shadow-lg rounded-lg mb-4 md:mb-0">
        <Header />
      </div>
      <div className="flex flex-col md:flex-row p-4 bg-gray-100 min-h-screen">
        <div className="md:w-1/3 w-full p-4 bg-white shadow-lg rounded-lg mb-4 md:mb-0">
          <h1 className="text-2xl font-bold mb-4">Welcome</h1>
          <NewUserForm />
        </div>
        <div className="flex flex-col md:w-2/3 w-full p-4 bg-red-200 shadow-lg rounded-lg overflow-auto h-full">
          <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
          <div className="flex-grow min-h-0 overflow-auto overflow-x-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <Bed key={i} name={`A${i + 1}`} occupied={i % 2 === 0} />
              ))}
            </div>
            <div className="border-b-2 border-dotted border-gray-500 my-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Bed key={i} name={`B${i + 1}`} occupied={false} />
              ))}
            </div>
            <div className="border-b-2 border-dotted border-gray-500 my-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Bed key={i} name={`C${i + 1}`} occupied={false} />
              ))}
            </div>
            <div className="border-b-2 border-dotted border-gray-500 my-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Bed key={i} name={`D${i + 1}`} occupied={false} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
