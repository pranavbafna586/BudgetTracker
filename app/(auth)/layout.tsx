import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative flex flex-col h-screen w-full items-center justify-center ">
      <div className="mt-12">{children}</div>
    </div>
  );
};

export default layout;
