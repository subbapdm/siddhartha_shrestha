import { AlignRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  console.log(isOpen);

  return (
    <div className="relative bg-[#0558b0] px-5 px-8">
      <div className="text-white flex items-center justify-between py-3">

        <div className="">
          <h1 className="text-xl font-semibold">सिद्धार्थ श्रेष्ठ</h1>
        </div>

        <div className="flex justify-between gap-5 text-sm">
          <button onClick={() => setIsOpen(!isOpen)} className="cursor-pointer md:hidden">
            <AlignRight />
          </button>

          <div
            className={`bg-gray-700 md:bg-transparent p-5 md:p-4 absolute md:opacity-100 transition-opacity delay-150 duration-300 ease-in-out md:static max-w-xl left-0 right-0 top-[52px] ${
              isOpen ? "block" : "hidden md:block opacity-[0]"
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-6 text-md font-medium">
              <Link to="/">Home</Link>
              <Link to="/">About</Link>
              <Link to="/">Frame</Link>
              <Link to="/">Contact</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Navbar;
