import React, { Children } from "react";

function AuthLayout({ children }) {
  return <div className="flex justify-center pt-48">{children}</div>;
}

export default AuthLayout;
