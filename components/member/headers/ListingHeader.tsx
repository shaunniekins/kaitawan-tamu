// components/admin/headers/ListingHeader.tsx

"use client";

const ListingHeader = () => {

  return (
    <>
      <header className="bg-white py-2 px-2 md:px-0 w-full flex items-center justify-center shadow-md fixed inset-x-0 top-0 lg:top-10 z-50">
        <div className="w-full max-w-6xl flex justify-center items-center py-[0.36rem]">
          <h1 className="font-bold text-lg">My Listing</h1>
        </div>
      </header>
    </>
  );
};

export default ListingHeader;
