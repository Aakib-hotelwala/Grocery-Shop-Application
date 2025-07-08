import ClipLoader from "react-spinners/ClipLoader";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <ClipLoader color="#ffffff" size={40} />
    </div>
  );
};

export default Loader;
